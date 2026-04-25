/**
 * 팀/공개 배포 URL만. (비밀·클라이언트 토큰은 커밋하지 말 것 — IMWEB_CORS.md)
 */
export const GAS_BASE_URL = '';

/**
 * GAS `POST` 동기 API가 붙기 전엔 `false` 유지(버튼은 비활성).
 * 붙이면 `true` 로 두고 `fetch` 경로/바디는 백엔드 §2 맞출 것.
 */
export const ENABLE_SYNC_ACTION = false;

export const GAS_MODE = {
  useMock: !GAS_BASE_URL,
  canSync: Boolean(GAS_BASE_URL) && ENABLE_SYNC_ACTION,
};
