/**
 * id 접두 `sp-`
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell app-shell--v3">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <p class="brand-kicker">내부</p>
            <h1>솔패스 대시보드</h1>
          </div>
        </div>
        <div class="header-desc">
          <p>아임웹 Open API로 회원·상품·주문 원천을 읽는다. 출력은 <strong>마스터 시트</strong> 한 번에 이어쓰기(풀 스냅샷).</p>
          <p>기존 시트 행은 <strong>전부 덮어쓴다</strong>. 주기/자동 갱신이 아닌, 비정기·필수 시에만 쓴다. 호출 1회마다 API·쿼터·GAS 실행시간이 든다.</p>
        </div>
      </header>

      <main class="app-main sp-app-main">
        <div class="sp-overlay" id="sp-loadingOverlay" hidden aria-hidden="true">
          <div class="sp-overlay-box">
            <div class="sp-spinner" role="status" aria-label="로딩"></div>
            <p class="sp-overlay-text">처리 중</p>
          </div>
        </div>
        <section class="panel panel--hero" aria-labelledby="sp-sync-title">
          <div class="panel__head">
            <h2 id="sp-sync-title">데이터 동기화</h2>
            <span class="chip chip--soft" id="sp-envChip">미연결</span>
          </div>
          <ul class="bullets">
            <li>갱신 순서는 백엔드 고정: <strong>members</strong> → <strong>products</strong> (1페이지) → <strong>orders</strong>.</li>
            <li>전체를 덮어쓰므로, 임시 열/수기 수정분은 사전에 따로 둔다.</li>
          </ul>
          <div class="sp-confirm-block">
            <p class="sp-block-title">실행 잠금</p>
            <p class="sp-confirm-hint">오인 클릭을 막기 위함이다. 아래에 <code>데이터 동기화</code>를 공백 없이 입력하면 실행 버튼이 켜진다.</p>
            <label class="sp-confirm-label" for="sp-confirm">확인 문구 (복붙·오타 시 비활성)</label>
            <div class="sp-confirm-row">
              <input type="text" class="sp-confirm" id="sp-confirm" name="sp-confirm" autocomplete="off" spellcheck="false" disabled placeholder="데이터 동기화" />
              <button type="button" class="btn btn--primary" id="sp-btnSync" disabled>전체 데이터 동기화</button>
            </div>
            <p class="actions-note" id="sp-actionNote">Web App exec URL 없음 — 위젯에서 <code>__SOLPATH__.gasBaseUrl</code> 주입</p>
          </div>
        </section>

        <section class="panel panel--result" aria-label="이번 작업">
          <h3 class="panel__sub">이번 작업</h3>
          <p class="mono-line" id="sp-statusLine">—</p>
          <p class="hint" id="sp-hintLine"></p>
          <div class="sp-success-actions" id="sp-successActions" hidden>
            <a
              class="btn btn--secondary"
              id="sp-sheetsLink"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              hidden
            >마스터 시트 열기</a>
          </div>
        </section>
      </main>

      <footer class="app-footer app-footer--compact">
        <p>프론트는 jsDelivr·GitHub 커밋/태그로 고정한다. <code>@main</code> CDN 캐시가 늦으면 스니펫 URL을 <strong>커밋 SHA</strong>로 맞춘다.</p>
      </footer>
    </div>`;
