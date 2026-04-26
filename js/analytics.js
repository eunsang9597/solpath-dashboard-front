/**
 * 일/월간 매출 및 인원 지표 — GAS JSONP
 */
import { GAS_BASE_URL, GAS_MODE } from './config.js';

const SCOPE_LABEL = { category: '대분류', product: '상품' };

/** 시트·API용 영문 키 → 표에만 한글 (저장 값은 그대로) */
const AN_CATEGORY_KEY_LABEL = {
  unmapped: '미분류',
  solpass: '솔패스',
  solutine: '솔루틴',
  challenge: '챌린지',
  textbook: '교재',
  jasoseo: '자소서'
};

/**
 * @param {string} scope
 * @param {string} key
 */
function displayScopeValueForTable_(scope, key) {
  const k = String(key != null ? key : '').trim();
  if (!k.length) {
    return '—';
  }
  if (String(scope) === 'product') {
    return '상품 번호 ' + k;
  }
  return AN_CATEGORY_KEY_LABEL[k] != null ? AN_CATEGORY_KEY_LABEL[k] : k;
}

/**
 * GAS JSONP (쿼리 파라미터)
 * @param {string} baseUrl
 * @param {string} action
 * @param {Record<string, string> | null} extraParams
 * @param {number} timeoutMs
 * @returns {Promise<Object>}
 */
function gasJsonpWithParams(baseUrl, action, extraParams, timeoutMs) {
  return new Promise(function (resolve, reject) {
    const cb = '_sp_an_' + String(Date.now()) + '_' + String(Math.floor(Math.random() * 1e9));
    const lim = timeoutMs != null ? timeoutMs : 120000;
    const t = window.setTimeout(function () {
      cleanup();
      reject(new Error('timeout'));
    }, lim);
    const s = document.createElement('script');
    const g = globalThis;
    function cleanup() {
      window.clearTimeout(t);
      try {
        delete g[cb];
      } catch (_e) {
        g[cb] = undefined;
      }
      if (s.parentNode) {
        s.parentNode.removeChild(s);
      }
    }
    g[cb] = function (/** @type {object} */ data) {
      cleanup();
      resolve(data);
    };
    let u;
    try {
      u = new URL(baseUrl);
    } catch (_e) {
      cleanup();
      reject(new Error('bad url'));
      return;
    }
    u.searchParams.set('format', 'jsonp');
    u.searchParams.set('callback', cb);
    u.searchParams.set('action', action);
    if (extraParams) {
      Object.keys(extraParams).forEach(function (k) {
        u.searchParams.set(k, extraParams[k]);
      });
    }
    s.async = true;
    s.src = u.toString();
    s.onerror = function () {
      cleanup();
      reject(new Error('script error'));
    };
    document.head.appendChild(s);
  });
}

/**
 * @param {string} baseUrl
 * @param {Object[]} rows
 * @param {number} maxEncLen
 */
async function analyticsTargetsApplyBatched_(baseUrl, rows, maxEncLen) {
  const all = rows || [];
  let i = 0;
  while (i < all.length) {
    let n;
    for (n = 1; n <= all.length - i; n++) {
      if (encodeURIComponent(JSON.stringify({ rows: all.slice(i, i + n) })).length > maxEncLen) {
        break;
      }
    }
    n -= 1;
    if (n < 1) {
      n = 1;
    }
    const chunk = all.slice(i, i + n);
    const r = await gasJsonpWithParams(
      baseUrl,
      'analyticsTargetsApply',
      { payload: JSON.stringify({ rows: chunk }) },
      120000
    );
    if (!r || !r.ok) {
      return r;
    }
    i += n;
  }
  return { ok: true, data: { written: all.length } };
}

/**
 * @param {unknown} r
 */
function errMsg_(r) {
  if (!r) {
    return '응답이 없습니다.';
  }
  if (typeof r.error === 'string' && r.error.length) {
    return r.error;
  }
  var msg = '';
  if (r.error && typeof r.error === 'object' && r.error.message) {
    msg = String(r.error.message);
  } else if (r.message) {
    msg = String(r.message);
  }
  if (!msg) {
    return '';
  }
  if (msg.indexOf('원천 DB') >= 0 || msg.indexOf('SHEETS_MASTER') >= 0 || (msg.indexOf('Drive') >= 0 && msg.indexOf('부모') >= 0)) {
    return '먼저 「데이터 동기화」에서 한 번 실행한 뒤, 다시 눌러 주세요.';
  }
  return msg;
}

/**
 * @param {string} action
 * @param {object|null} result
 * @param {Error|unknown} [caught]
 */
function logSolpathApi_(action, result, caught) {
  const payload = { action: action, ok: result && result.ok === true };
  if (result && !result.ok) {
    payload.error = result.error;
    payload.message = result.message;
    payload.body = result;
  }
  if (caught != null) {
    const e = /** @type {Error} */ (caught);
    payload.caught = e && e.message != null ? e.message : String(caught);
  }
  if (typeof console !== 'undefined' && console.error) {
    console.error('[솔루션편입·API]', payload);
  }
}

/**
 * @param {object|null|undefined} r
 */
function formatHintWithErrorCode_(r) {
  var m = errMsg_(r) || '요청이 완료되지 않았습니다.';
  if (r && r.error && typeof r.error === 'object' && r.error.code) {
    m += ' [코드: ' + String(r.error.code) + ']';
  }
  return m;
}

/**
 * 기간 셀렉트 → GAS `year`·`month` (0=해당 연 전체)
 * @param {string} p
 * @return {{ y: number, m: number }}
 */
function periodValueToApiYm_(p) {
  const yNow = new Date().getFullYear();
  const mNow = new Date().getMonth() + 1;
  const s = p != null && String(p).length ? String(p) : 'all';
  if (s === 'all') {
    return { y: yNow, m: mNow };
  }
  if (s.length === 5 && s.charAt(0) === 'Y') {
    return { y: parseInt(s.slice(1, 5), 10), m: 0 };
  }
  const re = /^Y(\d{4})M(\d{1,2})$/;
  const m = s.match(re);
  if (m) {
    return { y: parseInt(m[1], 10), m: parseInt(m[2], 10) };
  }
  return { y: yNow, m: mNow };
}

/**
 * @param {number} n
 * @return {string}
 */
function fmtKrw_(n) {
  if (!isFinite(n)) {
    return '—';
  }
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
}

/**
 * @param {number} n
 * @return {string}
 */
function fmtInt_(n) {
  if (!isFinite(n)) {
    return '—';
  }
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
}

/**
 * @param {HTMLElement} mount
 * @param {Record<string, unknown>} d
 */
export function applyAnalyticsHeaderUrls(mount, d) {
  const ext = mount.querySelector('#sp-an-external');
  const lo = /** @type {HTMLAnchorElement | null} */ (mount.querySelector('#sp-an-linkSheet'));
  const btnR = /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnRepair'));
  if (!ext) {
    return;
  }
  const u =
    d && d.analyticsSpreadsheetUrl != null ? String(d.analyticsSpreadsheetUrl).trim() : '';
  const hasUrl = Boolean(d && d.analyticsReady === true && u && /^https?:\/\//i.test(u));
  if (lo) {
    if (hasUrl) {
      lo.href = u;
      lo.removeAttribute('hidden');
    } else {
      lo.setAttribute('hidden', '');
      lo.removeAttribute('href');
    }
  }
  if (btnR) {
    if (d && d.analyticsReady === true) {
      btnR.removeAttribute('hidden');
    } else {
      btnR.setAttribute('hidden', '');
    }
  }
  if (d && d.analyticsReady === true) {
    ext.removeAttribute('hidden');
  } else {
    ext.setAttribute('hidden', '');
  }
}

/**
 * @param {Record<string, unknown>} r
 * @return {object}
 */
function rowToPayload_(r) {
  const y = Math.floor(Number(r.year));
  const mo = Math.floor(Number(r.month));
  const sc = String(r.scope != null ? r.scope : '').trim();
  const sk = String(r.scopeKey != null ? r.scopeKey : r.scope_key != null ? r.scope_key : '').trim();
  return {
    year: y,
    month: mo,
    scope: sc === 'product' ? 'product' : 'category',
    scopeKey: sk,
    targetAmount: Math.max(0, Number(r.targetAmount != null ? r.targetAmount : r.target_amount != null ? r.target_amount : 0)),
    targetCount: Math.max(0, Number(r.targetCount != null ? r.targetCount : r.target_count != null ? r.target_count : 0)),
    notes: r.notes != null ? String(r.notes) : '',
    updatedAt: new Date().toISOString()
  };
}

/**
 * @param {HTMLElement} mount
 */
export function initAnalytics(mount) {
  const el = {
    init: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-init')),
    body: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-body')),
    actuals: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-actuals')),
    valSales: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-valSales')),
    valOrders: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-valOrders')),
    valMem: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-valMem')),
    actualsPrev: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-actualsPrev')),
    actualsWarn: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-actualsWarn')),
    btnInit: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnInit')),
    hint: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-hint')),
    loading: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-loading')),
    tbody: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-tbody')),
    subSales: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-subSales')),
    subCount: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-subCount')),
    subLede: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-subLede')),
    table: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-table')),
    tableWrap: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-tableWrap')),
    filterPeriod: /** @type {HTMLSelectElement | null} */ (mount.querySelector('#sp-an-filterPeriod')),
    inY: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inY')),
    inM: /** @type {HTMLSelectElement | null} */ (mount.querySelector('#sp-an-inM')),
    inScope: /** @type {HTMLSelectElement | null} */ (mount.querySelector('#sp-an-inScope')),
    inKey: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inKey')),
    inAmt: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inAmt')),
    inCnt: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inCnt')),
    inNotes: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inNotes')),
    btnAdd: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnAdd')),
    btnSave: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnSave')),
    btnReset: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnReset')),
    btnRepair: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnRepair'))
  };
  if (!el.init || !el.body) {
    return;
  }

  const url = String(GAS_BASE_URL).trim();
  let localRows = /** @type {object[]} */ ([]);
  let subMode = 'sales';
  let ready = false;
  /** @type {number|undefined} */
  let persistTimer = undefined;

  function setHint(t, show) {
    if (!el.hint) {
      return;
    }
    el.hint.textContent = t || '';
    if (show) {
      el.hint.removeAttribute('hidden');
    } else {
      el.hint.setAttribute('hidden', '');
    }
  }

  function buildMonthOptions_(sel) {
    if (!sel) {
      return;
    }
    sel.innerHTML = '';
    const o0 = document.createElement('option');
    o0.value = '';
    o0.textContent = '전체';
    sel.appendChild(o0);
    const z = document.createElement('option');
    z.value = '0';
    z.textContent = '0(연간)';
    sel.appendChild(z);
    for (let m = 1; m <= 12; m++) {
      const o = document.createElement('option');
      o.value = String(m);
      o.textContent = String(m) + '월';
      sel.appendChild(o);
    }
  }

  function buildInMonth_(sel) {
    if (!sel) {
      return;
    }
    sel.innerHTML = '';
    const z = document.createElement('option');
    z.value = '0';
    z.textContent = '0(연간)';
    sel.appendChild(z);
    for (let m = 1; m <= 12; m++) {
      const o = document.createElement('option');
      o.value = String(m);
      o.textContent = String(m) + '월';
      sel.appendChild(o);
    }
  }

  buildInMonth_(el.inM);

  const yNow = new Date().getFullYear();
  if (el.inY) {
    el.inY.value = String(yNow);
  }
  if (el.inM) {
    const mo = new Date().getMonth() + 1;
    el.inM.value = String(mo);
  }
  if (el.inAmt) {
    el.inAmt.value = '0';
  }
  if (el.inCnt) {
    el.inCnt.value = '0';
  }

  function setSubMode(mode) {
    subMode = mode;
    if (el.subSales && el.subCount) {
      if (mode === 'count') {
        el.subSales.classList.remove('is-active');
        el.subSales.setAttribute('aria-selected', 'false');
        el.subSales.tabIndex = -1;
        el.subCount.classList.add('is-active');
        el.subCount.setAttribute('aria-selected', 'true');
        el.subCount.tabIndex = 0;
        if (el.subLede) {
          el.subLede.textContent = '같은 표에서 인원(건수) 칸이 더 잘 보이게 켠 상태입니다.';
        }
        if (el.table) {
          el.table.classList.remove('sp-an-table--mode-sales');
          el.table.classList.add('sp-an-table--mode-count');
        }
      } else {
        el.subCount.classList.remove('is-active');
        el.subCount.setAttribute('aria-selected', 'false');
        el.subCount.tabIndex = -1;
        el.subSales.classList.add('is-active');
        el.subSales.setAttribute('aria-selected', 'true');
        el.subSales.tabIndex = 0;
        if (el.subLede) {
          el.subLede.textContent = '같은 표에서 매출(원) 칸이 더 잘 보이게 켠 상태입니다.';
        }
        if (el.table) {
          el.table.classList.remove('sp-an-table--mode-count');
          el.table.classList.add('sp-an-table--mode-sales');
        }
      }
    }
  }

  if (el.subSales) {
    el.subSales.addEventListener('click', function () {
      setSubMode('sales');
    });
  }
  if (el.subCount) {
    el.subCount.addEventListener('click', function () {
      setSubMode('count');
    });
  }
  setSubMode('sales');

  /**
   * @return {Promise<Object|null>}
   */
  async function persistToDrive_() {
    if (!GAS_MODE.canSync || !ready) {
      return null;
    }
    const out = localRows.map(function (x) {
      return rowToPayload_(x);
    });
    return await analyticsTargetsApplyBatched_(url, out, 5000);
  }

  function schedulePersist_() {
    if (persistTimer != null) {
      window.clearTimeout(/** @type {number} */ (persistTimer));
    }
    persistTimer = window.setTimeout(function () {
      persistTimer = undefined;
      persistToDrive_()
        .then(function (r) {
          if (!r || !r.ok) {
            setHint('드라이브에 반영하지 못했습니다.「지금 드라이브에 다시 저장」을 누르세요.', true);
            return;
          }
          setHint('드라이브에 반영했습니다.', true);
          return loadTargets();
        })
        .catch(function () {
          setHint('드라이브에 반영하지 못했습니다.「지금 드라이브에 다시 저장」을 누르세요.', true);
        });
    }, 450);
  }

  function rebuildFilterPeriod_() {
    if (!el.filterPeriod) {
      return;
    }
    const cur = el.filterPeriod.value;
    const years = new Set();
    [yNow - 1, yNow, yNow + 1].forEach(function (y) {
      years.add(y);
    });
    for (let i = 0; i < localRows.length; i++) {
      const n = Math.floor(Number(localRows[i].year));
      if (isFinite(n) && n >= 2000 && n <= 2100) {
        years.add(n);
      }
    }
    const yArr = Array.from(years).sort(function (a, b) {
      return a - b;
    });
    el.filterPeriod.innerHTML = '';
    const o0 = document.createElement('option');
    o0.value = 'all';
    o0.textContent = '전체 기간';
    el.filterPeriod.appendChild(o0);
    for (let yi = 0; yi < yArr.length; yi++) {
      const yv = yArr[yi];
      const o1 = document.createElement('option');
      o1.value = 'Y' + yv;
      o1.textContent = yv + '년(그 해 전부)';
      el.filterPeriod.appendChild(o1);
      const oz = document.createElement('option');
      oz.value = 'Y' + yv + 'M0';
      oz.textContent = yv + '년·연간(월 0)';
      el.filterPeriod.appendChild(oz);
      for (let m = 1; m <= 12; m++) {
        const om = document.createElement('option');
        om.value = 'Y' + yv + 'M' + m;
        om.textContent = yv + '년 ' + m + '월';
        el.filterPeriod.appendChild(om);
      }
    }
    let found = false;
    for (let oi = 0; oi < el.filterPeriod.options.length; oi++) {
      if (el.filterPeriod.options[oi].value === cur) {
        found = true;
        break;
      }
    }
    const mNow = new Date().getMonth() + 1;
    const want = 'Y' + yNow + 'M' + mNow;
    const hasWant = Array.prototype.some.call(el.filterPeriod.options, function (o) {
      return o.value === want;
    });
    if (found && cur != null && cur.length) {
      el.filterPeriod.value = cur;
    } else if (hasWant) {
      el.filterPeriod.value = want;
    } else {
      el.filterPeriod.value = 'all';
    }
    if (GAS_MODE.canSync && !GAS_MODE.useMock) {
      void loadMasterActuals_();
    }
  }

  function rowPassesFilter(r) {
    if (!el.filterPeriod) {
      return true;
    }
    const p = el.filterPeriod.value != null && el.filterPeriod.value.length ? el.filterPeriod.value : 'all';
    if (p === 'all') {
      return true;
    }
    const yPart = r.year != null ? String(Math.floor(Number(r.year))) : '';
    const mPart = r.month != null ? String(Math.floor(Number(r.month))) : '';
    if (p.length === 5 && p.charAt(0) === 'Y') {
      return yPart === p.slice(1);
    }
    const re = /^Y(\d{4})M(\d{1,2})$/;
    const m = p.match(re);
    if (m) {
      return yPart === m[1] && mPart === String(Math.floor(Number(m[2])));
    }
    return true;
  }

  function esc(s) {
    return String(s != null ? s : '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    if (!el.tbody) {
      return;
    }
    el.tbody.innerHTML = '';
    var appended = 0;
    for (let i = 0; i < localRows.length; i++) {
      if (!rowPassesFilter(localRows[i])) {
        continue;
      }
      appended += 1;
      const r = localRows[i];
      const tr = document.createElement('tr');
      const sc = String(r.scope);
      const sk = String(r.scopeKey);
      tr.innerHTML =
        '<td>' +
        esc(r.year) +
        '</td><td>' +
        esc(r.month) +
        '</td><td>' +
        esc(SCOPE_LABEL[sc] || sc) +
        '</td><td>' +
        esc(displayScopeValueForTable_(sc, sk)) +
        '</td><td class="sp-an-table__em-sales">' +
        esc(r.targetAmount) +
        '</td><td class="sp-an-table__em-count">' +
        esc(r.targetCount) +
        '</td><td>' +
        esc(r.notes) +
        '</td><td><button type="button" class="btn btn--secondary sp-an-row-del" data-idx="' +
        i +
        '">삭제</button></td>';
      el.tbody.appendChild(tr);
    }
    if (appended === 0) {
      const trE = document.createElement('tr');
      trE.className = 'sp-an-table__empty-row';
      const tdE = document.createElement('td');
      tdE.colSpan = 8;
      tdE.className = 'sp-an-table__empty';
      if (localRows.length === 0) {
        tdE.textContent =
          '이 표는 목표(선택)만 보입니다. 위「집계 실적」이 실제 주문·매출이고, 목표는 아래에 한 줄씩 넣고「이 줄을 표에 넣기」합니다.';
      } else {
        tdE.textContent =
          '지금 [기간]에 맞는 목표 행이 없습니다.「전체 기간」으로 바꾸면 다른 목표가 다시 보일 수 있습니다.';
      }
      trE.appendChild(tdE);
      el.tbody.appendChild(trE);
    }
    if (el.tbody) {
      el.tbody.querySelectorAll('.sp-an-row-del').forEach(function (b) {
        b.addEventListener('click', function ev() {
          const ix = parseInt(
            String((/** @type {HTMLElement} */ (b)).getAttribute('data-idx') || '-1'),
            10
          );
          if (ix < 0 || ix >= localRows.length) {
            return;
          }
          localRows.splice(ix, 1);
          rebuildFilterPeriod_();
          render();
          schedulePersist_();
        });
      });
    }
  }

  function syncAnUi_() {
    if (GAS_MODE.useMock) {
      if (el.actuals) {
        el.actuals.setAttribute('hidden', '');
      }
      if (el.init) {
        el.init.setAttribute('hidden', '');
      }
      if (el.body) {
        el.body.setAttribute('hidden', '');
      }
      return;
    }
    if (GAS_MODE.canSync) {
      if (el.actuals) {
        el.actuals.removeAttribute('hidden');
      }
    } else if (el.actuals) {
      el.actuals.setAttribute('hidden', '');
    }
    if (ready) {
      if (el.init) {
        el.init.setAttribute('hidden', '');
      }
      if (el.body) {
        el.body.removeAttribute('hidden');
      }
    } else {
      if (el.init) {
        el.init.removeAttribute('hidden');
      }
      if (el.body) {
        el.body.setAttribute('hidden', '');
      }
    }
  }

  /**
   * 마스터 orders에서 집계 (KPI 시트와 무관)
   */
  async function loadMasterActuals_() {
    if (!GAS_MODE.canSync || GAS_MODE.useMock) {
      return;
    }
    if (!el.filterPeriod || !el.valSales || !el.valOrders || !el.valMem) {
      return;
    }
    if (el.actualsWarn) {
      el.actualsWarn.setAttribute('hidden', '');
      el.actualsWarn.textContent = '';
    }
    const ym = periodValueToApiYm_(el.filterPeriod.value);
    const url = String(GAS_BASE_URL).trim();
    try {
      const r = await gasJsonpWithParams(
        url,
        'analyticsMasterActualsGet',
        { year: String(ym.y), month: String(ym.m) },
        90000
      );
      if (!r || !r.ok) {
        if (el.valSales) {
          el.valSales.textContent = '—';
        }
        if (el.valOrders) {
          el.valOrders.textContent = '—';
        }
        if (el.valMem) {
          el.valMem.textContent = '—';
        }
        if (el.actualsPrev) {
          el.actualsPrev.textContent = '';
        }
        const msg =
          r && r.error && typeof r.error === 'object' && r.error.message
            ? String(r.error.message)
            : errMsg_(r);
        if (el.actualsWarn) {
          el.actualsWarn.textContent = msg || '집계를 가져오지 못했습니다.';
          el.actualsWarn.removeAttribute('hidden');
        }
        logSolpathApi_('analyticsMasterActualsGet', r, null);
        return;
      }
      const d = (r.data && r.data) || {};
      const pv = d.prevYear || {};
      if (el.valSales) {
        el.valSales.textContent = fmtKrw_(Number(d.actualSales));
      }
      if (el.valOrders) {
        el.valOrders.textContent = fmtInt_(Number(d.orderCount));
      }
      if (el.valMem) {
        el.valMem.textContent = fmtInt_(Number(d.uniqueMemberCount));
      }
      if (el.actualsPrev) {
        const py = pv.year != null ? Number(pv.year) : d.year - 1;
        const pm = pv.month != null ? Number(pv.month) : ym.m;
        let plab = '';
        if (pm === 0) {
          plab = py + '년(연간)';
        } else {
          plab = py + '년 ' + pm + '월';
        }
        el.actualsPrev.textContent =
          '전년 동기(' +
          plab +
          ') 실적: 매출 ' +
          fmtKrw_(Number(pv.actualSales)) +
          ' · 주문 ' +
          fmtInt_(Number(pv.orderCount)) +
          ' · 구매자 ' +
          fmtInt_(Number(pv.uniqueMemberCount)) +
          '. 목표를 비워 두었을 때 비교·참고로 쓸 수 있는 대표치입니다.';
      }
    } catch (e) {
      logSolpathApi_('analyticsMasterActualsGet', null, e);
      if (el.actualsWarn) {
        el.actualsWarn.textContent = '집계 요청이 끝나지 않았습니다.';
        el.actualsWarn.removeAttribute('hidden');
      }
    }
  }

  async function loadTargets() {
    if (!GAS_MODE.canSync || !ready) {
      return;
    }
    if (el.loading) {
      el.loading.removeAttribute('hidden');
    }
    setHint('', false);
    try {
      const r = await gasJsonpWithParams(url, 'analyticsTargetsGet', null, 60000);
      if (!r || !r.ok) {
        setHint(errMsg_(r) || '목록을 가져오지 못했습니다.', true);
        return;
      }
      const dr = (r.data && r.data.rows) || [];
      localRows = dr.map(function (x) {
        return {
          year: x.year,
          month: x.month,
          scope: String(x.scope).trim() || 'category',
          scopeKey: String(x.scopeKey != null ? x.scopeKey : x.scope_key != null ? x.scope_key : '').trim(),
          targetAmount: x.targetAmount != null ? x.targetAmount : x.target_amount,
          targetCount: x.targetCount != null ? x.targetCount : x.target_count,
          notes: x.notes != null ? String(x.notes) : ''
        };
      });
      rebuildFilterPeriod_();
      render();
    } catch (e) {
      const m = e && e.message != null ? String(e.message) : '';
      setHint('불러오지 못했습니다. ' + (m === 'timeout' ? '응답이 지연되었습니다.' : ''), true);
    } finally {
      if (el.loading) {
        el.loading.setAttribute('hidden', '');
      }
    }
  }

  function applyStateFromData(d) {
    ready = Boolean(d && d.analyticsReady === true);
    applyAnalyticsHeaderUrls(mount, d);
    syncAnUi_();
    if (ready) {
      void loadTargets();
    } else {
      rebuildFilterPeriod_();
    }
  }

  if (el.btnInit) {
    el.btnInit.disabled = !GAS_MODE.canSync;
  }
  if (el.btnSave) {
    el.btnSave.disabled = !GAS_MODE.canSync;
  }
  if (el.btnReset) {
    el.btnReset.disabled = !GAS_MODE.canSync;
  }
  if (el.btnRepair) {
    el.btnRepair.disabled = !GAS_MODE.canSync;
  }

  function validateRowInForm() {
    if (!el.inY || !el.inM || !el.inScope || !el.inKey || !el.inAmt || !el.inCnt) {
      return { ok: false, msg: '입력란을 확인합니다.' };
    }
    const y = Math.floor(Number(el.inY.value));
    const mo = Math.floor(Number(el.inM.value));
    const sc = el.inScope.value;
    const sk = el.inKey.value.trim();
    const ta = Number(el.inAmt.value);
    const tc = Number(el.inCnt.value);
    if (y < 2000 || y > 2100 || isNaN(y)) {
      return { ok: false, msg: '연도는 2000–2100 사이입니다.' };
    }
    if (mo < 0 || mo > 12) {
      return { ok: false, msg: '월은 0(연간)–12입니다.' };
    }
    if (sc !== 'category' && sc !== 'product') {
      return { ok: false, msg: '범위를 고릅니다.' };
    }
    if (!sk.length) {
      return { ok: false, msg: '키(대분류 키 또는 상품 번호)를 넣습니다.' };
    }
    if (!isFinite(ta) || ta < 0) {
      return { ok: false, msg: '매출(원)은 0 이상의 숫자입니다.' };
    }
    if (!isFinite(tc) || tc < 0) {
      return { ok: false, msg: '건수는 0 이상의 숫자입니다.' };
    }
    return {
      ok: true,
      row: {
        year: y,
        month: mo,
        scope: sc,
        scopeKey: sc === 'product' ? String(parseInt(sk, 10) || sk) : sk,
        targetAmount: ta,
        targetCount: tc,
        notes: el.inNotes && el.inNotes.value ? el.inNotes.value.trim() : ''
      }
    };
  }

  if (el.btnAdd) {
    el.btnAdd.addEventListener('click', function () {
      const v = validateRowInForm();
      if (!v.ok) {
        setHint(v.msg || '입력 오류', true);
        return;
      }
      if (v.row) {
        localRows.push(v.row);
      }
      rebuildFilterPeriod_();
      render();
      setHint('목록에 넣었습니다. 잠시 뒤 드라이브에도 반영되며, 안 되면「지금 드라이브에 다시 저장」을 누릅니다.', true);
    });
  }

  if (el.filterPeriod) {
    el.filterPeriod.addEventListener('change', function () {
      void loadMasterActuals_();
      render();
    });
  }

  if (el.btnInit) {
    el.btnInit.addEventListener('click', async function () {
      if (!GAS_MODE.canSync) {
        return;
      }
      el.btnInit.disabled = true;
      setHint('만드는 중…', true);
      try {
        const r = await gasJsonpWithParams(url, 'initAnalyticsSheets', null, 120000);
        if (!r || !r.ok) {
          logSolpathApi_('initAnalyticsSheets', r, null);
          setHint(formatHintWithErrorCode_(r) || '데이터 생성에 실패했습니다.', true);
          return;
        }
        const d0 = (r && r.data) || {};
        applyAnalyticsHeaderUrls(mount, {
          analyticsReady: true,
          analyticsSpreadsheetUrl: d0.analyticsSpreadsheetUrl
        });
        ready = true;
        syncAnUi_();
        await loadTargets();
        setHint('드라이브에 목표 표가 준비됐습니다. 위 실적은 항상 마스터·동기화 기준이고, 아래는 선택 목표만 적습니다.', true);
        window.requestAnimationFrame(function () {
          if (el.actuals) {
            el.actuals.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      } catch (e) {
        logSolpathApi_('initAnalyticsSheets', null, e);
        const m = e && e.message != null ? String(e.message) : '';
        setHint(
          m === 'timeout'
            ? '응답이 지연되었습니다. [네트워크/timeout]'
            : '요청이 끝나지 않았습니다. [콘솔에 상세]',
          true
        );
      } finally {
        if (el.btnInit) {
          el.btnInit.disabled = false;
        }
      }
    });
  }

  if (el.btnRepair) {
    el.btnRepair.addEventListener('click', async function () {
      if (!GAS_MODE.canSync) {
        return;
      }
      if (!ready) {
        setHint('먼저 집계용 드라이브 시트를 연 뒤 다시 누릅니다.', true);
        return;
      }
      el.btnRepair.disabled = true;
      if (el.loading) {
        el.loading.removeAttribute('hidden');
      }
      setHint('탭 이행·주문라인을 마스터에서 다시 채우는 중…', true);
      try {
        const r = await gasJsonpWithParams(url, 'analyticsSheetsRepair', null, 120000);
        if (!r || !r.ok) {
          logSolpathApi_('analyticsSheetsRepair', r, null);
          setHint(formatHintWithErrorCode_(r) || '갱신에 실패했습니다.', true);
          return;
        }
        const d1 = (r && r.data) || {};
        const wn = d1.written != null && isFinite(Number(d1.written)) ? Number(d1.written) : null;
        setHint(
          wn != null
            ? '01·02 탭을 맞추고 주문라인 ' + wn + '행을 다시 썼습니다.'
            : '01·02 탭을 맞추고 마스터에서 주문라인을 다시 채웠습니다.',
          true
        );
        await loadTargets();
      } catch (e) {
        logSolpathApi_('analyticsSheetsRepair', null, e);
        const m = e && e.message != null ? String(e.message) : '';
        setHint(
          m === 'timeout'
            ? '응답이 지연되었습니다. [네트워크/timeout]'
            : '요청이 끝나지 않았습니다. [콘솔에 상세]',
          true
        );
      } finally {
        if (el.loading) {
          el.loading.setAttribute('hidden', '');
        }
        if (el.btnRepair) {
          el.btnRepair.disabled = !GAS_MODE.canSync;
        }
      }
    });
  }

  if (el.btnSave) {
    el.btnSave.addEventListener('click', async function () {
      if (!GAS_MODE.canSync || !ready) {
        return;
      }
      const out = localRows.map(function (x) {
        return rowToPayload_(x);
      });
      if (el.btnSave) {
        el.btnSave.disabled = true;
      }
      if (el.loading) {
        el.loading.removeAttribute('hidden');
      }
      setHint('저장 중…', true);
      try {
        const r = await analyticsTargetsApplyBatched_(url, out, 5000);
        if (!r || !r.ok) {
          setHint(errMsg_(r) || '저장하지 못했습니다.', true);
          return;
        }
        setHint('드라이브에 저장했습니다.', true);
        await loadTargets();
      } catch (e) {
        const m = e && e.message != null ? String(e.message) : '';
        setHint(m === 'timeout' ? '응답이 지연되었습니다.' : '저장에 실패했습니다.', true);
      } finally {
        if (el.loading) {
          el.loading.setAttribute('hidden', '');
        }
        if (el.btnSave) {
          el.btnSave.disabled = false;
        }
      }
    });
  }

  if (el.btnReset) {
    el.btnReset.addEventListener('click', async function () {
      if (!GAS_MODE.canSync || !ready) {
        return;
      }
      const ok = window.confirm(
        '여기에 적어 둔 목표·일 단위 캐시를 모두 비웁니다. 되돌릴 수 없습니다. 정말 진행할까요?'
      );
      if (!ok) {
        return;
      }
      if (el.btnReset) {
        el.btnReset.disabled = true;
      }
      if (el.loading) {
        el.loading.removeAttribute('hidden');
      }
      setHint('초기화 중…', true);
      try {
        const r = await gasJsonpWithParams(url, 'analyticsResetAll', null, 120000);
        if (!r || !r.ok) {
          setHint(errMsg_(r) || '초기화에 실패했습니다.', true);
          return;
        }
        localRows = [];
        rebuildFilterPeriod_();
        render();
        setHint('초기화했습니다.', true);
      } catch (e) {
        const m = e && e.message != null ? String(e.message) : '';
        setHint(m === 'timeout' ? '응답이 지연되었습니다.' : '초기화에 실패했습니다.', true);
      } finally {
        if (el.loading) {
          el.loading.setAttribute('hidden', '');
        }
        if (el.btnReset) {
          el.btnReset.disabled = false;
        }
      }
    });
  }

  const tAn = mount.querySelector('#sp-tab-an');
  if (tAn) {
    tAn.addEventListener('click', function () {
      window.setTimeout(function () {
        if (tAn.classList.contains('is-active')) {
          if (GAS_MODE.canSync && !GAS_MODE.useMock) {
            void loadMasterActuals_();
          }
          if (ready) {
            void loadTargets();
          }
        }
      }, 0);
    });
  }

  if (GAS_MODE.useMock) {
    setHint('이 화면은 GAS Web App URL이 있을 때만 씁니다.', true);
  }

  syncAnUi_();
  rebuildFilterPeriod_();

  return {
    applyStateFromData: applyStateFromData,
    refresh: function () {
      if (GAS_MODE.canSync && !GAS_MODE.useMock) {
        void loadMasterActuals_();
      }
      if (ready) {
        return loadTargets();
      }
      return Promise.resolve();
    }
  };
}
