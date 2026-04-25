# solpath-dashboard-front

내부용 운영 대시보드 **정적 프론트** (HTML / 바닐라 JS). 백엔드는 GAS Web App + 스프레드시트(메타·GAS는 [`solpath-dashboard`](https://github.com/eunsang9597/solpath-dashboard) 쪽).

**원격 (동일 `main`을 양쪽에 푸시):**

- 개인: [eunsang9597/solpath-dashboard-front](https://github.com/eunsang9597/solpath-dashboard-front) (`origin`)
- Organization: [solpath-labs-dev/solpath-dashboard-front](https://github.com/solpath-labs-dev/solpath-dashboard-front) (`mirror`)

**첫 화면** — 데이터 동기화. **아임웹:** [IMWEB_SNIPPET_INJECT.html](./IMWEB_SNIPPET_INJECT.html) 로 `window.__SOLPATH__` + jsDelivr `@커밋` (캐시). iframe — [IMWEB_SNIPPET.html](./IMWEB_SNIPPET.html). **CORS:** [docs/IMWEB_CORS.md](./docs/IMWEB_CORS.md).

## 호스팅 (무료)

- **jsDelivr**: `https://cdn.jsdelivr.net/gh/<owner>/solpath-dashboard-front@<branch|tag|commit>/...`
- **GitHub Pages** (같은 레포 Settings → Pages) 또는 레포 `docs/` + Pages

캐시 갱신이 필요할 때는 **특정 커밋 SHA**로 URL을 잠그거나, jsDelivr purge 가이드 참고.

## 로컬 미리보기

```bash
# 예: Python 정적 서버 (또는 VS Code Live Server)
cd front
python3 -m http.server 8080
# → http://127.0.0.1:8080
```

`fetch`로 GAS Web App을 부를 때는 **CORS**를 백엔드에서 열어줘야 합니다(배포 URL과 연동).

## 설정

- **아임웹·jsDelivr** — 레포 `config.js`는 URL/토큰을 **비워 둠**. 위젯에서 **`app.js`보다 먼저** `window.__SOLPATH__ = { gasBaseUrl, token }` 주입 → [IMWEB_SNIPPET_INJECT.html](./IMWEB_SNIPPET_INJECT.html) 예시.  
- **로컬** — `js/config.js`의 `FALLBACK_*` 또는 동일 `__SOLPATH__` (실값 **git push 금지**).  
- GAS Property `SOLPATH_DASHBOARD_TOKEN` = `token` 과 동일.

## 푸시 (로컬 `front/`)

기본은 `origin`을 추적한다. 양쪽에 맞출 때:

```bash
git push origin main
git push mirror main
```
