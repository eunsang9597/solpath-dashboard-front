import { GAS_MODE, GAS_BASE_URL, DASHBOARD_SYNC_API_TOKEN } from './config.js';
import { SYNC_PAGE_SHELL_HTML } from './syncPageTemplate.js';

const MOUNT_ID = 'solpath-root';
const syncAction = 'syncOpenFull';

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
  if (!m.querySelector('.app-shell')) {
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
const actionNote = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-actionNote'));
const loadingOverlay = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-loadingOverlay'));
const successActions = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-successActions'));
const sheetsLink = /** @type {HTMLAnchorElement | null} */ (scope.querySelector('#sp-sheetsLink'));

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

/**
 * GAS `HttpOpenSync` `doPost` — `action=syncOpenFull` + `token`
 */
async function postSyncOpenFull() {
  const url = String(GAS_BASE_URL).trim();
  if (!url || !btnSync) {
    return;
  }
  const body = new URLSearchParams();
  body.set('action', syncAction);
  body.set('token', String(DASHBOARD_SYNC_API_TOKEN).trim());

  hideSheetsButton();
  setLoading(true);
  btnSync.disabled = true;
  setStatus('요청을 보냈습니다. 응답을 기다리는 중… (동기는 수 분 걸릴 수 있음)');
  setHint('');
  setChip('처리 중', 'soft');

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
      setStatus('응답이 JSON이 아닙니다 (http ' + res.status + ').');
      setHint(String(text).slice(0, 220));
      return;
    }
    if (!j.ok) {
      setChip('실패', 'err');
      const err = j.error != null ? String(j.error) : 'ERROR';
      const msg = j.message != null ? String(j.message) : '';
      if (err === 'UNAUTHORIZED') {
        setStatus('인증 실패 — 토큰과 GAS Property SOLPATH_DASHBOARD_TOKEN 을 맞추세요.');
      } else if (err === 'SYNC_FAILED') {
        setStatus('동기화 중 오류: ' + (msg || '알 수 없음'));
      } else {
        setStatus(err + (msg ? ': ' + msg : ''));
      }
      setHint(
        err === 'UNAUTHORIZED' ? 'config.js DASHBOARD_SYNC_API_TOKEN 확인' : 'GAS Executions·sync_log 시트를 확인하세요'
      );
      return;
    }

    setChip('완료', 'ok');
    const d = j.data || {};
    const m = d.members;
    const p = d.products;
    const o = d.orders;
    setStatus(
      '완료 — members ' +
        (m && m.rows != null ? m.rows : '—') +
        '행 · products ' +
        (p && p.rows != null ? p.rows : '—') +
        '행 · orders ' +
        (o && o.orderRows != null ? o.orderRows : '—') +
        '건 (품목 행 ' +
        (o && o.itemRows != null ? o.itemRows : '—') +
        ')'
    );
    const sheetUrl = d.spreadsheetUrl != null ? String(d.spreadsheetUrl).trim() : '';
    if (sheetUrl) {
      showSheetsButton(sheetUrl);
      setHint('아래 버튼으로 원천 DB 시트를 열어 members · orders · order_items 를 확인하세요.');
    } else {
      hideSheetsButton();
      setHint(
        '동기는 끝났지만 시트 URL이 없습니다. GAS에 SHEETS_MASTER_ID(또는 dbSetupMasterDatabase) 를 설정하세요.'
      );
    }
  } catch (e) {
    setChip('오류', 'err');
    setStatus('네트워크 오류: ' + (e && e.message != null ? e.message : String(e)));
    setHint('CORS, 배포 URL, Web App "액세스 권한"·docs/IMWEB_CORS.md');
  } finally {
    setLoading(false);
    if (GAS_MODE.canSync) {
      btnSync.disabled = false;
    }
  }
}

function wireSync() {
  if (!btnSync) {
    return;
  }
  if (!GAS_MODE.canSync) {
    btnSync.disabled = true;
    if (actionNote) {
      if (GAS_MODE.useMock) {
        actionNote.textContent = 'GAS_BASE_URL + DASHBOARD_SYNC_API_TOKEN (GAS Property와 동일, 레포엔 토큰 커밋 금지)';
      } else {
        actionNote.textContent = 'DASHBOARD_SYNC_API_TOKEN — Script Property SOLPATH_DASHBOARD_TOKEN 과 같은 값';
      }
    }
    return;
  }
  btnSync.disabled = false;
  if (actionNote) {
    actionNote.textContent = 'Open API·unit·Sheets 마스터 준비 후(최대 ~6분). 실패 시 Executions·sync_log';
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
    setStatus('대기 — config.js에 GAS Web App exec URL 이 필요합니다');
    setHint('아임웹: IMWEB_SNIPPET_INJECT.html · CORS docs/IMWEB_CORS.md');
    wireSync();
    return;
  }
  if (!GAS_MODE.canSync) {
    setChip('토큰 없음', 'soft');
    setStatus('GAS URL은 있음 — DASHBOARD_SYNC_API_TOKEN(=GAS SOLPATH_DASHBOARD_TOKEN)이 비어 있음');
    setHint('공개 static 에 실토큰 넣지 말 것');
    wireSync();
    return;
  }
  setChip('연결됨', 'ok');
  setStatus('전체 데이터 동기화: members → products(1p) → orders (백엔드 순서)');
  setHint('');
  wireSync();
}

main().catch((e) => {
  setChip('오류', 'err');
  setStatus('초기화 실패: ' + (e && e.message));
});
