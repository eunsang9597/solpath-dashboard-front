/**
 * 데이터 동기화 랜딩 마크업 (index / 아임웹 직접 삽입 공통).
 * id 는 sp- 로 시작해 위젯 호스트 페이지와 충돌 방지.
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <p class="brand-kicker">내부 운영</p>
            <h1>솔패스 대시보드</h1>
          </div>
        </div>
        <p class="header-desc">
          아임웹 Open API 기준으로 원천(회원·상품·주문)을 시트에 <strong>한 번에 맞춥니다</strong>.
        </p>
      </header>

      <main class="app-main">
        <section class="panel panel--hero" aria-labelledby="sp-sync-title">
          <div class="panel__head">
            <h2 id="sp-sync-title">데이터 동기화</h2>
            <span class="chip chip--soft" id="sp-envChip" data-state="unknown">백엔드 미연결</span>
          </div>
          <p class="lede">
            기존 시트/아이스 데이터에 <strong>오류가 있거나</strong>, 수기로 손댄 뒤
            <strong>전체를 다시 맞춰야 할 때</strong> 실행합니다. 주기·자동 갱신과는 별도로,
            <strong>필요할 때만</strong> 누르는 작업이에요(부하·쿼터·실행시간).
          </p>
          <ul class="bullets">
            <li>회원·상품·주문 스냅샷이 순서에 따라 갱신됩니다(백엔드 설계에 따름).</li>
            <li>이미 올려 둔 전체를 덮어쓰는 <strong>풀 갱신</strong>이므로, 잠깐만 쓰는 뷰/임시는 따로 백업해 두는 걸 권장합니다.</li>
          </ul>
          <div class="actions">
            <button type="button" class="btn btn--primary" id="sp-btnSync" disabled>
              전체 데이터 동기화
            </button>
            <p class="actions-note" id="sp-actionNote">백엔드 URL·토큰 연동 후 활성화됩니다.</p>
          </div>
        </section>

        <section class="panel" aria-label="상태">
          <h3 class="panel__sub">이번 작업</h3>
          <p class="mono-line" id="sp-statusLine">대기 중</p>
          <p class="hint" id="sp-hintLine"></p>
        </section>
      </main>

      <footer class="app-footer">
        <p>jsDelivr·아임웹 위젯·GAS CORS는 <code>docs/IMWEB_CORS.md</code> 참고</p>
      </footer>
    </div>`;
