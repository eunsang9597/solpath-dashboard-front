/**
 * 상품 항목 분류 — GAS JSONP (productMappingState|List|init|Apply)
 */
import { GAS_BASE_URL, GAS_MODE } from './config.js';

const CAT_ORDER = ['unmapped', 'solpass', 'solutine', 'challenge', 'textbook'];
/** 미분류(unmapped) 제외 4칸 — 한 행에 솔패스~교재 */
const CAT_ROW4 = CAT_ORDER.filter(function (c) {
  return c !== 'unmapped';
});
const CAT_LABEL = {
  unmapped: '미분류',
  solpass: '솔패스',
  solutine: '솔루틴',
  challenge: '챌린지',
  textbook: '교재'
};
const LIFE_LABEL = { active: '진행', archived: '만료', test: '테스트' };

const NAME_MAX = 20;

/**
 * @param {string|undefined} s
 */
function displayNameShort(s) {
  const t = s != null ? String(s) : '';
  if (t.length <= NAME_MAX) {
    return t;
  }
  return t.slice(0, NAME_MAX) + '…';
}

/**
 * @param {string|undefined} s
 */
function escAttr(s) {
  return String(s != null ? s : '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/**
 * GAS JSONP
 * @param {string} baseUrl
 * @param {string} action
 * @param {Record<string, string> | null} extraParams
 * @param {number} timeoutMs
 * @returns {Promise<Object>}
 */
function gasJsonpWithParams(baseUrl, action, extraParams, timeoutMs) {
  return new Promise(function (resolve, reject) {
    const cb = '_sp_pm_' + String(Date.now()) + '_' + String(Math.floor(Math.random() * 1e9));
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
 * URL 길이 제한(브라우저/프록시) — 안전을 위해 5000자 이하씩.
 * @param {string} baseUrl
 * @param {Object[]} allRows
 * @param {number} maxEncLen
 */
async function productMappingApplyBatched_(baseUrl, allRows, maxEncLen) {
  let i = 0;
  while (i < allRows.length) {
    let n;
    for (n = 1; n <= allRows.length - i; n++) {
      if (encodeURIComponent(JSON.stringify({ rows: allRows.slice(i, i + n) })).length > maxEncLen) {
        break;
      }
    }
    n -= 1;
    if (n < 1) {
      n = 1;
    }
    const chunk = allRows.slice(i, i + n);
    const r = await gasJsonpWithParams(
      baseUrl,
      'productMappingApply',
      { payload: JSON.stringify({ rows: chunk }) },
      120000
    );
    if (!r || !r.ok) {
      return r;
    }
    i += n;
  }
  return { ok: true, data: { upserted: allRows.length } };
}

/**
 * @param {object} r
 */
function rowSig(r) {
  return [r.prod_no, r.internal_category, r.lifecycle, r.product_name, r.notes != null ? String(r.notes) : ''].join('\t');
}

/**
 * @param {HTMLElement} mount
 */
export function initProductMapping(mount) {
  const el = {
    init: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-init')),
    btnInit: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-pm-btnInit')),
    filters: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-filters')),
    sections: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-sections')),
    apply: /** @type {HTMLButtonElement | null} */ (mount.querySelector('#sp-pm-apply')),
    listLoading: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-listLoading')),
    hint: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-hint')),
    search: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-pm-search')),
    onlyUnmapped: /** @type {HTMLInputElement | null} */ (mount.querySelector('#sp-pm-onlyUnmapped')),
    footerNote: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-footerNote')),
    instruct: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-instruct')),
    external: /** @type {HTMLElement | null} */ (mount.querySelector('#sp-pm-external')),
    linkMaster: /** @type {HTMLAnchorElement | null} */ (mount.querySelector('#sp-pm-linkMaster')),
    linkOps: /** @type {HTMLAnchorElement | null} */ (mount.querySelector('#sp-pm-linkOps'))
  };
  if (!el.init || !el.sections) {
    return;
  }

  let localRows = [];
  let baselineSig = new Map();
  let ready = false;
  let loadStateInflight = false;
  const url = String(GAS_BASE_URL).trim();

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

  /**
   * GAS `productMappingState`의 URL로 Google 시트(드라이브) 열기 링크
   * @param {Record<string, unknown>} d
   */
  function updateExternalLinks(d) {
    const ext = el.external;
    const lm = el.linkMaster;
    const lo = el.linkOps;
    if (!ext || !lm || !lo) {
      return;
    }
    const master = d && d.masterSpreadsheetUrl ? String(d.masterSpreadsheetUrl).trim() : '';
    const ops = d && d.operationsSpreadsheetUrl ? String(d.operationsSpreadsheetUrl).trim() : '';
    if (master && /^https?:\/\//i.test(master)) {
      lm.href = master;
      lm.removeAttribute('hidden');
    } else {
      lm.setAttribute('hidden', '');
      lm.removeAttribute('href');
    }
    if (ops && /^https?:\/\//i.test(ops)) {
      lo.href = ops;
      lo.removeAttribute('hidden');
    } else {
      lo.setAttribute('hidden', '');
      lo.removeAttribute('href');
    }
    if ((master && /^https?:\/\//i.test(master)) || (ops && /^https?:\/\//i.test(ops))) {
      ext.removeAttribute('hidden');
    } else {
      ext.setAttribute('hidden', '');
    }
  }

  function recomputeDirty() {
    let dirty = false;
    for (let i = 0; i < localRows.length; i++) {
      const r = localRows[i];
      const k = r.prod_no;
      if (rowSig(r) !== baselineSig.get(k)) {
        dirty = true;
        break;
      }
    }
    if (el.apply) {
      el.apply.disabled = !dirty || !ready;
    }
  }

  function snapshotBaseline() {
    baselineSig = new Map();
    for (let i = 0; i < localRows.length; i++) {
      const r = localRows[i];
      baselineSig.set(r.prod_no, rowSig(r));
    }
    recomputeDirty();
  }

  function getFilteredRows() {
    let r = localRows.slice();
    const q = el.search && el.search.value ? el.search.value.trim().toLowerCase() : '';
    if (q) {
      r = r.filter(function (x) {
        return (
          String(x.prod_no).indexOf(q) >= 0 ||
          String(x.product_name || '')
            .toLowerCase()
            .indexOf(q) >= 0
        );
      });
    }
    if (el.onlyUnmapped && el.onlyUnmapped.checked) {
      r = r.filter(function (x) {
        return x.internal_category === 'unmapped';
      });
    }
    return r;
  }

  function render() {
    if (!el.sections) {
      return;
    }
    if (!ready) {
      return;
    }
    const byCat = {};
    CAT_ORDER.forEach(function (c) {
      byCat[c] = [];
    });
    const list = getFilteredRows();
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      const c = CAT_ORDER.indexOf(row.internal_category) >= 0 ? row.internal_category : 'unmapped';
      byCat[c].push(row);
    }
    const counts = {};
    for (let c = 0; c < localRows.length; c++) {
      const k = localRows[c].internal_category;
      const key = CAT_ORDER.indexOf(k) >= 0 ? k : 'unmapped';
      counts[key] = (counts[key] || 0) + 1;
    }
    const parts = [];

    function pushOneCategory(cat) {
      const label = CAT_LABEL[cat] || cat;
      const n = byCat[cat] ? byCat[cat].length : 0;
      const openAttr = cat === 'unmapped' ? ' open' : '';
      const badge = (counts[cat] != null ? counts[cat] : 0) + '개';
      parts.push(
        '<details class="sp-pm-cat sp-pm-cat--' +
          escAttr(cat) +
          '"' +
          openAttr +
          ' data-cat="' +
          escAttr(cat) +
          '"><summary class="sp-pm-cat__sum"><span class="sp-pm-cat__title">' +
          escAttr(label) +
          '</span><span class="sp-pm-cat__badge">' +
          escAttr(badge) +
          '</span> <span class="sp-pm-cat__n">' +
          n +
          '개 표시</span></summary><div class="sp-pm-cat__body">'
      );
      const rows2 = byCat[cat] || [];
      for (let r = 0; r < rows2.length; r++) {
        const row2 = rows2[r];
        const nameShort = displayNameShort(row2.product_name);
        const full = row2.product_name != null ? String(row2.product_name) : '';
        const dataIdx = localRows.findIndex(function (x) {
          return x.prod_no === row2.prod_no;
        });
        const selCat = buildSelectCat(dataIdx, row2.internal_category);
        const selLife = buildSelectLife(dataIdx, row2.lifecycle);
        parts.push(
          '<div class="sp-pm-row" data-prod-no="' +
            String(row2.prod_no) +
            '"><span class="sp-pm-row__no">' +
            escAttr(String(row2.prod_no)) +
            '</span><span class="sp-pm-row__name" title="' +
            escAttr(full) +
            '">' +
            escAttr(nameShort) +
            '</span>' +
            selCat +
            selLife +
            '</div>'
        );
      }
      if (!rows2.length) {
        parts.push('<p class="sp-pm-empty">조건에 맞는 항목이 없습니다.</p>');
      }
      parts.push('</div></details>');
    }

    parts.push('<div class="sp-pm-cat-block sp-pm-cat-block--unmapped">');
    pushOneCategory('unmapped');
    parts.push('</div><div class="sp-pm-cat-row" role="presentation">');
    for (let f = 0; f < CAT_ROW4.length; f++) {
      pushOneCategory(CAT_ROW4[f]);
    }
    parts.push('</div>');

    el.sections.innerHTML = parts.join('');
    el.sections.querySelectorAll('select.sp-pm-sel--cat').forEach(function (se) {
      se.addEventListener('change', onSelectChange);
    });
    el.sections.querySelectorAll('select.sp-pm-sel--life').forEach(function (se) {
      se.addEventListener('change', onSelectChange);
    });
  }

  function buildSelectCat(dataIdx, val) {
    const opts = [];
    for (let i = 0; i < CAT_ORDER.length; i++) {
      const c = CAT_ORDER[i];
      const selected = c === val ? ' selected' : '';
      opts.push(
        '<option value="' + escAttr(c) + '"' + selected + '>' + escAttr(CAT_LABEL[c] || c) + '</option>'
      );
    }
    return (
      '<label class="sp-pm-sel__wrap"><span class="visually-hidden">대분류</span><select class="sp-pm-sel sp-pm-sel--cat" data-idx="' +
      dataIdx +
      '">' +
      opts.join('') +
      '</select></label>'
    );
  }

  function buildSelectLife(dataIdx, val) {
    const lifeKeys = Object.keys(LIFE_LABEL);
    const opts = [];
    for (let i = 0; i < lifeKeys.length; i++) {
      const l = lifeKeys[i];
      const selected = l === val ? ' selected' : '';
      opts.push(
        '<option value="' + escAttr(l) + '"' + selected + '>' + escAttr(LIFE_LABEL[l]) + '</option>'
      );
    }
    return (
      '<label class="sp-pm-sel__wrap"><span class="visually-hidden">상태</span><select class="sp-pm-sel sp-pm-sel--life" data-idx="' +
      dataIdx +
      '">' +
      opts.join('') +
      '</select></label>'
    );
  }

  /**
   * @param {Event} ev
   */
  function onSelectChange(ev) {
    const t = ev.target;
    if (!(t instanceof HTMLSelectElement)) {
      return;
    }
    const idx = t.getAttribute('data-idx');
    if (idx == null) {
      return;
    }
    const i = parseInt(idx, 10);
    if (isNaN(i) || !localRows[i]) {
      return;
    }
    if (t.classList.contains('sp-pm-sel--cat')) {
      localRows[i].internal_category = t.value;
    } else {
      localRows[i].lifecycle = t.value;
    }
    recomputeDirty();
  }

  /**
   * @param {string} emsg
   */
  function syncFooterAndInstruct() {
    if (el.footerNote) {
      if (ready && el.filters && !el.filters.hasAttribute('hidden')) {
        el.footerNote.removeAttribute('hidden');
      } else {
        el.footerNote.setAttribute('hidden', '');
      }
    }
    if (el.instruct) {
      if (ready) {
        el.instruct.setAttribute('hidden', '');
      } else {
        el.instruct.removeAttribute('hidden');
      }
    }
  }

  function errMsg(emsg) {
    if (!emsg) {
      return '요청이 실패했습니다.';
    }
    if (typeof emsg.error === 'string' && emsg.error.length) {
      return (emsg.message != null && String(emsg.message)) || emsg.error;
    }
    if (emsg.error && emsg.error.message) {
      return String(emsg.error.message);
    }
    if (emsg.error && emsg.error.code) {
      return String(emsg.error.code);
    }
    if (emsg.message) {
      return String(emsg.message);
    }
    return '요청이 실패했습니다.';
  }

  async function loadState() {
    if (!GAS_MODE.canSync) {
      setHint('GAS Web App URL이 주입되지 않았습니다.', true);
      updateExternalLinks({});
      return;
    }
    if (loadStateInflight) {
      return;
    }
    loadStateInflight = true;
    if (el.listLoading) {
      el.listLoading.removeAttribute('hidden');
    }
    setHint('', false);
    try {
      const st = await gasJsonpWithParams(url, 'productMappingState', null, 60000);
      if (!st || !st.ok) {
        setHint(errMsg(st), true);
        updateExternalLinks({});
        return;
      }
      const d = st.data || {};
      updateExternalLinks(d);
      ready = Boolean(d.ready);
      if (el.init) {
        if (!ready) {
          el.init.removeAttribute('hidden');
        } else {
          el.init.setAttribute('hidden', '');
        }
      }
      if (el.filters) {
        if (ready) {
          el.filters.removeAttribute('hidden');
        } else {
          el.filters.setAttribute('hidden', '');
        }
      }
      if (el.sections) {
        if (ready) {
          el.sections.removeAttribute('hidden');
        } else {
          el.sections.setAttribute('hidden', '');
        }
      }
      if (ready) {
        await loadList();
      }
      syncFooterAndInstruct();
    } catch (_e) {
      setHint('상태를 불러오지 못했습니다.', true);
      updateExternalLinks({});
    } finally {
      loadStateInflight = false;
      if (el.listLoading) {
        el.listLoading.setAttribute('hidden', '');
      }
    }
  }

  async function loadList() {
    if (!GAS_MODE.canSync) {
      return;
    }
    if (el.listLoading) {
      el.listLoading.removeAttribute('hidden');
    }
    setHint('', false);
    try {
      const res = await gasJsonpWithParams(url, 'productMappingList', null, 120000);
      if (!res || !res.ok) {
        if (res && res.error && (res.error.code === 'NO_OPERATIONS_SHEET' || res.error === 'NO_OPERATIONS_SHEET')) {
          ready = false;
          if (el.init) {
            el.init.removeAttribute('hidden');
          }
          if (el.filters) {
            el.filters.setAttribute('hidden', '');
          }
          if (el.sections) {
            el.sections.setAttribute('hidden', '');
            el.sections.innerHTML = '';
          }
          try {
            const stR = await gasJsonpWithParams(url, 'productMappingState', null, 30000);
            if (stR && stR.ok && stR.data) {
              updateExternalLinks(stR.data);
            }
          } catch (_s) {}
        }
        setHint(errMsg(res), true);
        syncFooterAndInstruct();
        return;
      }
      const rows = (res.data && res.data.rows) || [];
      localRows = JSON.parse(JSON.stringify(rows));
      snapshotBaseline();
      try {
        render();
      } catch (re) {
        const em = re && re.message != null ? String(re.message) : String(re);
        setHint('목록 화면을 그리지 못했습니다. ' + em, true);
        syncFooterAndInstruct();
        return;
      }
      syncFooterAndInstruct();
    } catch (_e) {
      const em = _e && _e.message != null ? String(_e.message) : String(_e);
      setHint('목록을 불러오지 못했습니다. ' + (em.length > 120 ? em.slice(0, 120) + '…' : em), true);
      syncFooterAndInstruct();
    } finally {
      if (el.listLoading) {
        el.listLoading.setAttribute('hidden', '');
      }
    }
  }

  async function onInit() {
    if (!GAS_MODE.canSync) {
      return;
    }
    if (el.btnInit) {
      el.btnInit.disabled = true;
    }
    if (el.listLoading) {
      el.listLoading.removeAttribute('hidden');
    }
    setHint('', false);
    try {
      const r = await gasJsonpWithParams(url, 'initOperationsSheets', null, 120000);
      if (!r || !r.ok) {
        setHint(errMsg(r), true);
        syncFooterAndInstruct();
        return;
      }
      ready = true;
      if (el.init) {
        el.init.setAttribute('hidden', '');
      }
      if (el.filters) {
        el.filters.removeAttribute('hidden');
      }
      if (el.sections) {
        el.sections.removeAttribute('hidden');
      }
      try {
        const stNew = await gasJsonpWithParams(url, 'productMappingState', null, 30000);
        if (stNew && stNew.ok && stNew.data) {
          updateExternalLinks(stNew.data);
        }
      } catch (_s) {}
      await loadList();
      const dInit = r.data || {};
      const nSeeded = dInit.seededRowCount != null ? Number(dInit.seededRowCount) : 0;
      if (nSeeded > 0) {
        setHint('원천 DB 기준으로 분류 시트에 상품 ' + nSeeded + '건을 넣었습니다. 시트에서도 확인하세요.', true);
        syncFooterAndInstruct();
      }
    } catch (_e) {
      setHint('스프레드시트를 만들지 못했습니다.', true);
      syncFooterAndInstruct();
    } finally {
      if (el.btnInit) {
        el.btnInit.disabled = false;
      }
      if (el.listLoading) {
        el.listLoading.setAttribute('hidden', '');
      }
    }
  }

  async function onApply() {
    if (!el.apply || el.apply.disabled) {
      return;
    }
    const dirty = [];
    for (let i = 0; i < localRows.length; i++) {
      const r = localRows[i];
      if (rowSig(r) !== baselineSig.get(r.prod_no)) {
        dirty.push({
          prod_no: r.prod_no,
          product_name: r.product_name,
          internal_category: r.internal_category,
          lifecycle: r.lifecycle,
          notes: r.notes != null ? String(r.notes) : ''
        });
      }
    }
    if (!dirty.length) {
      return;
    }
    el.apply.disabled = true;
    if (el.listLoading) {
      el.listLoading.removeAttribute('hidden');
    }
    setHint('', false);
    try {
      const r = await productMappingApplyBatched_(url, dirty, 5000);
      if (!r || !r.ok) {
        setHint(errMsg(r) || '저장 실패', true);
        return;
      }
      await loadList();
      setHint('저장했습니다.', true);
    } catch (_e) {
      setHint('저장 중 오류가 났습니다.', true);
    } finally {
      if (el.listLoading) {
        el.listLoading.setAttribute('hidden', '');
      }
      recomputeDirty();
    }
  }

  if (el.btnInit) {
    el.btnInit.addEventListener('click', function () {
      onInit();
    });
  }
  if (el.apply) {
    el.apply.addEventListener('click', onApply);
  }
  if (el.search) {
    el.search.addEventListener('input', function () {
      render();
    });
  }
  if (el.onlyUnmapped) {
    el.onlyUnmapped.addEventListener('change', function () {
      render();
    });
  }

  const tPm = mount.querySelector('#sp-tab-pm');
  if (tPm) {
    tPm.addEventListener('click', function () {
      window.setTimeout(function () {
        if (tPm.classList.contains('is-active')) {
          loadState();
        }
      }, 0);
    });
  }
}
