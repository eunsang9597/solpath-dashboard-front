/**
 * id 접두 `sp-`
 */
export const SYNC_PAGE_SHELL_HTML = `<div class="app-shell app-shell--v9">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <h1>솔패스 대시보드</h1>
          </div>
        </div>
        <div class="sp-intro-wrap">
          <div class="sp-intro-card">
            <p class="sp-intro-title">이 대시보드에서 하는 일</p>
            <ul class="sp-intro-list">
              <li>솔루션 편입으로 연동된 <strong>회원·상품·주문</strong> &rarr; 집계 시트 <strong>반영</strong></li>
              <li>실행 <strong>1회</strong>마다 집계 시트 <strong>전면 갱신</strong> (해당 시점 연동 기준)</li>
              <li>시트에 남겨 둘 내용 &rarr; 실행 <strong>전</strong>에 복사·보관</li>
              <li>1회 작업 <strong>소요</strong>: 수 분 수준</li>
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
          <div class="panel__head">
            <h2 class="sp-panel-eyebrow" id="sp-panel-sync-h">데이터 동기화</h2>
            <span class="chip chip--soft" id="sp-envChip">미연결</span>
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
                >집계 시트 열기</a>
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
          <div class="sp-pm" id="sp-pm-root">
            <div class="sp-pm-hero" id="sp-pm-hero">
              <h2 class="sp-panel-eyebrow" id="sp-pm-eyebrow">상품 항목 분류</h2>
              <div class="sp-pm-hero__actions" id="sp-pm-heroActions">
                <button type="button" class="btn btn--primary" id="sp-pm-apply" disabled>수정하기</button>
              </div>
            </div>
            <p class="sp-pm__hint" id="sp-pm-hint" hidden></p>
            <div class="sp-pm-init" id="sp-pm-init" hidden>
              <p>원천 DB의 상품과 연결해 내부 대분류(솔패스·솔루틴·챌린지·교재)를 씁니다. 먼저 운영용 스프레드시트를 만듭니다.</p>
              <button type="button" class="btn btn--primary" id="sp-pm-btnInit">상품 불러오기</button>
            </div>
            <div class="sp-pm-filters" id="sp-pm-filters" hidden>
              <label class="sp-pm-filters__s"><span class="sp-pm-filters__lbl">검색</span>
                <input type="search" class="sp-pm__search" id="sp-pm-search" placeholder="상품명·번호" autocomplete="off" />
              </label>
              <label class="sp-pm-filters__c"><input type="checkbox" id="sp-pm-onlyUnmapped" />
                <span>미분류만</span>
              </label>
            </div>
            <div class="sp-pm__loading" id="sp-pm-listLoading" hidden>불러오는 중</div>
            <div class="sp-pm-sections" id="sp-pm-sections" hidden></div>
          </div>
        </section>
        </div>
        </main>
      </div>
    </div>`;
