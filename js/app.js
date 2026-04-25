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
  // 아임웹에 예전에 붙인 정적 HTML(구 .app-shell)이 있으면 그대로 두지 않고 v2로 갈아탐
  if (!m.querySelector('.app-shell--v6')) {
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

async function postSyncOpenFull() {
  const url = String(GAS_BASE_URL).trim();
  if (!url || !btnSync || !confirmOk()) {
    return;
  }
  const body = new URLSearchParams();
  body.set('action', syncAction);

  syncBusy = true;
  refreshSyncButtonState();
  hideSheetsButton();
  setLoading(true);
  setStatus('쇼핑몰에서 읽어 온 뒤 시트에 쓰는 중입니다. 끝날 때까지 수 분이 걸릴 수 있습니다.');
  setHint('');
  setChip('진행', 'soft');

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const text = await res.text();
    let j;
    try {
      j = JSON.parse(text);
    } catch (_e) {
      setChip('오류', 'err');
      setStatus('끝나는 응답이 아닙니다. 잠시 뒤 다시 누르거나, 이 화면을 캡처해 보내 주세요.');
      setHint('(' + String(text).slice(0, 100) + '…)');
      return;
    }
    if (!j.ok) {
      setChip('실패', 'err');
      const err = j.error != null ? String(j.error) : 'ERROR';
      const msg = j.message != null ? String(j.message) : '';
      if (err === 'SYNC_FAILED') {
        setStatus('중간에 멈췄습니다. ' + (msg || '시트에 이유가 적혀 있을 수 있습니다.'));
      } else {
        setStatus('끝까지 가지 못했습니다. ' + (msg || ''));
      }
      setHint('이 화면을 캡처해 보내 주세요.');
      return;
    }

    setChip('완료', 'ok');
    const d = j.data || {};
    const m = d.members;
    const p = d.products;
    const o = d.orders;
    setStatus(
      '끝났습니다. 시트에 회원 ' +
        (m && m.rows != null ? m.rows : '—') +
        '줄, 상품 ' +
        (p && p.rows != null ? p.rows : '—') +
        '줄, 주문 ' +
        (o && o.orderRows != null ? o.orderRows : '—') +
        '건(안의 품목 줄 ' +
        (o && o.itemRows != null ? o.itemRows : '—') +
        '줄)이 들어갔습니다.'
    );
    const sheetUrl = d.spreadsheetUrl != null ? String(d.spreadsheetUrl).trim() : '';
    if (sheetUrl) {
      showSheetsButton(sheetUrl);
      setHint('');
    } else {
      hideSheetsButton();
      setHint('시트로 가는 링크를 못 받았습니다. 캡처 후 받은 연락처로 보내 주세요.');
    }
  } catch (e) {
    setChip('오류', 'err');
    setStatus('쇼핑몰/시트 쪽에 닿지 못했습니다. ' + (e && e.message != null ? e.message : String(e)));
    setHint('인터넷·맨 위 연결 주소를 본 뒤, 이 화면을 캡처해 보내 주세요.');
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
        '쇼핑몰과 붙이려면 맨 위에 받은 연결 주소가 있어야 합니다. 이 페이지에 맨 먼저 붙이는 그 한 줄이면 됩니다.';
    }
    return;
  }
  refreshSyncButtonState();
  if (actionNote) {
    actionNote.textContent =
      '한 번 누를 때마다 쇼핑몰에서 읽어서 시트에 쓰는 큰 작업이 돌아갑니다. 실패하면 이 화면을 캡처해 보내 주세요.';
  }
  btnSync.addEventListener('click', function onSync() {
    postSyncOpenFull();
  });
}

async function main() {
  if (!mount) {
    setChip('오류', 'err');
    setStatus('이 화면이 들어갈 상자가 없어 띄울 수 없습니다. 이 페이지에 붙인 HTML을 캡처해 보내 주세요.');
    return;
  }
  hideSheetsButton();
  if (GAS_MODE.useMock) {
    setChip('미연결', 'soft');
    setStatus('쇼핑몰과 잇는 주소가 아직 없습니다. 맨 위에 받은 주소·이 HTML 통째 붙이기를 확인하세요.');
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
  setStatus('첫 화면을 열다가 막혔습니다: ' + (e && e.message));
});
