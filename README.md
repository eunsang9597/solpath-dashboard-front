# solpath-dashboard-front

내부용 운영 대시보드 **정적 프론트** (HTML / 바닐라 JS). 백엔드는 GAS Web App + 스프레드시트(메타·GAS는 [`solpath-dashboard`](https://github.com/eunsang9597/solpath-dashboard) 쪽).

**원격 (동일 `main`을 양쪽에 푸시):**

- 개인: [eunsang9597/solpath-dashboard-front](https://github.com/eunsang9597/solpath-dashboard-front) (`origin`)
- Organization: [solpath-labs-dev/solpath-dashboard-front](https://github.com/solpath-labs-dev/solpath-dashboard-front) (`mirror`)

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

- `js/config.js` — **팀 공개로 올릴 수 있는** 값만 (Web App `exec` URL 베이스 path 등).  
- 비밀 토큰·Client Secret은 **레포에 넣지 말고** GAS Script Properties + 서버 측 검증만.

## 푸시 (로컬 `front/`)

기본은 `origin`을 추적한다. 양쪽에 맞출 때:

```bash
git push origin main
git push mirror main
```
