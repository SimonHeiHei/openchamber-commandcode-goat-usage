import { connectHost } from '@openchamber/sdk';
import {
  applyHostReady, mountBadge, mountBanner, mountButton, mountEmpty, mountList,
  mountProgress, mountSeparator, mountSpinner, mountTabs, mountText,
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
    turnsUnit: '轮',
    unknownModel: '未知模型',
    updatedPrefix: '更新于',
    updatedUnknown: '更新时间未知',
    lifetimeUnavailable: '累计用量不可用',
    lifetime: (count, rate, tokens) => `累计 ${count} 次 · 成功率 ${rate} · ${tokens} tokens`,
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
    turnsUnit: 'turns',
    unknownModel: 'Unknown model',
    updatedPrefix: 'Updated',
    updatedUnknown: 'Update time unknown',
    lifetimeUnavailable: 'Lifetime usage unavailable',
    lifetime: (count, rate, tokens) => `${count} calls · ${rate} success · ${tokens} tokens`,
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

const state = { range: 'today', data: null, loading: false, problem: null };
let ui = null;
let fetchSeq = 0;
let mounted = false;

const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const num = (v) => (isNum(v) ? v : null);
const int = (v) => (isNum(v) ? Math.round(v).toLocaleString('en-US') : '—');
const money = (v) => (isNum(v) ? `$${v.toFixed(2)}` : '—');
const pctText = (v) => (isNum(v) ? `${v.toFixed(1).replace(/\.0$/, '')}%` : '—');
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

function buildUi() {
  const root = document.getElementById('root');
  const retry = { label: t('retry'), onClick: () => void refresh() };
  const spinnerWrap = el('div', 'cg-state');
  mountSpinner(spinnerWrap, { label: t('loading') });
  const emptyWrap = el('div', 'cg-state');
  emptyWrap.hidden = true;
  const empty = mountEmpty(emptyWrap, { title: '', action: retry });
  const content = el('div', 'cg-shell');
  content.hidden = true;

  const planName = el('span', 'cg-plan', '—'), badgeSlot = el('span');
  const periodLine = el('div', 'cg-period', '—');
  const headTop = el('div', 'cg-head-top');
  headTop.append(planName, badgeSlot, el('span', 'cg-spacer'));
  const head = el('header', 'cg-head');
  head.append(headTop, periodLine);

  const bannerSlot = el('div');
  bannerSlot.hidden = true;
  const banner = mountBanner(bannerSlot, { tone: 'warning', title: '' });

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
      if (next === state.range) return;
      state.range = next;
      tabs.update({ activeId: next });
      void refresh();
    },
  });

  const stats = el('div', 'cg-stats');
  const statTurns = buildStat(t('statTurns')), statTokens = buildStat(t('statTokens')), statCost = buildStat(t('statCost'));
  stats.append(statTurns.box, statTokens.box, statCost.box);
  const statsNote = el('div', 'cg-stats-note', '');

  const daySepSlot = el('div');
  mountSeparator(daySepSlot, { label: t('sepByDay') });
  const dayListSlot = el('div');
  const listDefaults = { items: [], emptyText: t('noActivity'), onSelect: () => {} };
  const byDay = mountList(dayListSlot, { ...listDefaults, ariaLabel: t('ariaByDay') });
  const modelSepSlot = el('div');
  mountSeparator(modelSepSlot, { label: t('sepByModel') });
  const modelListSlot = el('div');
  const byModel = mountList(modelListSlot, { ...listDefaults, ariaLabel: t('ariaByModel') });

  const localSection = el('section', 'cg-section');
  localSection.append(localHead, tabsSlot, stats, statsNote, daySepSlot, dayListSlot, modelSepSlot, modelListSlot);

  const updatedLine = el('span', 'cg-foot-note', '—'), refreshSlot = el('span');
  const footRow = el('div', 'cg-foot-row');
  footRow.append(updatedLine, refreshSlot);
  const lifetimeSlot = el('div', 'cg-lifetime'), lifetime = mountText(lifetimeSlot, { text: '' });
  const foot = el('footer', 'cg-foot');
  foot.append(footRow, lifetimeSlot);

  const badge = mountBadge(badgeSlot, { label: '' });
  badgeSlot.hidden = true;
  const refreshButton = mountButton(refreshSlot, {
    label: t('refresh'), variant: 'outline', size: 'xs', onClick: () => void refresh(),
  });

  content.append(head, bannerSlot, bars, localSection, foot);
  root.append(spinnerWrap, emptyWrap, content);
  ui = {
    spinnerWrap, emptyWrap, content, planName, badgeSlot, badge, periodLine, bannerSlot,
    banner, fiveHour, weekly, monthly, tabs, localRange, statTurns, statTokens, statCost,
    statsNote, byDay, byModel, updatedLine, refreshButton, lifetime,
  };
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

function renderLocal(d) {
  const local = isObj(d.local) ? d.local : null;
  const totals = local && isObj(local.totals) ? local.totals : null;
  const from = local && typeof local.from === 'string' ? local.from : null;
  const to = local && typeof local.to === 'string' ? local.to : null;
  ui.localRange.textContent = from && to ? (from === to ? shortDay(from) : `${shortDay(from)} ~ ${shortDay(to)}`) : '';

  if (totals) {
    const [input, output, reasoning, cache] = ['input', 'output', 'reasoning', 'cache_read'].map((k) => num(totals[k]) ?? 0);
    ui.statTurns.value.textContent = int(num(totals.turns));
    ui.statTokens.value.textContent = int(input + output + reasoning + cache);
    ui.statCost.value.textContent = money(num(totals.cost));
    ui.statsNote.textContent = `${t('tokensIn')} ${int(input)} · ${t('tokensOut')} ${int(output)} · ${t('tokensReasoning')} ${int(reasoning)} · ${t('tokensCache')} ${int(cache)}`;
  } else {
    const dash = '—';
    ui.statTurns.value.textContent = dash;
    ui.statTokens.value.textContent = dash;
    ui.statCost.value.textContent = dash;
    ui.statsNote.textContent = t('recordUnavailable');
  }

  const emptyText = local ? t('noActivity') : t('recordUnavailable');
  const byDay = local && Array.isArray(local.byDay) ? local.byDay.filter(isObj) : [];
  byDay.sort((a, b) => String(a.day ?? '').localeCompare(String(b.day ?? '')));
  ui.byDay.update({
    items: byDay.map((row, i) => ({
      id: `day:${i}:${String(row.day ?? '')}`, title: shortDay(row.day),
      subtitle: `${int(num(row.turns))} ${t('turnsUnit')}`, meta: money(num(row.cost)),
    })),
    emptyText,
  });

  const byModel = local && Array.isArray(local.byModel) ? local.byModel.filter(isObj) : [];
  byModel.sort((a, b) => (num(b.cost) ?? 0) - (num(a.cost) ?? 0));
  ui.byModel.update({
    items: byModel.map((row, i) => ({
      id: `model:${i}:${String(row.model ?? '')}`,
      title: typeof row.model === 'string' && row.model ? row.model : t('unknownModel'),
      subtitle: `${int(num(row.turns))} ${t('turnsUnit')}`, meta: money(num(row.cost)),
    })),
    emptyText,
  });
}

function renderFooter(d) {
  const usage = isObj(d.periodUsage) ? d.periodUsage : null;
  ui.updatedLine.textContent = d.generatedAt ? `${t('updatedPrefix')} ${timeText(d.generatedAt)}` : t('updatedUnknown');
  if (!usage) {
    ui.lifetime.update({ text: t('lifetimeUnavailable') });
    return;
  }
  const rate = num(usage.successRate);
  const tokens = num(usage.tokens) ?? (num(usage.tokensIn) ?? 0) + (num(usage.tokensOut) ?? 0);
  ui.lifetime.update({
    text: t('lifetime')(int(num(usage.totalCount)), isNum(rate) ? `${rate.toFixed(2)}%` : '—', int(tokens)),
  });
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

async function refresh() {
  const seq = ++fetchSeq;
  state.loading = true;
  render();
  try {
    const result = await host.serviceRequest({ method: 'GET', path: '/summary', query: { range: state.range } });
    if (seq !== fetchSeq) return;
    if (!result || !isNum(result.status) || result.status !== 200) {
      state.data = null;
      state.problem = { kind: 'service', message: `${t('httpReturned')} HTTP ${result && result.status}` };
      return;
    }
    const payload = parsePayload(result.body);
    if (!payload) {
      state.problem = { kind: 'data', message: t('badResponse') };
      return;
    }
    state.data = payload;
    state.problem = null;
  } catch (error) {
    if (seq !== fetchSeq) return;
    const code = error && error.code;
    if (SERVICE_CODES.has(code)) {
      state.data = null;
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
    void refresh();
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
