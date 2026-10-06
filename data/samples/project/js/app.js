'use strict';
/* =========================================================
   카공 공간 조건 탐색 서비스 — js/app.js (6주차 버전)
   - 5주차: 코드 안의 배열(places)로 화면·상호작용 구현
   - 6주차: 서울시 휴게음식점 인허가 정보로 만든 data/items.json(380건)을 불러와 사용
            필드명은 6주차 데이터 명세서 기준(hasOutlet·noiseLevel·seatType·hasTimeLimit·hasWifi·openTime·closeTime 등)
   - 7주차: 불러온 데이터를 Console에서 점검(checkData)하고, 화면을 보며 JSON을 수정
   ========================================================= */

const $ = s => document.querySelector(s);
const page = document.body.dataset.page, params = new URLSearchParams(location.search);

// 홈(index.html)은 project 최상위, 나머지 화면은 pages/ 폴더에 있으므로 경로 기준을 페이지 위치에 맞춤
const ROOT = page === 'home' ? './' : '../';
const PAGES = page === 'home' ? './pages/' : './';
const HOME = ROOT + 'index.html';
const DATA_URL = ROOT + 'data/items.json';

// 기본 데이터(JSON에서 읽은 원본 배열)
let places = [];

// 6주차 허용값 → 화면 표시 문구
const NOISE_LABEL = { quiet: '조용함', normal: '보통', talkable: '대화 가능' };
const SEAT_LABEL = { single: '1인석 위주', group: '단체석 위주' };

// 신규 입점 기준일: 오늘로부터 1년 전(YYYY-MM-DD)
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
  cheap: p => typeof p.avgPrice === 'number' && p.avgPrice <= 5000 // 1인당 평균 5천원 이하
};
const FILTER_LABELS = { outlet: '콘센트', quiet: '조용함', nolimit: '시간제한 없음', wifi: '와이파이', group: '단체석', single: '1인석', talkable: '대화 가능', night: '밤 11시 이후', early: '오전 8시 이전', new: '신규 입점', studyroom: '스터디룸', parking: '주차 가능', pet: '반려동물 동반', open24: '24시간', cheap: '5천원 이하' };

/* ---------- 저장(LocalStorage)과 공통 함수 ---------- */
function read(key, fallback) { try { return JSON.parse(localStorage.getItem('kagong-pages-' + key)) ?? fallback; } catch { return fallback; } }
function write(key, value) { try { localStorage.setItem('kagong-pages-' + key, JSON.stringify(value)); } catch { notify('이 브라우저에서는 저장 기능을 사용할 수 없습니다.'); } }
function ids(key) { const v = read(key, []); return Array.isArray(v) ? v.filter(x => places.some(p => p.id === x)) : []; }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])); }
const findPlace = id => places.find(p => p.id === id);

let state = read('filters', { area: '전체', search: '', filters: [], sort: 'late' });
if (!state || !Array.isArray(state.filters)) state = { area: '전체', search: '', filters: [], sort: 'late' };
if (state.sort === 'walk') state.sort = 'late'; // 거리 필드가 없어 '가까운 순' 정렬 제외
if (params.has('area')) state.area = params.get('area');
if (['popular', 'new'].includes(params.get('sort'))) { state.sort = params.get('sort'); state.area = params.get('area') || '전체'; }
// 결과 없음 화면: 실제 데이터에서 0곳이 되는 조건(미근동 + 콘센트·조용함·시간제한 없음)
if (page === 'empty' && !params.has('state')) state = { area: '미근동', search: '', filters: ['outlet', 'quiet', 'nolimit'], sort: 'late' };
function persist() { write('filters', state); }

function notify(text) {
  const t = $('#toast'); t.replaceChildren(document.createTextNode(text + ' '));
  const a = document.createElement('a'); a.href = PAGES + 'my.html'; a.textContent = '보기'; t.append(a);
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
  return `<div class="badges">${list.map(t => `<span class="badge">${esc(t)}</span>`).join('')}</div>`;
}
function card(p) {
  const on = ids('favorites').includes(p.id);
  return `<article class="card" data-id="${p.id}"><a class="card-link" href="${PAGES}detail.html?id=${p.id}&from=${page}"><div class="thumb" aria-hidden="true"></div><div><h2>${esc(p.name)}</h2><p>${esc(p.area)}</p>${badges(p)}</div></a><button class="star" data-save="${p.id}" aria-label="${esc(p.name)} 즐겨찾기" aria-pressed="${on}">${on ? '★' : '☆'}</button></article>`;
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
  sel.innerHTML = ['전체', ...areaList()].map(a => `<option>${esc(a)}</option>`).join('');
  if (![...sel.options].some(o => o.value === state.area)) state.area = '전체';
}
// 정렬 기준: 늦게까지 여는 순(마감 시각이 없으면 뒤로)·이름순·인기순(popularity)·신규 입점순(openedAt)
const SORTERS = {
  late: (a, b) => (b.closeTime || '').localeCompare(a.closeTime || '') || a.name.localeCompare(b.name, 'ko'),
  name: (a, b) => a.name.localeCompare(b.name, 'ko'),
  popular: (a, b) => (b.popularity ?? -1) - (a.popularity ?? -1),
  new: (a, b) => (b.openedAt || '').localeCompare(a.openedAt || '')
};
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
const CORE_FILTERS = ['outlet', 'quiet', 'nolimit'];
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
}
// resetCount: 조건(지역·검색·필터·정렬)이 바뀌면 다시 30곳부터 보여줌
function renderList(resetCount = false) {
  if (resetCount) shownCount = PAGE_SIZE;
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
let myTab = params.get('tab') === 'recent' ? 'recent' : 'favorites';
function renderMy() {
  const fav = ids('favorites'), recent = ids('recent');
  $('#fav-tab').textContent = `즐겨찾기 ${fav.length}`;
  $('#fav-tab').setAttribute('aria-selected', myTab === 'favorites'); $('#recent-tab').setAttribute('aria-selected', myTab === 'recent');
  $('#my-cards').setAttribute('aria-labelledby', myTab === 'recent' ? 'recent-tab' : 'fav-tab');
  const arr = (myTab === 'recent' ? recent : fav).map(findPlace);
  $('#my-cards').innerHTML = arr.length ? arr.map(card).join('') : empty(myTab === 'recent' ? '최근 본 공간이 없습니다' : '저장한 공간이 없습니다', '마음에 드는 곳을 저장하면 여기에서 다시 볼 수 있습니다.', `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`);
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
  const tile = x => `<a href="${PAGES}detail.html?id=${x.id}&from=detail"><div class="thumb" aria-hidden="true"></div><h3>${esc(x.name)}</h3><p class="recent-area">${esc(x.area)}</p></a>`;
  const block = (title, sub, list, more) => `<section class="related"><div class="section-heading"><h2>${title}</h2>${more}</div>${sub ? `<p class="muted" style="font-size:12px;margin:4px 0 0">${sub}</p>` : ''}${list.length ? `<div class="recent-grid">${list.map(tile).join('')}</div>` : '<p class="muted" style="font-size:12px">표시할 공간이 없습니다.</p>'}</section>`;
  return block(`${esc(p.area)}의 다른 공간`, '', sameArea, `<a href="${PAGES}list.html?area=${encodeURIComponent(p.area)}">전체보기 →</a>`)
    + block('비슷한 조건의 공간', condText ? `${esc(condText)} 조건이 같은 공간` : '이 공간은 이용 조건 정보가 없어 비교할 수 없습니다.', sameCond, '');
}
// 위치 지도: 인허가 정보의 좌표(lat·lng)로 OpenStreetMap을 표시하고, 카카오맵·네이버 지도 바로가기 제공(API 키 불필요)
function mapSection(p) {
  if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return '<section><h2>위치</h2><p class="muted" style="font-size:12px">위치 정보 없음</p></section>';
  const d = 0.004, bbox = [p.lng - d, p.lat - d * 0.6, p.lng + d, p.lat + d * 0.6].map(n => n.toFixed(6)).join(',');
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat},${p.lng}`;
  const kakao = `https://map.kakao.com/link/map/${encodeURIComponent(p.name)},${p.lat},${p.lng}`;
  const naver = `https://map.naver.com/p/search/${encodeURIComponent(p.address || p.name)}`;
  return `<section><h2>위치</h2><div class="map"><iframe title="${esc(p.name)} 위치 지도" src="${osm}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    <div class="map-links"><a href="${kakao}" target="_blank" rel="noopener">카카오맵에서 보기 ↗</a><a href="${naver}" target="_blank" rel="noopener">네이버 지도에서 보기 ↗</a></div></section>`;
}
function renderDetail() {
  const p = findPlace(Number(params.get('id')) || places[0]?.id);
  if (!p) { $('#detail').innerHTML = empty('공간을 찾을 수 없습니다', '다른 공간을 둘러보세요.', `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`); return; }
  const on = ids('favorites').includes(p.id);
  const rows = a => '<dl>' + a.map(([k, v]) => `<div class="specrow"><dt>${k}</dt><dd>${v}</dd></div>`).join('') + '</dl>';
  const hours = p.openTime && p.closeTime ? `${esc(p.openTime)} – ${esc(p.closeTime)}` : '정보 없음';
  $('#detail').innerHTML = `<p class="eyebrow">${esc(p.area)}</p><h1>${esc(p.name)}</h1><div class="hero-image" role="img" aria-label="대표 이미지 자리">대표 이미지</div>
    <section><h2>체류 조건</h2>${rows([['콘센트', yesNo(p.hasOutlet)], ['소음', info(NOISE_LABEL[p.noiseLevel])], ['시간제한', yesNo(p.hasTimeLimit)], ['영업시간', hours]])}</section>
    <section><h2>공간 정보</h2>${rows([['주소', info(p.address)], ['좌석', info(SEAT_LABEL[p.seatType])], ['와이파이', yesNo(p.hasWifi)], ['스터디룸', yesNo(p.hasStudyRoom)], ['주차', yesNo(p.hasParking)], ['반려동물 동반', yesNo(p.isPetFriendly)], ['24시간 운영', yesNo(p.isOpen24h)], ['1인당 평균 가격', typeof p.avgPrice === 'number' ? p.avgPrice.toLocaleString('ko-KR') + '원' : '정보 없음'], ['입점일', info(p.openedAt)]])}${p.description ? `<p class="description">${esc(p.description)}</p>` : ''}
    <p class="muted" style="font-size:11px">기본 정보(공간명·주소·위치·입점일) 출처: 서울 열린데이터광장 「서울시 휴게음식점 인허가 정보」(공공누리 1유형). 이용 조건·영업시간·설명·관심 수·시설·가격은 실습용 임의 데이터입니다.</p></section>
    ${mapSection(p)}
    ${relatedSections(p)}
    <div class="save-bar"><button class="primary" data-save="${p.id}" aria-pressed="${on}">${on ? '★ 저장됨 · 해제하기' : '☆ 즐겨찾기에 저장'}</button></div>`;
}

function render() { if (page === 'list' || page === 'empty') renderList(); if (page === 'my') renderMy(); if (page === 'detail') renderDetail(); }

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
  $('#recent').innerHTML = arr.map(p => `<a href="${PAGES}detail.html?id=${p.id}&from=home"><div class="thumb" aria-hidden="true"></div><h3>${esc(p.name)}</h3><p class="recent-area">${esc(p.area)}</p></a>`).join('');
  // 인기 있는 공간·신규 입점 공간: 각각 6곳
  const tile = (p, sub) => `<a href="${PAGES}detail.html?id=${p.id}&from=home"><div class="thumb" aria-hidden="true"></div><h3>${esc(p.name)}</h3><p class="recent-area">${esc(p.area)} · ${sub}</p></a>`;
  $('#popular').innerHTML = [...places].sort(SORTERS.popular).slice(0, 6).map(p => tile(p, `관심 ${p.popularity ?? 0}`)).join('');
  $('#new-places').innerHTML = [...places].sort(SORTERS.new).slice(0, 6).map(p => tile(p, `${(p.openedAt || '').slice(0, 7).replace('-', '.')} 입점`)).join('');
  if (!recentIds.length) { const note = document.createElement('p'); note.className = 'recent-sample-note'; note.textContent = '방문 이력이 없어 샘플 공간을 표시합니다.'; $('#recent').after(note); }
}

/* ---------- 이벤트 연결 ---------- */
function setupEvents() {
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === (page === 'home' ? 'home' : page === 'my' ? 'my' : 'explore')) a.setAttribute('aria-current', 'page'); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-save]'); if (b) toggle(Number(b.dataset.save));
    const link = e.target.closest('.card-link'); if (link) write('return', { url: location.pathname.split('/').pop() + location.search, scroll: window.scrollY, shown: shownCount });
  });
  if (page === 'list' || page === 'empty') {
    $('.more-filters').onclick = () => { const open = $('#extra-filters').hidden; $('#extra-filters').hidden = !open; $('.more-filters').setAttribute('aria-expanded', open); $('.more-filters').textContent = open ? '−' : '+'; $('.more-filters').setAttribute('aria-label', open ? '조건 접기' : '조건 더보기'); $('.more-filters').title = open ? '조건 접기' : '조건 더보기'; };
    $('#search').value = state.search; if ($('#sort')) $('#sort').value = state.sort;
    $('#search').oninput = e => { state.search = e.target.value; persist(); renderList(true); };
    if ($('#area')) $('#area').onchange = e => { state.area = e.target.value; persist(); renderList(true); };
    document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { const f = b.dataset.filter; state.filters = state.filters.includes(f) ? state.filters.filter(x => x !== f) : [...state.filters, f]; persist(); renderList(true); });
    $('#reset').onclick = () => { state.filters = []; state.search = ''; state.area = '전체'; $('#search').value = ''; persist(); renderList(true); };
    if ($('#sort')) $('#sort').onchange = e => { state.sort = e.target.value; persist(); renderList(true); };
    if ($('#retry')) $('#retry').onclick = () => location.href = PAGES + 'list.html';
    persist();
  }
  if (page === 'my') { $('#fav-tab').onclick = () => { myTab = 'favorites'; renderMy(); }; $('#recent-tab').onclick = () => { myTab = 'recent'; renderMy(); }; }
  if (page === 'detail') {
    const id = Number(params.get('id')) || places[0]?.id;
    if (places.some(p => p.id === id)) write('recent', [id, ...ids('recent').filter(x => x !== id)].slice(0, 10));
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
    const restoring = (page === 'list' || page === 'empty') && read('restore', false);
    if (restoring) shownCount = read('return', {}).shown || PAGE_SIZE;
    render();
    if (restoring) { write('restore', false); requestAnimationFrame(() => window.scrollTo(0, read('return', {}).scroll || 0)); }
  })
  .catch(showLoadError);
