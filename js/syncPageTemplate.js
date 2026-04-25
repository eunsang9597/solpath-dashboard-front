/**
 * id 접두 `sp-`
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell app-shell--v4">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <p class="brand-kicker">내부</p>
            <h1>솔패스 대시보드</h1>
          </div>
        </div>
        <div class="header-desc">
          <p>쇼핑몰에 있는 <strong>회원·상품·주문</strong>을 한 번에 시트(원장)에 맞춥니다. 자동·주기 갱신이 아니라, 필요할 때만 돌리는 <strong>전체 맞춤</strong> 작업입니다.</p>
          <p>이미 시트에 쌓인 내용은 <strong>이번에 가져온 데이터로 싹 갈아엎습니다</strong>. 수동으로 적어 둔 칸, 임시로 쓰던 칸이 있으면 미리 복사해 두세요. 한 번 돌릴 때마다 쇼핑·구글 쪽에 부담이 갑니다.</p>
        </div>
      </header>

      <main class="app-main sp-app-main">
        <div class="sp-overlay" id="sp-loadingOverlay" hidden aria-hidden="true">
          <div class="sp-overlay-box">
            <div class="sp-spinner" role="status" aria-label="로딩"></div>
            <p class="sp-overlay-text">불러오는 중</p>
          </div>
        </div>
        <section class="panel panel--hero" aria-labelledby="sp-sync-title">
          <div class="panel__head">
            <h2 id="sp-sync-title">데이터 동기화</h2>
            <span class="chip chip--soft" id="sp-envChip">미연결</span>
          </div>
          <ul class="bullets">
            <li>맞춤 순서는 정해져 있습니다. <strong>회원</strong> → <strong>상품</strong> → <strong>주문</strong> 순서로 시트에 반영됩니다.</li>
            <li>한 번에 전체를 덮어쓰므로, 꼭 남겨야 할 것은 <strong>미리 백업</strong>하세요.</li>
          </ul>
          <div class="sp-confirm-block">
            <p class="sp-block-title">실행 전 확인</p>
            <p class="sp-confirm-hint">잘못 누르면 그대로 맞춤이 돌아갑니다. 아래에 <code>데이터 동기화</code>를 정확히 입력해야 큰 파란 버튼이 켜집니다.</p>
            <label class="sp-confirm-label" for="sp-confirm">아래에 그대로 입력 (띄어쓰기·오타면 버튼이 꺼짐)</label>
            <div class="sp-confirm-row">
              <input type="text" class="sp-confirm" id="sp-confirm" name="sp-confirm" autocomplete="off" spellcheck="false" disabled placeholder="데이터 동기화" />
              <button type="button" class="btn btn--primary" id="sp-btnSync" disabled>전체 데이터 동기화</button>
            </div>
            <p class="actions-note" id="sp-actionNote">쇼핑몰과 연결하는 주소는 맨 윗줄(솔루션에서 받은 주소)이 들어가야 합니다. 비어 있으면 솔루션 쪽에 문의하세요.</p>
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
        <p>화면이 비어 있거나, 예전 화면만 보이면 이 페이지에 붙인 코드 <strong>전체</strong>를 캡처·복사해 솔루션 담당자에게 보내 점검을 요청하세요.</p>
      </footer>
    </div>`;
