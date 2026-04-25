/**
 * id 접두 `sp-`
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell app-shell--v2">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <p class="brand-kicker">내부</p>
            <h1>솔패스 대시보드</h1>
          </div>
        </div>
        <p class="header-desc">Open API → 시트 풀 스냅샷. 기존 시트 행 <strong>전부 덮어씀</strong>.</p>
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
          <p class="lede">잘못 누르면 API·쿼터·실행시간 씀. 아래에 문구 똑같이 입력한 뒤에만 실행.</p>
          <div class="actions">
            <label class="sp-confirm-label" for="sp-confirm">확인: <code>데이터 동기화</code> 입력</label>
            <input type="text" class="sp-confirm" id="sp-confirm" name="sp-confirm" autocomplete="off" spellcheck="false" disabled placeholder="데이터 동기화" />
            <button type="button" class="btn btn--primary" id="sp-btnSync" disabled>실행</button>
            <p class="actions-note" id="sp-actionNote">Web App URL 없음</p>
          </div>
        </section>

        <section class="panel" aria-label="결과">
          <h3 class="panel__sub">결과</h3>
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
            >시트 열기</a>
          </div>
        </section>
      </main>
    </div>`;
