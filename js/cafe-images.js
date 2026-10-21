/* 카공 프로토타입: 연속 40개 카드에 서로 다른 이미지를 배정한다. */
(() => {
  const count = 40;
  const query = new URLSearchParams(location.search);
  const selected = Number(query.get('image'));
  let firstImage = Number.isInteger(selected) && selected >= 1 && selected <= count ? selected : null;
  const numberOf = img => Number(img.getAttribute('src')?.match(/cafe-(\d+)\.png/)?.[1]);
  const assign = () => {
    const images = [...document.querySelectorAll('.has-cafe-image img')];
    if (!images.length) return;
    // 상세 첫 이미지는 목록에서 선택한 이미지를 유지.
    if (firstImage === null) firstImage = document.body.dataset.page === 'detail' ? numberOf(images[0]) || 1 : 1;
    images.forEach((img, index) => {
      const number = (firstImage - 1 + index) % count + 1;
      const source = img.getAttribute('src');
      const next = source.replace(/cafe-\d+\.png/, `cafe-${String(number).padStart(2, '0')}.png`);
      if (source !== next) img.setAttribute('src', next);
      img.dataset.cafeImage = String(number);
    });
  };
  // 필터·정렬·추가 로딩·저장 후 다시 그린 화면에도 적용.
  assign();
  new MutationObserver(assign).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    const img = link?.querySelector('.has-cafe-image img');
    if (!img) return;
    const url = new URL(link.href, location.href);
    if (!url.pathname.endsWith('/detail.html')) return;
    const number = Number(img.dataset.cafeImage) || numberOf(img);
    if (!number) return;
    url.searchParams.set('image', String(number));
    link.href = url.href;
  }, true);
})();
