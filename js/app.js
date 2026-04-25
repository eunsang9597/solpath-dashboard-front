import { GAS_MODE } from './config.js';
import { SYNC_PAGE_SHELL_HTML } from './syncPageTemplate.js';

const MOUNT_ID = 'solpath-root';

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

function wireSync() {
  if (!btnSync) {
    return;
  }
  if (!GAS_MODE.canSync) {
    btnSync.disabled = true;
    if (actionNote) {
      actionNote.textContent =
        GAS_MODE.useMock
          ? 'config.js에 GAS_BASE_URL을 넣고, 백엔드 연동 시 ENABLE_SYNC_ACTION = true'
          : 'GAS self API(CORS+POST) 연동 후 ENABLE_SYNC_ACTION = true';
    }
    return;
  }
  btnSync.disabled = false;
  if (actionNote) {
    actionNote.textContent = '실행 시 백엔드가 순서·청크로 동기를 돌립니다(시간·쿼터에 유의).';
  }
  btnSync.addEventListener('click', () => {
    setStatus('요청 보내는 중… (백엔드 doPost/토큰 스펙 붙이면 이어짐)');
    setHint('지금은 UI만 — API 스펙에 맞춰 fetch 를 연결하세요.');
  });
}

async function main() {
  if (!mount) {
    setChip('오류', 'err');
    setStatus('#solpath-root 없음');
    return;
  }
  if (GAS_MODE.useMock) {
    setChip('로컬 / 설정 없음', 'soft');
    setStatus('대기 — js/config.js에 Web App exec URL(베이스)을 넣으면 "연결됨"으로 바꿀 수 있어요');
    setHint('아임웹: iframe이 막히면 IMWEB_SNIPPET_INJECT.html(스크립트 직접). CORS·토큰은 docs/IMWEB_CORS.md');
    wireSync();
    return;
  }
  setChip('URL 설정됨 · 동기 API TBD', 'soft');
  setStatus('GAS Web App 베이스가 config에 있습니다. 동기 `POST`는 백엔드 붙이면 이 버튼이 살아납니다.');
  setHint('');
  wireSync();
}

main().catch((e) => {
  setChip('오류', 'err');
  setStatus('초기화 실패: ' + (e && e.message));
});
