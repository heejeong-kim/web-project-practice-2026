/* =========================================================
   카공 공간 조건 탐색 서비스 - 5주차 상호작용
   이번 주차 범위 : 화면 상태 전환까지
   만들지 않는 범위 : JSON 불러오기(7주차), 검색·필터 처리(9주차),
                      상세 데이터 연결(10주차), 저장(11~12주차)
   ========================================================= */

/* ---------------------------------------------------------
   1. 요소 선택 (5주차 2.2)
   변수 이름은 화면에서 맡는 역할을 알 수 있게 작성
   --------------------------------------------------------- */
const searchInput        = document.querySelector('#search-input');
const filterGroup        = document.querySelector('#filter-group');
const filterMoreGroup    = document.querySelector('#filter-more-group');
const filterMoreButton   = document.querySelector('#filter-more');
const selectedConditions = document.querySelector('#selected-conditions');
const resetButton        = document.querySelector('#reset-button');
const spaceList          = document.querySelector('#space-list');
const detailPanel        = document.querySelector('#detail-panel');
const detailCloseButton  = document.querySelector('#detail-close');
const emptyState         = document.querySelector('#empty-state');
const emptyResetButton   = document.querySelector('#empty-reset-button');

/* 요소가 정상적으로 선택되었는지 먼저 확인 (5주차 2.3.5)
   null이 출력되면 선택자 이름이나 script 연결 위치를 확인 */
console.log('검색창 선택 결과:', searchInput);

/* ---------------------------------------------------------
   2. 화면 상태 변수
   데이터가 아니라 "지금 화면이 어떤 상태인가"만 보관
   9주차에서 이 변수들이 검색·필터 조건으로 확장됨
   --------------------------------------------------------- */
const selectedFilters = [];   // 선택된 조건 이름 목록 (복수 선택)
let currentKeyword = '';      // 현재 입력된 검색어

/* ---------------------------------------------------------
   3. 함수 (5주차 3.2)
   화면을 바꾸는 함수와 값을 읽는 함수를 나누어 작성
   --------------------------------------------------------- */

/* 선택된 조건을 화면 상단 요약 영역에 표시 */
function renderSelectedConditions() {
  if (selectedFilters.length === 0) {
    selectedConditions.textContent = '선택한 조건 없음';
    return;
  }
  selectedConditions.textContent = '선택 조건 ' + selectedFilters.join(', ');
}

/* [실습 1] 필터 버튼의 선택 상태를 전환
   4주차 설계가 복수 필터이므로 클래스를 제거하지 않고 버튼별로 토글 */
function toggleFilter(button) {
  const label = button.textContent;
  const index = selectedFilters.indexOf(label);

  if (index === -1) {
    button.classList.add('is-active');
    selectedFilters.push(label);
  } else {
    button.classList.remove('is-active');
    selectedFilters.splice(index, 1);
  }

  renderSelectedConditions();
  console.log('현재 선택된 조건:', selectedFilters);
}

/* 모든 조건을 처음 상태로 되돌림 */
function resetFilters() {
  const activeButtons = document.querySelectorAll('.filter-button.is-active');
  activeButtons.forEach(function (button) {
    button.classList.remove('is-active');
  });

  selectedFilters.length = 0;
  searchInput.value = '';
  currentKeyword = '';

  renderSelectedConditions();
  hideEmptyState();
  console.log('조건 초기화 완료');
}

/* [실습 2] 검색 입력창의 값을 읽어 확인
   이번 주차에는 값만 확인하고 실제 필터링은 하지 않음 */
function readKeyword() {
  currentKeyword = searchInput.value.trim();
  console.log('현재 검색어:', currentKeyword, '/ 자료형:', typeof currentKeyword);
}

/* [실습 3] 상세 영역 열기와 닫기
   선택한 카드의 식별자만 확인하고 데이터 연결은 10주차에 진행 */
function openDetail(spaceId) {
  detailPanel.classList.remove('is-hidden');
  console.log('선택한 공간 id:', spaceId, '/ 자료형:', typeof spaceId);
}

function closeDetail() {
  detailPanel.classList.add('is-hidden');
}

/* 상태 영역 전환 : 결과 없음
   9주차에 조건 처리 결과가 0건일 때 호출하도록 확장 */
function showEmptyState() {
  emptyState.classList.remove('is-hidden');
  spaceList.classList.add('is-hidden');
}

function hideEmptyState() {
  emptyState.classList.add('is-hidden');
  spaceList.classList.remove('is-hidden');
}

/* 접힌 조건 영역 보이기와 숨기기 */
function toggleMoreFilters() {
  filterMoreGroup.classList.toggle('is-hidden');

  if (filterMoreGroup.classList.contains('is-hidden')) {
    filterMoreButton.textContent = '조건 더보기';
  } else {
    filterMoreButton.textContent = '조건 접기';
  }
}

/* ---------------------------------------------------------
   4. 이벤트 연결 (5주차 3.1)
   --------------------------------------------------------- */

/* 필터 버튼 : 버튼이 여러 개이므로 묶음 요소에서 클릭을 감지 */
filterGroup.addEventListener('click', function (event) {
  const button = event.target.closest('.filter-button');
  if (!button) return;
  toggleFilter(button);
});

filterMoreGroup.addEventListener('click', function (event) {
  const button = event.target.closest('.filter-button');
  if (!button) return;
  toggleFilter(button);
});

/* 조건 더보기 */
filterMoreButton.addEventListener('click', toggleMoreFilters);

/* 검색어 입력 */
searchInput.addEventListener('input', readKeyword);

/* 전체 초기화 */
resetButton.addEventListener('click', resetFilters);
emptyResetButton.addEventListener('click', resetFilters);

/* 카드 클릭 : 카드 안의 어느 곳을 눌러도 카드 요소를 찾도록 처리 */
spaceList.addEventListener('click', function (event) {
  if (event.target.closest('.favorite-button')) {
    console.log('즐겨찾기 버튼 클릭 - 저장 기능은 11주차에 연결');
    return;
  }

  const card = event.target.closest('.space-card');
  if (!card) return;

  openDetail(card.dataset.id);
});

/* 상세 닫기 */
detailCloseButton.addEventListener('click', closeDetail);

/* ---------------------------------------------------------
   5. 초기 화면 상태
   --------------------------------------------------------- */
renderSelectedConditions();
