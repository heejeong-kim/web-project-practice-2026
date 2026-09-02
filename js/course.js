const weekGrid = document.querySelector('#week-grid');
const searchInput = document.querySelector('#week-search');
const chips = [...document.querySelectorAll('.filter-chip')];
const empty = document.querySelector('#empty-weeks');
const topButton = document.querySelector('#top-button');
const menuToggle = document.querySelector('.menu-toggle');
const topNav = document.querySelector('#top-nav');
const hero = document.querySelector('.hero');

const READY_WEEKS = new Set([0, 1, 2, 3, 4, 5]);
const WEEK5_PASSWORD_HASH = 'b564d46d60731e7b8a22e912c01957f6c62caf92143683efbf48d5ec2ca89176';
const WEEK5_GATE_KEY = 'web-project-week5-lecture-access';

let activeFilter = 'all';
let cardObserver;
let motionObserver;

function normalizeHeaderNavigation() {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;
  [...nav.querySelectorAll('a')].forEach(link => {
    const text = link.textContent.trim();
    if (text === '프로젝트 트랙' || text === '수업 진행') link.remove();
  });
  const weekLink = [...nav.querySelectorAll('a')].find(link => link.getAttribute('href') === '#weeks' || link.getAttribute('href')?.endsWith('#weeks'));
  if (weekLink) weekLink.textContent = '주차별 수업';
  const teamLink = [...nav.querySelectorAll('a')].find(link => link.getAttribute('href')?.includes('team-project.html'));
  if (teamLink) teamLink.textContent = '팀별 현황';
}

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
    .week5-entry-gate{position:fixed;inset:0;z-index:30000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.6);backdrop-filter:blur(5px)}
    .week5-entry-gate form{box-sizing:border-box;width:min(100%,420px);padding:32px;border-radius:20px;background:#fff;box-shadow:0 28px 80px rgba(15,23,42,.32)}
    .week5-entry-mark{display:grid;place-items:center;width:60px;height:60px;margin-bottom:18px;border-radius:17px;background:#111827;color:#ff8a3d;font-size:22px;font-weight:800}
    .week5-entry-gate h2{margin:0 0 8px;color:#111827;font-size:25px;letter-spacing:-.03em}
    .week5-entry-gate p{margin:0 0 18px;color:#667085;font-size:14px;line-height:1.6}
    .week5-entry-gate input{box-sizing:border-box;width:100%;height:48px;padding:0 13px;border:1px solid #cfd5df;border-radius:10px;font-size:16px;outline:none}
    .week5-entry-gate input:focus{border-color:#ff8a3d;box-shadow:0 0 0 3px rgba(255,138,61,.14)}
    .week5-entry-gate [data-error]{display:none;margin:8px 0 0;color:#dc2626;font-size:13px}
    .week5-entry-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
    .week5-entry-actions button{min-height:42px;padding:0 15px;border-radius:9px;font-weight:700;cursor:pointer}
    .week5-entry-actions [data-cancel]{border:1px solid #d0d5dd;background:#fff;color:#475467}
    .week5-entry-actions button[type="submit"]{border:0;background:#172033;color:#fff}
    @media(max-width:620px){.week-thumbnail{margin-bottom:16px}}
  `;
  document.head.appendChild(style);
}

function pageFor(item) {
  if (item.week === 5) return './lecture/?week=05';
  return item.page;
}

function cardTemplate(item) {
  const isReady = READY_WEEKS.has(item.week);
  const isOt = item.week === 0;
  const itemLabel = isOt ? 'OT' : `${item.week}주차`;
  const thumbnail = isOt ? './asset/ot.png' : `./asset/${item.week}.png`;
  const target = pageFor(item);
  const gateAttr = item.week === 5 ? ' data-week5-lecture="true"' : '';
  const linkAttrs = isReady
    ? `href="${target}"${gateAttr}`
    : `href="#" data-pending-lecture="true" aria-label="${itemLabel} 강의교안 준비중"`;
  const lectureLink = isReady
    ? `<a class="notion-link" href="${target}"${gateAttr}>강의교안</a>`
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
      <div class="week-keywords">${item.keywords.map(keyword => `<span>${keyword}</span>`).join('')}</div>
      <div class="week-actions">${lectureLink}</div>
    </article>`;
}

async function sha256Hex(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function hasWeek5Access() {
  try { return sessionStorage.getItem(WEEK5_GATE_KEY) === 'true'; } catch { return false; }
}

function saveWeek5Access() {
  try { sessionStorage.setItem(WEEK5_GATE_KEY, 'true'); } catch {}
}

function showWeek5EntryGate(target) {
  if (hasWeek5Access()) {
    window.location.href = target;
    return;
  }
  if (document.querySelector('.week5-entry-gate')) return;
  const overlay = document.createElement('div');
  overlay.className = 'week5-entry-gate';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `<form><div class="week5-entry-mark" aria-hidden="true">05</div><h2>5주차 강의교안</h2><p>비밀번호를 입력해야 5주차 강의교안을 열 수 있습니다.</p><input type="password" autocomplete="current-password" aria-label="5주차 강의교안 비밀번호" placeholder="비밀번호 입력"><p data-error role="alert">비밀번호가 올바르지 않습니다.</p><div class="week5-entry-actions"><button type="button" data-cancel>취소</button><button type="submit">강의교안 열기</button></div></form>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector('input');
  const error = overlay.querySelector('[data-error]');
  overlay.querySelector('[data-cancel]').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', event => { if (event.target === overlay) overlay.remove(); });
  overlay.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();
    error.style.display = 'none';
    if (await sha256Hex(input.value) !== WEEK5_PASSWORD_HASH) {
      error.style.display = 'block';
      input.select();
      return;
    }
    saveWeek5Access();
    window.location.href = target;
  });
  input.focus();
}

function setupWeek5LectureLinks() {
  weekGrid.querySelectorAll('[data-week5-lecture="true"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      showWeek5EntryGate(link.getAttribute('href') || './lecture/?week=05');
    });
  });
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
  setupWeek5LectureLinks();
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
  window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMobileMenu(); });
}

if (topButton) {
  const updateTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 420);
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

normalizeHeaderNavigation();
injectThumbnailStyles();
window.addEventListener('pageshow', restartHeroMotion);
render();
setupGeneralMotion();
restartHeroMotion();