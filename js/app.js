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
  if (!m.querySelector('.app-shell--v4')) {
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
  setStatus('맞춤을 시작했습니다. 끝날 때까지 수 분이 걸릴 수 있습니다.');
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
      setStatus('응답을 정상으로 읽지 못했습니다. 잠시 후 다시 시도하거나 담당자에게 문의하세요.');
      setHint('(참고) ' + String(text).slice(0, 120));
      return;
    }
    if (!j.ok) {
      setChip('실패', 'err');
      const err = j.error != null ? String(j.error) : 'ERROR';
      const msg = j.message != null ? String(j.message) : '';
      if (err === 'SYNC_FAILED') {
        setStatus('맞춤이 중간에 실패했습니다. ' + (msg || '원인은 시트·기록에 남을 수 있습니다.'));
      } else {
        setStatus('처리에 실패했습니다. ' + (msg || ''));
      }
      setHint('이 화면을 캡처해 솔루션 담당자에게 보내 주세요. 시트에 남는 동기 기록도 함께 보여 주시면 됩니다.');
      return;
    }

    setChip('완료', 'ok');
    const d = j.data || {};
    const m = d.members;
    const p = d.products;
    const o = d.orders;
    setStatus(
      '완료. 회원 ' +
        (m && m.rows != null ? m.rows : '—') +
        '행 · 상품 ' +
        (p && p.rows != null ? p.rows : '—') +
        '행 · 주문 ' +
        (o && o.orderRows != null ? o.orderRows : '—') +
        '건(세부 품목 ' +
        (o && o.itemRows != null ? o.itemRows : '—') +
        '행)'
    );
    const sheetUrl = d.spreadsheetUrl != null ? String(d.spreadsheetUrl).trim() : '';
    if (sheetUrl) {
      showSheetsButton(sheetUrl);
      setHint('아래 [마스터 시트 열기]로 열리는 집계 시트를 확인하세요.');
    } else {
      hideSheetsButton();
      setHint('시트로 바로 가는 주소를 받지 못했습니다. 솔루션 담당자에게 말씀해 주세요.');
    }
  } catch (e) {
    setChip('오류', 'err');
    setStatus('연결에 실패했습니다. ' + (e && e.message != null ? e.message : String(e)));
    setHint('인터넷·주소(맨 윗줄)를 한 번 더 확인하시고, 같은 일이 나면 이 화면을 캡처해 담당자에게 보내 주세요.');
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
        '맨 윗줄에 솔루션에서 안내한 연결 주소가 들어갔는지 확인하세요. 이 줄이 항상 맨 위에, 맨 아래 느낌의 스크립트보다 위에 있어야 합니다.';
    }
    return;
  }
  refreshSyncButtonState();
  if (actionNote) {
    actionNote.textContent =
      '한 번 실행할 때마다 쇼핑·구글 쪽에 부담이 갑니다. 실패하면 이 화면을 캡처해 담당자에게 보내 주세요.';
  }
  btnSync.addEventListener('click', function onSync() {
    postSyncOpenFull();
  });
}

async function main() {
  if (!mount) {
    setChip('오류', 'err');
    setStatus('필수 영역이 없어 화면을 띄울 수 없습니다. 붙여 넣은 코드를 솔루션 담당자에게 보내 주세요.');
    return;
  }
  hideSheetsButton();
  if (GAS_MODE.useMock) {
    setChip('미연결', 'soft');
    setStatus('쇼핑몰과 연결이 아직 잡혀 있지 않습니다.');
    setHint('맨 윗줄에 솔루션에서 안내한 연결 주소가 들어갔는지 확인하세요. 담당자가 넣어 준 코드가 아니면 담당자에게 다시 보내 달라고 하시면 됩니다.');
    wireSync();
    return;
  }
  setChip('연결됨', 'ok');
  setStatus('맞춤 대기. 아래에 ' + SYNC_CONFIRM + ' 를 입력한 뒤 [전체 데이터 동기화]를 누르세요.');
  setHint('맞춤 순서: 회원 → 상품 → 주문. 끊기면 시트·기록을 보여 주시면 담당자가 확인할 수 있습니다.');
  wireSync();
}

main().catch((e) => {
  setChip('오류', 'err');
  setStatus('초기화 실패: ' + (e && e.message));
});
