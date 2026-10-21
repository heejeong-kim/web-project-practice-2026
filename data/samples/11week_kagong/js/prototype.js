/* 7·9주차 예시는 유지하고, 화면 이동 후에도 프로토타입 모드를 유지. */
(() => {
  const params = new URLSearchParams(location.search);

  const root = document.body.dataset.page === 'home' ? './' : '../';
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = root + 'css/prototype.css?v=20261021-compare-nav';
  document.head.appendChild(sheet);
  const enhance = () => {
    document.querySelectorAll('a[href]').forEach(a => {
      const raw = a.getAttribute('href');
      if (!raw || raw.startsWith('#')) return;
      const url = new URL(raw, location.href);
      const base = new URL(root, location.href);
      if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || !url.pathname.endsWith('.html')) return;
      if (url.searchParams.get('prototype') !== '1') {
        url.searchParams.set('prototype', '1');
        a.href = url.href;
      }
    });
    document.querySelectorAll('.hero-image').forEach(el => {
      if (el.textContent === '代表画像' || el.textContent === '대표 이미지') {
        el.textContent = '집중이 필요한 오늘, 카공';
        el.setAttribute('aria-label', '커피 일러스트');
      }
    });
  };
  const imageNote = document.createElement('p');
  imageNote.className = 'image-source-note';
  imageNote.textContent = 'AI 생성 실습용 이미지 · 실제 매장 사진 아님 · 40개 반복 사용';
  document.querySelector('main').prepend(imageNote);
  enhance();
  new MutationObserver(enhance).observe(document.body, {childList:true,subtree:true});
})();
