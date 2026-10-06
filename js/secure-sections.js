(() => {
  'use strict';

  const week = Number(new URLSearchParams(window.location.search).get('week'));
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const WEEK5_GATE_KEY = 'web-project-week5-lecture-access';
  const b64 = s => { const bin = atob(s); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i); return out; };

  async function decrypt(password, payload) {
    const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(payload.salt),iterations:payload.iterations,hash:'SHA-256'}, material, {name:'AES-GCM',length:256}, false, ['decrypt']);
    return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(payload.iv)}, key, b64(payload.data)));
  }

  async function sha256Hex(value) {
    const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value)));
    return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function ensureStyles() {
    if (document.querySelector('#secure-section-styles')) return;
    const s = document.createElement('style');
    s.id = 'secure-section-styles';
    s.textContent = `
      .secure-section-placeholder{display:none}
      .secure-section-cta{display:inline-flex;align-items:center;justify-content:center;margin-left:10px;padding:4px 9px;border:1px solid #ff8a3d;border-radius:7px;background:#fff3eb;color:#b95516;font:700 12px/1.2 "IBM Plex Sans KR",sans-serif;vertical-align:middle;cursor:pointer}
      .secure-section-cta:hover{background:#ffe2cf;border-color:#e96f20}
      .secure-section-cta:focus-visible{outline:2px solid #ff8a3d;outline-offset:2px}
      .week5-code-block{margin:20px 0 26px;border:1px solid #202733;border-radius:12px;overflow:hidden;background:#0a0d12;box-shadow:0 8px 24px rgba(15,23,42,.12)}
      .week5-code-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border-bottom:1px solid #252d39;background:#0a0d12}
      .week5-code-lang{color:#aeb8c6;font:700 11px/1.2 "IBM Plex Sans KR",sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .week5-copy-code{border:1px solid #3b4554;border-radius:7px;background:#151b24;color:#fff;padding:5px 9px;font:700 11px/1 "IBM Plex Sans KR",sans-serif;cursor:pointer}
      .week5-copy-code:hover{background:#202938}.week5-copy-code.is-copied{background:#263246}
      .week5-code-block pre{margin:0!important;padding:18px 20px!important;background:#0a0d12!important;color:#fff!important;overflow:auto!important;font-size:13.5px!important;line-height:1.7!important;white-space:pre!important}
      .week5-code-block code{background:transparent!important;color:#fff!important;font-size:13.5px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important}
      .week5-folder-tree{margin:20px 0 26px;border:1px solid #d7dee8;border-left:4px solid #5b78a6;border-radius:10px;overflow:hidden;background:#f7f9fc}
      .week5-folder-toolbar{display:flex;align-items:center;gap:8px;padding:9px 13px;border-bottom:1px solid #dde4ee;background:#eef3f9;color:#40526e;font:800 11px/1.2 "IBM Plex Sans KR",sans-serif;letter-spacing:.08em}
      .week5-folder-tree pre{margin:0!important;padding:18px 20px!important;background:#f7f9fc!important;color:#243247!important;overflow:auto!important;font-size:13.5px!important;line-height:1.75!important;white-space:pre!important}
      .week5-folder-tree code{background:transparent!important;color:#243247!important;font-size:13.5px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important}
      .lecture-content details summary.week5-blue-summary,.lecture-content details summary.week5-blue-summary *{color:#2563eb!important;font-weight:800!important}
      .week5-practice-sample{min-height:620px!important}
      .lecture-content .week5-wireframe-wrap{margin:22px 0 26px}
      .lecture-content .week5-wireframe-frame{display:block;width:100%;height:min(86vh,900px);min-height:680px;border:1px solid #dfe4eb;border-radius:14px;background:#f4f4f2}
      .lecture-content .week5-wireframe-actions{display:flex;justify-content:flex-end;margin-top:10px}
      .lecture-content .week5-wireframe-open{display:inline-flex;align-items:center;min-height:40px;padding:0 13px;border:1px solid #ffb27f;border-radius:9px;background:#fff;color:#b95516!important;text-decoration:none!important;font-size:13px;font-weight:800}
      .lecture-content .week5-wireframe-open:hover{background:#fff3eb;border-color:#ff8a3d}
      .lecture-content .week5-chapter-image{display:block;margin:18px 0 34px;border-radius:18px;overflow:hidden;background:#eef1f5}
      .lecture-content .week5-chapter-image img{display:block;width:100%;height:auto}
      @media(max-width:680px){.lecture-content .week5-chapter-image{margin:14px 0 28px;border-radius:14px}}
    `;
    document.head.appendChild(s);
  }

  async function loadManifest(){const r=await fetch('../data/secure/manifest.json',{cache:'no-store'});if(!r.ok)throw new Error('manifest');return r.json();}
  function findHeadingForPlaceholder(ph){let n=ph.previousElementSibling;while(n){if(/^H[1-6]$/.test(n.tagName))return n;n=n.previousElementSibling;}return null;}

  function enableWeek5Navigation(){
    ['#week-select','#mobile-week-select'].forEach(selector=>{const option=document.querySelector(selector)?.querySelector('option[value="05"]');if(option)option.disabled=false;});
    if(week===6){const prev=document.querySelector('#prev-week');if(prev){prev.href='?week=05';prev.classList.remove('is-disabled');prev.removeAttribute('aria-disabled');prev.removeAttribute('tabindex');}}
    if(week===4){const next=document.querySelector('#next-week');if(next){next.href='?week=05';next.classList.remove('is-disabled');next.removeAttribute('aria-disabled');next.removeAttribute('tabindex');const strong=next.querySelector('strong');if(strong)strong.textContent='5주차 · JavaScript 프로젝트 기초';}}
  }

  function restoreWeek5Header(){if(week!==5)return;const data=window.WEEK_DATA?.find(item=>item.week===5);if(!data)return;document.title=`5주차 · ${data.title} | 웹프로젝트 실습`;const summary=document.querySelector('#lecture-summary');const keywords=document.querySelector('#lecture-keywords');if(summary)summary.textContent=data.summary;if(keywords)keywords.innerHTML=data.keywords.map(keyword=>`<span>${keyword}</span>`).join('');}

  function rebuildToc(){const content=document.querySelector('#lecture-content');const toc=document.querySelector('#toc-list');if(!content||!toc)return;const headings=[...content.querySelectorAll('h1,h2')].filter(heading=>!heading.closest('details'));headings.forEach((heading,index)=>{heading.id=`section-${index+1}`;});toc.innerHTML=headings.map(heading=>`<a href="#${heading.id}"${heading.tagName==='H2'?' class="toc-depth-2"':''}>${heading.textContent}</a>`).join('');}

  function insertWeek5ChapterImages(root=document.querySelector('#lecture-content')) {
    if (week !== 5 || !root) return;
    const images = [
      {prefix:'1.',src:'../asset/5_1.png?v=20260902-1',alt:'1장 와이어프레임을 HTML로 옮기기'},
      {prefix:'2.',src:'../asset/5_2.png?v=20260902-1',alt:'2장 JavaScript와 DOM 연결'},
      {prefix:'3.',src:'../asset/5_3.png?v=20260902-1',alt:'3장 이벤트와 함수'},
      {prefix:'4.',src:'../asset/5_4.png?v=20260902-1',alt:'4장 팀 프로젝트 적용'}
    ];
    const headings = [...root.querySelectorAll('h1')];
    images.forEach(item => {
      const heading = headings.find(h1 => h1.textContent.trim().startsWith(item.prefix));
      if (!heading || heading.nextElementSibling?.classList.contains('week5-chapter-image')) return;
      const figure = document.createElement('figure');
      figure.className = 'week5-chapter-image';
      figure.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="eager">`;
      heading.insertAdjacentElement('afterend', figure);
    });
  }

  // 5주차 1.4 실습(w05-0)의 실습 예시를 인터랙티브 와이어프레임으로 교체
  // - 잠금 해제된 원문 안의 예시 iframe·첨부 블록·링크(예전 5w 샘플 등)를 새 파일로 바꿈
  // - 교체할 예시가 없으면 1.4 내용 맨 아래에 새로 삽입
  function insertWeek5InteractiveWireframe(root){
    if(week!==5||!root)return;
    const target=root.matches?.('[data-secure-content="w05-0"]')?root:root.querySelector?.('[data-secure-content="w05-0"]');
    if(!target)return;
    const src='../data/samples/5week_kagong-pages/index.html?v=20261006-1';
    const title='카공 공간 조건 탐색 서비스 인터랙티브 와이어프레임';
    const makeActions=()=>{const div=document.createElement('div');div.className='week5-wireframe-actions';div.innerHTML=`<a class="week5-wireframe-open" href="${src}" target="_blank" rel="noopener noreferrer">새 창에서 크게 보기</a>`;return div;};
    const makeWrap=()=>{const wrap=document.createElement('div');wrap.className='week5-wireframe-wrap';wrap.innerHTML=`<iframe class="week5-wireframe-frame" src="${src}" title="${title}" loading="lazy"></iframe>`;wrap.appendChild(makeActions());return wrap;};
    // 예시 설명 문구: 예전 5w 샘플 설명을 '4주차 와이어프레임을 HTML로 전환한 결과'로 교체
    target.querySelectorAll('p,li').forEach(node=>{
      const text=node.textContent||'';
      if(!text.includes('5w/index.html')||!text.includes('실행한 결과'))return;
      node.innerHTML='아래 화면은 4주차 로우파이(Lo-fi) 와이어프레임을 실제 HTML·CSS·JavaScript 화면으로 전환한 5주차 실습 샘플(<code class="inline-code">data/samples/5week_kagong-pages/index.html</code>)을 실행한 결과임 — 홈·탐색·상세·마이 화면을 페이지로 나누어 구성했으며 화면 안의 메뉴로 이동하며 확인';
    });
    let replaced=false;
    // 1) 원문에 들어 있던 예시 iframe
    target.querySelectorAll('iframe').forEach(frame=>{
      if(frame.closest('.week5-wireframe-wrap'))return;
      frame.replaceWith(makeWrap());replaced=true;
    });
    // 2) Notion 첨부 블록으로 표시된 예시 파일
    target.querySelectorAll('.notion-embed').forEach(node=>{node.replaceWith(makeWrap());replaced=true;});
    // 3) 예전 샘플(5w 폴더, 와이어프레임 파일)로 연결된 링크
    target.querySelectorAll('a[href]').forEach(link=>{
      const href=link.getAttribute('href')||'';
      if(link.classList.contains('week5-wireframe-open'))return;
      if(/(^|\/)5w\/|wireframe\.html/.test(href)){link.setAttribute('href',src);link.target='_blank';link.rel='noopener noreferrer';replaced=true;}
    });
    if(!replaced&&!target.querySelector('.week5-wireframe-wrap')){
      // 1.4 마지막 콜아웃 아래에 예시 설명과 실행 화면을 함께 삽입
      const caption=document.createElement('p');caption.className='lecture-example';
      caption.innerHTML='<span class="notion-gray">예시) 4주차 로우파이(Lo-fi) 와이어프레임을 HTML·CSS·JavaScript 화면으로 전환한 5주차 실습 샘플</span>';
      // 폴더 구조를 따로 요청하지 않으면 모든 파일이 root에 저장된다는 안내와 실제 샘플 파일 구성
      const note=document.createElement('p');
      note.textContent='별도 디렉토리 구조를 요청하지 않으면(AI 도구에 폴더 구조를 명시하지 않은 경우 포함) 아래 샘플처럼 모든 파일이 폴더 구분 없이 root(최상위)에 저장됨. 2.1.2의 css·js·data·asset 폴더로 나누려면 요청 단계에서 폴더 구조를 함께 명시';
      const tree=document.createElement('div');tree.className='week5-folder-tree';
      tree.innerHTML='<div class="week5-folder-toolbar">📁 FOLDER STRUCTURE</div><pre><code></code></pre>';
      tree.querySelector('code').textContent=['5week_kagong-pages/','├─ style.css','├─ detail.html','├─ empty.html','├─ index.html','├─ list.html','├─ my.html','└─ app.js'].join('\n');
      target.appendChild(caption);target.appendChild(note);target.appendChild(tree);target.appendChild(makeWrap());
    }
  }

  function enhanceWeek5Content(root=document.querySelector('#lecture-content')){
    if(!root)return;
    root.querySelectorAll('pre[data-lang]').forEach(pre=>{
      if(pre.closest('.week5-code-block,.week5-folder-tree'))return;
      const lang=(pre.dataset.lang||'code').trim();
      const text=pre.textContent.replace(/^\n+|\n+$/g,'');
      const isFolder=/^(plain text|text|plaintext)$/i.test(lang) && /[├└│─]|\/$/m.test(text);
      const wrap=document.createElement('div');
      if(isFolder){
        wrap.className='week5-folder-tree';
        wrap.innerHTML=`<div class="week5-folder-toolbar">📁 FOLDER STRUCTURE</div><pre><code></code></pre>`;
        wrap.querySelector('code').textContent=text;
      }else{
        wrap.className='week5-code-block';
        wrap.innerHTML=`<div class="week5-code-toolbar"><span class="week5-code-lang">${lang||'code'}</span><button class="week5-copy-code" type="button">복사</button></div><pre><code></code></pre>`;
        wrap.querySelector('code').textContent=text;
        const button=wrap.querySelector('.week5-copy-code');
        button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);}catch{const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();}button.textContent='복사됨';button.classList.add('is-copied');setTimeout(()=>{button.textContent='복사';button.classList.remove('is-copied');},1400);});
      }
      pre.replaceWith(wrap);
    });
    root.querySelectorAll('details summary').forEach(summary=>{const text=summary.textContent.trim();if(text.startsWith('[참고]')||text.startsWith('[예시]'))summary.classList.add('week5-blue-summary');});
    insertWeek5ChapterImages(document.querySelector('#lecture-content'));
    insertWeek5InteractiveWireframe(root);
  }

  async function renderWeek5Source(){if(week!==5)return;const content=document.querySelector('#lecture-content');if(!content||!window.renderNotionMarkdown)return;const response=await fetch('../data/lectures/week05.md?v=20260902-7',{cache:'no-store'});if(!response.ok)throw new Error('5주차 교안 원문을 불러오지 못했습니다.');content.innerHTML=window.renderNotionMarkdown(await response.text());restoreWeek5Header();enhanceWeek5Content(content);rebuildToc();}

  async function readProtectedMarkdown(password,section){const r=await fetch('../data/secure/'+section.file+'?v=20260902-7',{cache:'no-store'});if(!r.ok)throw new Error('load');return (await decrypt(password,await r.json())).replace(/\\+([\[\]~*`|])/g,'$1');}

  // 현재 주차의 잠금 항목 목록(비밀번호 1회 입력으로 모두 해제할 때 사용)
  let ALL_SECTIONS=[];

  // 잠금 항목 1개를 복호화해 자리표시 위치에 삽입(이미 해제된 항목은 건너뜀)
  async function revealSection(password,section){
    const holder=document.querySelector('[data-secure-section="'+section.id+'"]');
    if(!holder)return;
    const heading=findHeadingForPlaceholder(holder);
    const markdown=await readProtectedMarkdown(password,section);
    const html=window.renderNotionMarkdown(markdown);
    holder.insertAdjacentHTML('afterend','<div class="secure-section-content" data-secure-content="'+section.id+'">'+html+'</div>');
    heading?.querySelector('.secure-section-cta')?.remove();
    holder.remove();
    enhanceWeek5Content(document.querySelector('[data-secure-content="'+section.id+'"]'));
  }

  function showSectionDialog(heading,section){
    if(document.querySelector('[data-secure-dialog]'))return;
    const overlay=document.createElement('div');overlay.dataset.secureDialog='1';overlay.style.cssText='position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.58);backdrop-filter:blur(4px)';const label=heading.textContent.replace('[클릭]','').trim();
    overlay.innerHTML='<form style="box-sizing:border-box;width:min(100%,380px);padding:28px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.3)"><h2 style="margin:0 0 8px;font-size:22px">'+week+'주차 · '+label+'</h2><p style="margin:0 0 18px;color:#667085">실습 비밀번호를 입력하면 이 항목의 숨겨진 내용이 표시됩니다.</p><input type="password" autocomplete="off" aria-label="비밀번호" style="box-sizing:border-box;width:100%;height:46px;padding:0 13px;border:1px solid #cfd5df;border-radius:10px;font-size:16px"><p data-error role="alert" style="display:none;margin:8px 0 0;color:#dc2626;font-size:14px">비밀번호가 올바르지 않습니다.</p><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px"><button type="button" data-cancel style="min-height:42px;padding:0 15px;border:1px solid #d0d5dd;border-radius:9px;background:#fff">취소</button><button type="submit" style="min-height:42px;padding:0 17px;border:0;border-radius:9px;background:#172033;color:#fff;font-weight:700">확인</button></div></form>';
    document.body.appendChild(overlay);const input=overlay.querySelector('input');const err=overlay.querySelector('[data-error]');const close=()=>overlay.remove();overlay.querySelector('[data-cancel]').addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
    overlay.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();err.style.display='none';const password=input.value;try{await revealSection(password,section);overlay.remove();
      // 같은 비밀번호로 이 주차의 나머지 잠금 항목도 한 번에 해제
      for(const other of ALL_SECTIONS){if(other.id===section.id)continue;try{await revealSection(password,other);}catch(_){}}
      rebuildToc();}catch(_){err.style.display='block';input.select();}});input.focus();
  }

  function attachSections(sections){ALL_SECTIONS=sections;sections.forEach(section=>{const ph=document.querySelector('[data-secure-section="'+section.id+'"]');if(!ph||ph.dataset.bound==='1')return;ph.dataset.bound='1';const heading=findHeadingForPlaceholder(ph);if(!heading)return;const btn=document.createElement('button');btn.type='button';btn.className='secure-section-cta';btn.textContent='[클릭]';btn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();showSectionDialog(heading,section);});heading.appendChild(btn);heading.style.cursor='pointer';heading.addEventListener('click',()=>showSectionDialog(heading,section));});}

  async function init(){ensureStyles();enableWeek5Navigation();const manifest=await loadManifest();const sections=(manifest.sections&&manifest.sections[week])||[];if(week===5){await renderWeek5Source();attachSections(sections);return;}attachSections(sections);const content=document.querySelector('#lecture-content');if(content)new MutationObserver(()=>attachSections(sections)).observe(content,{childList:true,subtree:true});}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init().catch(console.error),{once:true});else init().catch(console.error);
})();