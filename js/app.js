import { GAS_BASE_URL, GAS_MODE } from './config.js';

const statusLine = document.getElementById('statusLine');
const hintLine = document.getElementById('hintLine');

function setStatus(text) {
  if (statusLine) {
    statusLine.textContent = text;
  }
}

async function main() {
  if (GAS_MODE.useMock) {
    setStatus('GAS URL 미설정 — 로컬 셸만 (config.js에 GAS_BASE_URL 넣고 배포 URL 연동)');
    if (hintLine) {
      hintLine.textContent = '앱 루트: index.html · 모듈: js/app.js';
    }
    return;
  }
  setStatus('GAS: ' + GAS_BASE_URL + ' (doGet 건강 체크 등은 이후 백엔드 스펙에 맞게)');
}

main().catch((e) => {
  setStatus('에러: ' + (e && e.message));
});
