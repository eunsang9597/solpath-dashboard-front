# 아임웹 위젯 · CORS · 스크립트 정책

`process.md`·루트 README에 있는 대로, 대시보드 **프론트**는 `solpath-dashboard-front` 정적 파일을 **jsDelivr**로 쓰고, **백엔드**는 GAS Web App(`…/exec`)을 호출하는 구조를 전제로 한다.

## 1. 위젯에 넣는 방식 (권장 순)

1. **`<iframe src="https://cdn.jsdelivr.net/gh/…/index.html">`**  
   - 위젯 본문은 **빈 div + iframe**만. 앱(HTML·CSS·`type=module` JS)은 **iframe 내부**에서 그대로 로드된다.  
   - **부모(아임웹 페이지)와 origin이 다르므로** 아임웹 쪽 `postMessage` 연동이 필요할 때만 별도 설계(선택).
2. **같은 URL을 `script`+`link`로 직접 삽입**  
   - `type=module`·여러 asset은 아임웹 **코드 위젯**이 허용하는지(스크립트 묶기·순서) **한 번씩** 확인할 것.  
   - 모듈이 막히면, 추후 `embed`용 단일 번들(비모듈)로 나누는 Phase를 둔다(에자일).

**캐시** — `…@main`은 브랜치 해시 캐시로 바뀔 수 있으니, **배포 고정**이면 `@<커밋 SHA>` URL을 쓰면 된다(README·스니펫에 주석).

## 2. CORS(프론트 `fetch` → GAS `…/exec`)

- **정적 HTML이 로드된 origin** — GitHub/ jsDelivr 도메인 → **GAS**는 `script.google.com`이므로 **다른 origin**이며, `fetch(배포 URL, { method: 'POST', … })` 는 [CORS] 규칙이 적용된다.
- GAS `ContentService` 응답에 예시로 다음 **응답 헤더**를 붙일 수 있어야 한다(구현은 백엔드):
  - `Access-Control-Allow-Origin`: `*` 또는 (고정이면) `https://cdn.jsdelivr.net` + 필요 시 `https://eunsang9597.github.io` 등
  - `Access-Control-Allow-Methods`: `GET, POST, OPTIONS`
  - `Access-Control-Allow-Headers`: `Content-Type` (필요한 헤더만)
- **`Content-Type: application/json` 으로 POST** 하면 브라우저가 **OPTIONS** 프리플라이트**를** 보낼 수 있어, **GAS 쪽에서 `OPTIONS`에 204 + 위 헤더**를 내려주는지(또는 런타임이 `doOptions`를 노출하는지) **배포 후 Network 탭에서 확인**하는 것이 안전하다.  
- 프리플라이트가 **막힌 환경**이면, **1차**로 `application/x-www-form-urlencoded` 단순 POST(또는 `text/plain` 본문)로 피하는 방안을 백엔드와 약속할 수 있다.
- **민감 작업(동기화 트리거)** 은 `fetch` + 공개 URL만으로 두지 말고, **GAS `ScriptProperties`에 둔 토큰**을 query/body로 넣어 검증(공개 HTML에는 토큰 **넣지 말 것**—위젯은 운영자 전용 가정이어도 소스엔 남는다. 운자만 접근 + 서버에만 비밀).

## 3. GAS `Code.js`와의 관계(현황)

- **현 `doGet`** — OAuth·인가·HTML 응답이 중심. **자체 API JSON**용 `doPost`는 별도 이슈로 붙이면, 위 CORS·OPTIONS 규칙을 같이 맞춘다.  
- 상세한 엔드포인트는 **메타 레포** `통계자료마스터` — `docs/BACKEND_API.md` `§2. 자체 API` 를 갱신한다.

## 4. 정리

| 주제 | 정책 |
|------|------|
| 위젯 삽입 | **iframe** 우선(모듈·asset 분리 유지) |
| fetch → GAS | GAS **응답에 CORS 헤더** + 필요 시 **OPTIONS** |
| 토큰 | HTML에 실값 **금지**, GAS·스크립트 속성만 |
| 캐시 | 운영 고정이면 `jsDelivr@커밋` |

(상위 `통계자료마스터`는 `front/` 를 gitignore — 이 문서는 **프론트 전용 repo** `solpath-dashboard-front`에만 올라간다.)
