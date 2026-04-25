# solpath-dashboard-front

내부용 정적 대시보드(바닐라 JS). 백엔드는 GAS Web App + 시트(메타·GAS: [`solpath-dashboard`](https://github.com/eunsang9597/solpath-dashboard)).

**원격:** [eunsang9597/solpath-dashboard-front](https://github.com/eunsang9597/solpath-dashboard-front) · [solpath-labs-dev/solpath-dashboard-front](https://github.com/solpath-labs-dev/solpath-dashboard-front)

**아임웹:** [IMWEB_SNIPPET_INJECT.html](./IMWEB_SNIPPET_INJECT.html) — `__SOLPATH__` + jsDelivr. iframe: [IMWEB_SNIPPET.html](./IMWEB_SNIPPET.html). CORS: [docs/IMWEB_CORS.md](./docs/IMWEB_CORS.md).

## 호스팅

- jsDelivr: `https://cdn.jsdelivr.net/gh/<owner>/solpath-dashboard-front@<commit>/…`
- `@main`은 **CDN 캐시**로 늦게 갱신되는 경우가 있어, 아임웹은 `IMWEB_*`에 **커밋 SHA**로 고정하는 편이 안전(푸시할 때 SHA만 바꾸기)

## 로컬

```bash
cd front && python3 -m http.server 8080
```

## 설정

- `config.js`는 `gasBaseUrl` 비움. 위젯에서 **module 전에** `window.__SOLPATH__ = { gasBaseUrl: "…/exec" }`
- 로컬 실값: `FALLBACK_GAS_BASE_URL` 또는 동일 `__SOLPATH__` (커밋 금지)
- 동기화 버튼: 화면에 **`데이터 동기화`** 입력 후에만 활성

## 푸시

```bash
git push origin main
git push mirror main
```
