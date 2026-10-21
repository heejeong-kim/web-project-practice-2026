/* 상세 하단 추천: 작은 카드, 자동 좌우 왕복과 수동 스와이프. */
(() => {
  const main = document.querySelector('main'); if (!main) return;
  const setup = () => {
    document.querySelectorAll('.detail-discovery .recent-grid').forEach(track => {
      if (track.dataset.swipeReady) return;
      track.dataset.swipeReady = 'true'; track.tabIndex = 0;
      const title = track.closest('section').querySelector('h2')?.textContent || '추천 공간';
      track.setAttribute('aria-label', title + ', 좌우로 넘기기');
      const controls = document.createElement('div'); controls.className = 'related-swipe-controls';
      controls.innerHTML = '<button type="button" aria-label="이전 공간">‹</button><button type="button" aria-label="다음 공간">›</button>';
      track.after(controls); const [prev, next] = controls.children;
      const update = () => { const overflow = track.scrollWidth > track.clientWidth + 2; controls.hidden = !overflow; prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; };
      const move = delta => { const step = (track.firstElementChild?.getBoundingClientRect().width || 170) + 12; track.scrollBy({left: step * delta, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); };
      prev.onclick = () => move(-1); next.onclick = () => move(1);
      track.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } });
      let drag = null, suppress = false;
      track.addEventListener('pointerdown', e => { suppress = false; if (e.pointerType === 'mouse' && e.button === 0) drag = {x:e.clientX,left:track.scrollLeft,id:e.pointerId,moved:false}; });
      track.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx)>6 && !drag.moved) {drag.moved=true;track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');} if(drag.moved){e.preventDefault();track.scrollLeft=drag.left-dx;} });
      const release = () => { if(!drag)return;suppress=drag.moved;if(track.hasPointerCapture(drag.id))track.releasePointerCapture(drag.id);drag=null;track.classList.remove('is-dragging');update(); };
      window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
      track.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopPropagation();suppress=false;}},true);
      track.addEventListener('dragstart',e=>e.preventDefault());track.addEventListener('scroll',update,{passive:true});
      const section = track.closest('section');
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      let playing = !motion.matches, hovered = false, focused = false, pauseUntil = 0, direction = 1;
      const play = document.createElement('button'); play.type = 'button';
      const playLabel = () => { play.textContent = playing ? 'Ⅱ' : '▷'; play.setAttribute('aria-label', playing ? '추천 공간 자동 이동 일시정지' : '추천 공간 자동 이동 시작'); play.setAttribute('aria-pressed', String(playing)); };
      playLabel(); controls.prepend(play);
      play.onclick = () => { playing = !playing; focused = false; pauseUntil = 0; playLabel(); };
      section.addEventListener('mouseenter', () => {hovered = true;}); section.addEventListener('mouseleave', () => {hovered = false;});
      section.addEventListener('focusin', () => {focused = true;}); section.addEventListener('focusout', e => {if (!section.contains(e.relatedTarget)) focused = false;});
      const pause = () => {pauseUntil = Date.now() + 8000;};
      ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(type => track.addEventListener(type, pause, {passive:true}));
      prev.addEventListener('click', pause); next.addEventListener('click', pause);
      const motionChange = e => {if(e.matches){playing=false;playLabel();}};
      motion.addEventListener('change', motionChange);
      const resize = 'ResizeObserver' in window ? new ResizeObserver(update) : null;
      if (resize) resize.observe(track);
      const timer = window.setInterval(() => {
        if (!track.isConnected) {window.clearInterval(timer);resize?.disconnect();motion.removeEventListener('change',motionChange);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);return;}
        if (!playing || hovered || focused || document.hidden || Date.now() < pauseUntil || track.scrollWidth <= track.clientWidth + 2) return;
        const rect = track.getBoundingClientRect(); if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) direction = -1;
        else if (track.scrollLeft <= 2) direction = 1;
        move(direction);
      }, 4000);
      update();
    });
  };
  setup();new MutationObserver(setup).observe(main,{childList:true,subtree:true});
})();
