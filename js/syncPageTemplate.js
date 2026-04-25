/**
 * id 접두 `sp-`
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell app-shell--v9">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <h1>솔루션편입 대시보드</h1>
          </div>
        </div>
        <div class="sp-intro-wrap">
          <div class="sp-intro-card sp-intro-card--sync" id="sp-introSync">
            <p class="sp-intro-title">데이터 동기화 · 사용 안내</p>
            <ul class="sp-intro-list">
              <li>아임웹 <strong>솔루션 편입</strong>으로 연동된 <strong>회원·상품·주문(품목)</strong>을 서버가 읽어 <strong>집계(원천) 스프레드시트</strong>에 올립니다. 이 탭 상단 <strong>집계 시트 열기</strong>는 그 <strong>마스터 집계 파일</strong>로 이동합니다(운영 DB 분류 시트와는 별도).</li>
              <li><strong>실행</strong> 1회마다 집계 시트가 <strong>해당 시점의 연동 스냅샷</strong>으로 <strong>전면 갱신</strong>됩니다. 시트에 직접 적어 둔 메모·수식·수동 정리는 <strong>덮어쓰일 수 있으므로</strong>, 남겨 둘 내용은 반드시 <strong>실행 전</strong>에 복사·다른 파일로 옮깁니다.</li>
              <li>확인 입력란에 <code>데이터 동기화</code>를 <strong>한 글자도 틀리지 않게</strong> 입력한 뒤 <strong>실행</strong>합니다. 실수로 전체를 돌리는 것을 막기 위한 잠금입니다.</li>
              <li>한 번 실행하는 데 <strong>수 분</strong> 걸릴 수 있습니다. 완료되면 메시지와 <strong>집계 시트 확인하기</strong>로 반영 건수를 확인한 뒤, 스프레드시트를 열어 검증합니다.</li>
              <li>상단 배지는 <strong>연결됨</strong>이면 정상입니다. <strong>미연결</strong>이거나 오류로 보이면 <strong>내부 담당자에게</strong> 연락해 주세요.</li>
            </ul>
          </div>
          <div class="sp-intro-card sp-intro-card--pm" id="sp-introPm" hidden>
            <p class="sp-intro-title">상품 항목 분류 · 사용 안내</p>
            <ul class="sp-intro-list">
              <li>원천 <strong>집계(마스터) 시트</strong>의 상품과 별도로, <strong>운영 DB(분류) 스프레드시트</strong>에 <code>product_mapping</code> 시트를 두고, 품목마다 <strong>내부 대분류</strong>(솔패스·솔루틴·챌린지·교재·자소서·미분류)와 <strong>상태</strong>(진행·만료·테스트·(구)상품)을 붙여 관리합니다. 상단 <strong>운영 DB(분류) 열기</strong>는 이 <strong>분류 전용</strong> 파일로 갑니다.</li>
              <li><strong>집계 시트</strong>의 행(회원/주문 반영)은 <strong>데이터 동기화</strong> 탭에서, <strong>이 탭</strong>에서는 품목 <strong>분류·상태</strong>만 맞춥니다. 운영 시트가 없으면 <strong>상품 불러오기</strong>로 먼저 만듭니다.</li>
              <li>드롭다운을 바꾼 뒤 <strong>수정하기</strong>로 시트에 반영합니다. 저장이 끝나면 잠시 로딩 후 목록이 다시 그려집니다. 바꾼 내용이 없으면 <strong>수정하기</strong>는 비활성입니다(저장할 변경이 없을 때).</li>
              <li><strong>데이터 초기화</strong>는 운영 <code>product_mapping</code>을 비우고, 원천 <code>products</code> 기준으로 <strong>통째로 다시 채움</strong>입니다. 팀에 공유한 뒤에만 누릅니다(되돌릴 수 없음).</li>
              <li><strong>상태</strong>가 <strong>테스트</strong>인 품목은 대분류 박스가 아닌, 아래 <strong>상태·테스트</strong> 붉은 블록에만 모여 표시됩니다(동시에 대분류 구역에 또 나오지 않습니다).</li>
              <li><strong>미분류만</strong>을 켜면 내부 대분류가 <code>미분류</code>인 품목만 좁혀 봅니다. 검색은 상품명·번호에 대해 동작합니다.</li>
            </ul>
          </div>
        </div>
      </header>

      <div class="sp-app-outer">
        <nav class="sp-tabs" role="tablist" aria-label="메뉴">
          <button
            type="button"
            class="sp-tabs__btn is-active"
            id="sp-tab-sync"
            role="tab"
            aria-selected="true"
            aria-controls="sp-panel-sync"
            tabindex="0"
          >데이터 동기화</button>
          <button
            type="button"
            class="sp-tabs__btn"
            id="sp-tab-pm"
            role="tab"
            aria-selected="false"
            aria-controls="sp-panel-pm"
            tabindex="-1"
          >상품 항목 분류</button>
        </nav>

        <main class="app-main sp-app-main" id="sp-main">
        <div class="sp-overlay" id="sp-loadingOverlay" hidden aria-hidden="true">
          <div class="sp-overlay-box">
            <div class="sp-spinner" role="status" aria-label="로딩"></div>
            <p class="sp-overlay-text">처리 중</p>
          </div>
        </div>

        <div class="sp-tab-panels">
        <section
          class="sp-tab-panel is-active"
          id="sp-panel-sync"
          role="tabpanel"
          aria-labelledby="sp-tab-sync"
        >
        <div class="panel panel--hero">
          <div class="panel__head sp-sync-head">
            <h2 class="sp-panel-eyebrow" id="sp-panel-sync-h">데이터 동기화</h2>
            <div class="sp-sync-head__right">
              <span class="chip chip--soft" id="sp-envChip">미연결</span>
              <a
                class="btn btn--secondary sp-sync-head__link"
                id="sp-syncLinkAggregate"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                hidden
              >집계 시트 열기</a>
            </div>
          </div>
          <div class="sp-confirm-block">
            <p class="sp-confirm-instruct">데이터 초기화 시: 아래 텍스트 박스에 <code>데이터 동기화</code> 정확 입력 &rarr; <strong>실행</strong> 클릭.</p>
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
                >집계 시트 확인하기</a>
              </div>
            </div>
          </div>
        </div>
        </section>

        <section
          class="sp-tab-panel"
          id="sp-panel-pm"
          role="tabpanel"
          aria-labelledby="sp-tab-pm"
          hidden
        >
          <div class="panel panel--hero" id="sp-pm-root">
            <div class="panel__head sp-pm-head">
              <h2 class="sp-panel-eyebrow" id="sp-pm-eyebrow">상품 항목 분류</h2>
              <div class="sp-pm-head__right sp-pm-external" id="sp-pm-external" hidden>
                <a
                  class="sp-pm-external__link"
                  id="sp-pm-linkOps"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  hidden
                  >운영 DB(분류) 열기</a
                >
              </div>
            </div>
            <div class="sp-pm-hero__actions" id="sp-pm-heroActions">
                <div class="sp-pm-hero__ctas" id="sp-pm-heroCtas">
                  <button type="button" class="btn btn--primary sp-pm-apply" id="sp-pm-apply" disabled>수정하기</button>
                  <button
                    type="button"
                    class="btn btn--danger sp-pm-reset"
                    id="sp-pm-reset"
                    hidden
                    title="원천 products 기준으로 분류 시트를 통째로 다시 씁니다. 편집 내용이 사라집니다."
                    aria-label="데이터 초기화 — 운영 분류를 원천 기준으로 되돌립니다"
                  >데이터 초기화</button>
                </div>
                <p class="sp-pm-reset-note" id="sp-pm-resetNote" hidden>위 작업은 <strong>되돌릴 수 없습니다</strong>. 팀에 공유한 뒤 누르세요.</p>
            </div>
            <div class="sp-confirm-block sp-pm-confirm" id="sp-pm-confirm">
              <p class="sp-confirm-instruct" id="sp-pm-instruct">원천 DB의 상품과 연결해 <strong>내부 대분류</strong>(솔패스·솔루틴·챌린지·교재)를 씁니다. 처음이면 <strong>상품 불러오기</strong>로 운영용 시트를 만듭니다.</p>
              <p class="sp-pm__hint" id="sp-pm-hint" hidden></p>
              <div class="sp-pm-init" id="sp-pm-init" hidden>
                <div class="sp-confirm-row sp-pm-init__row">
                  <button type="button" class="btn btn--primary" id="sp-pm-btnInit">상품 불러오기</button>
                </div>
              </div>
              <div class="sp-pm-filters" id="sp-pm-filters" hidden>
                <label class="sp-pm-filters__s"><span class="sp-pm-filters__lbl">검색</span>
                  <input type="search" class="sp-confirm sp-pm__search" id="sp-pm-search" placeholder="상품명, 번호" autocomplete="off" />
                </label>
                <label class="sp-pm-filters__c"><input type="checkbox" id="sp-pm-onlyUnmapped" />
                  <span>미분류만</span>
                </label>
              </div>
              <div class="sp-pm__loading" id="sp-pm-listLoading" hidden>불러오는 중</div>
              <div class="sp-pm-sections" id="sp-pm-sections" hidden></div>
              <p class="actions-note sp-pm__footer-note" id="sp-pm-footerNote" hidden>편집한 뒤 <strong>수정하기</strong>로 시트에 반영합니다. 드롭다운을 바꾸면 <strong>수정하기</strong>가 켜집니다.</p>
            </div>
          </div>
        </section>
        </div>
        </main>
      </div>
    </div>`;
