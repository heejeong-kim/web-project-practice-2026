const weekGrid = document.querySelector('#week-grid');
const searchInput = document.querySelector('#week-search');
const chips = [...document.querySelectorAll('.filter-chip')];
const empty = document.querySelector('#empty-weeks');
const topButton = document.querySelector('#top-button');
const menuToggle = document.querySelector('.menu-toggle');
const topNav = document.querySelector('#top-nav');
const hero = document.querySelector('.hero');

const READY_WEEKS = new Set([0, 1, 2, 3]);

let activeFilter = 'all';
let cardObserver;
let motionObserver;

function injectThumbnailStyles() {
  if (document.querySelector('#week-thumbnail-styles')) return;
  const style = document.createElement('style');
  style.id = 'week-thumbnail-styles';
  style.textContent = `
    .week-card{border-top-color:#cfd5df!important}
    .week-card.is-ready:not(.is-exam){border-top-color:var(--accent)!important}
    .week-card.is-ready.is-exam{border-top-color:var(--purple)!important}
    .week-thumbnail{position:relative;margin:-1px -1px 18px;overflow:hidden;border-radius:16px 16px 12px 12px;aspect-ratio:16/9;background:#e8edf4}
    .week-thumbnail-link{display:block;text-decoration:none}
    .week-thumbnail img{display:block;width:100%;height:100%;object-fit:cover;filter:none;opacity:1;transition:transform .45s var(--ease,cubic-bezier(.22,1,.36,1))}
    .week-card:hover .week-thumbnail img{transform:scale(1.035)}
    .week-title-link{color:#7d8797;text-decoration:none;transition:color .3s ease}
    .week-card.is-ready .week-title-link{color:var(--ink)!important}
    .week-card .week-number,.week-card .type-badge,.week-card>p{color:#8b95a5!important}
    .week-card.is-ready .week-number{color:var(--ink)!important}
    .week-card.is-ready>p{color:var(--ink)!important}
    .week-card .type-badge{background:#eef1f5!important}
    .week-card.is-ready:hover .week-number{color:var(--ink)!important}
    .week-card.is-ready:hover .type-badge{background:#fff3eb!important;color:#9c4e18!important}
    .week-card.is-ready.is-exam:hover .type-badge{background:#f0edff!important;color:#5644b8!important}
    .week-card.is-ready:hover>p{color:var(--ink)!important}
    .week-keywords span{background:#eef1f5!important;color:#7f8998!important}
    .week-card.is-ready .week-keywords span{background:#fff0e6!important;color:#b55a20!important}
    .week-card.is-ready.is-exam .week-keywords span{background:#f0edff!important;color:#6552c4!important}
    .week-card.is-ready .notion-link{background:var(--ink)!important;color:#fff!important;box-shadow:0 10px 22px rgba(21,32,51,.14)!important}
    .week-card.is-ready .notion-link:hover{background:#24324b!important;color:#fff!important;box-shadow:0 12px 26px rgba(21,32,51,.22)!important}
    .week-card.is-pending:hover{border-color:#d7dce5!important;box-shadow:0 14px 28px rgba(24,34,52,.07)!important}
    .week-card.is-pending:hover::before{opacity:0!important}
    .week-card.is-pending:hover .week-thumbnail img{transform:scale(1.02)}
    .week-card.is-pending:hover .week-number{color:#8b95a5!important;transform:none}
    .week-card.is-pending:hover .week-keywords span{background:#eef1f5!important;transform:none}
    .week-actions{display:block}
    .week-actions .notion-link{display:block;width:100%}
    @media(max-width:620px){.week-thumbnail{margin-bottom:16px}}
  `;
  document.head.appendChild(style);
}

function cardTemplate(item) {
  const isReady = READY_WEEKS.has(item.week);
  const isOt = item.week === 0;
  const itemLabel = isOt ? 'OT' : `${item.week}주차`;
  const thumbnail = isOt ? './asset/ot.png' : `./asset/${item.week}.png`;
  const linkAttrs = isReady
    ? `href="${item.page}"`
    : `href="#" data-pending-lecture="true" aria-label="${itemLabel} 강의교안 준비중"`;
  const lectureLink = isReady
    ? `<a class="notion-link" href="${item.page}">강의교안</a>`
    : `<a class="notion-link is-pending" href="#" data-pending-lecture="true" aria-label="${itemLabel} 강의교안 준비중">강의교안</a>`;

  return `
    <article class="week-card ${item.type === 'exam' ? 'is-exam' : ''} ${isReady ? 'is-ready' : 'is-pending'}">
      <a class="week-thumbnail week-thumbnail-link" ${linkAttrs}>
        <img src="${thumbnail}" alt="${itemLabel} ${item.title} 썸네일" loading="lazy">
      </a>
      <div class="week-meta">
        <span class="week-number">${isOt ? 'OT' : `WEEK ${String(item.week).padStart(2, '0')}`}</span>
        <span class="type-badge">${isOt ? '안내' : (item.type === 'exam' ? 'EVALUATION' : '수업')}</span>
      </div>
      <h3><a class="week-title-link" ${linkAttrs}>${item.title}</a></h3>
      <p>${item.summary}</p>
      <div class="week-keywords">
        ${item.keywords.map(keyword => `<span>${keyword}</span>`).join('')}
      </div>
      <div class="week-actions">
        ${lectureLink}
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
