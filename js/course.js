const weekGrid = document.querySelector('#week-grid');
const searchInput = document.querySelector('#week-search');
const chips = [...document.querySelectorAll('.filter-chip')];
const empty = document.querySelector('#empty-weeks');
const topButton = document.querySelector('#top-button');
const menuToggle = document.querySelector('.menu-toggle');
const topNav = document.querySelector('#top-nav');
const hero = document.querySelector('.hero');

const READY_WEEKS = new Set([1, 2, 3]);

let activeFilter = 'all';
let cardObserver;
let motionObserver;

function injectThumbnailStyles() {
  if (document.querySelector('#week-thumbnail-styles')) return;
  const style = document.createElement('style');
  style.id = 'week-thumbnail-styles';
  style.textContent = `
    .week-thumbnail{position:relative;margin:-1px -1px 18px;overflow:hidden;border-radius:16px 16px 12px 12px;aspect-ratio:16/9;background:#e8edf4}
    .week-thumbnail img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .45s var(--ease,cubic-bezier(.22,1,.36,1))}
    .week-card:hover .week-thumbnail img{transform:scale(1.035)}
    .week-card.is-pending .week-thumbnail img{filter:saturate(.82);opacity:.9}
    @media(max-width:620px){.week-thumbnail{margin-bottom:16px}}
  `;
  document.head.appendChild(style);
}

function cardTemplate(item) {
  const actionText = item.type === 'exam' ? '평가 안내' : '실습 준비 중';
  const isReady = READY_WEEKS.has(item.week);
  const lectureLink = isReady
    ? `<a class="notion-link" href="${item.page}">강의교안</a>`
    : `<a class="notion-link is-pending" href="#" data-pending-lecture="true" aria-label="${item.week}주차 강의교안 준비중">강의교안</a>`;
  const thumbnail = `./asset/${item.week}.png`;

  return `
    <article class="week-card ${item.type === 'exam' ? 'is-exam' : ''} ${isReady ? '' : 'is-pending'}">
      <div class="week-thumbnail">
        <img src="${thumbnail}" alt="${item.week}주차 ${item.title} 썸네일" loading="lazy">
      </div>
      <div class="week-meta">
        <span class="week-number">WEEK ${String(item.week).padStart(2, '0')}</span>
        <span class="type-badge">${item.type === 'exam' ? 'EVALUATION' : 'CLASS'}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <div class="week-keywords">
        ${item.keywords.map(keyword => `<span>${keyword}</span>`).join('')}
      </div>
      <div class="week-actions">
        ${lectureLink}
        <a class="practice-link" aria-disabled="true">${actionText}</a>
      </div>
    </article>`;
}

function setupPendingLectureLinks() {
  weekGrid.querySelectorAll('[data-pending-lecture="true"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.alert('교안 준비중입니다.');
    });
  });
}

function setupWeekCardMotion() {
  if (cardObserver) cardObserver.disconnect();

  const cards = [...document.querySelectorAll('.week-card')];
  cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      cardObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  cards.forEach((card, index) => {
    card.style.setProperty('--card-delay', `${Math.min(index * 60, 360)}ms`);
    cardObserver.observe(card);
  });
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = window.WEEK_DATA.filter(item => {
    const typeMatch = activeFilter === 'all' || item.type === activeFilter;
    const searchableText = [item.week, item.title, item.summary, ...item.keywords].join(' ').toLowerCase();
    return typeMatch && (!query || searchableText.includes(query));
  });

  weekGrid.innerHTML = filtered.map(cardTemplate).join('');
  empty.hidden = filtered.length > 0;
  setupPendingLectureLinks();
  setupWeekCardMotion();
}

function setupGeneralMotion() {
  if (motionObserver) motionObserver.disconnect();
  const targets = document.querySelectorAll('.motion-card');
  motionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      motionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  targets.forEach((target, index) => {
    target.style.setProperty('--motion-delay', `${index * 80}ms`);
    motionObserver.observe(target);
  });
}

function restartHeroMotion() {
  if (!hero) return;
  hero.classList.remove('is-animated');
  void hero.offsetWidth;
  requestAnimationFrame(() => hero.classList.add('is-animated'));
}

function closeMobileMenu() {
  if (!menuToggle || !topNav) return;
  menuToggle.classList.remove('is-open');
  topNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '메뉴 열기');
}

searchInput.addEventListener('input', render);
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(item => item.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeFilter = chip.dataset.filter;
    render();
  });
});

if (menuToggle && topNav) {
  menuToggle.addEventListener('click', () => {
    const nextOpen = !topNav.classList.contains('is-open');
    topNav.classList.toggle('is-open', nextOpen);
    menuToggle.classList.toggle('is-open', nextOpen);
    menuToggle.setAttribute('aria-expanded', String(nextOpen));
    menuToggle.setAttribute('aria-label', nextOpen ? '메뉴 닫기' : '메뉴 열기');
  });
  topNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMobileMenu();
  });
}

if (topButton) {
  const updateTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 420);
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

injectThumbnailStyles();
window.addEventListener('pageshow', restartHeroMotion);
render();
setupGeneralMotion();
restartHeroMotion();
