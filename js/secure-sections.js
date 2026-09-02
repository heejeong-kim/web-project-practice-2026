(() => {
  'use strict';
  const week = Number(new URLSearchParams(window.location.search).get('week'));
  if (![2,3,4].includes(week)) return;
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const b64 = s => { const bin = atob(s); const out = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i); return out; };
  async function decrypt(password, payload) {
    const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(payload.salt),iterations:payload.iterations,hash:'SHA-256'}, material, {name:'AES-GCM',length:256}, false, ['decrypt']);
    return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(payload.iv)}, key, b64(payload.data)));
  }
  const accessKey = id => 'web-project-secure-section-' + id;
  const isUnlocked = id => { try { return sessionStorage.getItem(accessKey(id)) === 'true'; } catch { return false; } };
  function ensureStyles(){
    if(document.querySelector('#secure-section-styles')) return;
    const s=document.createElement('style'); s.id='secure-section-styles'; s.textContent='.secure-section-placeholder{display:none}.secure-section-cta{display:inline-flex;align-items:center;justify-content:center;margin-left:10px;padding:4px 9px;border:1px solid #ff8a3d;border-radius:7px;background:#fff3eb;color:#b95516;font:700 12px/1.2 "IBM Plex Sans KR",sans-serif;vertical-align:middle;cursor:pointer}.secure-section-cta:hover{background:#ffe2cf;border-color:#e96f20}.secure-section-cta:focus-visible{outline:2px solid #ff8a3d;outline-offset:2px}'; document.head.appendChild(s);
  }
  async function loadManifest(){ const r=await fetch('../data/secure/manifest.json',{cache:'no-store'}); if(!r.ok) throw new Error('manifest'); return r.json(); }
  function findHeadingForPlaceholder(ph){ let n=ph.previousElementSibling; while(n){ if(/^H[1-6]$/.test(n.tagName)) return n; n=n.previousElementSibling; } return null; }
  function showDialog(heading, section){
    if(document.querySelector('[data-secure-dialog]')) return;
    const overlay=document.createElement('div'); overlay.dataset.secureDialog='1'; overlay.style.cssText='position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.58);backdrop-filter:blur(4px)';
    const label=heading.textContent.replace('[클릭]','').trim();
    overlay.innerHTML='<form style="box-sizing:border-box;width:min(100%,380px);padding:28px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.3)"><h2 style="margin:0 0 8px;font-size:22px">'+week+'주차 · '+label+'</h2><p style="margin:0 0 18px;color:#667085">비밀번호를 입력하면 이 항목의 숨겨진 내용만 표시됩니다.</p><input type="password" autocomplete="off" aria-label="비밀번호" style="box-sizing:border-box;width:100%;height:46px;padding:0 13px;border:1px solid #cfd5df;border-radius:10px;font-size:16px"><p data-error role="alert" style="display:none;margin:8px 0 0;color:#dc2626;font-size:14px">비밀번호가 올바르지 않습니다.</p><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px"><button type="button" data-cancel style="min-height:42px;padding:0 15px;border:1px solid #d0d5dd;border-radius:9px;background:#fff">취소</button><button type="submit" style="min-height:42px;padding:0 17px;border:0;border-radius:9px;background:#172033;color:#fff;font-weight:700">확인</button></div></form>';
    document.body.appendChild(overlay); const input=overlay.querySelector('input'); const err=overlay.querySelector('[data-error]');
    const close=()=>overlay.remove(); overlay.querySelector('[data-cancel]').addEventListener('click',close); overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    overlay.querySelector('form').addEventListener('submit',async e=>{e.preventDefault(); err.style.display='none'; try{const r=await fetch('../data/secure/'+section.file,{cache:'no-store'}); if(!r.ok) throw new Error('load'); const markdown=await decrypt(input.value,await r.json()); const html=window.renderNotionMarkdown(markdown); const holder=document.querySelector('[data-secure-section="'+section.id+'"]'); holder.insertAdjacentHTML('afterend','<div class="secure-section-content" data-secure-content="'+section.id+'">'+html+'</div>'); try{sessionStorage.setItem(accessKey(section.id),'true')}catch{}; heading.querySelector('.secure-section-cta')?.remove(); holder.remove(); overlay.remove(); }catch(_){err.style.display='block'; input.select();}}); input.focus();
  }
  async function init(){
    ensureStyles(); const manifest=await loadManifest(); const sections=(manifest.sections&&manifest.sections[week])||[];
    const attach=()=>{sections.forEach(section=>{const ph=document.querySelector('[data-secure-section="'+section.id+'"]'); if(!ph||ph.dataset.bound==='1') return; ph.dataset.bound='1'; const heading=findHeadingForPlaceholder(ph); if(!heading) return; if(isUnlocked(section.id)){ /* fresh page cannot decrypt without password again */ try{sessionStorage.removeItem(accessKey(section.id))}catch{} } const btn=document.createElement('button'); btn.type='button'; btn.className='secure-section-cta'; btn.textContent='[클릭]'; btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showDialog(heading,section)}); heading.appendChild(btn); heading.style.cursor='pointer'; heading.addEventListener('click',()=>showDialog(heading,section));});};
    attach(); const content=document.querySelector('#lecture-content'); if(content) new MutationObserver(attach).observe(content,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>init().catch(console.error),{once:true}); else init().catch(console.error);
})();