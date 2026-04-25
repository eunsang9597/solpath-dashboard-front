/**
 * 공개 배포: 실제 토큰·URL은 **레포에 커밋하지 말고** (노출됨) 로컬/비공개 빌드에서만 주입.
 * GAS: Script Property `SOLPATH_DASHBOARD_TOKEN` — 아래 `DASHBOARD_SYNC_API_TOKEN` 과 동일 값.
 */
export const GAS_BASE_URL = '';

/**
 * Web App 배포 URL **전체** (예: `https://script.google.com/macros/s/…/usercode/exec` 형태).
 * 끝이 `/exec`인지 팀이 쓰는 URL 그대로.
 */
// export const GAS_BASE_URL = 'https://script.google.com/macros/s/XXXX/exec';

/**
 * 대시보드 `POST` `action`+`token` — `IMWEB_CORS.md` 참고(정적 토큰은 누구나 복제 가능, 운영은 내부·제한 URL 전제).
 */
export const DASHBOARD_SYNC_API_TOKEN = '';

export const GAS_MODE = {
  get useMock() {
    return !GAS_BASE_URL;
  },
  get canSync() {
    return Boolean(String(GAS_BASE_URL).trim() && String(DASHBOARD_SYNC_API_TOKEN).trim());
  }
};
