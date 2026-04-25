/**
 * ① **아임웹/위젯(권장)**: `app.js`보다 **먼저** `window.__SOLPATH__` 를 넣는다. (아래 `IMWEB_SNIPPET_INJECT` 참고)
 * ② 로컬: 아래 `FALLBACK_*` 에만 적어도 됨(레포엔 **커밋하지 말 것**)
 *
 * GAS: Property `SOLPATH_DASHBOARD_TOKEN` = `token` 와 같게.
 */
function spReadInjected_() {
  if (typeof globalThis === 'undefined') {
    return { url: '', token: '' };
  }
  const o = globalThis.__SOLPATH__;
  if (!o || typeof o !== 'object') {
    return { url: '', token: '' };
  }
  return {
    url: String(
      o.gasBaseUrl != null
        ? o.gasBaseUrl
        : o.GAS_BASE_URL != null
          ? o.GAS_BASE_URL
          : o.execUrl != null
            ? o.execUrl
            : ''
    ).trim(),
    token: String(
      o.token != null
        ? o.token
        : o.DASHBOARD_SYNC_API_TOKEN != null
          ? o.DASHBOARD_SYNC_API_TOKEN
          : o.syncToken != null
            ? o.syncToken
            : ''
    ).trim()
  };
}

const _inj = spReadInjected_();
/** 위젯에서 안 넣을 때만 쓰는 fallback (비어 있으면 동기 비활성) */
const FALLBACK_GAS_BASE_URL = '';
const FALLBACK_SYNC_TOKEN = '';

export const GAS_BASE_URL = _inj.url || FALLBACK_GAS_BASE_URL;
export const DASHBOARD_SYNC_API_TOKEN = _inj.token || FALLBACK_SYNC_TOKEN;

export const GAS_MODE = {
  get useMock() {
    return !String(GAS_BASE_URL).trim();
  },
  get canSync() {
    return Boolean(String(GAS_BASE_URL).trim() && String(DASHBOARD_SYNC_API_TOKEN).trim());
  }
};
