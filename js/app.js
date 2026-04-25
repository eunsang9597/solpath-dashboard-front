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
  if (!m.querySelector('.app-shell--v7')) {
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
  setStatus('쇼핑몰 데이터를 읽어 집계 시트에 반영하는 중입니다. 완료까지 수 분이 걸릴 수 있습니다.');
  setHint('');
  setChip('처리', 'soft');

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
      setStatus('서버 응답을 확인할 수 없습니다. 잠시 후 [실행]을 다시 누릅니다.');
      setHint('');
      return;
    }
    if (!j.ok) {
      setChip('실패', 'err');
      const err = j.error != null ? String(j.error) : 'ERROR';
      const msg = j.message != null ? String(j.message) : '';
      if (err === 'SYNC_FAILED') {
        setStatus('처리가 완료되지 않았습니다. ' + (msg || '집계 시트에 남는 내용을 확인한 뒤 사내 절차에 따릅니다.'));
      } else {
        setStatus('처리를 마치지 못했습니다. ' + (msg || '동일 증상이면 사내 절차에 따라 문의합니다.'));
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
      setHint('집계 시트 바로가기 링크를 받지 못했습니다. 사내에 공지된 절차에 따라 문의합니다.');
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
        '이 화면이 동작하려면 사이트에 넣는 스크립트 맨 앞부분에, 안내된 연결 주소가 들어가 있어야 합니다. 담당 설정을 확인합니다.';
    }
    return;
  }
  refreshSyncButtonState();
  if (actionNote) {
    actionNote.textContent =
      '[실행] 1회마다 쇼핑몰 현재 데이터로 집계 시트를 덮어쓰며, 수 분이 걸릴 수 있습니다.';
  }
  btnSync.addEventListener('click', function onSync() {
    postSyncOpenFull();
  });
}

async function main() {
  if (!mount) {
    setChip('오류', 'err');
    setStatus('이 페이지에서 화면을 띄울 영역이 없습니다. 사이트 편집에 붙인 위젯·코드가 안내된 대로인지 담당자에게 확인합니다.');
    return;
  }
  hideSheetsButton();
  if (GAS_MODE.useMock) {
    setChip('미연결', 'soft');
    setStatus('연결 주소가 이 페이지에 설정되어 있지 않습니다. 사이트에 삽입한 스크립트 상단의 연결 주소를 확인합니다.');
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
  setStatus('초기 로드에 실패했습니다. 페이지를 새로 고침한 뒤 다시 시도합니다.');
});
