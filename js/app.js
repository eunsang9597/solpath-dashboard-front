import { GAS_MODE, GAS_BASE_URL } from './config.js';
import { SYNC_PAGE_SHELL_HTML } from './syncPageTemplate.js';

const MOUNT_ID = 'solpath-root';
const syncAction = 'syncOpenFull';
const SYNC_CONFIRM = '데이터 동기화';

function getMount() {
  return document.getElementById(MOUNT_ID);
}

function ensureShell() {
  const m = getMount();
  if (!m) {
    return null;
  }
  if (m.getAttribute('data-solpath-autofill') === '0') {
    return m;
  }
  if (!m.querySelector('.app-shell--v9')) {
    m.innerHTML = SYNC_PAGE_SHELL_HTML;
  }
  return m;
}

const mount = ensureShell();
const scope = mount != null ? mount : document;

const statusLine = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-statusLine'));
const hintLine = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-hintLine'));
const envChip = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-envChip'));
const btnSync = /** @type {HTMLButtonElement | null} */ (scope.querySelector('#sp-btnSync'));
const confirmInput = /** @type {HTMLInputElement | null} */ (scope.querySelector('#sp-confirm'));
const actionNote = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-actionNote'));
const loadingOverlay = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-loadingOverlay'));
const successActions = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-successActions'));
const sheetsLink = /** @type {HTMLAnchorElement | null} */ (scope.querySelector('#sp-sheetsLink'));
const feedback = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-feedback'));

let syncBusy = false;

function wireTabs_() {
  if (!mount) {
    return;
  }
  const tSync = mount.querySelector('#sp-tab-sync');
  const tMore = mount.querySelector('#sp-tab-more');
  const pSync = mount.querySelector('#sp-panel-sync');
  const pMore = mount.querySelector('#sp-panel-more');
  if (!tSync || !tMore || !pSync || !pMore) {
    return;
  }
  function activateSync() {
    tSync.classList.add('is-active');
    tSync.setAttribute('aria-selected', 'true');
    tSync.tabIndex = 0;
    tMore.classList.remove('is-active');
    tMore.setAttribute('aria-selected', 'false');
    tMore.tabIndex = -1;
    pSync.classList.add('is-active');
    pSync.removeAttribute('hidden');
    pMore.classList.remove('is-active');
    pMore.setAttribute('hidden', '');
  }
  function activateMore() {
    tMore.classList.add('is-active');
    tMore.setAttribute('aria-selected', 'true');
    tMore.tabIndex = 0;
    tSync.classList.remove('is-active');
    tSync.setAttribute('aria-selected', 'false');
    tSync.tabIndex = -1;
    pMore.classList.add('is-active');
    pMore.removeAttribute('hidden');
    pSync.classList.remove('is-active');
    pSync.setAttribute('hidden', '');
  }
  tSync.addEventListener('click', activateSync);
  tMore.addEventListener('click', activateMore);
}

function setChip(text, kind) {
  if (!envChip) {
    return;
  }
  envChip.textContent = text;
  envChip.classList.remove('chip--ok', 'chip--err', 'chip--soft');
  if (kind === 'ok') {
    envChip.classList.add('chip--ok');
  } else if (kind === 'err') {
    envChip.classList.add('chip--err');
  } else {
    envChip.classList.add('chip--soft');
  }
}

function syncFeedbackBlock_() {
  if (!feedback) {
    return;
  }
  const tMain = statusLine && statusLine.textContent.trim();
  const tSub = hintLine && hintLine.textContent.trim();
  const hasLink = Boolean(
    successActions && !successActions.hasAttribute('hidden') && sheetsLink && !sheetsLink.hasAttribute('hidden')
  );
  if (tMain || tSub || hasLink) {
    feedback.removeAttribute('hidden');
  } else {
    feedback.setAttribute('hidden', '');
  }
}

function setStatus(text) {
  if (statusLine) {
    statusLine.textContent = text;
  }
  syncFeedbackBlock_();
}

function setHint(text) {
  if (hintLine) {
    hintLine.textContent = text;
  }
  syncFeedbackBlock_();
}

/**
 * @param {boolean} on
 */
function setLoading(on) {
  if (loadingOverlay) {
    if (on) {
      loadingOverlay.removeAttribute('hidden');
      loadingOverlay.setAttribute('aria-hidden', 'false');
    } else {
      loadingOverlay.setAttribute('hidden', '');
      loadingOverlay.setAttribute('aria-hidden', 'true');
    }
  }
  if (btnSync) {
    if (on) {
      btnSync.setAttribute('aria-busy', 'true');
    } else {
      btnSync.removeAttribute('aria-busy');
    }
  }
}

function confirmOk() {
  return Boolean(confirmInput && confirmInput.value.trim() === SYNC_CONFIRM);
}

function refreshSyncButtonState() {
  if (!btnSync) {
    return;
  }
  if (!GAS_MODE.canSync) {
    btnSync.disabled = true;
    if (confirmInput) {
      confirmInput.disabled = true;
    }
    return;
  }
  if (confirmInput) {
    confirmInput.disabled = false;
  }
  btnSync.disabled = syncBusy || !confirmOk();
}

/**
 * @param {string|undefined} url
 */
function showSheetsButton(url) {
  if (!sheetsLink || !successActions) {
    return;
  }
  const u = String(url != null ? url : '').trim();
  if (u.length > 0 && (u.indexOf('http://') === 0 || u.indexOf('https://') === 0)) {
    sheetsLink.href = u;
    sheetsLink.removeAttribute('hidden');
    successActions.removeAttribute('hidden');
  } else {
    sheetsLink.setAttribute('hidden', '');
    sheetsLink.href = '#';
    successActions.setAttribute('hidden', '');
  }
  syncFeedbackBlock_();
}

function hideSheetsButton() {
  if (sheetsLink) {
    sheetsLink.setAttribute('hidden', '');
    sheetsLink.removeAttribute('href');
    sheetsLink.setAttribute('href', '#');
  }
  if (successActions) {
    successActions.setAttribute('hidden', '');
  }
  syncFeedbackBlock_();
}

/**
 * GAS `TextOutput`에는 CORS(setHeader)가 없고, `fetch`는 응답 CORS를 요구 → JSONP로 동일 출처·크로스 오리진 모두 JS만 실행
 * @param {string} baseUrl
 * @param {string} action
 * @param {number} timeoutMs
 * @returns {Promise<Object>}
 */
function gasJsonp_(baseUrl, action, timeoutMs) {
  return new Promise(function (resolve, reject) {
    const cb =
      '_solpath_jp_' + String(Date.now()) + '_' + String(Math.floor(Math.random() * 1e9));
    const lim = timeoutMs != null ? timeoutMs : 360000;
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
    s.async = true;
    s.src = u.toString();
    s.onerror = function () {
      cleanup();
      reject(new Error('script error'));
    };
    document.head.appendChild(s);
  });
}

async function postSyncOpenFull() {
  const url = String(GAS_BASE_URL).trim();
  if (!url || !btnSync || !confirmOk()) {
    return;
  }
  syncBusy = true;
  refreshSyncButtonState();
  hideSheetsButton();
  setLoading(true);
  setStatus('연동 데이터를 읽어 집계 시트에 반영하는 중입니다. 완료까지 수 분이 걸릴 수 있습니다.');
  setHint('');
  setChip('처리', 'soft');

  try {
    const j = await gasJsonp_(url, syncAction, 360000);
    if (!j.ok) {
      setChip('실패', 'err');
      const err = j.error != null ? String(j.error) : 'ERROR';
      const msg = j.message != null ? String(j.message) : '';
      if (err === 'SYNC_FAILED') {
        setStatus('처리가 완료되지 않았습니다. ' + (msg || '집계 시트에 남는 내용을 확인한 뒤 운영 절차에 따릅니다.'));
      } else {
        setStatus('처리를 마치지 못했습니다. ' + (msg || '동일 증상이면 운영 절차에 따라 문의합니다.'));
      }
      setHint('');
      return;
    }

    setChip('완료', 'ok');
    const d = j.data || {};
    const m = d.members;
    const p = d.products;
    const o = d.orders;
    setStatus(
      '처리가 완료되었습니다. 반영 건수 — 회원 ' +
        (m && m.rows != null ? m.rows : '—') +
        ' · 상품 ' +
        (p && p.rows != null ? p.rows : '—') +
        ' · 주문 ' +
        (o && o.orderRows != null ? o.orderRows : '—') +
        ' · 품목 ' +
        (o && o.itemRows != null ? o.itemRows : '—') +
        '. [집계 시트 열기]로 확인합니다.'
    );
    const sheetUrl = d.spreadsheetUrl != null ? String(d.spreadsheetUrl).trim() : '';
    if (sheetUrl) {
      showSheetsButton(sheetUrl);
      setHint('');
    } else {
      hideSheetsButton();
      setHint('집계 시트 바로가기를 받지 못했습니다. 운영 절차에 따라 문의합니다.');
    }
  } catch (e) {
    setChip('오류', 'err');
    setStatus('요청이 완료되지 않았습니다. 네트워크·접속 환경을 확인한 뒤 [실행]을 다시 누릅니다.');
    setHint('');
  } finally {
    syncBusy = false;
    setLoading(false);
    refreshSyncButtonState();
  }
}

function wireSync() {
  if (!btnSync) {
    return;
  }
  if (confirmInput) {
    const onIn = function () {
      refreshSyncButtonState();
    };
    confirmInput.addEventListener('input', onIn);
    confirmInput.addEventListener('paste', onIn);
  }
  if (!GAS_MODE.canSync) {
    btnSync.disabled = true;
    if (confirmInput) {
      confirmInput.disabled = true;
    }
    if (actionNote) {
      actionNote.textContent =
        '이 기능을 쓰려면 서버와의 연결이 먼저 잡혀 있어야 합니다. 운영에서 안내받은 절차를 확인합니다.';
    }
    return;
  }
  refreshSyncButtonState();
  if (actionNote) {
    actionNote.textContent =
      '[실행] 1회마다 솔루션 연동 기준의 현재 데이터로 집계 시트를 덮어쓰며, 수 분이 걸릴 수 있습니다.';
  }
  btnSync.addEventListener('click', function onSync() {
    postSyncOpenFull();
  });
}

async function main() {
  if (!mount) {
    setChip('오류', 'err');
    return;
  }
  wireTabs_();
  hideSheetsButton();
  if (GAS_MODE.useMock) {
    setChip('미연결', 'soft');
    setStatus('서버와 연결이 잡혀 있지 않습니다. 운영에서 안내받은 절차에 따라 환경을 확인합니다.');
    setHint('');
    wireSync();
    return;
  }
  setChip('연결됨', 'ok');
  setStatus('');
  setHint('');
  wireSync();
}

main().catch((e) => {
  setChip('오류', 'err');
  setStatus('화면을 불러오지 못했습니다. 페이지를 새로 고침한 뒤 다시 시도합니다.');
});
