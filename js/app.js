import { GAS_MODE, GAS_BASE_URL, DASHBOARD_SYNC_API_TOKEN } from './config.js';
import { SYNC_PAGE_SHELL_HTML } from './syncPageTemplate.js';

const MOUNT_ID = 'solpath-root';
const syncAction = 'syncOpenFull';

function getMount() {
  return document.getElementById(MOUNT_ID);
}

function ensureShell() {
  const mount = getMount();
  if (!mount) {
    return null;
  }
  if (mount.getAttribute('data-solpath-autofill') === '0') {
    return mount;
  }
  if (!mount.querySelector('.app-shell')) {
    mount.innerHTML = SYNC_PAGE_SHELL_HTML;
  }
  return mount;
}

const mount = ensureShell();
const scope = mount != null ? mount : document;

const statusLine = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-statusLine'));
const hintLine = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-hintLine'));
const envChip = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-envChip'));
const btnSync = /** @type {HTMLButtonElement | null} */ (scope.querySelector('#sp-btnSync'));
const actionNote = /** @type {HTMLElement | null} */ (scope.querySelector('#sp-actionNote'));

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
 * GAS `HttpOpenSync.js` `doPost` — `action=syncOpenFull` + `token`
 */
async function postSyncOpenFull() {
  const url = String(GAS_BASE_URL).trim();
  if (!url || !btnSync) {
    return;
  }
  const body = new URLSearchParams();
  body.set('action', syncAction);
  body.set('token', String(DASHBOARD_SYNC_API_TOKEN).trim());

  btnSync.disabled = true;
  setStatus('동기화 요청 중…');
  setHint('');
  setChip('동기화 중', 'soft');

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
      setStatus('응답이 JSON이 아님 (http ' + res.status + ')');
      setHint(String(text).slice(0, 220));
      return;
    }
    if (!j.ok) {
      setChip('실패', 'err');
      setStatus(String(j.error || 'ERROR') + (j.message ? ': ' + j.message : ''));
      setHint(j.error === 'UNAUTHORIZED' ? '토큰·Property SOLPATH_DASHBOARD_TOKEN 확인' : '');
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
        ' · products ' +
        (p && p.rows != null ? p.rows : '—') +
        ' · orders ' +
        (o && o.orderRows != null ? o.orderRows : '—') +
        ' (품목 ' +
        (o && o.itemRows != null ? o.itemRows : '—') +
        ')'
    );
    setHint('');
  } catch (e) {
    setChip('오류', 'err');
    setStatus('요청 실패: ' + (e && e.message != null ? e.message : String(e)));
    setHint('CORS·배포 URL·exec 경로는 docs/IMWEB_CORS.md·BACKEND_API.md');
  } finally {
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
