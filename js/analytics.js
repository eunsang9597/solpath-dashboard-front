/**
 * 집계·분석(매출·건수 목표) — GAS JSONP
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
  var msg = '';
  if (r.error && typeof r.error === 'object' && r.error.message) {
    msg = String(r.error.message);
  } else if (r.message) {
    msg = String(r.message);
  }
  if (!msg) {
    return '';
  }
  if (msg.indexOf('원천 DB') >= 0 || msg.indexOf('SHEETS_MASTER') >= 0 || msg.indexOf('Drive') >= 0 && msg.indexOf('부모') >= 0) {
    return '집계용 구글 시트(원본)를 찾지 못했습니다. 마스터 파일이 열리는지 확인한 뒤 다시 시도합니다.';
  }
  return msg;
}

/**
 * @param {HTMLElement} mount
 * @param {Record<string, unknown>} d
 */
export function applyAnalyticsHeaderUrls(mount, d) {
  const ext = mount.querySelector('#sp-an-external');
  const lo = /** @type {HTMLAnchorElement | null} */ (mount.querySelector('#sp-an-linkSheet'));
  if (!ext || !lo) {
    return;
  }
  const u =
    d && d.analyticsSpreadsheetUrl != null ? String(d.analyticsSpreadsheetUrl).trim() : '';
  if (d && d.analyticsReady === true && u && /^https?:\/\//i.test(u)) {
    lo.href = u;
    lo.removeAttribute('hidden');
    ext.removeAttribute('hidden');
  } else {
    lo.setAttribute('hidden', '');
    lo.removeAttribute('href');
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
    btnInit: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnInit')),
    hint: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-hint')),
    loading: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-loading')),
    tbody: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-tbody')),
    subSales: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-subSales')),
    subCount: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-subCount')),
    subLede: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-subLede')),
    table: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-an-table')),
    filterYear: /** @type {HTMLSelectElement | null} */ (mount.querySelector('#sp-an-filterYear')),
    filterMonth: /** @type {HTMLSelectElement | null} */ (mount.querySelector('#sp-an-filterMonth')),
    inY: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inY')),
    inM: /** @type {HTMLSelectElement | null} */ (mount.querySelector('#sp-an-inM')),
    inScope: /** @type {HTMLSelectElement | null} */ (mount.querySelector('#sp-an-inScope')),
    inKey: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inKey')),
    inAmt: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inAmt')),
    inCnt: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inCnt')),
    inNotes: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-an-inNotes')),
    btnAdd: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnAdd')),
    btnSave: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnSave')),
    btnReset: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-an-btnReset'))
  };
  if (!el.init || !el.body) {
    return;
  }

  const url = String(GAS_BASE_URL).trim();
  let localRows = /** @type {object[]} */ ([]);
  let subMode = 'sales';
  let ready = false;

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

  buildMonthOptions_(el.filterMonth);
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
          el.subLede.textContent = '건수 목표 열을 강조한 뷰입니다.';
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
          el.subLede.textContent = '매출 목표(원) 열을 강조한 뷰입니다.';
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

  function yearFilterList() {
    const opts = [yNow - 1, yNow, yNow + 1];
    if (!el.filterYear) {
      return;
    }
    el.filterYear.innerHTML = '';
    const a = document.createElement('option');
    a.value = '';
    a.textContent = '전체';
    el.filterYear.appendChild(a);
    for (let i = 0; i < opts.length; i++) {
      const o = document.createElement('option');
      o.value = String(opts[i]);
      o.textContent = String(opts[i]) + '년';
      el.filterYear.appendChild(o);
    }
    for (let i = 0; i < localRows.length; i++) {
      const yy = localRows[i].year;
      const n = Math.floor(Number(yy));
      if (!isFinite(n) || n < 2000) {
        continue;
      }
      const ex = el.filterYear.querySelector('option[value="' + String(n) + '"]');
      if (!ex) {
        const o = document.createElement('option');
        o.value = String(n);
        o.textContent = String(n) + '년';
        el.filterYear.appendChild(o);
      }
    }
  }

  function rowPassesFilter(r) {
    const fy = el.filterYear && el.filterYear.value ? el.filterYear.value : '';
    const fm = el.filterMonth && el.filterMonth.value !== '' ? el.filterMonth.value : '';
    if (fy.length) {
      if (String(Math.floor(Number(r.year))) !== fy) {
        return false;
      }
    }
    if (fm.length) {
      if (String(Math.floor(Number(r.month))) !== fm) {
        return false;
      }
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
    for (let i = 0; i < localRows.length; i++) {
      if (!rowPassesFilter(localRows[i])) {
        continue;
      }
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
          yearFilterList();
          render();
        });
      });
    }
  }

  function syncAnUi_() {
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
      yearFilterList();
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
      yearFilterList();
      render();
      setHint('목록에 반영했습니다. 시트에 쓰려면 「시트에 반영」을 누릅니다.', true);
    });
  }

  if (el.filterYear) {
    el.filterYear.addEventListener('change', function () {
      render();
    });
  }
  if (el.filterMonth) {
    el.filterMonth.addEventListener('change', function () {
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
          setHint(errMsg_(r) || '준비에 실패했습니다.', true);
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
        setHint('집계·분석 시트를 준비했습니다. 목표를 적은 뒤 「시트에 반영」으로 저장합니다.', true);
      } catch (e) {
        const m = e && e.message != null ? String(e.message) : '';
        setHint(m === 'timeout' ? '응답이 지연되었습니다.' : '요청이 완료되지 않았습니다.', true);
      } finally {
        if (el.btnInit) {
          el.btnInit.disabled = false;
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
          setHint(errMsg_(r) || '시트에 쓰지 못했습니다.', true);
          return;
        }
        setHint('시트에 반영했습니다.', true);
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
        yearFilterList();
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
        if (tAn.classList.contains('is-active') && ready) {
          loadTargets();
        }
      }, 0);
    });
  }

  if (GAS_MODE.useMock) {
    setHint('이 화면은 GAS Web App URL이 있을 때만 씁니다.', true);
  }

  syncAnUi_();

  return {
    applyStateFromData: applyStateFromData,
    refresh: loadTargets
  };
}
