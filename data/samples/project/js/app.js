'use strict';
/* =========================================================
   카공 공간 조건 탐색 서비스 — js/app.js (6주차 버전)
   - 5주차: 코드 안의 배열(places)로 화면·상호작용 구현
   - 6주차: 서울시 휴게음식점 인허가 정보로 만든 data/items.json(381건)을 불러와 사용
            필드명은 6주차 데이터 명세서 기준(hasOutlet·noiseLevel·seatType·hasTimeLimit·hasWifi·openTime·closeTime)
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

// 5주차 필터 버튼(data-filter) 값 → 6주차 필드 조건 대응표
const FILTER_RULES = {
  outlet: p => p.hasOutlet === true,
  quiet: p => p.noiseLevel === 'quiet',
  nolimit: p => p.hasTimeLimit === false,
  wifi: p => p.hasWifi === true,
  group: p => p.seatType === 'group'
};
const FILTER_LABELS = { outlet: '콘센트', quiet: '조용함', nolimit: '시간제한 없음', wifi: '와이파이', group: '단체석' };

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
  if (p.closeTime) list.push(p.closeTime === '24:00' ? '24시' : p.closeTime + '까지');
  if (!list.length) list.push('이용 조건 조사 전');
  return `<div class="badges">${list.map(t => `<span class="badge">${esc(t)}</span>`).join('')}</div>`;
}
function card(p) {
  const on = ids('favorites').includes(p.id);
  return `<article class="card" data-id="${p.id}"><a class="card-link" href="${PAGES}detail.html?id=${p.id}&from=${page}"><div class="thumb" aria-hidden="true"></div><div><h2>${esc(p.name)}</h2><p>${esc(p.area)}</p>${badges(p)}</div></a><button class="star" data-save="${p.id}" aria-label="${esc(p.name)} 즐겨찾기" aria-pressed="${on}">${on ? '★' : '☆'}</button></article>`;
}
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
function renderList() {
  $('#area-title').textContent = state.area === '전체' ? '전체 공간' : state.area; $('#area').value = state.area;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', state.filters.includes(b.dataset.filter)));
  if (params.get('state') === 'error') { $('#error').hidden = false; $('#cards').hidden = true; $('#count').textContent = '공간 정보 불러오기 실패'; return; }
  const arr = results();
  arr.sort(state.sort === 'name'
    ? (a, b) => a.name.localeCompare(b.name, 'ko')
    : (a, b) => (b.closeTime || '').localeCompare(a.closeTime || '') || a.name.localeCompare(b.name, 'ko')); // 마감 시각이 없으면 뒤로
  $('#count').textContent = `조건 ${state.filters.length}개 적용 · ${arr.length}곳`;
  if (arr.length) { $('#cards').innerHTML = arr.map(card).join(''); return; }
  const removable = [...state.filters].reverse().find(f => results(state.filters.filter(x => x !== f)).length);
  $('#cards').innerHTML = empty('조건에 맞는 공간이 없습니다',
    removable ? `${FILTER_LABELS[removable]}을 해제하면 ${results(state.filters.filter(x => x !== removable)).length}곳을 볼 수 있습니다.` : '검색어나 지역, 조건을 조금 넓혀보세요.',
    `<button class="primary" id="relax">${removable ? FILTER_LABELS[removable] + ' 해제' : '검색 · 조건 전체 해제'}</button>`);
  $('#relax').onclick = () => { if (removable) state.filters = state.filters.filter(x => x !== removable); else { state.search = ''; state.filters = []; state.area = '전체'; $('#search').value = ''; } persist(); renderList(); };
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
function renderDetail() {
  const p = findPlace(Number(params.get('id')) || places[0]?.id);
  if (!p) { $('#detail').innerHTML = empty('공간을 찾을 수 없습니다', '다른 공간을 둘러보세요.', `<a class="primary" href="${PAGES}list.html">공간 둘러보기</a>`); return; }
  const on = ids('favorites').includes(p.id);
  const rows = a => '<dl>' + a.map(([k, v]) => `<div class="specrow"><dt>${k}</dt><dd>${v}</dd></div>`).join('') + '</dl>';
  const hours = p.openTime && p.closeTime ? `${esc(p.openTime)} – ${esc(p.closeTime)}` : '정보 없음';
  $('#detail').innerHTML = `<p class="eyebrow">${esc(p.area)}</p><h1>${esc(p.name)}</h1><div class="hero-image" role="img" aria-label="대표 이미지 자리">대표 이미지</div>
    <section><h2>체류 조건</h2>${rows([['콘센트', yesNo(p.hasOutlet)], ['소음', info(p.noiseLevel, NOISE_LABEL[p.noiseLevel])], ['시간제한', yesNo(p.hasTimeLimit)], ['영업시간', hours]])}</section>
    <section><h2>공간 정보</h2>${rows([['주소', info(p.address)], ['좌석', info(p.seatType, SEAT_LABEL[p.seatType])], ['와이파이', yesNo(p.hasWifi)]])}${p.description ? `<p class="description">${esc(p.description)}</p>` : ''}
    <p class="muted" style="font-size:11px">기본 정보 출처: 서울 열린데이터광장 「서울시 휴게음식점 인허가 정보」(공공누리 1유형). 이용 조건·영업시간·설명은 실습용 임의 데이터입니다.</p></section>
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
  if (!recentIds.length) { const note = document.createElement('p'); note.className = 'recent-sample-note'; note.textContent = '방문 이력이 없어 샘플 공간을 표시합니다.'; $('#recent').after(note); }
}

/* ---------- 이벤트 연결 ---------- */
function setupEvents() {
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === (page === 'home' ? 'home' : page === 'my' ? 'my' : 'explore')) a.setAttribute('aria-current', 'page'); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-save]'); if (b) toggle(Number(b.dataset.save));
    const link = e.target.closest('.card-link'); if (link) write('return', { url: location.pathname.split('/').pop() + location.search, scroll: window.scrollY });
  });
  if (page === 'list' || page === 'empty') {
    $('.more-filters').onclick = () => { const open = $('#extra-filters').hidden; $('#extra-filters').hidden = !open; $('.more-filters').setAttribute('aria-expanded', open); $('.more-filters').textContent = open ? '조건 접기' : '조건 더보기'; };
    $('#search').value = state.search; if ($('#sort')) $('#sort').value = state.sort;
    $('#search').oninput = e => { state.search = e.target.value; persist(); renderList(); };
    $('#area').onchange = e => { state.area = e.target.value; persist(); renderList(); };
    document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { const f = b.dataset.filter; state.filters = state.filters.includes(f) ? state.filters.filter(x => x !== f) : [...state.filters, f]; persist(); renderList(); });
    $('#reset').onclick = () => { state.filters = []; state.search = ''; $('#search').value = ''; persist(); renderList(); };
    if ($('#sort')) $('#sort').onchange = e => { state.sort = e.target.value; persist(); renderList(); };
    if ($('#retry')) $('#retry').onclick = () => location.href = PAGES + 'list.html';
    persist();
  }
  if (page === 'my') { $('#fav-tab').onclick = () => { myTab = 'favorites'; renderMy(); }; $('#recent-tab').onclick = () => { myTab = 'recent'; renderMy(); }; }
  if (page === 'detail') {
    const id = Number(params.get('id')) || places[0]?.id;
    if (places.some(p => p.id === id)) write('recent', [id, ...ids('recent').filter(x => x !== id)].slice(0, 10));
    const from = params.get('from'); const back = read('return', {});
    $('#back').href = from === 'my' ? 'my.html' : from === 'home' ? HOME : from === 'empty' ? 'empty.html' : back.url?.startsWith('list.html') ? back.url : 'list.html';
    $('#back').onclick = () => write('restore', true);
  }
}

/* ---------- 데이터 불러오기 실패 표시 ---------- */
function showLoadError(error) {
  console.error('[데이터 불러오기 실패]', DATA_URL, error);
  const hint = location.protocol === 'file:' ? '파일을 더블클릭해 열면 JSON을 불러올 수 없습니다. Live Server로 열어 주세요.' : 'data/items.json 경로와 파일명을 확인해 주세요.';
  const box = `<div class="empty"><div class="state-icon" aria-hidden="true">!</div><h2>공간 정보를 불러오지 못했습니다</h2><p>${hint}</p><a class="primary" href="">다시 시도</a></div>`;
  if ($('#count')) $('#count').textContent = '공간 정보 불러오기 실패';
  const target = $('#cards') || $('#my-cards') || $('#detail') || $('#recent');
  if (target) target.innerHTML = box;
}

/* ---------- 시작: JSON을 불러온 뒤 화면을 그림 ---------- */
if ($('#count')) $('#count').textContent = '공간 정보를 불러오는 중';
// data/items.json을 fetch로 불러오고, 파일을 직접 연 경우(file://)처럼 fetch가 막히면 같은 내용의 data/items.js를 사용
function loadData() {
  const backup = Array.isArray(window.KAGONG_ITEMS) ? window.KAGONG_ITEMS : null;
  if (location.protocol === 'file:' && backup) return Promise.resolve(backup);
  return fetch(DATA_URL)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .catch(error => { if (backup) { console.warn('[items.json 불러오기 실패 → items.js 사용]', error); return backup; } throw error; });
}
loadData()
  .then(data => {
    places = Array.isArray(data) ? data : [];
    console.log('[데이터 확인]', DATA_URL, '건수:', places.length);
    if (page === 'home') setupHome();
    fillAreaSelect();
    setupEvents();
    render();
    if ((page === 'list' || page === 'empty') && read('restore', false)) { write('restore', false); requestAnimationFrame(() => window.scrollTo(0, read('return', {}).scroll || 0)); }
  })
  .catch(showLoadError);
