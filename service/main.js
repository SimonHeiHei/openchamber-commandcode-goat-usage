// cc-goat OpenChamber extension service.
// Plain Node ESM, node: builtins only, zero dependencies, no build step.
// Aggregates CommandCode Goat quota (upstream API) + local OpenCode token cost (SQLite)
// into one JSON document. See /tmp/cc-goat/CONTRACT.md — shapes are frozen.
// allow: SIZE_OK — the frozen contract mandates this single shipped artifact (no build step,
// no second file, zero dependencies), so it cannot be split across modules.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const PORT = Number.parseInt(process.env.OPENCHAMBER_SERVICE_PORT ?? '8787', 10);
const TOKEN = process.env.OPENCHAMBER_SERVICE_TOKEN ?? '';

// OpenCode keeps its data in the XDG layout on every platform
// (<XDG_DATA_HOME or ~/.local/share>/opencode), but a machine may also carry the
// Windows AppData layout. Probe both and use whichever actually holds the file,
// so the extension works regardless of the local OpenCode convention.
function dataRoots() {
  const roots = [];
  const xdg = (process.env.XDG_DATA_HOME ?? '').trim();
  const home = os.homedir();
  if (xdg) roots.push(path.join(xdg, 'opencode'));
  if (home) roots.push(path.join(home, '.local', 'share', 'opencode'));
  for (const name of ['LOCALAPPDATA', 'APPDATA']) {
    const base = (process.env[name] ?? '').trim();
    if (base) roots.push(path.join(base, 'opencode'));
  }
  return roots;
}

function resolveDataFile(fileName, override) {
  if (override) return override;
  const roots = dataRoots();
  for (const root of roots) {
    const candidate = path.join(root, fileName);
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // unreadable candidate: try the next root
    }
  }
  return path.join(roots[0] ?? path.join(os.homedir(), '.local', 'share'), fileName);
}

const AUTH_FILE = resolveDataFile('auth.json', process.env.CC_GOAT_AUTH_FILE);
const DB_PATH = resolveDataFile('opencode.db', process.env.CC_GOAT_DB);
const API_BASE = (process.env.CC_GOAT_API_BASE ?? 'https://api.commandcode.ai').replace(/\/+$/, '');
const USER_AGENT = 'cc-goat-openchamber/1.0';
const RANGES = new Set(['today', 'week', 'month', 'all']);
// 17s per call keeps a fully-failing first request inside the host's 20s serviceRequest ceiling.
const UPSTREAM_TIMEOUT_MS = 17000;
const configuredCacheTtl = Number.parseInt(process.env.CC_GOAT_CACHE_TTL_MS ?? '', 10);
const CACHE_TTL_MS = Number.isFinite(configuredCacheTtl) && configuredCacheTtl >= 0 ? configuredCacheTtl : 60000;

// node:sqlite is a newer core module. Load it lazily and cache the outcome (success or
// failure) so a runtime that lacks it degrades only the local-cost half — never the
// module load, /health, or the upstream-API half. The rejection is handled inline, so
// no unhandled rejection can escape and the load is attempted exactly once.
let sqlitePromise = null;
const loadSqlite = () =>
  (sqlitePromise ??= import('node:sqlite').then(
    (m) => m.DatabaseSync,
    () => null,
  ));

const round = (n, d) => {
  const v = Number(n);
  return Number.isFinite(v) ? Number(v.toFixed(d)) : 0;
};
const round4 = (n) => round(n, 4);
const num = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);

// The key must never appear in a message, a log line, or a response body.
const safeMessage = (err, secret) => {
  let msg = err instanceof Error ? err.message : String(err);
  if (secret) msg = msg.split(secret).join('[redacted]');
  return msg;
};

function tokenValid(header) {
  if (TOKEN.length === 0 || typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  const provided = Buffer.from(header.slice(7), 'utf8');
  const expected = Buffer.from(TOKEN, 'utf8');
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

function localDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Range semantics (matching the validated local cc-usage reference):
// today = local calendar day, week = trailing 7 days incl. today,
// month = current local calendar month, all = epoch..today.
function rangeBounds(range) {
  const now = new Date();
  const to = localDate(now);
  if (range === 'today') return { from: to, to };
  if (range === 'month') return { from: localDate(new Date(now.getFullYear(), now.getMonth(), 1)), to };
  if (range === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return { from: localDate(d), to };
  }
  return { from: '1970-01-01', to };
}

function readApiKey() {
  try {
    const parsed = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const key = parsed?.commandcode?.key;
    if (typeof key !== 'string' || key.length === 0) throw new Error(`no commandcode key in ${AUTH_FILE}`);
    return { key, error: null };
  } catch (err) {
    return { key: null, error: safeMessage(err) };
  }
}

// Upstream responses are cached per route, in memory only (never on disk). A fresh entry is served
// with no network call; an expired entry is served immediately from the last-known-good value while
// a single background refresh repopulates the cache (stale-while-revalidate), so a returning user
// never blocks on the ~15 s upstream. Only a cold cache (no value to show) blocks. A failed blocking
// fetch is still recorded as an error, so the panel shows the data it has plus a notice.
const upstreamCache = new Map();
const upstreamRefreshing = new Map(); // route -> in-flight background refresh (at most one per route)

// One upstream GET, storing the parsed body on success. Rejects on any failure; callers decide how to
// degrade. The key is only ever sent in the Authorization header, never in a message.
async function fetchUpstream(key, route) {
  const res = await fetch(`${API_BASE}${route}`, {
    headers: { Authorization: `Bearer ${key}`, 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`upstream returned HTTP ${res.status}`);
  const value = await res.json();
  upstreamCache.set(route, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

// Revalidate a route behind the caller's back. At most one refresh per route is in flight; the
// rejection is handled here so a background failure can neither crash the process nor add an
// errors[] entry — it only surfaces later if a blocking call needs a value it does not have.
function refreshUpstream(key, route) {
  if (upstreamRefreshing.has(route)) return;
  const inFlight = fetchUpstream(key, route)
    .catch(() => {})
    .finally(() => upstreamRefreshing.delete(route));
  upstreamRefreshing.set(route, inFlight);
}

async function apiGet(key, route, fresh = false) {
  const cached = upstreamCache.get(route);

  // Manual refresh (fresh=1): always attempt a real fetch. On failure fall back to the cached value
  // (plus the caller's errors[] entry) so a section the user can still see is never blanked.
  if (fresh) {
    try {
      return { ok: true, value: await fetchUpstream(key, route), error: null };
    } catch (err) {
      if (cached) return { ok: true, value: cached.value, error: err };
      return { ok: false, value: null, error: err };
    }
  }

  // Default path. Fresh: no network. Expired: serve the stale value now and revalidate in the
  // background — no errors[] entry, because the caller got usable data.
  if (cached) {
    if (cached.expiresAt <= Date.now()) refreshUpstream(key, route);
    return { ok: true, value: cached.value, error: null };
  }

  // Cold cache: nothing to show, so this call must block on the fetch.
  try {
    return { ok: true, value: await fetchUpstream(key, route), error: null };
  } catch (err) {
    return { ok: false, value: null, error: err };
  }
}

// --- upstream mappers (exact CONTRACT shapes) -------------------------------

function mapPlan(sub) {
  const d = sub?.data;
  if (!d) return null;
  return {
    planId: d.planId ?? null,
    status: d.status ?? null,
    periodStart: d.currentPeriodStart ?? null,
    periodEnd: d.currentPeriodEnd ?? null,
  };
}

function mapWindow(w) {
  const used = num(w?.used);
  const cap = num(w?.cap);
  return {
    used: round4(used),
    cap,
    pct: cap === 0 ? 0 : round((used / cap) * 100, 1),
    resetAt: w?.resetAt ?? null,
    exceeded: Boolean(w?.exceeded),
  };
}

function mapCreditsCredits(credits) {
  const c = credits?.credits ?? {};
  return {
    monthlyRemaining: round4(c.monthlyCredits ?? 0),
    purchased: round4(c.purchasedCredits ?? 0),
    free: round4(c.freeCredits ?? 0),
  };
}

function mapWindows(credits) {
  const wl = credits?.windowLimits ?? {};
  return {
    fiveHour: mapWindow(wl.fiveHour),
    weekly: mapWindow(wl.weekly),
    limited: Boolean(wl.limited),
  };
}

function mapPeriodUsage(s) {
  return {
    totalCost: round4(s?.totalCost ?? 0),
    totalCount: num(s?.totalCount),
    successRate: round(s?.successRate ?? 0, 2),
    failedCount: num(s?.failedCount),
    tokensIn: num(s?.totalTokensIn),
    tokensOut: num(s?.totalTokensOut),
    tokens: num(s?.totalTokens),
  };
}

// --- local OpenCode cost (SQL semantics ported from cc-usage) ---------------
// The whole history is aggregated ONCE into one row per (day, model); every range is then a pure
// in-memory filter/sum over those rows, so switching today/week/month/all costs zero SQL. On a
// 1.2 GB DB (~12k assistant rows) the single pass is ~70 ms and yields ~130 groups. The cache is
// keyed on the DB file's mtimeMs+size and additionally floored to one rescan per
// LOCAL_RESCAN_FLOOR_MS, so rapid tab switching (or messages streaming in) cannot re-scan in a storm.
const LOCAL_RESCAN_FLOOR_MS = 5000;
const LOCAL_DAYS_CAP = 31;
const LOCAL_MODELS_CAP = 31;

let localAggregates = null; // { mtimeMs, size, ranAt, rows }
let localQueryCount = 0; // aggregation queries actually executed (logged per /summary as evidence)

function openDb(DatabaseSync) {
  try {
    return new DatabaseSync(DB_PATH, { readOnly: true });
  } catch (err) {
    throw new Error(`cannot open ${DB_PATH}: ${safeMessage(err)}`);
  }
}

// One pass over assistant rows, no date filter: the per-group counters are cached so a range
// total is a plain sum of its groups and stays exact.
const LOCAL_AGGREGATE_SQL = `
  select date(m.time_created/1000,'unixepoch','localtime') as day,
    json_extract(m.data,'$.modelID') as model,
    count(*) as turns,
    coalesce(sum(json_extract(m.data,'$.tokens.input')),0) as input,
    coalesce(sum(json_extract(m.data,'$.tokens.output')),0) as output,
    coalesce(sum(json_extract(m.data,'$.tokens.reasoning')),0) as reasoning,
    coalesce(sum(json_extract(m.data,'$.tokens.cache.read')),0) as cache_read,
    coalesce(sum(json_extract(m.data,'$.cost')),0) as cost
  from message m
  where json_extract(m.data,'$.role')='assistant'
  group by 1, 2`;

async function loadLocalAggregates() {
  const DatabaseSync = await loadSqlite();
  if (!DatabaseSync) {
    throw new Error(`node:sqlite is unavailable in this runtime; local cost needs it (db: ${DB_PATH})`);
  }
  let stat;
  try {
    stat = fs.statSync(DB_PATH);
  } catch (err) {
    throw new Error(`cannot open ${DB_PATH}: ${safeMessage(err)}`);
  }
  const unchanged =
    localAggregates && localAggregates.mtimeMs === stat.mtimeMs && localAggregates.size === stat.size;
  if (unchanged) return localAggregates.rows;
  if (localAggregates && Date.now() - localAggregates.ranAt < LOCAL_RESCAN_FLOOR_MS) return localAggregates.rows;
  const db = openDb(DatabaseSync);
  try {
    localQueryCount += 1;
    const rows = db.prepare(LOCAL_AGGREGATE_SQL).all();
    localAggregates = { mtimeMs: stat.mtimeMs, size: stat.size, ranAt: Date.now(), rows };
    return rows;
  } finally {
    db.close();
  }
}

// Model ranking shared by byModel and each day's models: cost desc, then turns desc, then model id
// (the id tiebreak only decides the order of models that are otherwise equal, so it stays deterministic).
const byCostThenTurns = (a, b) =>
  b.cost - a.cost || b.turns - a.turns || (a.model < b.model ? -1 : a.model > b.model ? 1 : 0);

// Pure range projection: filter the cached groups to [from, to] and sum in JS — no SQL here.
function localForRange(rows, range) {
  const { from, to } = rangeBounds(range);
  const totals = { turns: 0, input: 0, output: 0, reasoning: 0, cache_read: 0, cost: 0 };
  const days = new Map(); // day -> { day, turns, cost, models: Map(model -> { model, turns, cost }) }
  const models = new Map(); // model -> { model, turns, cost }
  for (const row of rows) {
    if (row.day < from || row.day > to) continue;
    const turns = num(row.turns);
    const cost = num(row.cost);
    totals.turns += turns;
    totals.input += num(row.input);
    totals.output += num(row.output);
    totals.reasoning += num(row.reasoning);
    totals.cache_read += num(row.cache_read);
    totals.cost += cost;
    const day = days.get(row.day) ?? { day: row.day, turns: 0, cost: 0, models: new Map() };
    day.turns += turns;
    day.cost += cost;
    const dayModel = day.models.get(row.model) ?? { model: row.model, turns: 0, cost: 0 };
    dayModel.turns += turns;
    dayModel.cost += cost;
    day.models.set(row.model, dayModel);
    days.set(row.day, day);
    const model = models.get(row.model) ?? { model: row.model, turns: 0, cost: 0 };
    model.turns += turns;
    model.cost += cost;
    models.set(row.model, model);
  }
  return {
    from,
    to,
    totals: {
      turns: totals.turns,
      input: totals.input,
      output: totals.output,
      reasoning: totals.reasoning,
      cache_read: totals.cache_read,
      cost: round4(totals.cost),
    },
    // Most recent LOCAL_DAYS_CAP days, ascending: sort ascending then keep the tail (oldest-31
    // would silently drop the newest days once the history exceeds the cap).
    byDay: [...days.values()]
      .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
      .slice(-LOCAL_DAYS_CAP)
      .map((d) => ({
        day: d.day,
        turns: d.turns,
        cost: round4(d.cost),
        models: [...d.models.values()]
          .sort(byCostThenTurns)
          .map((m) => ({ model: m.model, turns: m.turns, cost: round4(m.cost) })),
      })),
    byModel: [...models.values()]
      .sort(byCostThenTurns)
      .slice(0, LOCAL_MODELS_CAP)
      .map((m) => ({ model: m.model, turns: m.turns, cost: round4(m.cost) })),
  };
}

async function queryLocal(range) {
  return localForRange(await loadLocalAggregates(), range);
}

// --- summary assembly -------------------------------------------------------

async function buildSummary(range, fresh) {
  const errors = [];

  let local = null;
  try {
    local = await queryLocal(range);
  } catch (err) {
    errors.push({ source: 'db', message: safeMessage(err) });
  }
  // Evidence that a range switch is served from the in-memory aggregation: localQueryCount only
  // advances when the single (day, model) pass actually runs.
  console.log(
    `cc-goat local: range=${range} aggregationQueries=${localQueryCount} groups=${localAggregates?.rows?.length ?? 0} ok=${local !== null}`,
  );

  const { key, error: keyError } = readApiKey();
  let plan = null;
  let credits = null;
  let windows = null;
  let periodUsage = null;

  if (keyError) {
    errors.push({ source: 'api', message: keyError });
  } else {
    const [sub, cred, usage] = await Promise.all([
      apiGet(key, '/alpha/billing/subscriptions', fresh),
      apiGet(key, '/alpha/billing/credits', fresh),
      apiGet(key, '/alpha/usage/summary', fresh),
    ]);
    if (sub.ok) plan = mapPlan(sub.value);
    if (sub.error) errors.push({ source: 'subscriptions', message: safeMessage(sub.error, key) });
    if (cred.ok) {
      credits = mapCreditsCredits(cred.value);
      windows = mapWindows(cred.value);
    }
    if (cred.error) errors.push({ source: 'credits', message: safeMessage(cred.error, key) });
    if (usage.ok) periodUsage = mapPeriodUsage(usage.value);
    if (usage.error) errors.push({ source: 'usage', message: safeMessage(usage.error, key) });
  }

  return { generatedAt: Date.now(), range, plan, credits, windows, periodUsage, local, errors };
}

// --- HTTP -------------------------------------------------------------------

function send(res, status, body) {
  const payload = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': payload.length,
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  if (!tokenValid(req.headers?.authorization)) {
    send(res, 401, { error: 'unauthorized' });
    return;
  }
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (req.method === 'GET' && url.pathname === '/health') {
    send(res, 200, { ok: true, service: 'cc-goat' });
    return;
  }
  if (req.method === 'GET' && url.pathname === '/summary') {
    const raw = url.searchParams.get('range');
    const range = RANGES.has(raw) ? raw : 'today';
    const fresh = url.searchParams.get('fresh') === '1';
    try {
      send(res, 200, await buildSummary(range, fresh));
    } catch (err) {
      // Never 5xx for an upstream/data failure: degrade to nulls + errors[].
      send(res, 200, {
        generatedAt: Date.now(),
        range,
        plan: null,
        credits: null,
        windows: null,
        periodUsage: null,
        local: null,
        errors: [{ source: 'api', message: safeMessage(err) }],
      });
    }
    return;
  }
  send(res, 404, { error: 'not found' });
});

server.on('error', (err) => {
  console.error(`cc-goat service error: ${safeMessage(err)}`);
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`cc-goat service listening on 127.0.0.1:${PORT}`);
});
