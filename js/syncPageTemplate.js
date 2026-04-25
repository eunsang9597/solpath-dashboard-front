/**
 * id 접두 `sp-`
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell app-shell--v7">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <h1>솔패스 대시보드</h1>
          </div>
        </div>
        <div class="header-desc">
          <p>쇼핑몰의 회원·상품·주문을 집계 시트에 반영한다. <strong>실행 1회마다 집계 시트 전체</strong>가 그 시점 쇼핑몰 기준으로 갱신된다. 보존이 필요한 칸은 실행 전에 복사한다. 완료까지 수 분이 걸릴 수 있다.</p>
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
          <div class="sp-confirm-block">
            <p class="sp-confirm-instruct">데이터 갱신·초기 맞춤 시: 아래 입력란에 <code>데이터 동기화</code>를 정확히 입력한 뒤 [실행]을 누른다.</p>
            <label class="sp-confirm-label" for="sp-confirm">확인 입력</label>
            <div class="sp-confirm-row">
              <input type="text" class="sp-confirm" id="sp-confirm" name="sp-confirm" autocomplete="off" spellcheck="false" disabled placeholder="데이터 동기화" />
              <button type="button" class="btn btn--primary" id="sp-btnSync" disabled>실행</button>
            </div>
            <p class="actions-note" id="sp-actionNote"></p>
            <div class="sp-feedback" id="sp-feedback" hidden>
              <p class="sp-feedback__main" id="sp-statusLine"></p>
              <p class="sp-feedback__sub" id="sp-hintLine"></p>
              <div class="sp-success-actions" id="sp-successActions" hidden>
                <a
                  class="btn btn--secondary"
                  id="sp-sheetsLink"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  hidden
                >집계 시트 열기</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>`;
