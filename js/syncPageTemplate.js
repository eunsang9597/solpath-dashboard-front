/**
 * id 접두 `sp-`
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell app-shell--v6">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <h1>솔패스 대시보드</h1>
          </div>
        </div>
        <div class="header-desc">
          <p>쇼핑몰에 올라와 있는 <strong>회원·상품·주문</strong>이 한 번에 <strong>시트(엑셀)</strong>에 옮겨 적힌다. 자동이 아니라, 여기서 버튼을 누를 때마다 그때 보이는 쇼핑몰 기준으로 싹 갈아쓴다.</p>
          <p>시트에 있던 <strong>예전 내용</strong>은 지워지고 이번에 가져온 내용으로 <strong>전부</strong> 바뀐다. 남기고 싶은 칸이 있으면 먼저 복사해 둔다. 한 번 돌릴 때마다 시간이 꽤 걸릴 수 있다.</p>
        </div>
      </header>

      <main class="app-main sp-app-main">
        <div class="sp-overlay" id="sp-loadingOverlay" hidden aria-hidden="true">
          <div class="sp-overlay-box">
            <div class="sp-spinner" role="status" aria-label="로딩"></div>
            <p class="sp-overlay-text">옮기는 중</p>
          </div>
        </div>
        <section class="panel panel--hero" aria-labelledby="sp-sync-title">
          <div class="panel__head">
            <h2 id="sp-sync-title">데이터 동기화</h2>
            <span class="chip chip--soft" id="sp-envChip">미연결</span>
          </div>
          <ul class="bullets">
            <li>시트에 찍히는 순서: <strong>회원</strong> → <strong>상품</strong> → <strong>주문</strong> (이 순서로 한 번에 쓰인다).</li>
            <li>한 번 실행하면 <strong>시트 전체</strong>가 이번 데이터로 덮어써진다.</li>
          </ul>
          <div class="sp-confirm-block">
            <p class="sp-block-title">잘못 누르지 않게</p>
            <p class="sp-confirm-hint">아래에 <code>데이터 동기화</code>를 똑같이 써 넣으면, 그때만 아래 큰 단추가 켜진다.</p>
            <label class="sp-confirm-label" for="sp-confirm">이 글자를 그대로 입력</label>
            <div class="sp-confirm-row">
              <input type="text" class="sp-confirm" id="sp-confirm" name="sp-confirm" autocomplete="off" spellcheck="false" disabled placeholder="데이터 동기화" />
              <button type="button" class="btn btn--primary" id="sp-btnSync" disabled>전체 데이터 동기화</button>
            </div>
            <p class="actions-note" id="sp-actionNote">쇼핑몰과 이 화면이 만나려면, 맨 위에 받아 둔 연결 주소가 있어야 한다.</p>
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
