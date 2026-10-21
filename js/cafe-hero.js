/* 7·9주차는 실제 이미지 없는 X 박스, 10주차부터 컬러·은은한 배경 모션 */
(() => {
  if (Number(document.body.dataset.week) < 10 && new URLSearchParams(location.search).get('prototype') !== '1') return;
  // 공통 project 샘플의 7주차는 prototype 파라미터가 없으면 정적으로 유지.
  if (!document.body.dataset.week && new URLSearchParams(location.search).get('prototype') !== '1') return;
  document.body.setAttribute('data-hero-prototype', '');
  const hero = document.querySelector('.intro.has-hero-banner');
  if (!hero) return;
  const image = hero.querySelector('.hero-banner-image');
  if (image?.dataset.src) image.src = image.dataset.src;
  let visible = true;
  const update = () => hero.toggleAttribute('data-motion-paused', document.hidden || !visible);
  document.addEventListener('visibilitychange', update);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(hero);
  }
  update();
})();
