'use strict';
// 실제 매장 정보가 아닌 와이어프레임 구현용 예시 데이터입니다.
const places = [
 {id:1,name:'논스탑 스터디바',area:'성수동',walk:6,outlet:true,quiet:true,nolimit:false,wifi:true,group:false,open:'00:00',close:'24:00',address:'성동구 성수이로 00',seats:'1인석',description:'혼자 집중하기 좋은 작업 공간입니다. 이용 시간과 요금은 방문 전에 확인해 주세요.'},
 {id:2,name:'라온커피',area:'성수동',walk:9,outlet:true,quiet:true,nolimit:true,wifi:true,group:true,open:'09:00',close:'23:00',address:'성동구 연무장길 00',seats:'1인석 · 단체석',description:'좌석 대부분에 콘센트가 있고 조용하게 작업할 수 있습니다. 오래 머물며 과제하기 좋은 공간입니다.'},
 {id:3,name:'어반플랜트',area:'성수동',walk:12,outlet:true,quiet:true,nolimit:false,wifi:true,group:true,open:'10:00',close:'22:00',address:'성동구 왕십리로 00',seats:'1인석 · 단체석',description:'식물이 있는 넓은 공간입니다. 이용 시간은 3시간으로 제한됩니다.'},
 {id:4,name:'페이지 커피',area:'건대입구',walk:5,outlet:true,quiet:true,nolimit:true,wifi:true,group:false,open:'10:00',close:'22:00',address:'광진구 능동로 00',seats:'1인석',description:'책을 읽거나 개인 작업을 하기 좋은 공간입니다.'},
 {id:5,name:'모임 테이블',area:'건대입구',walk:8,outlet:true,quiet:false,nolimit:true,wifi:true,group:true,open:'11:00',close:'23:00',address:'광진구 아차산로 00',seats:'단체석',description:'팀 과제와 대화에 적합한 단체 테이블이 있습니다.'},
 {id:6,name:'왕십리 작은서재',area:'왕십리',walk:4,outlet:false,quiet:true,nolimit:true,wifi:true,group:false,open:'09:00',close:'21:00',address:'성동구 왕십리로 00',seats:'1인석',description:'조용히 읽고 공부하기 좋은 작은 공간입니다.'}
];
const $ = s => document.querySelector(s);
const page=document.body.dataset.page, params=new URLSearchParams(location.search);
function read(key,fallback){try{return JSON.parse(localStorage.getItem('kagong-pages-'+key))??fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem('kagong-pages-'+key,JSON.stringify(value));}catch{notify('이 브라우저에서는 저장 기능을 사용할 수 없습니다.');}}
function ids(key){const v=read(key,[]);return Array.isArray(v)?v.filter(x=>places.some(p=>p.id===x)):[];}
let state=read('filters',{area:'전체',search:'',filters:[],sort:'late'});
if(!state || !Array.isArray(state.filters))state={area:'전체',search:'',filters:[],sort:'late'};
if(params.has('area'))state.area=params.get('area');
if(page==='empty'&&!params.has('state'))state={area:'성수동',search:'논스탑',filters:['outlet','quiet','nolimit'],sort:'late'};
function persist(){write('filters',state);}
function notify(text){const t=$('#toast');t.replaceChildren(document.createTextNode(text+' '));const a=document.createElement('a');a.href='my.html';a.textContent='보기';t.append(a);t.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.hidden=true,3200);}
function badges(p){return `<div class="badges"><span class="badge">${p.outlet?'콘센트':'콘센트 없음'}</span><span class="badge">${p.quiet?'조용함':'대화 가능'}</span><span class="badge">${p.close==='24:00'?'24시':p.close+'까지'}</span></div>`;}
function card(p){const on=ids('favorites').includes(p.id);return `<article class="card"><a class="card-link" href="detail.html?id=${p.id}&from=${page}"><div class="thumb" aria-hidden="true"></div><div><h2>${p.name}</h2><p>${p.area} · 도보 ${p.walk}분</p>${badges(p)}</div></a><button class="star" data-save="${p.id}" aria-label="${p.name} 즐겨찾기" aria-pressed="${on}">${on?'★':'☆'}</button></article>`;}
function toggle(id){let a=ids('favorites');const on=a.includes(id);a=on?a.filter(x=>x!==id):[id,...a];write('favorites',a);notify(places.find(p=>p.id===id).name+(on?' 저장을 해제했습니다':'를 즐겨찾기에 저장했습니다'));render();}
function results(filters=state.filters){const q=state.search.replace(/\s/g,'').toLowerCase();return places.filter(p=>(state.area==='전체'||p.area===state.area)&&(!q||(p.name+p.area).replace(/\s/g,'').toLowerCase().includes(q))&&filters.every(f=>p[f]));}
function empty(title,text,action){return `<div class="empty"><div class="state-icon" aria-hidden="true">⌕</div><h2>${title}</h2><p>${text}</p>${action}</div>`;}
function renderList(){
 $('#area-title').textContent=state.area==='전체'?'전체 공간':state.area;$('#area').value=state.area;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',state.filters.includes(b.dataset.filter)));
 if(params.get('state')==='error'){$('#error').hidden=false;$('#cards').hidden=true;$('#count').textContent='공간 정보 불러오기 실패';return;}
 let arr=results();arr.sort(state.sort==='name'?(a,b)=>a.name.localeCompare(b.name,'ko'):state.sort==='walk'?(a,b)=>a.walk-b.walk:(a,b)=>b.close.localeCompare(a.close));
 $('#count').textContent=`조건 ${state.filters.length}개 적용 · ${arr.length}곳`;
 if(arr.length){$('#cards').innerHTML=arr.map(card).join('');return;}
 const labels={outlet:'콘센트',quiet:'조용함',nolimit:'시간제한 없음',wifi:'와이파이',group:'단체석'};
 const removable=[...state.filters].reverse().find(f=>results(state.filters.filter(x=>x!==f)).length);
 $('#cards').innerHTML=empty('조건에 맞는 공간이 없습니다',removable?`${labels[removable]}을 해제하면 ${results(state.filters.filter(x=>x!==removable)).length}곳을 볼 수 있습니다.`:'검색어나 지역, 조건을 조금 넓혀보세요.',`<button class="primary" id="relax">${removable?labels[removable]+' 해제':'검색 · 조건 전체 해제'}</button>`);
 $('#relax').onclick=()=>{if(removable)state.filters=state.filters.filter(x=>x!==removable);else{state.search='';state.filters=[];state.area='전체';$('#search').value='';}persist();renderList();};
}
let myTab=params.get('tab')==='recent'?'recent':'favorites';
function renderMy(){const fav=ids('favorites'),recent=ids('recent');$('#fav-tab').textContent=`즐겨찾기 ${fav.length}`;$('#fav-tab').setAttribute('aria-selected',myTab==='favorites');$('#recent-tab').setAttribute('aria-selected',myTab==='recent');$('#my-cards').setAttribute('aria-labelledby',myTab==='recent'?'recent-tab':'fav-tab');const arr=(myTab==='recent'?recent:fav).map(id=>places.find(p=>p.id===id));$('#my-cards').innerHTML=arr.length?arr.map(card).join(''):empty(myTab==='recent'?'최근 본 공간이 없습니다':'저장한 공간이 없습니다','마음에 드는 곳을 저장하면 여기에서 다시 볼 수 있습니다.','<a class="primary" href="list.html">공간 둘러보기</a>');}
function renderDetail(){const p=places.find(p=>p.id===Number(params.get('id')||2));if(!p){$('#detail').innerHTML=empty('공간을 찾을 수 없습니다','다른 공간을 둘러보세요.','<a class="primary" href="list.html">공간 둘러보기</a>');return;}const on=ids('favorites').includes(p.id);const rows=a=>'<dl>'+a.map(([k,v])=>`<div class="specrow"><dt>${k}</dt><dd>${v}</dd></div>`).join('')+'</dl>';$('#detail').innerHTML=`<p class="eyebrow">${p.area} · 도보 ${p.walk}분</p><h1>${p.name}</h1><div class="hero-image" role="img" aria-label="대표 이미지 자리">대표 이미지</div><section><h2>체류 조건</h2>${rows([['콘센트',p.outlet?'좌석 대부분':'없음'],['소음',p.quiet?'조용함':'대화 가능'],['시간제한',p.nolimit?'없음':'3시간'],['영업시간',p.open+' – '+p.close]])}</section><section><h2>공간 정보</h2>${rows([['주소',p.address],['좌석',p.seats],['와이파이',p.wifi?'있음':'없음']])}<p class="description">${p.description}</p><p class="muted" style="font-size:11px">와이어프레임 구현용 예시 공간 정보입니다.</p></section><div class="save-bar"><button class="primary" data-save="${p.id}" aria-pressed="${on}">${on?'★ 저장됨 · 해제하기':'☆ 즐겨찾기에 저장'}</button></div>`;}
function render(){if(page==='list'||page==='empty')renderList();if(page==='my')renderMy();if(page==='detail')renderDetail();}
document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(page==='home'?'home':page==='my'?'my':'explore'))a.setAttribute('aria-current','page');});
document.addEventListener('click',e=>{const b=e.target.closest('[data-save]');if(b)toggle(Number(b.dataset.save));const link=e.target.closest('.card-link');if(link){write('return',{url:location.pathname.split('/').pop()+location.search,scroll:window.scrollY});}});
if(page==='home'){
 document.querySelectorAll('[data-home-area]').forEach(b=>b.onclick=()=>{state.area=b.dataset.homeArea;persist();document.querySelectorAll('[data-home-area]').forEach(x=>x.setAttribute('aria-pressed',x===b));});
 $('#area-toggle').onclick=()=>{const open=$('#all-areas').hidden;$('#all-areas').hidden=!open;$('#area-toggle').setAttribute('aria-expanded',open);$('#area-toggle').setAttribute('aria-label',open?'전체 지역 접기':'전체 지역 펼치기');$('#area-toggle').textContent=open?'−':'+';};
 const recentIds=ids('recent').slice(0,3);
 const arr=recentIds.length?recentIds.map(id=>places.find(p=>p.id===id)):places.slice(0,3);
 $('#recent-section').hidden=false;
 $('#recent').classList.remove('is-empty');
 $('#recent').innerHTML=arr.map(p=>`<a href="detail.html?id=${p.id}&from=home"><div class="thumb" aria-hidden="true"></div><h3>${p.name}</h3><p class="recent-area">${p.area}</p></a>`).join('');
 if(!recentIds.length){const note=document.createElement('p');note.className='recent-sample-note';note.textContent='방문 이력이 없어 샘플 공간을 표시합니다.';$('#recent').after(note);}
}
if(page==='list'||page==='empty'){
 $('.more-filters').onclick=()=>{const open=$('#extra-filters').hidden;$('#extra-filters').hidden=!open;$('.more-filters').setAttribute('aria-expanded',open);$('.more-filters').textContent=open?'조건 접기':'조건 더보기';};
 $('#search').value=state.search;if($('#sort'))$('#sort').value=state.sort;
 $('#search').oninput=e=>{state.search=e.target.value;persist();renderList();};$('#area').onchange=e=>{state.area=e.target.value;persist();renderList();};
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{const f=b.dataset.filter;state.filters=state.filters.includes(f)?state.filters.filter(x=>x!==f):[...state.filters,f];persist();renderList();});
 $('#reset').onclick=()=>{state.filters=[];state.search='';$('#search').value='';persist();renderList();};if($('#sort'))$('#sort').onchange=e=>{state.sort=e.target.value;persist();renderList();};if($('#retry'))$('#retry').onclick=()=>location.href='list.html';persist();
}
if(page==='my'){$('#fav-tab').onclick=()=>{myTab='favorites';renderMy();};$('#recent-tab').onclick=()=>{myTab='recent';renderMy();};}
if(page==='detail'){const id=Number(params.get('id')||2);if(places.some(p=>p.id===id))write('recent',[id,...ids('recent').filter(x=>x!==id)].slice(0,10));const from=params.get('from');const back=read('return',{});$('#back').href=from==='my'?'my.html':from==='home'?'index.html':from==='empty'?'empty.html':back.url?.startsWith('list.html')?back.url:'list.html';$('#back').onclick=()=>write('restore',true);}
render();
if((page==='list'||page==='empty')&&read('restore',false)){write('restore',false);requestAnimationFrame(()=>window.scrollTo(0,read('return',{}).scroll||0));}
