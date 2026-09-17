import { connectHost } from '@openchamber/sdk';
import {
  applyHostReady, mountBadge, mountBanner, mountButton, mountEmpty,
  mountProgress, mountSeparator, mountSpinner, mountTabs,
} from '@openchamber/sdk/ui';

const host = connectHost();
const SERVICE_CODES = new Set([
  'NO_SERVICE', 'SERVICE_FAILED', 'NOT_GRANTED', 'DISABLED', 'HOST_UNAVAILABLE', 'HOST_TIMEOUT',
]);

const MESSAGES = {
  zh: {
    docTitle: 'Goat 用量',
    retry: '重试',
    loading: '正在读取用量…',
    refresh: '刷新',
    planFallback: 'Goat 订阅',
    periodUnavailable: '计费周期不可用',
    barFiveHour: '5 小时窗口',
    barWeekly: '每周窗口',
    barMonthly: '本月池',
    remaining: '剩余',
    used: '已用',
    resetSoon: '即将重置',
    resetUnknown: '重置时间未知',
    resetInDays: (day, hour) => `${day} 天 ${hour} 小时后重置`,
    resetInHours: (hour) => `${hour} 小时后重置`,
    resetInMinutes: (minute) => `${minute} 分钟后重置`,
    periodEnds: '周期至',
    cardRequests: '请求',
    cardSuccess: '成功率',
    cardCost: '花费',
    cardTokens: 'Token',
    cardFailed: (count) => `失败 ${count}`,
    creditsLabel: 'credits',
    metaTurns: (count) => `${count} 轮`,
    metaSessions: (count) => `${count} 对话`,
    metaTokens: (value) => `${value} tokens`,
    metaCached: (pct) => `缓存 ${pct}`,
    metaSep: ' · ',
    statSessions: '对话',
    statFailed: '失败',
    localCost: '本地成本',
    tabToday: '今日',
    tabWeek: '本周',
    tabMonth: '本月',
    tabAll: '全部',
    statTurns: '轮次',
    statTokens: 'Token',
    statCost: '成本',
    tokensIn: '入',
    tokensOut: '出',
    tokensReasoning: '思考',
    tokensCache: '缓存',
    sepByDay: '按天',
    sepByModel: '按模型',
    ariaByDay: '按天统计',
    ariaByModel: '按模型统计',
    noActivity: '该区间暂无本地活动',
    recordUnavailable: '本地记录不可用',
    other: '其他',
    emptyDash: '—',
    weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    unknownModel: '未知模型',
    updatedPrefix: '更新于',
    updatedUnknown: '更新时间未知',
    noticePartial: (count) => `部分数据不可用（${count}）`,
    noticeMissingPrefix: '部分数据缺失：',
    missingPlan: '订阅',
    missingQuota: '额度',
    missingPeriodUsage: '周期用量',
    missingLocal: '本地记录',
    listSep: '、',
    errorSep: '；',
    unknownError: '未知错误',
    dataReadFailed: '数据读取失败',
    serviceNotReady: '本地服务未就绪',
    serviceHint: '请在 设置 → 扩展 中允许 cc-goat 的本地服务，面板才能读取 CommandCode 用量与本地成本。',
    httpReturned: '本地服务返回',
    badResponse: '本地服务返回了无法解析的响应',
    serviceUnavailable: '本地服务不可用',
    readFailed: '读取失败',
  },
  en: {
    docTitle: 'Goat Usage',
    retry: 'Retry',
    loading: 'Reading usage…',
    refresh: 'Refresh',
    planFallback: 'Goat subscription',
    periodUnavailable: 'Billing period unavailable',
    barFiveHour: '5h window',
    barWeekly: 'Weekly window',
    barMonthly: 'Monthly pool',
    remaining: 'remaining',
    used: 'used',
    resetSoon: 'resetting soon',
    resetUnknown: 'reset time unknown',
    resetInDays: (day, hour) => `resets in ${day}d ${hour}h`,
    resetInHours: (hour) => `resets in ${hour}h`,
    resetInMinutes: (minute) => `resets in ${minute}m`,
    periodEnds: 'period ends',
    cardRequests: 'Requests',
    cardSuccess: 'Success',
    cardCost: 'Cost',
    cardTokens: 'Tokens',
    cardFailed: (count) => `${count} failed`,
    creditsLabel: 'credits',
    metaTurns: (count) => `${count} turns`,
    metaSessions: (count) => `${count} sessions`,
    metaTokens: (value) => `${value} tokens`,
    metaCached: (pct) => `${pct} cached`,
    metaSep: ' · ',
    statSessions: 'Sessions',
    statFailed: 'Failed',
    localCost: 'Local cost',
    tabToday: 'Today',
    tabWeek: 'Week',
    tabMonth: 'Month',
    tabAll: 'All',
    statTurns: 'Turns',
    statTokens: 'Tokens',
    statCost: 'Cost',
    tokensIn: 'in',
    tokensOut: 'out',
    tokensReasoning: 'reasoning',
    tokensCache: 'cache',
    sepByDay: 'By day',
    sepByModel: 'By model',
    ariaByDay: 'By-day stats',
    ariaByModel: 'By-model stats',
    noActivity: 'No local activity in this range',
    recordUnavailable: 'Local record unavailable',
    other: 'Other',
    emptyDash: '—',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    unknownModel: 'Unknown model',
    updatedPrefix: 'Updated',
    updatedUnknown: 'Update time unknown',
    noticePartial: (count) => `partial data unavailable (${count})`,
    noticeMissingPrefix: 'missing data: ',
    missingPlan: 'plan',
    missingQuota: 'quota',
    missingPeriodUsage: 'period usage',
    missingLocal: 'local records',
    listSep: ', ',
    errorSep: '; ',
    unknownError: 'unknown error',
    dataReadFailed: 'Could not read data',
    serviceNotReady: 'Local service not ready',
    serviceHint: 'Allow the cc-goat local service in Settings → Extensions so the panel can read CommandCode usage and local cost.',
    httpReturned: 'local service returned',
    badResponse: 'local service returned an unparseable response',
    serviceUnavailable: 'local service unavailable',
    readFailed: 'read failed',
  },
};

let lang = 'en';
const resolveLang = (locale) =>
  (typeof locale === 'string' && locale.trim().toLowerCase().startsWith('zh') ? 'zh' : 'en');
const t = (key) => MESSAGES[lang][key] ?? MESSAGES.en[key] ?? key;

const RANGE_TABS = [
  { id: 'today', key: 'tabToday' }, { id: 'week', key: 'tabWeek' },
  { id: 'month', key: 'tabMonth' }, { id: 'all', key: 'tabAll' },
];

/* chart constants — stable colour per global byModel rank, tail folds into "other" */
const TOP_MODELS = 5;
const MODEL_COLORS = [
  'var(--oc-primary)',
  'var(--oc-info)',
  'var(--oc-success)',
  'var(--oc-warning)',
  'var(--oc-error)',
  'color-mix(in oklab, var(--oc-muted) 45%, var(--oc-elevated))',
];
const OTHER_SLOT = TOP_MODELS;
const BAR_ROWS = 10;
const COLUMN_COUNT = 7;
const CALENDAR_CELLS = 42;
const PLOT_PX = 96;
const PLOT_INNER_PX = PLOT_PX - 1;
const SEG_MIN_PX = 4;
const TIP_GAP = 12;
const TIP_PAD = 8;
const HEAT_MIN_MIX = 10;
const HEAT_MAX_MIX = 60;

const state = { range: 'today', dataRange: null, data: null, loading: false, problem: null };
const cache = new Map();
let ui = null;
let fetchSeq = 0;
let mounted = false;

const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const num = (v) => (isNum(v) ? v : null);
const int = (v) => (isNum(v) ? Math.round(v).toLocaleString('en-US') : '—');
const money = (v) => (isNum(v) ? `$${v.toFixed(2)}` : '—');
const mtok = (v) => {
  if (!isNum(v)) return '—';
  const m = v / 1e6;
  return `${m >= 1 ? m.toFixed(1) : m.toFixed(2)}M`;
};
const pctText = (v) => (isNum(v) ? `${v.toFixed(1).replace(/\.0$/, '')}%` : '—');
/* billing-period formatters — plain integers and exact money, per the reference look */
const plainInt = (v) => (isNum(v) ? String(Math.round(v)) : '—');
const money4 = (v) => (isNum(v) ? `$${v.toFixed(4)}` : '—');
/* local-cost counters — v3 rows carry input/output/reasoning/cache_read/cache_write */
const tokenKeys = ['input', 'output', 'reasoning', 'cache_read', 'cache_write'];
const tokenTotal = (row) => tokenKeys.reduce((sum, key) => sum + (num(row[key]) ?? 0), 0);
const cacheHitRate = (row) => {
  const fresh = num(row.input) ?? 0, read = num(row.cache_read) ?? 0;
  const denom = fresh + read;
  return denom > 0 ? read / denom : null;
};
const cachePctText = (row) => {
  const rate = cacheHitRate(row);
  return rate === null ? t('emptyDash') : `${Math.round(rate * 100)}%`;
};
const toneFor = (pct) => (pct >= 90 ? 'error' : pct >= 60 ? 'warning' : undefined);
const pctOf = (win) => {
  const pct = isObj(win) ? num(win.pct) : null;
  if (pct !== null) return pct;
  const used = isObj(win) ? num(win.used) : null;
  const cap = isObj(win) ? num(win.cap) : null;
  if (used === null || cap === null) return null;
  return cap > 0 ? (used / cap) * 100 : 0;
};
const pad2 = (n) => String(n).padStart(2, '0');
const asDate = (v) => { const d = v instanceof Date ? v : new Date(v); return Number.isNaN(d.getTime()) ? null : d; };
const dateText = (v) => { const d = asDate(v); return d ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` : '—'; };
const timeText = (v) => { const d = asDate(v); return d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}` : '—'; };
const shortDay = (day) =>
  typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day.slice(5) : String(day ?? '—');
const countdownText = (resetAt) => {
  const at = num(resetAt);
  if (at === null) return t('resetUnknown');
  const ms = at - Date.now();
  if (ms <= 0) return t('resetSoon');
  const day = Math.floor(ms / 86400000), hour = Math.floor((ms % 86400000) / 3600000);
  const minute = Math.floor((ms % 3600000) / 60000);
  if (day > 0) return t('resetInDays')(day, hour);
  return hour > 0 ? t('resetInHours')(hour) : t('resetInMinutes')(Math.max(1, minute));
};
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/* local-cost helpers */
const costOf = (row) => (isObj(row) ? num(row.cost) ?? 0 : 0);
const sortModels = (rows) => (Array.isArray(rows) ? rows.filter(isObj) : [])
  .slice().sort((a, b) => costOf(b) - costOf(a));
const shortModel = (id) => {
  const raw = typeof id === 'string' && id ? id : '';
  if (!raw) return t('unknownModel');
  const slash = raw.lastIndexOf('/');
  return slash >= 0 && slash < raw.length - 1 ? raw.slice(slash + 1) : raw;
};
const rankModels = (rows) => {
  const rank = new Map();
  rows.forEach((row, i) => {
    if (typeof row.model === 'string' && row.model && !rank.has(row.model)) rank.set(row.model, i);
  });
  return rank;
};
const slotFor = (rank, id) => {
  const index = typeof id === 'string' ? rank.get(id) : undefined;
  return isNum(index) && index < TOP_MODELS ? index : OTHER_SLOT;
};
const localDate = (key) => {
  if (typeof key !== 'string') return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!parts) return null;
  const d = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};
const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const windowDays = (from, to, fallback) => {
  const start = localDate(from), end = localDate(to);
  if (!start || !end || end < start) return fallback;
  const days = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cur <= end && days.length < 31) {
    days.push(dayKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days.length > 0 ? days : fallback;
};
/** Split a fixed pixel budget between segments, keeping every non-zero part visible.
 *  `SEG_MIN_PX` is the slimmest bar that still reads and hovers under a 16px-wide column. */
const fitHeights = (values, total) => {
  const used = values.filter((v) => v > 0).length;
  const sum = values.reduce((a, b) => a + b, 0);
  if (used === 0 || !(total > 0) || !(sum > 0)) return values.map(() => 0);
  if (used * SEG_MIN_PX >= total) return values.map((v) => (v > 0 ? Math.floor(total / used) : 0));
  const rest = total - used * SEG_MIN_PX;
  return values.map((v) => (v > 0 ? Math.floor(SEG_MIN_PX + (v / sum) * rest) : 0));
};

/* mounting */
function buildBar(name) {
  const box = el('div', 'cg-bar'), progressSlot = el('div');
  const sub = el('div', 'cg-bar-sub'), note = el('div', 'cg-bar-sub');
  box.append(progressSlot, sub, note);
  return { box, progress: mountProgress(progressSlot, { value: 0, label: name }), sub, note };
}

function buildStat(label) {
  const box = el('div', 'cg-stat'), value = el('span', 'cg-stat-value', '—');
  box.append(el('span', 'cg-stat-label', label), value);
  return { box, value };
}

function buildCard(label) {
  const box = el('div', 'cg-card');
  const value = el('div', 'cg-card-value', '—');
  const sub = el('div', 'cg-card-sub');
  sub.hidden = true;
  box.append(el('div', 'cg-card-label', label), value, sub);
  return { box, value, sub };
}

function refreshIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228l-.997-1.795Zm13.074 15.134A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772l.997 1.795Z');
  svg.append(path);
  return svg;
}

function buildRefreshButton(slot) {
  const node = el('button', 'cg-iconbtn');
  node.type = 'button';
  const icon = refreshIcon();
  const ring = el('span', 'cg-iconbtn-ring');
  ring.hidden = true;
  node.append(icon, ring);
  const sync = (loading) => {
    node.disabled = Boolean(loading);
    node.setAttribute('aria-busy', loading ? 'true' : 'false');
    ring.hidden = !loading;
    icon.hidden = Boolean(loading);
  };
  const label = t('refresh');
  node.setAttribute('aria-label', label);
  node.title = label;
  node.addEventListener('click', () => {
    if (!node.disabled) void manualRefresh();
  });
  slot.append(node);
  sync(false);
  return { node, update: (next) => sync(next.loading) };
}

/* week-chart tooltip — a custom node so it carries tokens/sessions, not just a title */
const tip = { box: null, head: null, model: null, stat: null, tokens: null };
let tipSegNode = null;

function ensureTip() {
  if (tip.box) return tip.box;
  const box = el('div', 'cg-tip');
  const head = el('div', 'cg-tip-head');
  const model = el('div', 'cg-tip-model');
  const stat = el('div', 'cg-tip-line');
  const tokens = el('div', 'cg-tip-line');
  box.append(head, model, stat, tokens);
  box.hidden = true;
  document.body.append(box);
  Object.assign(tip, { box, head, model, stat, tokens });
  return box;
}

function tipLines(seg) {
  const weekday = seg.date ? t('weekdays')[seg.date.getDay()] : '';
  return [
    weekday ? `${seg.day} ${weekday}` : String(seg.day ?? ''),
    seg.label,
    `${money4(seg.cost)} · ${t('metaTurns')(int(num(seg.turns)))} · ${t('metaSessions')(int(num(seg.sessions)))}`,
    `${mtok(num(seg.input))} ${t('tokensIn')} / ${mtok(num(seg.output))} ${t('tokensOut')}`,
  ];
}

function positionTip(x, y) {
  const box = tip.box;
  const width = box.offsetWidth, height = box.offsetHeight;
  const maxLeft = Math.max(TIP_PAD, window.innerWidth - width - TIP_PAD);
  const maxTop = Math.max(TIP_PAD, window.innerHeight - height - TIP_PAD);
  let left = x + TIP_GAP;
  if (left > maxLeft) left = x - TIP_GAP - width;
  let top = y + TIP_GAP;
  if (top > maxTop) top = y - TIP_GAP - height;
  box.style.left = `${Math.round(Math.min(Math.max(TIP_PAD, left), maxLeft))}px`;
  box.style.top = `${Math.round(Math.min(Math.max(TIP_PAD, top), maxTop))}px`;
}

function showTip(node, x, y) {
  const seg = node.cgSeg;
  if (!seg) return;
  const lines = tipLines(seg);
  ensureTip();
  tip.head.textContent = lines[0];
  tip.model.textContent = lines[1];
  tip.stat.textContent = lines[2];
  tip.tokens.textContent = lines[3];
  tip.box.hidden = false;
  tipSegNode = node;
  positionTip(x, y);
}

function hideTip() {
  if (!tip.box || tip.box.hidden) return;
  tip.box.hidden = true;
  tipSegNode = null;
}

function segAt(target, stack) {
  const node = target instanceof Element ? target.closest('.cg-seg') : null;
  return node && node.cgSeg && stack.contains(node) ? node : null;
}

function buildLegend() {
  const box = el('div', 'cg-legend');
  const items = [];
  for (let i = 0; i < MODEL_COLORS.length; i++) {
    const item = el('span', 'cg-lg-item');
    item.style.setProperty('--cg-color', MODEL_COLORS[i]);
    item.hidden = true;
    box.append(item);
    items.push(item);
  }
  return { box, items };
}

function buildColumns() {
  const box = el('div', 'cg-chart');
  box.style.setProperty('--cg-plot', `${PLOT_PX}px`);
  const legend = buildLegend();
  const row = el('div', 'cg-cols');
  const cols = [];
  for (let i = 0; i < COLUMN_COUNT; i++) {
    const col = el('div', 'cg-col');
    const stack = el('div', 'cg-stack');
    stack.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const node = segAt(event.target, stack);
      if (!node) {
        hideTip();
        return;
      }
      if (tipSegNode !== node) showTip(node, event.clientX, event.clientY);
      else positionTip(event.clientX, event.clientY);
    });
    stack.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'touch') hideTip();
    });
    stack.addEventListener('pointerdown', (event) => {
      const node = segAt(event.target, stack);
      if (!node) {
        hideTip();
        return;
      }
      if (event.pointerType === 'touch') {
        if (tipSegNode === node) hideTip();
        else showTip(node, event.clientX, event.clientY);
      }
    });
    const value = el('span', 'cg-col-value');
    const day = el('span', 'cg-col-day');
    col.append(stack, value, day);
    col.hidden = true;
    row.append(col);
    cols.push({ col, stack, value, day, segs: [] });
  }
  box.append(legend.box, row);
  return { box, legend, row, cols };
}

function buildCalendar() {
  const box = el('div', 'cg-chart');
  const head = el('div', 'cg-cal-head');
  const heads = [];
  for (let i = 0; i < COLUMN_COUNT; i++) {
    const cell = el('span', 'cg-cal-dow');
    head.append(cell);
    heads.push(cell);
  }
  const grid = el('div', 'cg-cal');
  const cells = [];
  for (let i = 0; i < CALENDAR_CELLS; i++) {
    const cell = el('div', 'cg-cell');
    cell.hidden = true;
    grid.append(cell);
    cells.push(cell);
  }
  box.append(head, grid);
  return { box, heads, cells };
}

function buildModels() {
  const box = el('div', 'cg-models');
  const rows = [];
  for (let i = 0; i < BAR_ROWS + 1; i++) {
    const row = el('div', 'cg-model');
    const top = el('div', 'cg-model-top');
    const name = el('span', 'cg-model-name');
    const cost = el('span', 'cg-model-cost');
    top.append(name, cost);
    const meta = el('div', 'cg-model-meta');
    const track = el('div', 'cg-model-track');
    const fill = el('div', 'cg-model-fill');
    track.append(fill);
    row.append(top, meta, track);
    row.hidden = true;
    box.append(row);
    rows.push({ row, name, cost, meta, fill });
  }
  return { box, rows };
}

function buildUi() {
  const root = document.getElementById('root');
  const retry = { label: t('retry'), onClick: () => void manualRefresh() };
  const spinnerWrap = el('div', 'cg-state');
  mountSpinner(spinnerWrap, { label: t('loading') });
  const emptyWrap = el('div', 'cg-state');
  emptyWrap.hidden = true;
  const empty = mountEmpty(emptyWrap, { title: '', action: retry });
  const content = el('div', 'cg-shell');
  content.hidden = true;

  const planName = el('span', 'cg-plan', '—'), badgeSlot = el('span');
  const periodLine = el('div', 'cg-period', '—');
  const refreshSlot = el('span', 'cg-refresh');
  const headTop = el('div', 'cg-head-top');
  headTop.append(planName, badgeSlot, el('span', 'cg-spacer'), refreshSlot);
  const head = el('header', 'cg-head');
  head.append(headTop, periodLine);

  const bannerSlot = el('div');
  bannerSlot.hidden = true;
  const banner = mountBanner(bannerSlot, { tone: 'warning', title: '' });

  const cards = el('div', 'cg-cards');
  const cardRequests = buildCard(t('cardRequests'));
  const cardSuccess = buildCard(t('cardSuccess'));
  const cardCost = buildCard(t('cardCost'));
  const cardTokens = buildCard(t('cardTokens'));
  cards.append(cardRequests.box, cardSuccess.box, cardCost.box, cardTokens.box);

  const bars = el('div', 'cg-bars');
  const fiveHour = buildBar(t('barFiveHour'));
  const weekly = buildBar(t('barWeekly'));
  const monthly = buildBar(t('barMonthly'));
  bars.append(fiveHour.box, weekly.box, monthly.box);

  const localRange = el('span', 'cg-sec-note', '');
  const localHead = el('div', 'cg-sec-head');
  localHead.append(el('span', 'cg-sec-title', t('localCost')), localRange);
  const tabsSlot = el('div', 'cg-tabs');
  const tabs = mountTabs(tabsSlot, {
    items: RANGE_TABS.map(({ id, key }) => ({ id, label: t(key) })), activeId: state.range, trackBackground: true,
    onChange: (next) => {
      if (next !== state.range) selectRange(next);
    },
  });

  const stats = el('div', 'cg-stats');
  const statTurns = buildStat(t('statTurns')), statTokens = buildStat(t('statTokens')), statCost = buildStat(t('statCost'));
  stats.append(statTurns.box, statTokens.box, statCost.box);
  const statsNote = el('div', 'cg-stats-note', '');
  const localNote = el('div', 'cg-note', '');
  localNote.hidden = true;

  const daySepSlot = el('div');
  mountSeparator(daySepSlot, { label: t('sepByDay') });
  const dayChartSlot = el('div');
  dayChartSlot.setAttribute('role', 'group');
  dayChartSlot.setAttribute('aria-label', t('ariaByDay'));
  const columns = buildColumns();
  const calendar = buildCalendar();
  dayChartSlot.append(columns.box, calendar.box);
  columns.box.hidden = true;
  calendar.box.hidden = true;

  const modelSepSlot = el('div');
  mountSeparator(modelSepSlot, { label: t('sepByModel') });
  const models = buildModels();
  models.box.setAttribute('role', 'group');
  models.box.setAttribute('aria-label', t('ariaByModel'));

  const localSection = el('section', 'cg-section');
  localSection.append(
    localHead, tabsSlot, stats, statsNote, localNote,
    daySepSlot, dayChartSlot, modelSepSlot, models.box,
  );

  const updatedLine = el('span', 'cg-foot-note', '—');
  const footRow = el('div', 'cg-foot-row');
  footRow.append(updatedLine);
  const foot = el('footer', 'cg-foot');
  foot.append(footRow);

  const badge = mountBadge(badgeSlot, { label: '' });
  badgeSlot.hidden = true;
  const refreshButton = buildRefreshButton(refreshSlot);

  content.append(head, cards, bannerSlot, bars, localSection, foot);
  root.append(spinnerWrap, emptyWrap, content);
  ui = {
    spinnerWrap, emptyWrap, empty, content, planName, badgeSlot, badge, periodLine, bannerSlot,
    banner, cards: { requests: cardRequests, success: cardSuccess, cost: cardCost, tokens: cardTokens },
    fiveHour, weekly, monthly, tabs, localRange, statTurns, statTokens, statCost,
    statsNote, localNote, daySepSlot, dayChartSlot, columns, calendar, modelSepSlot, models,
    updatedLine, refreshButton,
  };
}

/* chart renderers — nodes are built once and updated in place so transitions run */
function updateLegend(chart, models) {
  for (let i = 0; i < TOP_MODELS; i++) {
    const row = models[i];
    const item = chart.legend.items[i];
    item.hidden = !row;
    if (row) item.textContent = shortModel(row.model);
  }
  const tail = chart.legend.items[OTHER_SLOT];
  tail.hidden = models.length <= TOP_MODELS;
  tail.textContent = t('other');
}

function paintStack(cell, segs, heights) {
  while (cell.segs.length < segs.length) {
    const node = el('div', 'cg-seg');
    node.setAttribute('role', 'img');
    cell.stack.append(node);
    cell.segs.push(node);
  }
  const topIndex = heights.reduce((acc, height, i) => (height > 0 ? i : acc), -1);
  cell.segs.forEach((node, i) => {
    const seg = segs[i];
    if (!seg) {
      node.hidden = true;
      node.cgSeg = null;
      node.removeAttribute('aria-label');
      return;
    }
    node.hidden = false;
    node.cgSeg = seg;
    node.classList.toggle('is-top', i === topIndex);
    node.style.setProperty('--cg-color', MODEL_COLORS[seg.slot] ?? MODEL_COLORS[OTHER_SLOT]);
    node.style.height = `${heights[i]}px`;
    node.setAttribute('aria-label', tipLines(node.cgSeg).join(' · '));
  });
}

function updateColumns(chart, local, models, rank, byDay) {
  hideTip();
  const lookup = new Map();
  const fallback = [];
  for (const row of byDay) {
    if (typeof row.day !== 'string') continue;
    lookup.set(row.day, row);
    fallback.push(row.day);
  }
  const days = windowDays(local.from, local.to, fallback).slice(-COLUMN_COUNT);
  const prepared = days.map((key) => {
    const row = lookup.get(key);
    const groups = new Map();
    if (row && Array.isArray(row.models)) {
      for (const item of row.models.filter(isObj)) {
        const cost = Math.max(0, costOf(item));
        if (cost <= 0) continue;
        const slot = slotFor(rank, item.model);
        const agg = groups.get(slot) ?? {
          count: 0, cost: 0, turns: 0, input: 0, output: 0, reasoning: 0,
          cache_read: 0, cache_write: 0, sessions: 0, model: null,
        };
        agg.count += 1;
        agg.cost += cost;
        agg.turns += num(item.turns) ?? 0;
        agg.input += num(item.input) ?? 0;
        agg.output += num(item.output) ?? 0;
        agg.reasoning += num(item.reasoning) ?? 0;
        agg.cache_read += num(item.cache_read) ?? 0;
        agg.cache_write += num(item.cache_write) ?? 0;
        agg.sessions += num(item.sessions) ?? 0;
        agg.model = typeof item.model === 'string' && item.model ? item.model : agg.model;
        groups.set(slot, agg);
      }
    }
    const declared = row ? num(row.cost) : null;
    const total = Math.max(0, declared ?? [...groups.values()].reduce((acc, agg) => acc + agg.cost, 0));
    if (groups.size === 0 && total > 0) {
      groups.set(OTHER_SLOT, {
        count: 0, cost: total, turns: 0, input: 0, output: 0, reasoning: 0,
        cache_read: 0, cache_write: 0, sessions: 0, model: null,
      });
    }
    const date = localDate(key);
    const segs = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([slot, agg]) => ({
      slot, cost: agg.cost, day: key, date,
      label: agg.count > 1 ? t('other') : agg.model ? shortModel(agg.model) : t('unknownModel'),
      turns: agg.count > 0 ? agg.turns : null,
      sessions: agg.count === 1 ? num(agg.sessions) : null,
      input: agg.input, output: agg.output,
    }));
    return { key, date, total, segs, hasActivity: Boolean(row) };
  });
  const max = prepared.reduce((acc, day) => Math.max(acc, day.total), 0);
  const weekdays = t('weekdays');
  chart.cols.forEach((cell, i) => {
    const day = prepared[i];
    if (!day) {
      cell.col.hidden = true;
      return;
    }
    cell.col.hidden = false;
    const budget = max > 0 ? Math.round((day.total / max) * PLOT_INNER_PX) : 0;
    paintStack(cell, day.segs, fitHeights(day.segs.map((seg) => seg.cost), budget));
    /* hasActivity, not total > 0: unpriced models record cost 0 and are never backfilled, so a day
     * can hold real work with a zero bill — that is "$0.00", not the no-data dash. */
    cell.value.textContent = day.hasActivity ? money(day.total) : t('emptyDash');
    cell.value.classList.toggle('is-zero', day.hasActivity && day.total <= 0);
    cell.day.textContent = day.date ? weekdays[day.date.getDay()] ?? shortDay(day.key) : shortDay(day.key);
  });
  updateLegend(chart, models);
}

function updateCalendar(chart, local, byDay) {
  const base = localDate(local.from) ?? (byDay[0] ? localDate(byDay[0].day) : null);
  if (!base) return;
  const year = base.getFullYear(), month = base.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  const leading = new Date(year, month, 1).getDay();
  const lookup = new Map();
  for (const row of byDay) if (typeof row.day === 'string') lookup.set(row.day, row);
  const costs = [];
  for (let d = 1; d <= count; d++) {
    const row = lookup.get(`${year}-${pad2(month + 1)}-${pad2(d)}`);
    costs.push(row ? Math.max(0, costOf(row)) : 0);
  }
  const max = costs.reduce((a, b) => Math.max(a, b), 0);
  const weekdays = t('weekdays');
  chart.heads.forEach((node, i) => { node.textContent = weekdays[i] ?? ''; });
  chart.cells.forEach((cell, i) => {
    const offset = i - leading;
    if (offset < 0 || offset >= count) {
      cell.hidden = true;
      return;
    }
    cell.hidden = false;
    cell.style.gridColumn = String((i % COLUMN_COUNT) + 1);
    cell.style.gridRow = String(Math.floor(i / COLUMN_COUNT) + 1);
    const cost = costs[offset];
    cell.dataset.day = String(offset + 1);
    if (cost > 0 && max > 0) {
      const ratio = Math.min(1, cost / max) ** 0.7;
      const mix = (HEAT_MIN_MIX + (HEAT_MAX_MIX - HEAT_MIN_MIX) * ratio).toFixed(1);
      cell.dataset.cost = money(cost);
      cell.style.background = `color-mix(in oklab, var(--oc-primary) ${mix}%, var(--oc-elevated))`;
    } else {
      cell.dataset.cost = t('emptyDash');
      cell.style.background = '';
    }
  });
}

const metaText = (row) => [
  t('metaTurns')(int(num(row.turns))),
  t('metaSessions')(int(num(row.sessions))),
  t('metaTokens')(mtok(tokenTotal(row))),
  t('metaCached')(cachePctText(row)),
].join(t('metaSep'));

function updateModels(chart, models) {
  const top = models.slice(0, BAR_ROWS);
  const rest = models.slice(BAR_ROWS);
  const max = top.length > 0 ? costOf(top[0]) : 0;
  const rows = top.map((row, i) => ({
    name: shortModel(row.model), cost: costOf(row), slot: i < TOP_MODELS ? i : OTHER_SLOT, meta: metaText(row),
  }));
  if (rest.length > 0) {
    const tail = { turns: 0, cost: 0, input: 0, output: 0, reasoning: 0, cache_read: 0, cache_write: 0, sessions: null };
    for (const row of rest) {
      tail.turns += num(row.turns) ?? 0;
      tail.cost += costOf(row);
      for (const key of tokenKeys) tail[key] += num(row[key]) ?? 0;
    }
    rows.push({ name: t('other'), cost: tail.cost, slot: OTHER_SLOT, meta: metaText(tail) });
  }
  chart.rows.forEach((cell, i) => {
    const row = rows[i];
    if (!row) {
      cell.row.hidden = true;
      return;
    }
    cell.row.hidden = false;
    cell.row.style.setProperty('--cg-color', MODEL_COLORS[row.slot] ?? MODEL_COLORS[OTHER_SLOT]);
    cell.name.textContent = row.name;
    cell.cost.textContent = money(row.cost);
    cell.meta.textContent = row.meta;
    cell.fill.style.width = max > 0 ? `${(Math.min(1, row.cost / max) * 100).toFixed(1)}%` : '0%';
  });
}

/* render */
function renderHeader(d) {
  const plan = isObj(d.plan) ? d.plan : null;
  const planId = plan && typeof plan.planId === 'string' && plan.planId ? plan.planId : null;
  const status = plan && typeof plan.status === 'string' && plan.status ? plan.status : null;
  const start = plan ? plan.periodStart : null;
  const end = plan ? plan.periodEnd : null;
  ui.planName.textContent = planId ?? t('planFallback');
  ui.badgeSlot.hidden = !status;
  if (status) ui.badge.update({ label: status, tone: status === 'active' ? 'success' : 'warning' });
  ui.periodLine.textContent = start && end ? `${dateText(start)} → ${dateText(end)}` : t('periodUnavailable');
}

function fillWindowBar(bar, name, win) {
  const pct = pctOf(win);
  if (pct === null) {
    bar.box.hidden = true;
    return;
  }
  const cap = num(win.cap);
  const used = num(win.used);
  const remaining = cap !== null && used !== null ? Math.max(0, cap - used) : null;
  bar.box.hidden = false;
  bar.progress.update({ value: pct, label: `${name} · ${pctText(pct)}`, tone: toneFor(pct) });
  bar.sub.textContent = `${t('remaining')} ${money(remaining)} · ${countdownText(win.resetAt)}`;
  bar.sub.hidden = false;
  bar.note.hidden = true;
}

function fillMonthlyBar(d) {
  const bar = ui.monthly;
  const credits = isObj(d.credits) ? d.credits : null;
  const usage = isObj(d.periodUsage) ? d.periodUsage : null;
  const used = usage ? num(usage.totalCost) : null;
  const remaining = credits ? num(credits.monthlyRemaining) : null;
  const total = used !== null && remaining !== null ? used + remaining : null;
  if (total === null) {
    bar.box.hidden = true;
    return;
  }
  const pct = total > 0 ? (used / total) * 100 : 0;
  const end = isObj(d.plan) ? d.plan.periodEnd : null;
  bar.box.hidden = false;
  bar.progress.update({ value: pct, label: `${t('barMonthly')} · ${pctText(pct)}`, tone: toneFor(pct) });
  bar.sub.textContent = `${t('used')} ${money(used)} / ${money(total)} · ${t('remaining')} ${money(remaining)}`;
  bar.sub.hidden = false;
  bar.note.textContent = end ? `${t('periodEnds')} ${dateText(end)}` : '';
  bar.note.hidden = !end;
}

function renderBars(d) {
  const windows = isObj(d.windows) ? d.windows : null;
  fillWindowBar(ui.fiveHour, t('barFiveHour'), windows && isObj(windows.fiveHour) ? windows.fiveHour : null);
  fillWindowBar(ui.weekly, t('barWeekly'), windows && isObj(windows.weekly) ? windows.weekly : null);
  fillMonthlyBar(d);
}

function renderCards(d) {
  const usage = isObj(d.periodUsage) ? d.periodUsage : null;
  const cards = ui.cards;
  const all = [cards.requests, cards.success, cards.cost, cards.tokens];
  if (!usage) {
    for (const card of all) {
      card.value.textContent = t('emptyDash');
      card.sub.textContent = '';
      card.sub.hidden = true;
    }
    return;
  }
  cards.requests.value.textContent = plainInt(num(usage.totalCount));
  cards.requests.sub.textContent = t('cardFailed')(plainInt(num(usage.failedCount)));
  cards.requests.sub.hidden = false;
  const rate = num(usage.successRate);
  cards.success.value.textContent = isNum(rate) ? `${rate.toFixed(2)}%` : t('emptyDash');
  cards.success.sub.hidden = true;
  cards.cost.value.textContent = money4(num(usage.totalCost));
  cards.cost.sub.textContent = `${money(num(usage.totalCredits))} ${t('creditsLabel')}`;
  cards.cost.sub.hidden = false;
  cards.tokens.value.textContent = mtok(num(usage.tokens));
  cards.tokens.sub.textContent = `${mtok(num(usage.tokensIn))} ${t('tokensIn')} / ${mtok(num(usage.tokensOut))} ${t('tokensOut')}`;
  cards.tokens.sub.hidden = false;
}

function renderLocal(d) {
  hideTip();
  const local = isObj(d.local) ? d.local : null;
  const totals = local && isObj(local.totals) ? local.totals : null;
  const from = local && typeof local.from === 'string' ? local.from : null;
  const to = local && typeof local.to === 'string' ? local.to : null;
  ui.localRange.textContent = from && to ? (from === to ? shortDay(from) : `${shortDay(from)} ~ ${shortDay(to)}`) : '';

  if (totals) {
    const counters = tokenKeys.map((key) => num(totals[key]) ?? 0);
    ui.statTurns.value.textContent = int(num(totals.turns));
    ui.statTokens.value.textContent = mtok(counters.reduce((a, b) => a + b, 0));
    ui.statCost.value.textContent = money(num(totals.cost));
    ui.statsNote.textContent = [
      `${t('tokensIn')} ${mtok(counters[0])}`,
      `${t('tokensOut')} ${mtok(counters[1])}`,
      `${t('tokensReasoning')} ${mtok(counters[2])}`,
      `${t('tokensCache')} ${mtok(counters[3] + counters[4])}`,
      `${t('statSessions')} ${int(num(totals.sessions))}`,
      `${t('statFailed')} ${int(num(totals.failed))}`,
    ].join(t('metaSep'));
  } else {
    const dash = t('emptyDash');
    ui.statTurns.value.textContent = dash;
    ui.statTokens.value.textContent = dash;
    ui.statCost.value.textContent = dash;
    ui.statsNote.textContent = t('recordUnavailable');
  }

  const byDay = local && Array.isArray(local.byDay) ? local.byDay.filter(isObj) : [];
  const models = local ? sortModels(local.byModel) : [];
  const rank = rankModels(models);
  const hasData = Boolean(local) && (byDay.length > 0 || models.length > 0);
  const view = state.dataRange ?? state.range;

  ui.localNote.hidden = hasData;
  ui.localNote.textContent = local ? t('noActivity') : t('recordUnavailable');

  const showDay = hasData && (view === 'week' || view === 'month') && byDay.length > 0;
  ui.daySepSlot.hidden = !showDay;
  ui.dayChartSlot.hidden = !showDay;
  ui.modelSepSlot.hidden = !hasData;
  ui.models.box.hidden = !hasData;

  if (showDay) {
    const isMonth = view === 'month';
    ui.columns.box.hidden = isMonth;
    ui.calendar.box.hidden = !isMonth;
    if (isMonth) updateCalendar(ui.calendar, local, byDay);
    else updateColumns(ui.columns, local, models, rank, byDay);
  }
  if (hasData) updateModels(ui.models, models);
}

function renderFooter(d) {
  ui.updatedLine.textContent = d.generatedAt ? `${t('updatedPrefix')} ${timeText(d.generatedAt)}` : t('updatedUnknown');
}

function renderNotice(d) {
  const errors = d && Array.isArray(d.errors) ? d.errors.filter(isObj) : [];
  const missing = !d ? [] : [
    !isObj(d.plan) ? t('missingPlan') : null, !isObj(d.windows) && !isObj(d.credits) ? t('missingQuota') : null,
    !isObj(d.periodUsage) ? t('missingPeriodUsage') : null, !isObj(d.local) ? t('missingLocal') : null,
  ].filter(Boolean);

  if (errors.length > 0) {
    const body = errors.map((e) => `${typeof e.source === 'string' ? `${e.source}: ` : ''}${typeof e.message === 'string' ? e.message : t('unknownError')}`).join(t('errorSep'));
    ui.banner.update({ tone: 'warning', title: t('noticePartial')(errors.length), body });
    ui.bannerSlot.hidden = false;
    return;
  }
  if (missing.length > 0) {
    ui.banner.update({ tone: 'warning', title: `${t('noticeMissingPrefix')}${missing.join(t('listSep'))}`, body: '' });
    ui.bannerSlot.hidden = false;
    return;
  }
  if (state.problem && state.problem.kind === 'data') {
    ui.banner.update({ tone: 'error', title: t('dataReadFailed'), body: state.problem.message });
    ui.bannerSlot.hidden = false;
    return;
  }
  ui.bannerSlot.hidden = true;
}

function pushBadge(d) {
  const weekly = d && isObj(d.windows) && isObj(d.windows.weekly) ? d.windows.weekly : null;
  const pct = weekly ? pctOf(weekly) : null;
  const count = isNum(pct) ? Math.max(0, Math.min(999, Math.round(100 - pct))) : null;
  host.setBadge(count).catch(() => {});
}

function render() {
  const d = isObj(state.data) ? state.data : null;
  const serviceDown = Boolean(state.problem && state.problem.kind === 'service');
  const dataDown = Boolean(state.problem && state.problem.kind === 'data' && !d);

  if (serviceDown) ui.empty.update({ title: t('serviceNotReady'), body: t('serviceHint') });
  else if (dataDown) ui.empty.update({ title: t('dataReadFailed'), body: state.problem.message });

  ui.emptyWrap.hidden = !(serviceDown || dataDown);
  ui.content.hidden = serviceDown || dataDown || !d;
  ui.spinnerWrap.hidden = !(state.loading && !d && !serviceDown && !dataDown);
  ui.refreshButton.update({ loading: state.loading });

  if (d) {
    renderHeader(d);
    renderCards(d);
    renderBars(d);
    renderLocal(d);
    renderFooter(d);
  }
  renderNotice(d);
  pushBadge(d);
}

function parsePayload(body) {
  let value = body;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return isObj(value) ? value : null;
}

/** Remembered per range so switching back paints from memory without a round trip. */
const showCached = (range) => {
  const payload = cache.get(range);
  if (!payload) return false;
  fetchSeq += 1;
  state.loading = false;
  state.problem = null;
  state.data = payload;
  state.dataRange = range;
  render();
  return true;
};

function selectRange(next) {
  state.range = next;
  ui.tabs.update({ activeId: next });
  if (!showCached(next)) void refresh();
}

function manualRefresh() {
  cache.clear();
  void refresh(true);
}

/** `fresh` asks the service to bypass its stale-while-revalidate cache; only user-triggered refreshes set it. */
async function refresh(fresh = false) {
  const range = state.range;
  const seq = ++fetchSeq;
  state.loading = true;
  render();
  try {
    const query = fresh ? { range, fresh: '1' } : { range };
    const result = await host.serviceRequest({ method: 'GET', path: '/summary', query });
    if (seq !== fetchSeq) return;
    if (!result || !isNum(result.status) || result.status !== 200) {
      state.data = null;
      state.dataRange = null;
      state.problem = { kind: 'service', message: `${t('httpReturned')} HTTP ${result && result.status}` };
      return;
    }
    const payload = parsePayload(result.body);
    if (!payload) {
      state.problem = { kind: 'data', message: t('badResponse') };
      return;
    }
    state.data = payload;
    state.dataRange = range;
    state.problem = null;
    cache.set(range, payload);
  } catch (error) {
    if (seq !== fetchSeq) return;
    const code = error && error.code;
    if (SERVICE_CODES.has(code)) {
      state.data = null;
      state.dataRange = null;
      state.problem = { kind: 'service', message: error.message || t('serviceUnavailable') };
    } else {
      state.problem = { kind: 'data', message: error && error.message ? error.message : t('readFailed') };
    }
  } finally {
    if (seq === fetchSeq) {
      state.loading = false;
      render();
    }
  }
}

host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  const next = resolveLang(ctx && ctx.locale);
  const switched = next !== lang;
  lang = next;
  document.title = t('docTitle');
  document.documentElement.lang = next;
  if (!mounted) {
    mounted = true;
    buildUi();
    if (!showCached(state.range)) void refresh();
    return;
  }
  if (switched) {
    document.getElementById('root').replaceChildren();
    buildUi();
    render();
  }
});

window.setInterval(() => {
  if (state.data) renderBars(state.data);
}, 30000);

/* a tap outside the chart dismisses a touch-opened tooltip; scrolling invalidates its anchor */
document.addEventListener('pointerdown', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target || !target.closest('.cg-seg')) hideTip();
}, true);
window.addEventListener('scroll', hideTip, { capture: true, passive: true });
