/* =========================================================
   7주차 제공 코드｜JSON 기반 목록 화면
   흐름: JSON → fetch → JavaScript 데이터 → 반복 렌더링 → 화면
   ※ 팀 프로젝트에 적용할 때는 맨 위 CONFIG(설정값)만 바꾸고
     아래 함수 내용은 수정하지 않음
   ========================================================= */

// ① 설정값: 팀 JSON 파일 경로·필수 필드·기본 이미지
const CONFIG = {
  dataUrl: './data/items.json',            // 6주차 data/ 폴더의 팀 JSON 파일
  requiredFields: ['id', 'name', 'area'],  // 6주차 명세서의 필수 필드
  placeholderImage: './asset/placeholder.svg'
};

// ② 실습용 데이터 전환: 주소 뒤 ?data=값 으로 코드 수정 없이 상황을 바꿔 봄
const DATA_SOURCES = {
  sample: './data/items.json',            // 정상 데이터 8건
  empty: './data/empty.json',             // 빈 배열 [] → 빈 상태
  check: './data/items-check.json',       // 필수 필드 누락·허용값 밖 값 포함
  candidates: './data/candidates.json',  // 6주차 후보 381건(선택 필드가 모두 null)
  wrong: './data/item.json'               // 일부러 틀린 경로 → 오류 상태
};

const params = new URLSearchParams(location.search);
const sourceKey = params.get('data');
const dataUrl = DATA_SOURCES[sourceKey] || CONFIG.dataUrl;
const delay = Number(params.get('delay')) || 0; // ?delay=1500 → 로딩 상태를 1.5초 동안 보여 줌

// ③ 화면 요소: 5주차 HTML의 id를 그대로 사용(새로 만들지 않음)
const listEl = document.querySelector('#item-list');
const countEl = document.querySelector('#result-count');
const sourceEl = document.querySelector('#data-source');
const errorDetailEl = document.querySelector('#error-detail');
const STATE_AREAS = {
  loading: document.querySelector('#loading-state'),
  empty: document.querySelector('#empty-state'),
  error: document.querySelector('#error-state')
};

// ④ 원본 배열: JSON에서 읽은 데이터를 그대로 보존(이후 주차의 결과 배열과 구분)
let allItems = [];

// 6주차 noiseLevel 허용값 → 화면 표시 문구
const NOISE_LABEL = { quiet: '조용함', normal: '보통', talkable: '대화 가능' };

// 상태 영역 전환: 지정한 영역만 보이고 나머지는 숨김(null이면 모두 숨김)
function showState(name) {
  Object.entries(STATE_AREAS).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
}

// 데이터 속 특수문자가 HTML 태그로 해석되지 않도록 변환
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]
  ));
}

// 데이터 확인 체크리스트(1.3.2)를 Console에 출력하고, 필수 필드가 빠진 항목은 제외
function checkItems(data) {
  console.group('[데이터 확인]', dataUrl);
  console.log('배열인가?', Array.isArray(data));
  if (!Array.isArray(data)) {
    console.groupEnd();
    throw new Error('JSON 최상위가 배열이 아님');
  }
  console.log('데이터 건수:', data.length);
  if (data.length > 0) {
    console.log('첫 번째 객체의 필드:', Object.keys(data[0]));
    console.log('첫 번째 id와 자료형:', data[0].id, typeof data[0].id);
  }

  const validItems = data.filter(item => {
    const missing = CONFIG.requiredFields.filter(field => item[field] === undefined || item[field] === null || item[field] === '');
    if (missing.length > 0) {
      console.warn(`필수 필드 누락 → 화면에서 제외(원본 JSON 수정 필요) · id: ${item.id} · 누락: ${missing.join(', ')}`);
      return false;
    }
    if (item.noiseLevel && !NOISE_LABEL[item.noiseLevel]) {
      console.warn(`허용값 밖의 값 → 배지 생략 · id: ${item.id} · noiseLevel: ${item.noiseLevel}`);
    }
    return true;
  });

  console.log('화면에 표시할 건수:', validItems.length);
  console.groupEnd();
  return validItems;
}

// 카드 1개 생성: 선택 필드는 값이 있을 때만 표시, 이미지가 없거나 깨지면 기본 이미지
function createCard(item) {
  const badgeTexts = [
    item.hasOutlet === true ? '콘센트' : '',
    NOISE_LABEL[item.noiseLevel] || '',
    item.hasTimeLimit === false ? '시간제한 없음' : '',
    item.closeTime ? `${item.closeTime}까지` : ''
  ].filter(Boolean);

  const badges = badgeTexts.map(text => `<span class="badge">${escapeHtml(text)}</span>`).join('');
  const image = item.image || CONFIG.placeholderImage;

  return `
    <article class="item-card" data-id="${escapeHtml(item.id)}">
      <img class="item-thumb" src="${escapeHtml(image)}" alt="${escapeHtml(item.name)} 대표 이미지" loading="lazy"
           onerror="this.onerror=null; this.src='${CONFIG.placeholderImage}'">
      <div class="item-body">
        <h3 class="item-name">${escapeHtml(item.name)}</h3>
        <p class="item-area">${escapeHtml(item.area)}</p>
        ${badges ? `<div class="badges">${badges}</div>` : ''}
        ${item.description ? `<p class="item-desc">${escapeHtml(item.description)}</p>` : ''}
      </div>
    </article>`;
}

// 렌더링 함수: 배열을 받아 결과 건수·빈 상태·카드 목록을 한 번에 갱신
// (JSON 파일을 직접 알지 못하므로 이후 주차의 검색·필터 결과 배열에도 그대로 재사용)
function renderItems(items) {
  countEl.textContent = `총 ${items.length}건`;

  if (items.length === 0) {
    listEl.innerHTML = '';
    showState('empty');
    return;
  }

  showState(null);
  listEl.innerHTML = items.map(createCard).join('');
}

// 일정 시간 기다리기(로딩 상태 확인용)
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 데이터 불러오기: 로딩 표시 → fetch → 확인 → 렌더링, 실패하면 오류 영역 표시
function loadItems() {
  showState('loading');
  listEl.innerHTML = '';
  countEl.textContent = '불러오는 중';
  sourceEl.textContent = dataUrl;

  wait(delay)
    .then(() => fetch(dataUrl))
    .then(response => {
      if (!response.ok) throw new Error(`요청 실패 ${response.status} · ${dataUrl}`);
      return response.json();
    })
    .then(data => {
      allItems = checkItems(data);
      renderItems(allItems);
    })
    .catch(error => {
      console.error('[불러오기 실패]', error);
      countEl.textContent = '총 0건';
      errorDetailEl.textContent = location.protocol === 'file:'
        ? '파일을 더블클릭해 열면 fetch가 차단됨 · Live Server로 열어 주세요'
        : '파일 경로와 파일명을 확인한 뒤 다시 시도해 주세요';
      showState('error');
    });
}

// 카드 클릭 시 data-id 확인: HTML 속성값은 항상 문자열이므로 6주차 ID 규칙대로 Number()로 변환
listEl.addEventListener('click', event => {
  const card = event.target.closest('.item-card');
  if (!card) return;
  const id = Number(card.dataset.id);
  const item = allItems.find(entry => entry.id === id);
  console.log('[카드 선택] data-id:', card.dataset.id, '→', id, item);
});

document.querySelector('#retry-button').addEventListener('click', loadItems);

// 실습 전환 바에서 현재 선택한 항목 강조
document.querySelectorAll('.practice-bar a').forEach(link => {
  if (link.getAttribute('href') === location.search) link.classList.add('on');
});

loadItems();
