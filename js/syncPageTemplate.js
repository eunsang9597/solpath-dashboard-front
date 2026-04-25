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
              <li>아임웹 <strong>솔루션 편입</strong>에 묶인 <strong>회원·상품·주문(품목)</strong>을, 팀이 쓰는 <strong>구글 드라이브「집계(마스터)」스프레드시트</strong> 쪽에 맞춰 올리는 화면입니다. 숫자·원천 목록은 <strong>이 파일(집계·원천)</strong>에 쌓이고, 상단 <strong>집계 시트 열기</strong>는 그 <strong>집계 파일</strong>로 바로 갑니다. <strong>품목 분류·상태</strong>만 다루는 <strong>운영(분류)용</strong> 구글 시트는 <strong>다른 파일</strong>이니, 그건 <strong>상품 항목 분류</strong> 탭을 쓰면 됩니다.</li>
              <li><strong>실행</strong>을 누를 때마다 <strong>그때</strong> 아임웹과 맞춰 둔 내용이 <strong>집계(마스터) 시트</strong>에 <strong>통째로 다시</strong> 반영됩니다. 시트에 직접 적어 둔 메모·수식·수동 정리는 <strong>지워질 수 있으니</strong>, 꼭 남길 내용은 <strong>실행 전</strong>에 복사해 두거나 다른 파일에 옮깁니다.</li>
              <li>잘못 누르는 실수를 줄이려고, 확인 칸에 <strong>「데이터 동기화」</strong>라는 문구를 <strong>한 글자도 틀리지 않게</strong> 적은 뒤에만 <strong>실행</strong>됩니다.</li>
              <li>한 번 돌리는 데 <strong>수 분</strong> 걸릴 수 있습니다. 끝나면 안내와 <strong>집계 시트 확인하기</strong>로 건수를 보고, 구글 시트를 열어 눈으로도 한 번 확인합니다.</li>
              <li>상단 배지는 <strong>연결됨</strong>이면 정상입니다. <strong>미연결</strong>이거나 오류로 보이면 <strong>내부 담당자에게</strong> 연락해 주세요.</li>
            </ul>
          </div>
          <div class="sp-intro-card sp-intro-card--pm" id="sp-introPm" hidden>
            <p class="sp-intro-title">상품 항목 분류 · 사용 안내</p>
            <ul class="sp-intro-list">
              <li>팀에서 정한 흐름으로, <strong>집계·숫자는「집계(마스터)」시트</strong>에 쌓고, <strong>각 품목이 어떤 강좌/상품군에 붙는지, 지금은 어떻게 취급할지</strong>는 <strong>구글 드라이브의 운영(분류)용 스프레드시트</strong>에 적어 둡니다. 그 파일 안 <strong>「상품 매핑(분류)」</strong>이라는 <strong>시트(탭) 이름</strong>이 있는 곳이 실제 저장 위치입니다. 상단 <strong>운영 DB(분류) 열기</strong>는 그 <strong>운영(분류) 파일</strong>로 이동합니다.</li>
              <li><strong>내부 대분류</strong>는 품목을 <strong>어느 상품군(솔패스·솔루틴·챌린지·교재·자소서·미분류)</strong>으로 묶어 볼지에 대한 <strong>큰 꼬리표</strong>입니다. 대시보드·집계에서 <strong>같은 묶음으로</strong> 보고 싶을 때 맞춥니다.</li>
              <li><strong>상태</strong>는 <strong>같은 품목도 운영·노출을 어떻게 볼지</strong>를 나눈 값입니다. <strong>진행</strong>은 지금 취급하는 판매 품목, <strong>만료</strong>는 <strong>상품은 판매 대상이지만(상품이 살아 있지만) 판매(노출) 기간이 끝난</strong> 경우, <strong>테스트</strong>는 시험·검수용, <strong>(구)상품</strong>은 <strong>판매를 완전히 끝냈거나, 대체 상품이 올라와 예전 품목으로만</strong> 보는 경우에 맞춥니다.</li>
              <li><strong>집계(마스터) 쪽</strong> <strong>회원·주문·반영</strong>은 <strong>데이터 동기화</strong> 탭에서, <strong>이 탭</strong>에서는 품목 <strong>분류·상태</strong>만 손댑니다. 운영(분류) 시트/파일이 아직 없으면 <strong>상품 불러오기</strong>로 먼저 만듭니다.</li>
              <li>드롭다운을 바꾼 뒤 <strong>수정하기</strong>를 눌러 구글 시트에 반영합니다. 저장이 끝나면 잠시 로딩 후 목록이 다시 그려집니다. 바꾼 내용이 없으면 <strong>수정하기</strong>는 켜지지 않습니다(저장할 변경이 없을 때).</li>
              <li><strong>데이터 초기화</strong>는 <strong>「상품 매핑(분류)」시트</strong>에 적어 둔 내용을 비우고, <strong>집계(마스터) 파일 쪽</strong>에 올라와 있는 <strong>상품 목록</strong>을 기준으로 <strong>처음부터 다시</strong> 채웁니다. 팀에 공지한 뒤에만 누릅니다(돌이킬 수 없습니다).</li>
              <li><strong>상태</strong>를 <strong>테스트</strong>로 둔 품목은, 위쪽 대분류 박스가 아니라 <strong>아래 붉은「상태·테스트」</strong> 구역에만 모여 보입니다(대분류랑 겹쳐 두 번 나오지 않게 한 규칙입니다).</li>
              <li><strong>미분류만</strong>을 켜면 <strong>내부 대분류가「미분류」</strong>로 남은 품목만 볼 수 있습니다. 검색은 <strong>상품 이름·상품 번호</strong>에 맞습니다.</li>
            </ul>
          </div>
          <div class="sp-intro-card sp-intro-card--an" id="sp-introAn" hidden>
            <p class="sp-intro-title">매출·건수 집계 · 사용 안내</p>
            <ul class="sp-intro-list">
              <li>팀 흐름: <strong>집계(마스터)</strong>에 원천·숫자, <strong>운영(분류)</strong>에 품목 분류, <strong>집계·분석</strong> 전용 구글 시트(이 탭)에 <strong>매출·건수 목표</strong> 등을 둡니다. 파일이 다르므로, 상단 <strong>집계·분석 시트 열기</strong>로 열 수 있습니다.</li>
              <li>시트를 열면 <strong>매출·건수 목표</strong>라는 이름의 탭에 목표가 저장됩니다. 여기서 <strong>시트에 반영</strong>을 누르면, 화면에 적어 둔 줄이 그대로 시트에 올라갑니다.</li>
              <li><strong>범위</strong>를 <strong>대분류</strong>로 두면, <strong>상품 항목 분류</strong>에서 쓰는 상품군(솔패스, 미분류, 솔루틴 등)에 맞게 적습니다. <strong>상품</strong>이면 <strong>상품 번호</strong>를 넣습니다. <strong>월</strong>이 <strong>0(연간)</strong>이면 그 해 한 줄로 잡는 연간 목표로 둡니다.</li>
              <li>아래 <strong>매출</strong> / <strong>건수</strong>는 같은 표에서 보기만 바꿉니다. 위에서 고른 <strong>연·월</strong>은 이 화면에 보이는 행만 걸러 냅니다.</li>
              <li><strong>전부 초기화</strong>는 여기에 쌓인 목표와, 나중에 쓰는 일 단위 캐시를 비웁니다. 팀에 공지한 뒤에만 누릅니다.</li>
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
          <button
            type="button"
            class="sp-tabs__btn"
            id="sp-tab-an"
            role="tab"
            aria-selected="false"
            aria-controls="sp-panel-an"
            tabindex="-1"
          >매출·건수 집계</button>
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
            <p class="sp-confirm-instruct">아래 칸에 <strong>「데이터 동기화」</strong>를 한 글자도 틀리지 않게 입력한 뒤 <strong>실행</strong>을 누릅니다.</p>
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
                    title="「상품 매핑(분류)」시트를 비우고, 집계(마스터) 파일의 상품 목록 기준으로 다시 채웁니다. 편집한 내용이 사라집니다."
                    aria-label="데이터 초기화: 상품 매핑 시트를 집계(마스터) 상품 목록 기준으로 다시 맞춤"
                  >데이터 초기화</button>
                </div>
                <p class="sp-pm-reset-note" id="sp-pm-resetNote" hidden>위 작업은 <strong>되돌릴 수 없습니다</strong>. 팀에 공유한 뒤 누르세요.</p>
            </div>
            <div class="sp-confirm-block sp-pm-confirm" id="sp-pm-confirm">
              <p class="sp-confirm-instruct" id="sp-pm-instruct">집계(마스터) 쪽 <strong>상품 목록</strong>에 맞춰, 운영(분류) 시트에 <strong>내부 대분류</strong>·<strong>상태</strong>를 적어 둡니다(솔패스·솔루틴·챌린지·교재·자소서 등). <strong>처음</strong>이면 <strong>상품 불러오기</strong>로 <strong>「상품 매핑(분류)」</strong>이 있는 시트를 만듭니다.</p>
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

        <section
          class="sp-tab-panel"
          id="sp-panel-an"
          role="tabpanel"
          aria-labelledby="sp-tab-an"
          hidden
        >
          <div class="panel panel--hero" id="sp-an-root">
            <div class="panel__head sp-an-head">
              <h2 class="sp-panel-eyebrow" id="sp-an-eyebrow">매출·건수 집계</h2>
              <div class="sp-an-head__right" id="sp-an-external" hidden>
                <a
                  class="btn btn--secondary sp-sync-head__link"
                  id="sp-an-linkSheet"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  hidden
                >집계·분석 시트 열기</a>
              </div>
            </div>
            <div class="sp-confirm-block sp-an-block" id="sp-an-block">
              <p class="sp-confirm-instruct" id="sp-an-instruct">
                <strong>매출·건수 목표</strong>는 <strong>집계·분석</strong>만을 위한 구글 시트에 있습니다. 맨 위쪽 <strong>매출·건수 목표</strong> 탭에 저장됩니다. 이 파일은 집계(마스터)·운영(분류)과 <strong>다른 파일</strong>입니다. 처음 쓰면 <strong>집계 시트 준비</strong>로 만듭니다.
              </p>
              <p class="sp-pm__hint" id="sp-an-hint" hidden></p>
              <div class="sp-pm-init" id="sp-an-init" hidden>
                <div class="sp-confirm-row sp-pm-init__row">
                  <button type="button" class="btn btn--primary" id="sp-an-btnInit">집계 시트 준비</button>
                </div>
              </div>
              <div id="sp-an-body" hidden>
                <div class="sp-an-subtabs" role="tablist" aria-label="지표">
                  <button type="button" class="sp-an-subtabs__btn is-active" id="sp-an-subSales" role="tab" aria-selected="true" aria-controls="sp-an-tableWrap" tabindex="0">매출</button>
                  <button type="button" class="sp-an-subtabs__btn" id="sp-an-subCount" role="tab" aria-selected="false" aria-controls="sp-an-tableWrap" tabindex="-1">건수</button>
                </div>
                <p class="sp-an-subtabs__lede" id="sp-an-subLede" aria-live="polite">매출 목표(원) 열을 강조한 뷰입니다.</p>
                <div class="sp-an-filters" id="sp-an-filters">
                  <label class="sp-an-filters__f"><span class="sp-pm-filters__lbl">연도</span>
                    <select class="sp-confirm" id="sp-an-filterYear" title="화면에 보일 행만 걸러 냅니다"></select>
                  </label>
                  <label class="sp-an-filters__f"><span class="sp-pm-filters__lbl">월</span>
                    <select class="sp-confirm" id="sp-an-filterMonth" title="0=연간(월 구분 없음) 포함"></select>
                  </label>
                </div>
                <div class="sp-pm__loading" id="sp-an-loading" hidden>불러오는 중</div>
                <div class="sp-an-table-wrap" id="sp-an-tableWrap" role="tabpanel" aria-labelledby="sp-an-subSales">
                  <div class="sp-an-table-scroll">
                    <table class="sp-an-table sp-an-table--mode-sales" id="sp-an-table">
                      <thead>
                        <tr>
                          <th>연</th>
                          <th>월</th>
                          <th>범위</th>
                          <th>적는 값</th>
                          <th class="sp-an-table__em-sales">매출목표(원)</th>
                          <th class="sp-an-table__em-count">건수목표</th>
                          <th>비고</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody id="sp-an-tbody"></tbody>
                    </table>
                  </div>
                </div>
                <div class="sp-an-add" id="sp-an-form">
                  <p class="sp-an-add__title">한 줄 추가</p>
                  <div class="sp-an-add__row">
                    <label>연 <input type="number" class="sp-confirm" id="sp-an-inY" min="2000" max="2100" step="1" /></label>
                    <label>월
                      <select class="sp-confirm" id="sp-an-inM" title="0은 연간"></select>
                    </label>
                    <label>범위
                      <select class="sp-confirm" id="sp-an-inScope">
                        <option value="category">대분류</option>
                        <option value="product">상품</option>
                      </select>
                    </label>
                    <label>적는 값 <input type="text" class="sp-confirm" id="sp-an-inKey" placeholder="예: 솔패스, 미분류 또는 상품 번호" spellcheck="false" /></label>
                    <label>매출(원) <input type="number" class="sp-confirm" id="sp-an-inAmt" min="0" step="1" /></label>
                    <label>건수 <input type="number" class="sp-confirm" id="sp-an-inCnt" min="0" step="1" /></label>
                  </div>
                  <label class="sp-an-add__notes">비고
                    <input type="text" class="sp-confirm" id="sp-an-inNotes" maxlength="200" />
                  </label>
                  <div class="sp-an-add__ctas">
                    <button type="button" class="btn btn--secondary" id="sp-an-btnAdd">목록에 넣기</button>
                    <button type="button" class="btn btn--primary" id="sp-an-btnSave">시트에 반영</button>
                    <button type="button" class="btn btn--danger" id="sp-an-btnReset">전부 초기화</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
        </main>
      </div>
    </div>`;
