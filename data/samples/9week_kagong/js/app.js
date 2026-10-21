'use strict';
/* =========================================================
   카공 공간 조건 탐색 서비스 — js/app.js (6주차 버전)
   - 5주차: 코드 안의 배열(places)로 화면·상호작용 구현
   - 6주차: 서울시 휴게음식점 인허가 정보로 만든 data/items.json(380건)을 불러와 사용
            필드명은 6주차 데이터 명세서 기준(hasOutlet·noiseLevel·seatType·hasTimeLimit·hasWifi·openTime·closeTime 등)
   - 7주차: 불러온 데이터를 Console에서 점검(checkData)하고, 화면을 보며 JSON을 수정
            항목마다 출처 플래그(meta)를 달아 저장 JSON·API·실제·더미를 데이터와 화면에서 구분
   - 9주차: 검색·지역·조건 필터·정렬을 state 하나로 묶어 results() → renderList()로 처리
   - 10주차: 카드 링크의 id로 상세(renderDetail)를 찾고, 목록 복귀 시 조건·스크롤 유지
   - 11주차: read()/write()로 즐겨찾기·최근 본 공간·탐색 조건을 LocalStorage에 저장
   - 12주차: 마이 화면 통합, 저장 기록 초기화(resetMy), [심화] API 연동 공간의 실시간 정보(Open-Meteo API)
   - 9주차 추가: 영업 중 필터(open), 내 위치 가까운 순 정렬(near, Geolocation API)
   - 10주차 추가: 상세 공유하기(Web Share API·클립보드)
   - 11주차 추가: 비교함 열기(compare, 최대 3곳) + 비교함 페이지(pages/compare.html)
   - 12주차 추가: [심화 B] 한줄평·정보 수정 제보를 구글 시트(Apps Script 웹 앱)에 저장
   - 주차별 스냅샷: 폴더마다 <body data-week="N">으로 N주차까지의 기능만 켜고, N주차에 바뀐 부분은 주차 색 점선으로 강조
   ========================================================= */

const $ = s => document.querySelector(s);
const page = document.body.dataset.page, params = new URLSearchParams(location.search);

// 홈(9week_kagong.html)은 9week_kagong 폴더 최상위, 나머지 화면은 pages/ 폴더에 있으므로 경로 기준을 페이지 위치에 맞춤
const ROOT = page === 'home' ? './' : '../';
const PAGES = page === 'home' ? './pages/' : './';
const HOME = ROOT + '9week_kagong.html';
const DATA_URL = ROOT + 'data/items.json';

/* ---------- 주차별 스냅샷 ----------
   - data-added="N" : N주차에 새로 생긴 요소 — N주차 이전 화면에서는 숨기고, N주차 화면에서는 강조
   - data-mark="N"  : 이전부터 있던 요소 중 N주차에 동작이 바뀐 요소 — N주차 화면에서만 강조
   - data-until="N" : N주차까지만 있고 이후 주차 화면에서는 빠지는 요소 */
const WEEK = Number(document.body.dataset.week) || 13;
const has = w => WEEK >= w;
const WEEK_NOTES = {
  9: '검색·지역·조건·정렬을 하나의 상태로 연결 · 영업 중 조건 · 가까운 순 정렬(거리 표시)',
  10: '프로토타입 전환 · 홈은 히어로와 전체 공간 둘러보기만(지역은 탐색에서 선택) · 상세(카공 환경·위치 지도·추천) · ‹ 목록 복귀 시 조건 유지 · 공유하기 · 카공 환경 제목 옆 별·하트',
  11: '즐겨찾기(☆)·최근 본 공간 저장 · 마이 화면 · 비교함에 담기와 비교함 페이지',
  12: '개인 상태 통합·초기화 · 통합·사용자 테스트·주요 수정·재검증 후 최종 IA 정리 · API·구글 시트는 선택 심화',
  13: '발표 버전(13·14주차) · 9~12주차 기능 전체 · 발표자료 준비·마지막 수정·검토·리허설 후 버전 고정'
};
function markWeek(root = document) {
  // data-until="N" : N주차까지만 보이고 이후 주차에서 빠지는 요소(예: 10주차부터 홈 지역 선택 제거)
  root.querySelectorAll('[data-until]').forEach(el => el.classList.toggle('wk-future', WEEK > Number(el.dataset.until)));
  root.querySelectorAll('[data-added],[data-mark]').forEach(el => {
    const w = Number(el.dataset.added || el.dataset.mark);
    el.classList.toggle('wk-future', !!el.dataset.added && w > WEEK);
    el.classList.toggle('wk-new', w === WEEK);
    if (w === WEEK && !el.title) el.title = `${w}주차 업데이트`;
  });
}
// 화면 맨 위 안내: 이 화면이 몇 주차 버전이고 무엇이 바뀌었는지(강조 표시 끄기·켜기)
function setupWeekBanner() { document.body.classList.add('wk-off'); }

// 기본 데이터(JSON에서 읽은 원본 배열)
let places = [];

// 6주차 허용값 → 화면 표시 문구
const NOISE_LABEL = { quiet: '조용함', normal: '보통', talkable: '대화 가능' };
const SEAT_LABEL = { single: '1인석 위주', group: '단체석 위주' };

/* ---------- 7주차: 데이터 출처 플래그(meta) ----------
   meta.source : 항목을 가져오는 방식 — json(저장 JSON만 사용) / api(저장 JSON + 실행 중 외부 API 호출)
   meta.real   : 공공데이터 원본에서 가져온 실제 값 필드
   meta.dummy  : 실습용으로 임의 생성한 더미 값 필드
   meta.api    : 실행 중 API 응답으로 채우는 필드(api 항목만) — 응답 실패 시 '대체'로 표시 */
const SOURCE_LABEL = { json: 'JSON', api: has(12) ? 'API' : 'API 예정' };
const FIELD_TYPE_LABEL = { real: '실제', dummy: '더미', api: 'API', fallback: '대체' };
// 화면 태그 약어: RL = 실제(Real), DM = 더미(Dummy)
const FIELD_TYPE_SHORT = { real: 'RL', dummy: 'DM', api: 'API', fallback: '대체' };
const sourceOf = p => (p.meta && SOURCE_LABEL[p.meta.source]) ? p.meta.source : 'json';
function fieldType(p, key) {
  const m = p.meta || {};
  if ((m.api || []).includes(key)) return 'api';
  if ((m.real || []).includes(key)) return 'real';
  if ((m.dummy || []).includes(key)) return 'dummy';
  return '';
}
// 화면 표시용 표식: 항목 출처 칩(저장 JSON·API 연동)과 필드 유형 태그(실제·더미·API·대체)
// 카페명 앞 출처 표시: J = 저장 JSON, A = API 연동
const SOURCE_MARK = { json: ['J', '저장 JSON 데이터'], api: ['A', has(12) ? 'API 연동 공간' : '저장 JSON · 12주차 선택 API 연동 예정'] };
const sourceMark = p => { const [t, label] = SOURCE_MARK[sourceOf(p)]; return `<span class="src-mark src-${sourceOf(p)}" title="${label}" aria-label="${label}">${t}</span>`; };
const sourceChip = p => `<span class="src-chip src-${sourceOf(p)}">${SOURCE_LABEL[sourceOf(p)]}</span>`;
const typeTag = type => type ? `<span class="type-tag type-${type}" title="${FIELD_TYPE_LABEL[type]} 데이터" aria-label="${FIELD_TYPE_LABEL[type]} 데이터">${FIELD_TYPE_SHORT[type]}</span>` : '';

// 신규 입점 기준일: 오늘로부터 1년 전(YYYY-MM-DD)
const nowHM = () => new Date().toTimeString().slice(0, 5);          // 현재 시각 "HH:MM"
const ONE_YEAR_AGO = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); })();
// 5주차 필터 버튼(data-filter) 값 → 6주차 필드 조건 대응표
const FILTER_RULES = {
  outlet: p => p.hasOutlet === true,
  quiet: p => p.noiseLevel === 'quiet',
  nolimit: p => p.hasTimeLimit === false,
  wifi: p => p.hasWifi === true,
  group: p => p.seatType === 'group',
  single: p => p.seatType === 'single',
  talkable: p => p.noiseLevel === 'talkable',
  night: p => (p.closeTime || '') >= '23:00',                    // 밤 11시 이후까지 영업
  early: p => !!p.openTime && p.openTime <= '08:00',             // 오전 8시 이전 오픈
  new: p => !!p.openedAt && p.openedAt >= ONE_YEAR_AGO,          // 최근 1년 안에 입점
  studyroom: p => p.hasStudyRoom === true,
  parking: p => p.hasParking === true,
  pet: p => p.isPetFriendly === true,
  open24: p => p.isOpen24h === true,
  cheap: p => typeof p.avgPrice === 'number' && p.avgPrice <= 5000, // 1인당 평균 5천원 이하
  // 9주차 2.4.2: 영업 중 — 현재 시각이 영업시간 안에 있는지(자정을 넘겨 닫는 공간 포함)
  open: p => {
    if (p.isOpen24h === true) return true;
    if (!p.openTime || !p.closeTime) return false;                    // 영업시간 정보 없으면 제외
    const t = nowHM();
    return p.openTime <= p.closeTime ? t >= p.openTime && t < p.closeTime : t >= p.openTime || t < p.closeTime;
  }
};
const FILTER_LABELS = { outlet: '콘센트', quiet: '조용함', nolimit: '시간제한 없음', wifi: '와이파이', group: '단체석', single: '1인석', talkable: '대화 가능', night: '밤 11시 이후', early: '오전 8시 이전', new: '신규 입점', studyroom: '스터디룸', parking: '주차 가능', pet: '반려동물 동반', open24: '24시간', cheap: '5천원 이하', open: '영업 중' };

/* ---------- 저장(LocalStorage)과 공통 함수 ---------- */
function read(key, fallback) { try { return JSON.parse(localStorage.getItem('kagong-pages-' + key)) ?? fallback; } catch { return fallback; } }
function write(key, value) { try { localStorage.setItem('kagong-pages-' + key, JSON.stringify(value)); } catch { notify('이 브라우저에서는 저장 기능을 사용할 수 없습니다.'); } }
function ids(key) { const v = read(key, []); return Array.isArray(v) ? v.filter(x => places.some(p => p.id === x)) : []; }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])); }
const findPlace = id => places.find(p => p.id === id);

// 탐색 조건 기억은 10주차(목록 복귀 시 조건 유지)부터 사용
let state = has(10) ? read('filters', { area: '전체', search: '', filters: [], sort: 'late' }) : { area: '전체', search: '', filters: [], sort: 'late' };
if (!state || !Array.isArray(state.filters)) state = { area: '전체', search: '', filters: [], sort: 'late' };
if (['walk', 'near'].includes(state.sort)) state.sort = 'late'; // 가까운 순은 위치 권한이 필요해 새로 열 때마다 기본 정렬로 시작
if (params.has('area')) state.area = params.get('area');
if (['popular', 'new'].includes(params.get('sort'))) { state.sort = params.get('sort'); state.area = params.get('area') || '전체'; }
// 결과 없음 화면: 실제 데이터에서 0곳이 되는 조건(미근동 + 콘센트·조용함·시간제한 없음)
if (page === 'empty' && !params.has('state')) state = { area: '미근동', search: '', filters: ['outlet', 'quiet', 'nolimit'], sort: 'late' };
function persist() { if (has(10)) write('filters', state); }

// link: 알림 오른쪽 '보기' 링크(null이면 링크 없음)
function notify(text, link = has(11) ? PAGES + 'my.html' : null, label = '보기') {
  const t = $('#toast'); if (!t) return; t.replaceChildren(document.createTextNode(text + ' '));
  if (link) { const a = document.createElement('a'); a.href = link; a.textContent = label; t.append(a); }
  t.hidden = false; clearTimeout(notify.timer); notify.timer = setTimeout(() => t.hidden = true, 3200);
}

// 지역 목록: 데이터의 area 값을 건수가 많은 순으로 정리
function areaList() {
  const count = {};
  places.forEach(p => { count[p.area] = (count[p.area] || 0) + 1; });
  return Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b, 'ko'));
}

/* ---------- 카드·배지 ---------- */
// 값이 확인된 조건만 배지로 표시하고, 조사 전(null)이면 '이용 조건 조사 전'으로 표시
function badges(p) {
  const list = [];
  if (p.hasOutlet === true) list.push('콘센트'); else if (p.hasOutlet === false) list.push('콘센트 없음');
  if (NOISE_LABEL[p.noiseLevel]) list.push(NOISE_LABEL[p.noiseLevel]);
  if (p.isOpen24h === true) list.push('24시간'); else if (p.closeTime) list.push(p.closeTime === '24:00' ? '24시' : p.closeTime + '까지');
  if (!list.length) list.push('이용 조건 조사 전');
  // 카드 배지는 모두 더미 필드(콘센트·소음·영업시간)에서 만들어지므로 점선 배지로 구분
  const dummy = ['hasOutlet', 'noiseLevel', 'closeTime'].some(k => fieldType(p, k) === 'dummy');
  return `<div class="badges">${list.map(t => `<span class="badge${dummy ? ' is-dummy' : ''}"${dummy ? ' title="실습용 더미 데이터"' : ''}>${esc(t)}</span>`).join('')}</div>`;
}
function card(p) {
  const on = ids('favorites').includes(p.id);
  // 9주차: 가까운 순일 때 내 위치에서의 거리 표시
  const km = state.sort === 'near' && myPos && typeof p.lat === 'number' ? ` <span class="dist" data-mark="9">${distanceKm(myPos, p).toFixed(1)}km</span>` : '';
  const star = has(11) ? `<button class="star" data-save="${p.id}" data-added="11" aria-label="${esc(p.name)} 즐겨찾기" aria-pressed="${on}">${on ? '★' : '☆'}</button>` : '';
  return `<article class="card" data-id="${p.id}"><a class="card-link" href="${PAGES}detail.html?id=${p.id}&from=${page}"><div class="thumb" aria-hidden="true"></div><div><h2>${sourceMark(p)}${esc(p.name)}</h2><p>${esc(p.area)}${km}</p>${badges(p)}</div></a>${star}</article>`;
}
// 받침 여부에 따라 조사 선택(콘센트를 / 시간제한 없음을)
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return w + ((c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b); };
function empty(title, text, action) { return `<div class="empty"><div class="state-icon" aria-hidden="true">⌕</div><h2>${title}</h2><p>${text}</p>${action}</div>`; }

function toggle(id) {
  let a = ids('favorites'); const on = a.includes(id);
  a = on ? a.filter(x => x !== id) : [id, ...a]; write('favorites', a);
  notify(findPlace(id).name + (on ? ' 저장을 해제했습니다' : '를 즐겨찾기에 저장했습니다')); render();
}

/* ---------- 목록·결과 없음 ---------- */
function results(filters = state.filters) {
  const q = state.search.replace(/\s/g, '').toLowerCase();
  return places.filter(p =>
    (state.area === '전체' || p.area === state.area) &&
    (!q || (p.name + p.area).replace(/\s/g, '').toLowerCase().includes(q)) &&
    filters.every(f => (FILTER_RULES[f] || (() => true))(p)));
}
function fillAreaSelect() {
  const sel = $('#area'); if (!sel) return;
  // 9주차: 지역 필터 — 데이터의 area 값을 공간 수가 많은 순으로 보여주고 지역별 공간 수를 함께 표시
  const count = a => a === '전체' ? places.length : places.filter(p => p.area === a).length;
  sel.innerHTML = ['전체', ...areaList()].map(a => `<option value="${esc(a)}">${esc(a === '전체' ? '전체' : a)} (${count(a)})</option>`).join('');
  if (![...sel.options].some(o => o.value === state.area)) state.area = '전체';
}
// 정렬 기준: 늦게까지 여는 순(마감 시각이 없으면 뒤로)·이름순·인기순(popularity)·신규 입점순(openedAt)
const SORTERS = {
  late: (a, b) => (b.closeTime || '').localeCompare(a.closeTime || '') || a.name.localeCompare(b.name, 'ko'),
  name: (a, b) => a.name.localeCompare(b.name, 'ko'),
  popular: (a, b) => (b.popularity ?? -1) - (a.popularity ?? -1),
  new: (a, b) => (b.openedAt || '').localeCompare(a.openedAt || ''),
  near: (a, b) => dist(a) - dist(b)                                   // 9주차: 가까운 순(좌표 없는 공간은 맨 뒤)
};
/* ---------- 9주차 2.4.2: 내 위치 가까운 순 ---------- */
const toRad = d => d * Math.PI / 180;
function distanceKm(a, b) {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));                          // 하버사인 공식(km)
}
let myPos = null;                                                     // 내 위치(브라우저에 저장하지 않음)
const dist = p => myPos && typeof p.lat === 'number' ? distanceKm(myPos, p) : Infinity;
function useMyLocation() {
  const fallback = text => { notify(text, null); state.sort = 'late'; if ($('#sort')) $('#sort').value = 'late'; renderList(true); };
  if (!navigator.geolocation) return fallback('이 브라우저는 위치 정보를 지원하지 않습니다');
  $('#count').textContent = '내 위치를 확인하는 중';
  navigator.geolocation.getCurrentPosition(
    pos => { myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }; state.sort = 'near'; renderList(true); },
    () => fallback('위치 권한이 없어 늦게까지 여는 순으로 보여줍니다'),
    { timeout: 8000 }
  );
}
// 탐색 목록: 처음 30곳을 보여주고, 목록 끝까지 스크롤하면 30곳씩 더 불러옴
const PAGE_SIZE = 30;
let shownCount = PAGE_SIZE, listResults = [], moreObserver = null;
function appendMore() {
  const next = listResults.slice(shownCount, shownCount + PAGE_SIZE);
  if (!next.length) return;
  $('#more-sentinel')?.insertAdjacentHTML('beforebegin', next.map(card).join(''));
  shownCount += next.length;
  updateMore();
}
// 목록 끝 표시: 남은 공간이 있으면 감시 영역을 두고, 다 보여주면 안내 문구로 바꿈
function updateMore() {
  const sentinel = $('#more-sentinel'); if (!sentinel) return;
  const rest = listResults.length - shownCount;
  sentinel.textContent = rest > 0 ? `아래로 스크롤하면 ${Math.min(rest, PAGE_SIZE)}곳을 더 불러옵니다 (${shownCount}/${listResults.length})` : `모든 공간을 불러왔습니다 (총 ${listResults.length}개 공간)`;
  if (rest <= 0 && moreObserver) moreObserver.disconnect();
}
function watchMore() {
  if (moreObserver) moreObserver.disconnect();
  const sentinel = $('#more-sentinel'); if (!sentinel || !('IntersectionObserver' in window)) return;
  moreObserver = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) appendMore(); }, { rootMargin: '200px 0px' });
  moreObserver.observe(sentinel);
}
// 선택한 조건 칩은 윗줄 맨 앞으로 이동, 해제하면 더보기 영역의 원래 자리로 돌아감
const CORE_FILTERS = ['outlet', 'quiet', 'nolimit', 'open'];   // 기본으로 보이는 핵심 조건(9주차 영업 중 포함)
const FILTER_ORDER = [...document.querySelectorAll('[data-filter]')].map(b => b.dataset.filter);
function arrangeChips() {
  const top = $('#top-chips'), extra = $('#extra-filters');
  if (!top || !extra) return;
  const chip = f => document.querySelector(`[data-filter="${f}"]`);
  const focused = document.activeElement;
  const selected = state.filters.filter(f => chip(f));
  const topList = [...selected, ...CORE_FILTERS.filter(f => !selected.includes(f))];
  topList.forEach(f => top.appendChild(chip(f)));
  FILTER_ORDER.filter(f => !topList.includes(f)).forEach(f => extra.appendChild(chip(f)));
  if (focused && focused !== document.activeElement && document.contains(focused)) focused.focus({ preventScroll: true });
  updateMoreButton();
}
// 더보기(+) 버튼: 닫혀 있을 때 핵심 조건 외에 선택한 조건 수를 함께 표시(예: +2)
function updateMoreButton() {
  const btn = $('.more-filters'), extra = $('#extra-filters'); if (!btn || !extra) return;
  const open = !extra.hidden, n = state.filters.filter(f => !CORE_FILTERS.includes(f)).length;
  btn.textContent = open ? '−' : n ? `+${n}` : '+';
  btn.classList.toggle('has-count', !open && n > 0);
  btn.setAttribute('aria-expanded', open);
  const label = open ? '조건 접기' : n ? `조건 더보기 · 추가 조건 ${n}개 선택됨` : '조건 더보기';
  btn.setAttribute('aria-label', label); btn.title = label;
}
// resetCount: 조건(지역·검색·필터·정렬)이 바뀌면 다시 30곳부터 보여줌
// 주소의 area·sort 값을 현재 상태와 맞춤 — 상세에서 돌아오거나 새로 고쳐도 홈에서 넘겨받은 옛 지역으로 되돌아가지 않게 함
function syncListUrl() {
  if (page !== 'list') return;
  const u = new URL(location.href);
  if (state.area === '전체') u.searchParams.delete('area'); else u.searchParams.set('area', state.area);
  u.searchParams.delete('sort');
  if (u.href !== location.href) history.replaceState(null, '', u.href);
}
function renderList(resetCount = false) {
  if (resetCount) shownCount = PAGE_SIZE;
  syncListUrl();
  $('#area-title').textContent = state.area === '전체' ? '원하는 공간을 찾아보세요.' : `${state.area}에서 원하는 공간을 찾아보세요.`; if ($('#area')) $('#area').value = state.area;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', state.filters.includes(b.dataset.filter)));
  arrangeChips();
  if (params.get('state') === 'error') { $('#error').hidden = false; $('#cards').hidden = true; $('#count').textContent = '공간 정보 불러오기 실패'; return; }
  const arr = results();
  arr.sort(SORTERS[state.sort] || SORTERS.late);
  $('#count').textContent = `총 ${arr.length}개 공간` + (state.filters.length ? ` · 조건 ${state.filters.length}개 적용` : '');
  if (arr.length) {
    listResults = arr; shownCount = Math.min(Math.max(shownCount, PAGE_SIZE), arr.length);
    $('#cards').innerHTML = arr.slice(0, shownCount).map(card).join('') + '<p id="more-sentinel" class="more-sentinel muted" aria-live="polite"></p>';
    updateMore(); watchMore();
    return;
  }
  listResults = [];
  const removable = [...state.filters].reverse().find(f => results(state.filters.filter(x => x !== f)).length);
  $('#cards').innerHTML = empty('조건에 맞는 공간이 없습니다',
    removable ? `${josa(FILTER_LABELS[removable], '을', '를')} 해제하면 ${results(state.filters.filter(x => x !== removable)).length}곳을 볼 수 있습니다.` : '검색어나 지역, 조건을 조금 넓혀보세요.',
    `<button class="primary" id="relax">${removable ? FILTER_LABELS[removable] + ' 해제' : '검색 · 조건 전체 해제'}</button>`);
  $('#relax').onclick = () => { if (removable) state.filters = state.filters.filter(x => x !== removable); else { state.search = ''; state.filters = []; state.area = '전체'; $('#search').value = ''; } persist(); renderList(true); };
}

/* ---------- 마이 ---------- */
const MY_TABS = ['favorites', 'recent', 'memos', 'reports'];   // 한줄평·제보 탭은 12주차부터
let myTab = MY_TABS.includes(params.get('tab')) && (has(12) || !['memos', 'reports'].includes(params.get('tab'))) ? params.get('tab') : 'favorites';
function renderMy() {
  if (!has(11)) { $('#my-cards').innerHTML = empty('저장 기능 준비 중', '즐겨찾기·최근 본 공간은 LocalStorage를 배우는 주차에 연결됩니다.', `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`); return; }
  const fav = ids('favorites'), recent = ids('recent');
  const memos = read('my-memos', []).filter(m => findPlace(m.placeId)), reports = read('my-reports', []).filter(r => findPlace(r.placeId));
  $('#fav-tab').textContent = `즐겨찾기 ${fav.length}`;
  if ($('#memos-tab')) $('#memos-tab').textContent = `내 한줄평 ${memos.length}`;
  if ($('#reports-tab')) $('#reports-tab').textContent = `내 제보 ${reports.length}`;
  const TAB_ID = { favorites: 'fav-tab', recent: 'recent-tab', memos: 'memos-tab', reports: 'reports-tab' };
  Object.entries(TAB_ID).forEach(([k, id]) => $('#' + id)?.setAttribute('aria-selected', myTab === k));
  $('#my-cards').setAttribute('aria-labelledby', TAB_ID[myTab]);
  if (myTab === 'memos' || myTab === 'reports') { renderMyPosts(myTab, myTab === 'memos' ? memos : reports); return; }
  const arr = (myTab === 'recent' ? recent : fav).map(findPlace);
  $('#my-cards').innerHTML = arr.length ? arr.map(card).join('') : empty(myTab === 'recent' ? '최근 본 공간이 없습니다' : '저장한 공간이 없습니다', '마음에 드는 곳을 저장하면 여기에서 다시 볼 수 있습니다.', `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`);
}

// 12주차: 내가 등록한 한줄평·정보 수정 제보 모아보기(최신순) — 공간명을 누르면 해당 공간 상세로 이동
function renderMyPosts(kind, list) {
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const day = v => String(v || '').slice(0, 10);
  const place = id => { const p = findPlace(id); return `<a class="post-place" href="${PAGES}detail.html?id=${p.id}&from=my">${sourceMark(p)}${esc(p.name)}</a><span class="post-area">${esc(p.area)}</span>`; };
  if (!list.length) {
    $('#my-cards').innerHTML = empty(kind === 'memos' ? '등록한 한줄평이 없습니다' : '보낸 제보가 없습니다',
      kind === 'memos' ? '공간 상세의 한줄평 영역에서 별점과 한줄평을 남겨 보세요.' : '공간 상세에서 ‘정보가 달라요’를 눌러 바른 정보를 알려 주세요.',
      `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`);
    return;
  }
  const items = [...list].reverse().map(x => kind === 'memos'
    ? `<li class="post"><div class="post-head">${place(x.placeId)}</div><p><span class="memo-stars">${stars(Number(x.rating) || 0)}</span> ${esc(x.text)}</p><small>${esc(x.nickname || '익명')} · ${day(x.createdAt)} 등록</small></li>`
    : `<li class="post"><div class="post-head">${place(x.placeId)}<span class="post-status">운영자 확인 대기</span></div><p><b>${esc(REPORT_FIELDS[x.field]?.[0] || x.field)}</b> ${esc(x.current)} → <b>${esc(x.suggested)}</b></p>${x.note ? `<small>${esc(x.note)}</small>` : ''}<small>${day(x.createdAt)} 제보</small></li>`).join('');
  $('#my-cards').innerHTML = `<ul class="post-list" data-added="12">${items}</ul><p class="muted" style="font-size:11px">${sheetOn() ? '구글 시트에 등록한 내용 중 이 브라우저에서 보낸 기록입니다.' : '구글 시트 미연결 상태라 이 브라우저에만 저장된 기록입니다.'}</p>`;
}

// 12주차: 저장 기록 초기화 — 실수로 누르지 않도록 확인 후 이 서비스의 키(kagong-pages-)만 삭제
const STORAGE_KEYS = ['favorites', 'recent', 'filters', 'return', 'restore', 'compare', 'my-memos', 'my-reports'];
function resetMy() {
  if (!confirm('즐겨찾기·최근 본 공간·비교함·탐색 조건과 이 브라우저의 한줄평·제보 기록을 모두 지울까요?')) return;
  try { STORAGE_KEYS.forEach(k => localStorage.removeItem('kagong-pages-' + k)); } catch {}
  state = { area: '전체', search: '', filters: [], sort: 'late' };
  renderMy();
  const t = $('#toast'); t.textContent = '저장 기록을 초기화했습니다'; t.hidden = false; clearTimeout(notify.timer); notify.timer = setTimeout(() => t.hidden = true, 3200);
}

/* ---------- 상세 ---------- */
const info = (v, label) => (v === null || v === undefined || v === '') ? '정보 없음' : esc(label ?? v);
const yesNo = v => v === true ? '있음' : v === false ? '없음' : '정보 없음';
// 상세 하단 추천: 같은 동의 공간·같은 조건의 공간(각 6곳, 현재 공간 제외)
function relatedSections(p) {
  const others = places.filter(x => x.id !== p.id);
  const sameArea = others.filter(x => x.area === p.area).sort(SORTERS.popular).slice(0, 6);
  // 같은 조건: 콘센트·소음·시간제한 값이 확인된(null 아님) 항목 중 현재 공간과 모두 같은 공간
  const keys = ['hasOutlet', 'noiseLevel', 'hasTimeLimit'].filter(k => k === 'noiseLevel' ? !!NOISE_LABEL[p.noiseLevel] : typeof p[k] === 'boolean');
  const sameCond = keys.length ? others.filter(x => keys.every(k => x[k] === p[k])).sort(SORTERS.popular).slice(0, 6) : [];
  const condText = keys.map(k => k === 'hasOutlet' ? (p.hasOutlet ? '콘센트 있음' : '콘센트 없음') : k === 'noiseLevel' ? NOISE_LABEL[p.noiseLevel] : (p.hasTimeLimit ? '시간제한 있음' : '시간제한 없음')).join(' · ');
  const tile = x => `<a href="${PAGES}detail.html?id=${x.id}&from=detail"><div class="thumb" aria-hidden="true"></div><h3>${sourceMark(x)}${esc(x.name)}</h3><p class="recent-area">${esc(x.area)}</p></a>`;
  const block = (title, sub, list, more, kind) => `<section class="related related-${kind}"><div class="section-heading"><h2>${title}</h2>${more}</div>${sub ? `<p class="muted" style="font-size:12px;margin:4px 0 0">${sub}</p>` : ''}${list.length ? `<div class="recent-grid">${list.map(tile).join('')}</div>` : '<p class="muted" style="font-size:12px">표시할 공간이 없습니다.</p>'}</section>`;
  return block(`${esc(p.area)}의 다른 공간`, '', sameArea, `<a class="more-link" href="${PAGES}list.html?area=${encodeURIComponent(p.area)}" aria-label="${esc(p.area)} 공간 전체보기" title="${esc(p.area)} 공간 전체보기">…</a>`, 'area')
    + block('비슷한 조건의 공간', condText ? `${esc(condText)} 조건이 같은 공간` : '이 공간은 이용 조건 정보가 없어 비교할 수 없습니다.', sameCond, '', 'cond');
}
// 위치 지도: 인허가 정보의 좌표(lat·lng)로 OpenStreetMap을 표시하고, 카카오맵·네이버 지도 바로가기 제공(API 키 불필요)
function mapSection(p) {
  if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return '<section><h2>위치</h2><p class="muted" style="font-size:12px">위치 정보 없음</p></section>';
  const d = 0.004, bbox = [p.lng - d, p.lat - d * 0.6, p.lng + d, p.lat + d * 0.6].map(n => n.toFixed(6)).join(',');
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat},${p.lng}`;
  const kakao = `https://map.kakao.com/link/map/${encodeURIComponent(p.name)},${p.lat},${p.lng}`;
  const naver = `https://map.naver.com/p/search/${encodeURIComponent(p.address || p.name)}`;
  return `<section><div class="section-heading map-heading"><h2>위치</h2><div class="map-links map-icons"><a class="map-icon map-kakao" href="${kakao}" target="_blank" rel="noopener" aria-label="카카오맵에서 보기(새 창)" title="카카오맵에서 보기"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span>카카오</span><svg class="ext" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg></a><a class="map-icon map-naver" href="${naver}" target="_blank" rel="noopener" aria-label="네이버 지도에서 보기(새 창)" title="네이버 지도에서 보기"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span>네이버</span><svg class="ext" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg></a></div></div><div class="map"><iframe title="${esc(p.name)} 위치 지도" src="${osm}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    </section>`;
}
function renderDetail() {
  if (!has(10)) {
    $('#detail').innerHTML = empty('상세 화면 자리', '9주차는 탐색 결과를 검증합니다. ID 기반 상세·목록 복귀는 10주차에 연결합니다.', `<a class="primary" href="${PAGES}list.html">공간 목록으로 돌아가기</a>`);
    return;
  }
  const p = findPlace(Number(params.get('id')) || places[0]?.id);
  if (!p) { $('#detail').innerHTML = empty('공간을 찾을 수 없습니다', '다른 공간을 둘러보세요.', `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`); return; }
  const on = ids('favorites').includes(p.id);
  // [항목명, 값, 필드명] — 필드명이 있으면 값 옆에 실제·더미·API 태그 표시
  const rows = a => '<dl>' + a.map(([k, v, key]) => `<div class="specrow"><dt>${k}</dt><dd>${v}${key ? typeTag(fieldType(p, key)) : ''}</dd></div>`).join('') + '</dl>';
  const m = p.meta || {};
  const legend = `<div class="src-legend">${sourceChip(p)}<span>RL ${(m.real || []).length}개 · DM ${(m.dummy || []).length}개${(m.api || []).length ? ` · API ${m.api.length}개` : ''} 필드</span></div>`;
  const hours = p.openTime && p.closeTime ? `${esc(p.openTime)} – ${esc(p.closeTime)}` : '정보 없음';
  const inCompare = ids('compare').includes(p.id);
  // 10주차 공유하기 · 11주차 비교함에 담기
  const actions = has(10) ? `<div class="detail-actions">
      ${has(11) ? `<button type="button" class="icon-btn" data-compare="${p.id}" data-added="11" aria-pressed="${inCompare}" aria-label="${inCompare ? '비교함에서 빼기' : '비교함에 담기'} (${ids('compare').length}/${COMPARE_MAX})" title="${inCompare ? '비교함에서 빼기' : '비교함에 담기'}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/></svg>${ids('compare').length ? `<span class="icon-badge">${ids('compare').length}</span>` : ''}</button>` : ''}
      <button type="button" class="icon-btn" data-share="${p.id}" data-added="10" aria-label="공간 공유하기" title="공유하기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg></button>
    </div>` : '';
  const saveBar = has(11)
    ? `<div class="save-bar" data-added="11"><button class="primary" data-save="${p.id}" aria-pressed="${on}">${on ? '★ 저장됨 · 해제하기' : '☆ 즐겨찾기에 저장'}</button></div>`
    : has(10) ? `<div class="save-bar" data-added="10"><button class="primary" disabled aria-disabled="true">☆ 즐겨찾기에 저장 (준비 중)</button></div>` : '';
  $('#detail').innerHTML = `<p class="eyebrow">${esc(p.area)}</p><h1>${sourceMark(p)}${esc(p.name)}</h1><div class="legend-row">${legend}${actions}</div>${has(12) ? '<p id="rating-summary" class="rating-summary" data-added="12" hidden></p>' : ''}<div class="hero-image" role="img" aria-label="대표 이미지 자리">대표 이미지</div>
    <section><h2>카공 환경</h2>${rows([['콘센트', yesNo(p.hasOutlet), 'hasOutlet'], ['소음', info(NOISE_LABEL[p.noiseLevel]), 'noiseLevel'], ['시간제한', yesNo(p.hasTimeLimit), 'hasTimeLimit'], ['영업시간', hours, 'openTime']])}</section>
    <section><h2>공간 정보</h2>${rows([['주소', info(p.address), 'address'], ['좌석', info(SEAT_LABEL[p.seatType]), 'seatType'], ['와이파이', yesNo(p.hasWifi), 'hasWifi'], ['스터디룸', yesNo(p.hasStudyRoom), 'hasStudyRoom'], ['주차', p.hasParking === true ? '있음' : p.hasParking === false ? '없음' : '별도 문의', 'hasParking'], ['반려동물 동반', yesNo(p.isPetFriendly), 'isPetFriendly'], ['24시간 운영', yesNo(p.isOpen24h), 'isOpen24h'], ['1인당 평균 가격', typeof p.avgPrice === 'number' ? p.avgPrice.toLocaleString('ko-KR') + '원' : '정보 없음', 'avgPrice'], ['입점일', info(p.openedAt), 'openedAt']])}${p.description ? `<p class="description">${esc(p.description)} ${typeTag(fieldType(p, 'description'))}</p>` : ''}
    <p class="muted" style="font-size:11px">기본 정보(공간명·주소·위치·입점일) 출처: 서울 열린데이터광장 「서울시 휴게음식점 인허가 정보」(공공누리 1유형). 이용 조건·영업시간·설명·관심 수·시설·가격은 실습용 더미 데이터입니다. 값 옆 태그 RL(실제)·DM(더미)·API로 구분합니다.</p></section>
    ${has(10) ? mapSection(p) : ''}
    ${has(12) ? liveSection(p) : ''}
    ${has(12) ? memoSection(p) + reportSection(p) : ''}
    ${has(10) ? relatedSections(p) : ''}
    ${saveBar}`;
  if (has(12)) { loadLive(p); loadMemos(p); updateReportCurrent(p); }
}

/* ---------- 10주차 3.4.1: 공유하기 ---------- */
async function sharePlace(p) {
  // 출발 화면(from) 같은 나만의 탐색 맥락은 빼고 id만 담은 주소를 공유
  const url = new URL(`detail.html?id=${p.id}`, location.href).href;
  try {
    if (navigator.share) await navigator.share({ title: p.name, text: `${p.area} · 카공 공간`, url });
    else { await navigator.clipboard.writeText(url); notify('공간 주소를 복사했습니다', null); }
  } catch (e) {
    if (e.name !== 'AbortError') notify('공유하지 못했습니다. 주소창의 주소를 복사해 주세요', null);
  }
}

/* ---------- 11주차 2.5.3: 비교함 열기 ---------- */
const COMPARE_MAX = 3;
function toggleCompare(id) {
  let a = ids('compare');
  if (a.includes(id)) a = a.filter(x => x !== id);
  else if (a.length >= COMPARE_MAX) return notify(`비교함에는 최대 ${COMPARE_MAX}곳까지 담을 수 있습니다`, PAGES + 'compare.html', '비교함');
  else a = [...a, id];
  write('compare', a);
  notify(`비교함 ${a.length}/${COMPARE_MAX}`, PAGES + 'compare.html', '비교함 열기');
  render(); renderCompareBar();
}
const COMPARE_ROWS = [
  ['콘센트', p => yesNo(p.hasOutlet)],
  ['소음', p => info(NOISE_LABEL[p.noiseLevel])],
  ['시간제한', p => yesNo(p.hasTimeLimit)],
  ['영업시간', p => p.openTime && p.closeTime ? `${esc(p.openTime)}~${esc(p.closeTime)}` : '정보 없음'],
  ['좌석', p => info(SEAT_LABEL[p.seatType])],
  ['와이파이', p => yesNo(p.hasWifi)],
  ['평균 가격', p => typeof p.avgPrice === 'number' ? p.avgPrice.toLocaleString('ko-KR') + '원' : '정보 없음']
];
function renderCompare() {
  const arr = ids('compare').map(findPlace).filter(Boolean);           // 사라진 id는 제외
  if (arr.length < 2) {
    $('#compare').innerHTML = empty('비교함에 담을 공간을 2곳 이상 담아 주세요', `공간 상세에서 ‘비교함에 담기’를 누르세요. (현재 ${arr.length}/${COMPARE_MAX})`, `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`);
    return;
  }
  // 공간마다 A·B·C 색(cmp-c1~3)을 정해 열 전체를 같은 색으로 묶어 좌우 비교가 한눈에 보이게 함
  const tag = i => String.fromCharCode(65 + i);                          // A, B, C
  const head = `<tr><th scope="col" class="cmp-label">항목</th>${arr.map((p, i) => `<th scope="col" class="cmp-col cmp-c${i + 1}"><span class="cmp-tag">${tag(i)}</span><a href="${PAGES}detail.html?id=${p.id}&from=compare">${sourceMark(p)}${esc(p.name)}</a><small>${esc(p.area)}</small><button type="button" class="cmp-remove" data-compare="${p.id}" aria-label="${esc(p.name)} 비교함에서 빼기">빼기</button></th>`).join('')}</tr>`;
  const body = COMPARE_ROWS.map(([label, fn]) => {
    const vals = arr.map(fn), diff = new Set(vals).size > 1;               // 값이 서로 다른 행은 ≠ 표시와 굵은 글씨
    return `<tr class="${diff ? 'is-diff' : ''}"><th scope="row" class="cmp-label">${label}${diff ? '<span class="cmp-diff" title="공간마다 값이 다름">≠</span>' : ''}</th>${vals.map((v, i) => `<td class="cmp-col cmp-c${i + 1}">${v}</td>`).join('')}</tr>`;
  }).join('');
  $('#compare').innerHTML = `<div class="compare-wrap"><table class="compare-table cmp-n${arr.length}">${head}${body}</table></div><p class="muted" style="font-size:11px">≠ 표시 행은 공간마다 값이 다른 항목(굵은 글씨) · 콘센트·소음·영업시간·좌석·와이파이·가격은 실습용 더미 데이터</p><button type="button" class="cmp-clear" aria-label="비교함 비우기" title="비교함 비우기"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>`;
}
// 확인 모달: 브라우저 기본 confirm 대신 서비스 화면 안의 모달로 확인 — 확인 true, 취소·Esc·바깥 클릭 false
function confirmModal(title, text, okLabel = '확인') {
  return new Promise(resolve => {
    const back = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-text">
      <div class="modal-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg></div>
      <h2 id="modal-title">${title}</h2><p id="modal-text">${text}</p>
      <div class="modal-actions"><button type="button" data-modal="cancel">취소</button><button type="button" class="modal-ok" data-modal="ok">${okLabel}</button></div></div>`;
    const close = ok => { wrap.remove(); document.removeEventListener('keydown', onKey); back?.focus?.(); resolve(ok); };
    const onKey = e => { if (e.key === 'Escape') close(false); };
    wrap.addEventListener('click', e => { if (e.target === wrap) close(false); const b = e.target.closest('[data-modal]'); if (b) close(b.dataset.modal === 'ok'); });
    document.addEventListener('keydown', onKey);
    document.body.append(wrap);
    wrap.querySelector('[data-modal="cancel"]').focus();                // 실수로 지우지 않도록 취소에 먼저 초점
  });
}
// 목록 화면 아래 비교함 바(담은 수가 있을 때만)
function renderCompareBar() {
  if (!has(11) || !['list', 'empty'].includes(page)) return;
  let bar = $('#compare-bar');
  if (!bar) { bar = document.createElement('a'); bar.id = 'compare-bar'; bar.className = 'compare-bar'; bar.dataset.added = '11'; bar.href = PAGES + 'compare.html'; document.querySelector('.app').append(bar); }
  const n = ids('compare').length;
  bar.hidden = !n; bar.innerHTML = `비교함 <b>${n}</b>/${COMPARE_MAX} · 비교함 열기 →`;
  markWeek(bar.parentNode);
}

/* ---------- 12주차 2.3.3: 구글 시트 한줄평·정보 수정 제보 ----------
   - SHEET_URL에 Apps Script 웹 앱 주소(/exec)를 넣으면 구글 시트 memo·report 탭에 저장(apps-script/Code.gs)
   - 주소가 비어 있으면 '시트 미연결'로 표시하고 이 브라우저(LocalStorage)에만 임시 저장 */
const SHEET_URL = '';
const sheetOn = () => !!SHEET_URL;
function memoSection(p) {
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  // 한줄평 영역: ① 평균 별점 요약 → ② 한줄평 목록(디스플레이) → ③ 한줄평 남기기 폼
  return `<section id="memo" data-added="12"><div class="section-heading"><h2>한줄평 <span id="memo-count" class="memo-count"></span></h2><span class="src-chip">${sheetOn() ? '구글 시트' : '시트 미연결'}</span></div>
    <div id="memo-summary" class="memo-summary" aria-live="polite"></div>
    <div id="memo-list" class="memo-display"></div>
    <h3 class="memo-form-title">한줄평 남기기</h3>
    <form id="memo-form" class="memo-form">
      <select id="memo-rating" aria-label="별점"><option value="">별점 선택</option>${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${stars(n)}</option>`).join('')}</select>
      <input id="memo-name" maxlength="10" placeholder="닉네임(선택)" aria-label="닉네임">
      <input id="memo-text" maxlength="60" placeholder="한줄평 60자 이내 · 개인정보 입력 금지" aria-label="한줄평">
      <button class="primary" type="submit">한줄평 등록</button>
    </form>
    <p class="muted" style="font-size:11px">${sheetOn() ? '방문자 한줄평 · 구글 시트(Apps Script 웹 앱)에 저장되어 모두에게 보입니다.' : '구글 시트 웹 앱 주소(SHEET_URL)가 아직 연결되지 않아 이 브라우저에만 임시 저장됩니다.'}</p></section>`;
}
// 한줄평 표시: 평균 별점·개수 요약(상세 상단 요약 줄과 한줄평 제목)과 최신순 카드 목록
function renderMemos(items) {
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const n = items.length, avg = n ? items.reduce((t, m) => t + (Number(m.rating) || 0), 0) / n : 0;
  $('#memo-count').textContent = n ? n : '';
  const summary = n ? `<span class="memo-avg">★ ${avg.toFixed(1)}</span><span class="memo-bar"><i style="width:${(avg / 5) * 100}%"></i></span><span>한줄평 ${n}개</span>` : '';
  $('#memo-summary').innerHTML = summary;
  const top = $('#rating-summary');
  if (top) { top.hidden = !n; top.innerHTML = n ? `<a href="#memo">★ ${avg.toFixed(1)} · 한줄평 ${n}개</a>` : ''; }
  $('#memo-list').innerHTML = n
    ? `<ul class="memo-items">${items.map(m => `<li class="memo-card"><div class="memo-card-head"><span class="memo-stars" aria-label="별점 ${Number(m.rating) || 0}점">${stars(Number(m.rating) || 0)}</span><small>${esc(m.nickname || '익명')} · ${esc(String(m.createdAt || '').slice(0, 10))}</small></div><p>${esc(m.text)}</p></li>`).join('')}</ul>`
    : '<div class="memo-empty">아직 한줄평이 없습니다. 이 공간에서 공부해 봤다면 첫 한줄평을 남겨 주세요.</div>';
}
function loadMemos(p) {
  if (!sheetOn()) { renderMemos(read('my-memos', []).filter(m => m.placeId === p.id).reverse()); return; }
  $('#memo-list').innerHTML = '<p class="muted" style="font-size:12px">한줄평을 불러오는 중</p>';   // 4주차 ‘로딩’
  fetch(`${SHEET_URL}?placeId=${p.id}`)
    .then(r => r.json())
    .then(d => renderMemos(d.items || []))
    .catch(() => { $('#memo-list').innerHTML = '<p class="muted" style="font-size:12px">한줄평을 불러오지 못했습니다 <button type="button" class="memo-retry">다시 시도</button></p>'; });
}
// 등록: 한줄평(type 'memo')과 정보 수정 제보(type 'report')가 같은 함수를 사용 — 성공하면 true
function sendToSheet(data, button) {
  if (button) button.disabled = true;                                   // 중복 등록 방지
  // 내가 등록한 기록은 시트 연결 여부와 관계없이 이 브라우저(LocalStorage)에도 남겨 마이 화면에서 모아봄
  const saveMine = () => { const key = data.type === 'memo' ? 'my-memos' : 'my-reports'; write(key, [...read(key, []), { ...data, createdAt: new Date().toISOString() }]); };
  if (!sheetOn()) {
    saveMine();
    notify('시트 미연결 · 이 브라우저에 임시 저장했습니다', has(12) ? PAGES + 'my.html?tab=' + (data.type === 'memo' ? 'memos' : 'reports') : null, '마이에서 보기');
    if (button) button.disabled = false;
    return Promise.resolve(true);
  }
  return fetch(SHEET_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
    .then(r => r.json())
    .then(d => { if (!d.ok) throw new Error(d.error); saveMine(); notify('등록했습니다', PAGES + 'my.html?tab=' + (data.type === 'memo' ? 'memos' : 'reports'), '마이에서 보기'); return true; })
    .catch(() => { notify('등록하지 못했습니다. 잠시 후 다시 시도해 주세요', null); return false; })
    .finally(() => { if (button) button.disabled = false; });
}
const REPORT_FIELDS = {
  hasOutlet: ['콘센트', p => yesNo(p.hasOutlet)], noiseLevel: ['소음', p => info(NOISE_LABEL[p.noiseLevel])],
  hasTimeLimit: ['시간제한', p => yesNo(p.hasTimeLimit)], openTime: ['영업시간', p => p.openTime && p.closeTime ? `${p.openTime}–${p.closeTime}` : '정보 없음'],
  seatType: ['좌석', p => info(SEAT_LABEL[p.seatType])], hasWifi: ['와이파이', p => yesNo(p.hasWifi)],
  avgPrice: ['1인당 평균 가격', p => typeof p.avgPrice === 'number' ? p.avgPrice + '원' : '정보 없음'], address: ['주소', p => info(p.address)]
};
function reportSection(p) {
  return `<section id="report" data-added="12"><div class="section-heading"><h2>정보 수정 제보</h2><button type="button" class="report-toggle" aria-expanded="false" aria-controls="report-form">정보가 달라요 <span aria-hidden="true">▾</span></button></div>
    <p class="muted" style="font-size:12px;margin:4px 0 0">콘센트·영업시간 등이 실제와 다르면 알려 주세요.</p>
    <form id="report-form" class="report-form" hidden>
      <label>항목 <select id="report-field">${Object.entries(REPORT_FIELDS).map(([k, [label]]) => `<option value="${k}">${label}${fieldType(p, k) === 'dummy' ? ' (DM)' : ''}</option>`).join('')}</select></label>
      <p class="muted" id="report-current" style="font-size:12px"></p>
      <label>바른 값 <input id="report-suggested" maxlength="40" placeholder="예: 콘센트 있음, 10:00–22:00"></label>
      <label>설명(선택) <input id="report-note" maxlength="100" placeholder="확인한 날짜·방법"></label>
      <button class="primary" type="submit">제보 보내기</button>
      <p class="muted" style="font-size:11px">제보는 ${sheetOn() ? '구글 시트 report 탭에 쌓이고' : '(시트 미연결) 이 브라우저에 임시 저장되고'} 운영자가 확인한 뒤 데이터에 반영합니다. 화면에는 공개되지 않습니다.</p>
    </form></section>`;
}
function updateReportCurrent(p) {
  const f = $('#report-field'); if (!f) return;
  $('#report-current').textContent = '현재 값 : ' + REPORT_FIELDS[f.value][1](p).replace(/<[^>]+>/g, '');
}

/* ---------- [심화] 외부 API: API 연동 공간(meta.source = 'api')의 실시간 정보 ----------
   - Open-Meteo(키 불필요)로 meta.api 필드(temperature·precipitation·windSpeed)를 채움
   - 저장 JSON 공간(meta.source = 'json')은 API를 호출하지 않음
   - 응답 실패·필드 누락이면 '정보 없음'과 '대체' 태그로 바꾸고 상세·저장 등 필수 흐름은 그대로 유지(4주차 대체 상태) */
const LIVE_FIELDS = { temperature: ['현재 기온', v => v + '℃'], precipitation: ['강수량', v => v + 'mm'], windSpeed: ['풍속', v => v + 'km/h'] };
function liveSection(p) {
  if (sourceOf(p) !== 'api') return `<section data-added="12"><h2>실시간 정보</h2><p class="muted" style="font-size:12px">이 공간은 API 미연동 공간으로 저장 JSON 데이터만 표시합니다. ${sourceChip(p)}</p></section>`;
  const list = (p.meta.api || []).filter(k => LIVE_FIELDS[k]);
  return `<section id="live" data-added="12"><h2>실시간 정보</h2><dl>${list.map(k => `<div class="specrow"><dt>${LIVE_FIELDS[k][0]}</dt><dd data-live="${k}">불러오는 중${typeTag('api')}</dd></div>`).join('')}</dl><p class="muted" id="live-note" style="font-size:11px">Open-Meteo API 응답 · 요청 중</p></section>`;
}
const liveCache = {};
function loadLive(p) {
  if (sourceOf(p) !== 'api' || typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
  const fill = (w, ok) => {
    document.querySelectorAll('[data-live]').forEach(dd => {
      const k = dd.dataset.live, v = w?.[k];
      dd.innerHTML = ok && typeof v === 'number' ? esc(LIVE_FIELDS[k][1](v)) + typeTag('api') : '정보 없음' + typeTag('fallback');
    });
    $('#live-note').textContent = ok ? `Open-Meteo API 응답 · ${w.time} 기준` : 'API 응답 실패 — 대체 표시(정보 없음), 나머지 정보는 저장 JSON 그대로';
  };
  if (liveCache[p.id]) { fill(liveCache[p.id], true); return; }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lng}&current=temperature_2m,precipitation,wind_speed_10m&timezone=Asia%2FSeoul`;
  fetch(url)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => {
      // 외부 응답 필드 → 내부 필드(meta.api 이름)로 변환
      const c = data.current || {};
      const w = { temperature: c.temperature_2m, precipitation: c.precipitation, windSpeed: c.wind_speed_10m, time: (c.time || '').replace('T', ' ') };
      if (typeof w.temperature !== 'number') throw new Error('응답 필드 누락');
      liveCache[p.id] = w; fill(w, true);
    })
    .catch(error => { fill(null, false); console.warn('[API 실패] 실시간 정보만 대체 표시', error); });
}

function render() { if (page === 'list' || page === 'empty') renderList(); if (page === 'my') renderMy(); if (page === 'detail') renderDetail(); if (page === 'compare') renderCompare(); }

/* ---------- 홈 ---------- */
function setupHome() {
  // 지역 칩: 건수가 많은 3곳은 바로 보이고, 나머지 지역과 '전체 지역'은 + 버튼으로 펼침
  const areas = areaList();
  const chip = a => `<button type="button" data-home-area="${esc(a)}" aria-pressed="${state.area === a}">${esc(a === '전체' ? '전체 지역' : a)}</button>`;
  $('#top-areas').innerHTML = areas.slice(0, 3).map(chip).join('');
  $('#all-areas').innerHTML = [...areas.slice(3), '전체'].map(chip).join('');
  document.querySelectorAll('[data-home-area]').forEach(b => b.onclick = () => {
    state.area = b.dataset.homeArea; persist();
    document.querySelectorAll('[data-home-area]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#browse-all').href = PAGES + 'list.html?area=' + encodeURIComponent(state.area);
    $('#browse-all').textContent = (state.area === '전체' ? '전체 공간' : state.area + ' 공간') + ' 둘러보기 →';
  });
  $('#area-toggle').onclick = () => {
    const open = $('#all-areas').hidden; $('#all-areas').hidden = !open;
    $('#area-toggle').setAttribute('aria-expanded', open); $('#area-toggle').setAttribute('aria-label', open ? '전체 지역 접기' : '전체 지역 펼치기'); $('#area-toggle').textContent = open ? '−' : '+';
  };
  const recentIds = ids('recent').slice(0, 3);
  const arr = recentIds.length ? recentIds.map(findPlace) : places.slice(0, 3);
  $('#recent-section').hidden = false; $('#recent').classList.remove('is-empty');
  $('#recent').innerHTML = arr.map(p => `<a href="${PAGES}detail.html?id=${p.id}&from=home"><div class="thumb" aria-hidden="true"></div><h3>${sourceMark(p)}${esc(p.name)}</h3><p class="recent-area">${esc(p.area)}</p></a>`).join('');
  // 인기 있는 공간·신규 입점 공간: 각각 6곳
  const tile = (p, sub) => `<a href="${PAGES}detail.html?id=${p.id}&from=home"><div class="thumb" aria-hidden="true"></div><h3>${sourceMark(p)}${esc(p.name)}</h3><p class="recent-area">${esc(p.area)} · ${sub}</p></a>`;
  // 추천 공간은 카공 조건 중심, 인기 공간은 관심 수, 신규 입점은 입점일 기준.
  const featuredIds = new Set([
    ...[...places].sort(SORTERS.popular).slice(0, 6),
    ...[...places].sort(SORTERS.new).slice(0, 6)
  ].map(p => p.id));
  const recommendScore = p => Number(p.hasOutlet === true) * 2 + Number(p.noiseLevel === 'quiet') * 2 + Number(p.hasWifi === true) + Number(p.hasTimeLimit === false);
  const recommended = places.filter(p => !featuredIds.has(p.id)).sort((a, b) => recommendScore(b) - recommendScore(a) || a.id - b.id).slice(0, 6);
  $('#recommended').innerHTML = recommended.map(p => tile(p, '작업하기 좋은 조건')).join('');
  $('#popular').innerHTML = [...places].sort(SORTERS.popular).slice(0, 6).map(p => tile(p, `♡ ${p.popularity ?? 0}`)).join('');
  $('#new-places').innerHTML = [...places].sort(SORTERS.new).slice(0, 6).map(p => tile(p, `${(p.openedAt || '').slice(0, 7).replace('-', '.')} 입점`)).join('');
  if (!recentIds.length) { const note = document.createElement('p'); note.className = 'recent-sample-note'; note.textContent = '방문 이력이 없어 샘플 공간을 표시합니다.'; $('#recent').after(note); }
}

/* ---------- 이벤트 연결 ---------- */
function setupEvents() {
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === (page === 'home' ? 'home' : page === 'my' ? 'my' : 'explore')) a.setAttribute('aria-current', 'page'); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-save]'); if (b && has(11)) toggle(Number(b.dataset.save));
    const sh = e.target.closest('[data-share]'); if (sh) sharePlace(findPlace(Number(sh.dataset.share)));
    const cp = e.target.closest('[data-compare]'); if (cp) toggleCompare(Number(cp.dataset.compare));
    if (e.target.closest('.cmp-clear')) confirmModal('비교함을 비울까요?', `담아 둔 공간 ${ids('compare').length}곳이 비교함에서 모두 빠집니다.`, '비우기').then(ok => { if (ok) { write('compare', []); renderCompare(); notify('비교함을 비웠습니다', null); } });
    if (e.target.closest('.memo-retry')) loadMemos(findPlace(Number(params.get('id')) || places[0]?.id));
    const rt = e.target.closest('.report-toggle'); if (rt) { const open = $('#report-form').hidden; $('#report-form').hidden = !open; rt.setAttribute('aria-expanded', open); rt.querySelector('span').textContent = open ? '▴' : '▾'; }
    const link = e.target.closest('.card-link'); if (link) write('return', { url: location.pathname.split('/').pop() + location.search, scroll: window.scrollY, shown: shownCount });
  });
  if (page === 'list' || page === 'empty') {
    $('.more-filters').onclick = () => { $('#extra-filters').hidden = !$('#extra-filters').hidden; updateMoreButton(); };
    $('#search').value = state.search; if ($('#sort')) $('#sort').value = state.sort;
    $('#search').oninput = e => { state.search = e.target.value; persist(); renderList(true); };
    if ($('#area')) $('#area').onchange = e => { state.area = e.target.value; persist(); renderList(true); };
    document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { const f = b.dataset.filter; state.filters = state.filters.includes(f) ? state.filters.filter(x => x !== f) : [...state.filters, f]; persist(); renderList(true); });
    $('#reset').onclick = () => { state.filters = []; state.search = ''; state.area = '전체'; $('#search').value = ''; persist(); renderList(true); };
    if ($('#sort')) $('#sort').onchange = e => { if (e.target.value === 'near') return useMyLocation(); state.sort = e.target.value; persist(); renderList(true); };
    if ($('#retry')) $('#retry').onclick = () => location.href = PAGES + 'list.html' + (params.get('prototype') === '1' ? '?prototype=1' : '');
    persist();
  }
  if (page === 'my') {
    $('#fav-tab').onclick = () => { myTab = 'favorites'; renderMy(); }; $('#recent-tab').onclick = () => { myTab = 'recent'; renderMy(); };
    if ($('#memos-tab')) $('#memos-tab').onclick = () => { myTab = 'memos'; renderMy(); };
    if ($('#reports-tab')) $('#reports-tab').onclick = () => { myTab = 'reports'; renderMy(); };
    if ($('#reset-my')) $('#reset-my').onclick = resetMy;
  }
  if (page === 'detail') {
    const id = Number(params.get('id')) || places[0]?.id;
    if (has(11) && places.some(p => p.id === id)) write('recent', [id, ...ids('recent').filter(x => x !== id)].slice(0, 10));
    const current = () => findPlace(id);
    document.addEventListener('change', e => { if (e.target.id === 'report-field') updateReportCurrent(current()); });
    // 12주차: 한줄평·제보 폼 제출 — 화면에서 먼저 검증한 뒤 전송
    document.addEventListener('submit', e => {
      e.preventDefault();
      const p = current(); if (!p) return;
      if (e.target.id === 'memo-form') {
        const text = $('#memo-text').value.trim(), rating = Number($('#memo-rating').value);
        if (!text || text.length > 60 || !(rating >= 1 && rating <= 5)) return notify('별점과 60자 이내 한줄평을 입력해 주세요', null);
        sendToSheet({ type: 'memo', placeId: p.id, rating, text, nickname: $('#memo-name').value.trim() || '익명' }, e.submitter)
          .then(ok => { if (ok) { e.target.reset(); loadMemos(p); } });
      }
      if (e.target.id === 'report-form') {
        const field = $('#report-field').value, suggested = $('#report-suggested').value.trim();
        if (!suggested) return notify('바른 값을 입력해 주세요', null);
        sendToSheet({ type: 'report', placeId: p.id, field, current: REPORT_FIELDS[field][1](p).replace(/<[^>]+>/g, ''), suggested, note: $('#report-note').value.trim() }, e.submitter)
          .then(ok => { if (ok) { e.target.reset(); e.target.hidden = true; updateReportCurrent(p); } });
      }
    });
    const from = params.get('from'); const back = read('return', {});
    $('#back').href = from === 'my' ? 'my.html' : from === 'home' ? HOME : from === 'empty' ? 'empty.html' : back.url?.startsWith('list.html') ? back.url : 'list.html';
    $('#back').onclick = e => {
      write('restore', true);
      // 같은 서비스 안에서 들어온 경우 브라우저 뒤로가기로 이전 화면에 돌아감(없으면 링크 주소로 이동)
      if (history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin) { e.preventDefault(); history.back(); }
    };
  }
}

/* ---------- TOP 버튼: 400px 이상 스크롤하면 표시, 누르면 맨 위로 이동 ---------- */
function setupTopButton() {
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'top-button'; btn.setAttribute('aria-label', '맨 위로 이동');
  btn.innerHTML = '<span aria-hidden="true">↑</span>TOP';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);
  const update = () => btn.classList.toggle('is-visible', window.scrollY > 400);
  window.addEventListener('scroll', update, { passive: true }); update();
}
setupTopButton();

/* ---------- 데이터 불러오기 실패 표시 ---------- */
function showLoadError(error) {
  console.error('[데이터 불러오기 실패]', DATA_URL, error);
  const hint = location.protocol === 'file:' ? '파일을 더블클릭해 열면 JSON을 불러올 수 없습니다. GitHub Pages 배포 주소에서 열어 주세요.' : 'data/items.json 경로와 파일명을 확인해 주세요.';
  const box = `<div class="empty"><div class="state-icon" aria-hidden="true">!</div><h2>공간 정보를 불러오지 못했습니다</h2><p>${hint}</p><a class="primary" href="">다시 시도</a></div>`;
  if ($('#count')) $('#count').textContent = '공간 정보 불러오기 실패';
  const target = $('#cards') || $('#my-cards') || $('#detail') || $('#recent');
  if (target) target.innerHTML = box;
}

/* ---------- 시작: JSON을 불러온 뒤 화면을 그림 ---------- */
if ($('#count')) $('#count').textContent = '공간 정보를 불러오는 중';
// data/items.json을 fetch로 불러오고, 파일을 직접 연 경우(file://)처럼 fetch가 막히면 같은 내용의 data/items.js를 사용
/* ---------- 데이터 점검(7주차) ---------- */
// 6주차 데이터 명세서 기준: 필수 필드·허용값·자료형·id 중복·좌표 범위를 Console에 출력하고, 필수 필드가 빠진 항목은 화면에서 제외
const REQUIRED = ['id', 'name', 'area'];
const ALLOWED = { noiseLevel: Object.keys(NOISE_LABEL), seatType: Object.keys(SEAT_LABEL) };
const TYPES = {
  id: 'number', name: 'string', area: 'string', address: 'string', lat: 'number', lng: 'number',
  hasOutlet: 'boolean', noiseLevel: 'string', seatType: 'string', hasTimeLimit: 'boolean', hasWifi: 'boolean',
  openTime: 'string', closeTime: 'string', image: 'string', description: 'string', openedAt: 'string', popularity: 'number',
  hasStudyRoom: 'boolean', hasParking: 'boolean', isPetFriendly: 'boolean', isOpen24h: 'boolean', avgPrice: 'number'
};
function checkData(data, source) {
  console.group('[데이터 점검]', source);
  console.log('배열인가?', Array.isArray(data));
  if (!Array.isArray(data)) { console.groupEnd(); return []; }
  console.log('데이터 건수:', data.length);
  if (data[0]) { console.log(`첫 번째 객체의 필드(${Object.keys(data[0]).length}개):`, Object.keys(data[0])); console.log('첫 번째 id와 자료형:', data[0].id, typeof data[0].id); }
  const warn = [];
  const seen = new Set(), dup = new Set();
  data.forEach(p => { if (seen.has(p.id)) dup.add(p.id); seen.add(p.id); });
  if (dup.size) warn.push(`id 중복: ${[...dup].join(', ')} → 상세보기·즐겨찾기가 다른 공간을 가리킬 수 있음`);
  const nulls = {};
  data.forEach(p => {
    Object.entries(TYPES).forEach(([k, type]) => {
      const v = p[k];
      if (v === null || v === undefined || v === '') { if (k !== 'image') nulls[k] = (nulls[k] || 0) + 1; return; }
      if (typeof v !== type) warn.push(`자료형: id ${p.id} ${k} = ${JSON.stringify(v)} (${type} 이어야 함)`);
      else if (ALLOWED[k] && !ALLOWED[k].includes(v)) warn.push(`허용값 밖: id ${p.id} ${k} = "${v}" (${ALLOWED[k].join('·')} 중 하나)`);
      else if ((k === 'openTime' || k === 'closeTime') && !/^\d{2}:\d{2}$/.test(v)) warn.push(`시간 형식: id ${p.id} ${k} = "${v}" (HH:MM)`);
      else if (k === 'lat' && (v < 33 || v > 39)) warn.push(`좌표 범위: id ${p.id} lat = ${v} (위도 33~39)`);
      else if (k === 'lng' && (v < 124 || v > 132)) warn.push(`좌표 범위: id ${p.id} lng = ${v} (경도 124~132)`);
    });
  });
  const valid = data.filter(p => {
    const miss = REQUIRED.filter(k => p[k] === null || p[k] === undefined || p[k] === '');
    if (miss.length) warn.push(`필수 필드 누락: id ${p.id ?? '(없음)'} ${miss.join('·')} → 화면에서 제외`);
    return !miss.length;
  });
  // 출처 플래그(meta) 점검: 항목 출처별 건수, 플래그 누락·허용값 밖·실제/더미 중복
  const bySource = {};
  data.forEach(p => {
    const m = p.meta;
    if (!m) { warn.push(`출처 플래그 없음: id ${p.id} → 화면에서 '저장 JSON'으로 간주`); return; }
    bySource[m.source] = (bySource[m.source] || 0) + 1;
    if (!SOURCE_LABEL[m.source]) warn.push(`출처 허용값 밖: id ${p.id} meta.source = "${m.source}" (json·api 중 하나)`);
    if (m.source === 'api' && !(m.api || []).length) warn.push(`API 필드 없음: id ${p.id} meta.source = "api"인데 meta.api가 비어 있음`);
    const both = (m.real || []).filter(k => (m.dummy || []).includes(k));
    if (both.length) warn.push(`실제·더미 중복: id ${p.id} ${both.join('·')}`);
  });
  console.log('항목 출처:', bySource);
  if (data[0]?.meta) console.log('첫 번째 항목 필드 유형:', { 실제: data[0].meta.real, 더미: data[0].meta.dummy, API: data[0].meta.api || [] });
  console.log('빈 값(null) 수:', nulls);
  if (warn.length) warn.forEach(w => console.warn(w)); else console.log('경고: 없음');
  console.log('화면에 표시할 건수:', valid.length);
  console.groupEnd();
  return valid;
}
let dataSource = DATA_URL;
function loadData() {
  const backup = Array.isArray(window.KAGONG_ITEMS) ? window.KAGONG_ITEMS : null;
  if (location.protocol === 'file:' && backup) { dataSource = ROOT + 'data/items.js (file:// 실행 — items.json 수정은 반영되지 않음)'; return Promise.resolve(backup); }
  return fetch(DATA_URL)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });  // GitHub Pages에서 불러오기에 실패하면 showLoadError()가 오류 안내를 표시
}
loadData()
  .then(data => {
    places = checkData(data, dataSource);
    if (page === 'home') setupHome();
    fillAreaSelect();
    setupEvents();
    setupWeekBanner();
    const restoring = has(10) && (page === 'list' || page === 'empty') && read('restore', false);
    if (restoring) shownCount = read('return', {}).shown || PAGE_SIZE;
    render();
    if (restoring) { write('restore', false); requestAnimationFrame(() => window.scrollTo(0, read('return', {}).scroll || 0)); }
    renderCompareBar();
    markWeek();
    new MutationObserver(() => markWeek()).observe(document.body, { childList: true, subtree: true });
  })
  .catch(showLoadError);
