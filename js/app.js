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
  if (!m.querySelector('.app-shell--v3')) {
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

function setStatus(text) {
  if (statusLine) {
    statusLine.textContent = text;
  }
}

function setHint(text) {
  if (hintLine) {
    hintLine.textContent = text;
  }
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
  setStatus('요청을 보냄. 완료까지 수 분이 걸릴 수 있다.');
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
      setStatus('응답이 JSON이 아님. HTTP ' + res.status);
      setHint(String(text).slice(0, 200));
      return;
    }
    if (!j.ok) {
      setChip('실패', 'err');
      const err = j.error != null ? String(j.error) : 'ERROR';
      const msg = j.message != null ? String(j.message) : '';
      if (err === 'SYNC_FAILED') {
        setStatus('동기화 실패: ' + (msg || '—'));
      } else {
        setStatus(err + (msg ? ': ' + msg : ''));
      }
      setHint('GAS Executions·스크립트 내 오류, sync_log 시트');
      return;
    }

    setChip('완료', 'ok');
    const d = j.data || {};
    const m = d.members;
    const p = d.products;
    const o = d.orders;
    setStatus(
      '완료. members ' +
        (m && m.rows != null ? m.rows : '—') +
        '행 · products ' +
        (p && p.rows != null ? p.rows : '—') +
        '행 · orders ' +
        (o && o.orderRows != null ? o.orderRows : '—') +
        '건(품목 행 ' +
        (o && o.itemRows != null ? o.itemRows : '—') +
        ')'
    );
    const sheetUrl = d.spreadsheetUrl != null ? String(d.spreadsheetUrl).trim() : '';
    if (sheetUrl) {
      showSheetsButton(sheetUrl);
      setHint('시트 URL은 GAS Property SHEETS_MASTER_ID·마스터 생성 여부에 따른다.');
    } else {
      hideSheetsButton();
      setHint('시트 URL이 없다. SHEETS_MASTER_ID·dbSetup·배포 스크립트를 확인.');
    }
  } catch (e) {
    setChip('오류', 'err');
    setStatus('브라우저 요청 실패: ' + (e && e.message != null ? e.message : String(e)));
    setHint('CORS(배포에 미러링)·exec URL·Web App 액세스(익명/계정) 순으로 본다.');
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
        'GAS Web App …/exec 를 window.__SOLPATH__.gasBaseUrl 에 둔다. type=module app.js 보다 위에 위치시킨다.';
    }
    return;
  }
  refreshSyncButtonState();
  if (actionNote) {
    actionNote.textContent = '1회당 Open API·쿼터·GAS가 소비된다. 실패 시 GAS Executions·sync_log를 본다.';
  }
  btnSync.addEventListener('click', function onSync() {
    postSyncOpenFull();
  });
}

async function main() {
  if (!mount) {
    setChip('오류', 'err');
    setStatus('#solpath-root 없음');
    return;
  }
  hideSheetsButton();
  if (GAS_MODE.useMock) {
    setChip('로컬 / URL 없음', 'soft');
    setStatus('대기 — exec URL이 없다.');
    setHint('위젯: __SOLPATH__.gasBaseUrl 에 Web App exec URL. app.js module 보다 먼저. 로컬: config.js FALLBACK(커밋 금지).');
    wireSync();
    return;
  }
  setChip('연결됨', 'ok');
  setStatus('준비됨. 아래 잠금 문구 입력 후 전체 데이터 동기화로 실행.');
  setHint('순서: members → products(1p) → orders. 중단·재시도는 GAS 쪽 로그에 따른다.');
  wireSync();
}

main().catch((e) => {
  setChip('오류', 'err');
  setStatus('초기화 실패: ' + (e && e.message));
});
