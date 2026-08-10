const weekGrid = document.querySelector('#week-grid');
const searchInput = document.querySelector('#week-search');
const chips = [...document.querySelectorAll('.filter-chip')];
const empty = document.querySelector('#empty-weeks');
const topButton = document.querySelector('#top-button');
const menuToggle = document.querySelector('.menu-toggle');
const topNav = document.querySelector('#top-nav');
const hero = document.querySelector('.hero');

let activeFilter = 'all';
let cardObserver;
let motionObserver;

function cardTemplate(item) {
  const actionText = item.type === 'exam' ? '평가 주차' : '실습 준비 중';

  return `
    <article class="week-card ${item.type === 'exam' ? 'is-exam' : ''}">
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
        <a class="notion-link" href="${item.notion}" target="_blank" rel="noopener noreferrer">강의교안</a>
        <a class="practice-link" aria-disabled="true">${actionText}</a>
      </div>
    </article>`;
}

function setupWeekCardMotion() {
  if (cardObserver) cardObserver.disconnect();

  const cards = [...document.querySelectorAll('.week-card')];

  cardObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        cardObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -24px 0px'
    }
  );

  cards.forEach((card, index) => {
    card.style.setProperty('--card-delay', `${Math.min(index * 60, 360)}ms`);
    cardObserver.observe(card);
  });
}

function render() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = window.WEEK_DATA.filter(item => {
    const typeMatch = activeFilter === 'all' || item.type === activeFilter;
    const searchableText = [item.week, item.title, item.summary, ...item.keywords]
      .join(' ')
      .toLowerCase();

    return typeMatch && (!query || searchableText.includes(query));
  });

  weekGrid.innerHTML = filtered.map(cardTemplate).join('');
  empty.hidden = filtered.length > 0;
  setupWeekCardMotion();
}

function setupGeneralMotion() {
  if (motionObserver) motionObserver.disconnect();

  const targets = document.querySelectorAll('.motion-card');

  motionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        motionObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((target, index) => {
    target.style.setProperty('--motion-delay', `${index * 80}ms`);
    motionObserver.observe(target);
  });
}

function restartHeroMotion() {
  if (!hero) return;

  hero.classList.remove('is-animated');
  void hero.offsetWidth;

  requestAnimationFrame(() => {
    hero.classList.add('is-animated');
  });
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

  topNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMobileMenu();
  });
}

if (topButton) {
  const updateTopButton = () => {
    topButton.classList.toggle('is-visible', window.scrollY > 420);
  };

  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();

  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

window.addEventListener('pageshow', restartHeroMotion);

render();
setupGeneralMotion();
restartHeroMotion();
