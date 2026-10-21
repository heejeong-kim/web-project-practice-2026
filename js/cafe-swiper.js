/* 추천 공간: 터치 스와이프·마우스 드래그·키보드·이전/다음 버튼 */
(() => {
  const section = document.querySelector('#recommend-section');
  const track = document.querySelector('#recommended');
  if (!section || !track) return;
  section.setAttribute('aria-label', '추천 공간');
  section.setAttribute('aria-roledescription', '캐러셀');
  const title = section.querySelector('h2');
  if (title) title.textContent = '추천 공간';
  const all = section.querySelector('.section-heading a');
  if (all) { all.setAttribute('aria-label', '추천 공간 전체보기'); all.title = '추천 공간 전체보기'; }
  const caption = document.createElement('p');
  caption.className = 'recommend-caption';
  caption.textContent = '마음에 드는 공간를 옆으로 넘겨보세요';
  track.before(caption);
  track.tabIndex = 0;
  track.setAttribute('aria-label', '추천 공간 목록, 좌우 방향키로 이동');
  const controls = document.createElement('div');
  controls.className = 'recommend-controls';
  controls.innerHTML = '<div class="recommend-arrows"><button type="button" aria-label="이전 추천 공간">‹</button><button type="button" aria-label="다음 추천 공간">›</button></div>';
  track.after(controls);
  const [prev, next] = controls.querySelectorAll('button');
  const cards = () => [...track.children];
  const current = () => cards().reduce((best, card, i, list) => Math.abs(card.offsetLeft - list[0].offsetLeft - track.scrollLeft) < Math.abs(list[best].offsetLeft - list[0].offsetLeft - track.scrollLeft) ? i : best, 0);
  const update = () => {
    const n = cards().length;
    prev.disabled = !n || track.scrollLeft <= 2;
    next.disabled = !n || track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  const move = direction => {
    const list = cards();
    if (!list.length) return;
    const index = Math.max(0, Math.min(list.length - 1, current() + direction));
    track.scrollTo({left: list[index].offsetLeft - list[0].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };
  prev.onclick = () => move(-1); next.onclick = () => move(1);
  track.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1);
  });
  let drag = null, suppressClick = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    suppressClick = false;
    drag = {id: e.pointerId, x: e.clientX, scroll: track.scrollLeft, moved: false};
  });
  track.addEventListener('pointermove', e => {
    if (!drag) return;
    const delta = e.clientX - drag.x;
    if (Math.abs(delta) > 6 && !drag.moved) {
      drag.moved = true; track.setPointerCapture(e.pointerId); track.classList.add('is-dragging');
    }
    if (drag.moved) { e.preventDefault(); track.scrollLeft = drag.scroll - delta; }
  });
  const release = () => {
    if (!drag) return;
    suppressClick = drag.moved;
    if (track.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id);
    drag = null; track.classList.remove('is-dragging'); update();
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  track.addEventListener('dragstart', e => e.preventDefault());
  track.addEventListener('click', e => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; } }, true);
  track.addEventListener('scroll', update, {passive: true});
  new MutationObserver(update).observe(track, {childList: true});
  // 자동 이동: 보이는 동안 4초 간격, 사용자가 조작하면 잠시 대기.
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !motion.matches, hovered = false, focused = false, pauseUntil = 0;
  const playButton = document.createElement('button');
  playButton.type = 'button'; playButton.className = 'recommend-play';
  const playLabel = () => { playButton.textContent = playing ? 'Ⅱ' : '▷'; playButton.setAttribute('aria-label', playing ? '추천 공간 자동 이동 일시정지' : '추천 공간 자동 이동 시작'); playButton.setAttribute('aria-pressed', String(playing)); };
  playLabel(); controls.querySelector('.recommend-arrows').prepend(playButton);
  playButton.onclick = () => { playing = !playing; focused = false; pauseUntil = 0; playLabel(); };
  section.addEventListener('mouseenter', () => { hovered = true; });
  section.addEventListener('mouseleave', () => { hovered = false; });
  section.addEventListener('focusin', () => { focused = true; });
  section.addEventListener('focusout', e => { if (!section.contains(e.relatedTarget)) focused = false; });
  const manualPause = () => { pauseUntil = Date.now() + 8000; };
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(type => track.addEventListener(type, manualPause, {passive: true}));
  prev.addEventListener('click', manualPause); next.addEventListener('click', manualPause);
  motion.addEventListener('change', e => { if (e.matches) { playing = false; playLabel(); } });
  window.setInterval(() => {
    if (!playing || hovered || focused || document.hidden || Date.now() < pauseUntil || cards().length < 2) return;
    const rect = section.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) track.scrollTo({left: 0, behavior: motion.matches ? 'auto' : 'smooth'});
    else move(1);
  }, 4000);
  window.addEventListener('resize', update); update();
})();
