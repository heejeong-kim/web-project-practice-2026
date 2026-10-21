'use strict';
// 7주차 전용: JSON 읽기·반복 렌더링·데이터 점검. 검색·저장·API 요청은 이후 주차.
const page = document.body.dataset.page;
const ROOT = page === 'home' ? './' : '../';
const PAGES = ROOT + 'pages/';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source = p => `<span class="badge">저장 JSON${p.meta?.source === 'api' ? ' · API 연동 예정' : ''}</span>`;
function card(p) {
  return `<article class="card"><a href="${PAGES}detail.html?id=${encodeURIComponent(p.id)}"><div class="thumb" aria-label="이미지 자리"></div><h3>${esc(p.name)}</h3></a><p>${esc(p.area)}</p>${source(p)}<p>콘센트 ${p.hasOutlet == null ? '정보 없음' : p.hasOutlet ? '있음' : '없음'} · ${esc(p.noiseLevel || '정보 없음')}</p><span class="badge">이용 조건: 실습 더미</span></article>`;
}
function field(p, key, label) {
  const type = p.meta?.real?.includes(key) ? '실제' : p.meta?.dummy?.includes(key) ? '더미' : '확인 필요';
  return `<dt>${label} <span class="badge">${type}</span></dt><dd>${esc(p[key] ?? '정보 없음')}</dd>`;
}
function checkData(data) {
  const ids = data.map(p => p.id);
  console.info('[데이터 점검]', {count: data.length, duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i), missing: data.filter(p => p.id == null || !p.name), source: 'data/items.json 저장 파일. API 필드는 연동 예정, 실행 중 API 요청 없음'});
}
function render(data) {
  const main = document.querySelector('#content');
  // 버전 설명 패널을 보존하고 데이터 화면만 갱신.
  const view = document.createElement('div'); view.id = 'data-view';
  main.querySelector('#data-view')?.remove();
  main.querySelector('p[role="status"]')?.remove();
  if (page === 'detail') {
    const p = data.find(p => String(p.id) === new URLSearchParams(location.search).get('id'));
    view.innerHTML = p ? `<a href="${PAGES}list.html">‹ 목록</a><h1>${esc(p.name)}</h1><div class="hero"><span>상세 이미지 자리</span></div><h2>데이터·화면 구조 점검</h2>${source(p)}<dl class="fields">${field(p,'name','공간명')}${field(p,'address','주소')}${field(p,'hasOutlet','콘센트')}${field(p,'noiseLevel','소음')}</dl><p class="muted">상세 구조와 ID를 점검합니다. 상세 인터랙션은 10주차에 연결합니다.</p>` : `<h1>공간을 찾을 수 없습니다</h1><a href="${PAGES}list.html">목록으로</a>`;
  } else if (page === 'my') {
    view.innerHTML = `<h1>마이 화면 자리</h1><p>즐겨찾기·최근 본 공간 저장은 11주차에 연결합니다.</p><a href="${PAGES}list.html">공간 둘러보기</a>`;
  } else if (page === 'home') {
    const popular = [...data].sort((a,b) => b.popularity-a.popularity).slice(0,6);
    const newer = [...data].sort((a,b) => String(b.openedAt).localeCompare(String(a.openedAt))).slice(0,6);
    const used = new Set([...popular,...newer].map(p=>p.id));
    const score = p => Number(p.hasOutlet)+Number(p.noiseLevel==='quiet')+Number(!p.hasTimeLimit);
    const recommended = data.filter(p=>!used.has(p.id)).sort((a,b)=>score(b)-score(a)).slice(0,6);
    view.innerHTML = `<h1>작업하기 좋은 공간 찾기</h1><div class="hero"><span>히어로 이미지 자리</span></div><section id="recommend-section"><h2>추천 공간</h2><div id="recommended" class="track" tabindex="0" aria-label="추천 공간 가로 목록">${recommended.map(card).join('')}</div><div class="controls"><button type="button" data-step="-1" aria-label="이전 추천 공간">‹</button><button type="button" data-step="1" aria-label="다음 추천 공간">›</button></div></section><section><h2>인기 공간</h2><div class="cards">${popular.map(card).join('')}</div></section><section><h2>신규 입점 공간</h2><div class="cards">${newer.map(card).join('')}</div></section>`;
  } else {
    view.innerHTML = `<h1>공간 목록</h1><p>${data.length}개 공간</p>${data.length ? `<div class="cards">${data.map(card).join('')}</div>` : '<p>등록된 공간이 없습니다. JSON 배열을 확인하세요.</p>'}`;
  }
  main.append(view);
  view.querySelectorAll('#recommend-section,.badge,.fields').forEach(el => el.classList.add('wk-new'));
  const track = document.querySelector('#recommended');
  const move = n => track?.scrollBy({left:n*track.clientWidth*.7,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  document.querySelectorAll('[data-step]').forEach(b => b.onclick=()=>move(Number(b.dataset.step)));
  track?.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
}
(async () => {
  try {
    let data;
    try { const response=await fetch(ROOT+'data/items.json'); if(!response.ok) throw new Error('JSON 요청 실패'); data=await response.json(); }
    catch(error) { if(location.protocol==='file:' && Array.isArray(window.KAGONG_ITEMS)) data=window.KAGONG_ITEMS; else throw error; }
    if(!Array.isArray(data)) throw new Error('JSON 최상위는 배열이어야 합니다');
    checkData(data); render(data);
  } catch(error) {
    const status=document.querySelector('p[role="status"]');
    if(status) status.textContent='데이터를 불러오지 못했습니다. 파일 경로·JSON 문법·배포 주소를 확인하세요.';
    console.error(error);
  }
})();
