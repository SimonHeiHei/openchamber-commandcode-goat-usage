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

// Upstream responses are cached per route, in memory only (never on disk). A fresh entry is
// served with no network call; an expired entry is refetched, and when that refetch fails the
// last-known-good value is still returned while the failure is recorded, so the panel shows
// the data plus a notice instead of an empty section.
const upstreamCache = new Map();

async function apiGet(key, route) {
  const cached = upstreamCache.get(route);
  if (cached && cached.expiresAt > Date.now()) return { ok: true, value: cached.value, error: null };
  try {
    const res = await fetch(`${API_BASE}${route}`, {
      headers: { Authorization: `Bearer ${key}`, 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`upstream returned HTTP ${res.status}`);
    const value = await res.json();
    upstreamCache.set(route, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return { ok: true, value, error: null };
  } catch (err) {
    if (cached) return { ok: true, value: cached.value, error: err };
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

function openDb(DatabaseSync) {
  try {
    return new DatabaseSync(DB_PATH, { readOnly: true });
  } catch (err) {
    throw new Error(`cannot open ${DB_PATH}: ${safeMessage(err)}`);
  }
}

async function queryLocal(range) {
  const DatabaseSync = await loadSqlite();
  if (!DatabaseSync) {
    throw new Error(`node:sqlite is unavailable in this runtime; local cost needs it (db: ${DB_PATH})`);
  }
  const { from, to } = rangeBounds(range);
  const db = openDb(DatabaseSync);
  try {
    const from3 = `from message m left join session s on s.id = m.session_id left join project p on p.id = s.project_id`;
    const where = `where json_extract(m.data,'$.role')='assistant' and date(m.time_created/1000,'unixepoch','localtime') between ? and ?`;
    const totals = db
      .prepare(
        `select count(*) as turns,
           coalesce(sum(json_extract(m.data,'$.tokens.input')),0) as input,
           coalesce(sum(json_extract(m.data,'$.tokens.output')),0) as output,
           coalesce(sum(json_extract(m.data,'$.tokens.reasoning')),0) as reasoning,
           coalesce(sum(json_extract(m.data,'$.tokens.cache.read')),0) as cache_read,
           coalesce(sum(json_extract(m.data,'$.cost')),0) as cost
         ${from3} ${where}`,
      )
      .get(from, to);
    const byDay = db
      .prepare(
        `select date(m.time_created/1000,'unixepoch','localtime') as day,
           count(*) as turns, coalesce(sum(json_extract(m.data,'$.cost')),0) as cost
         ${from3} ${where}
         group by 1 order by day asc limit 31`,
      )
      .all(from, to);
    const byModel = db
      .prepare(
        `select json_extract(m.data,'$.modelID') as model,
           count(*) as turns, coalesce(sum(json_extract(m.data,'$.cost')),0) as cost
         ${from3} ${where}
         group by 1 order by cost desc, turns desc limit 31`,
      )
      .all(from, to);
    return {
      from,
      to,
      totals: {
        turns: num(totals.turns),
        input: num(totals.input),
        output: num(totals.output),
        reasoning: num(totals.reasoning),
        cache_read: num(totals.cache_read),
        cost: round4(totals.cost),
      },
      byDay: byDay.map((r) => ({ day: r.day, turns: num(r.turns), cost: round4(r.cost) })),
      byModel: byModel.map((r) => ({ model: r.model, turns: num(r.turns), cost: round4(r.cost) })),
    };
  } finally {
    db.close();
  }
}

// --- summary assembly -------------------------------------------------------

async function buildSummary(range) {
  const errors = [];

  let local = null;
  try {
    local = await queryLocal(range);
  } catch (err) {
    errors.push({ source: 'db', message: safeMessage(err) });
  }

  const { key, error: keyError } = readApiKey();
  let plan = null;
  let credits = null;
  let windows = null;
  let periodUsage = null;

  if (keyError) {
    errors.push({ source: 'api', message: keyError });
  } else {
    const [sub, cred, usage] = await Promise.all([
      apiGet(key, '/alpha/billing/subscriptions'),
      apiGet(key, '/alpha/billing/credits'),
      apiGet(key, '/alpha/usage/summary'),
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
    try {
      send(res, 200, await buildSummary(range));
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
