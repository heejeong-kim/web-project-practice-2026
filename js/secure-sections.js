(() => {
  'use strict';

  const week = Number(new URLSearchParams(window.location.search).get('week'));
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const WEEK5_PASSWORD_HASH = 'b564d46d60731e7b8a22e912c01957f6c62caf92143683efbf48d5ec2ca89176';
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
  }

  async function renderWeek5Source(){if(week!==5)return;const content=document.querySelector('#lecture-content');if(!content||!window.renderNotionMarkdown)return;const response=await fetch('../data/lectures/week05.md?v=20260902-7',{cache:'no-store'});if(!response.ok)throw new Error('5주차 교안 원문을 불러오지 못했습니다.');content.innerHTML=window.renderNotionMarkdown(await response.text());restoreWeek5Header();enhanceWeek5Content(content);rebuildToc();}

  async function readProtectedMarkdown(password,section){const r=await fetch('../data/secure/'+section.file+'?v=20260902-7',{cache:'no-store'});if(!r.ok)throw new Error('load');return (await decrypt(password,await r.json())).replace(/\\+([\[\]~*`|])/g,'$1');}

  function showSectionDialog(heading,section){
    if(document.querySelector('[data-secure-dialog]'))return;
    const overlay=document.createElement('div');overlay.dataset.secureDialog='1';overlay.style.cssText='position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.58);backdrop-filter:blur(4px)';const label=heading.textContent.replace('[클릭]','').trim();
    overlay.innerHTML='<form style="box-sizing:border-box;width:min(100%,380px);padding:28px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.3)"><h2 style="margin:0 0 8px;font-size:22px">'+week+'주차 · '+label+'</h2><p style="margin:0 0 18px;color:#667085">실습 비밀번호를 입력하면 이 항목의 숨겨진 내용이 표시됩니다.</p><input type="password" autocomplete="off" aria-label="비밀번호" style="box-sizing:border-box;width:100%;height:46px;padding:0 13px;border:1px solid #cfd5df;border-radius:10px;font-size:16px"><p data-error role="alert" style="display:none;margin:8px 0 0;color:#dc2626;font-size:14px">비밀번호가 올바르지 않습니다.</p><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px"><button type="button" data-cancel style="min-height:42px;padding:0 15px;border:1px solid #d0d5dd;border-radius:9px;background:#fff">취소</button><button type="submit" style="min-height:42px;padding:0 17px;border:0;border-radius:9px;background:#172033;color:#fff;font-weight:700">확인</button></div></form>';
    document.body.appendChild(overlay);const input=overlay.querySelector('input');const err=overlay.querySelector('[data-error]');const close=()=>overlay.remove();overlay.querySelector('[data-cancel]').addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
    overlay.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();err.style.display='none';try{const markdown=await readProtectedMarkdown(input.value,section);const html=window.renderNotionMarkdown(markdown);const holder=document.querySelector('[data-secure-section="'+section.id+'"]');if(!holder)throw new Error('holder');holder.insertAdjacentHTML('afterend','<div class="secure-section-content" data-secure-content="'+section.id+'">'+html+'</div>');heading.querySelector('.secure-section-cta')?.remove();holder.remove();overlay.remove();enhanceWeek5Content(document.querySelector('[data-secure-content="'+section.id+'"]'));rebuildToc();}catch(_){err.style.display='block';input.select();}});input.focus();
  }

  function attachSections(sections){sections.forEach(section=>{const ph=document.querySelector('[data-secure-section="'+section.id+'"]');if(!ph||ph.dataset.bound==='1')return;ph.dataset.bound='1';const heading=findHeadingForPlaceholder(ph);if(!heading)return;const btn=document.createElement('button');btn.type='button';btn.className='secure-section-cta';btn.textContent='[클릭]';btn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();showSectionDialog(heading,section);});heading.appendChild(btn);heading.style.cursor='pointer';heading.addEventListener('click',()=>showSectionDialog(heading,section));});}

  async function init(){ensureStyles();enableWeek5Navigation();const manifest=await loadManifest();const sections=(manifest.sections&&manifest.sections[week])||[];if(week===5){await renderWeek5Source();attachSections(sections);return;}attachSections(sections);const content=document.querySelector('#lecture-content');if(content)new MutationObserver(()=>attachSections(sections)).observe(content,{childList:true,subtree:true});}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init().catch(console.error),{once:true});else init().catch(console.error);
})();