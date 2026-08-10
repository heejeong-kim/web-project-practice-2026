const params = new URLSearchParams(window.location.search);
const requestedWeek = Number(params.get('week')) || 1;
const week = Math.min(15, Math.max(1, requestedWeek));
const weekData = window.WEEK_DATA.find(item => item.week === week);
const lecture = window.LECTURE_DATA?.[week];

const titleEl = document.querySelector('#lecture-title');
const weekEl = document.querySelector('#lecture-week');
const summaryEl = document.querySelector('#lecture-summary');
const keywordEl = document.querySelector('#lecture-keywords');
const heroNumberEl = document.querySelector('#hero-week-number');
const contentEl = document.querySelector('#lecture-content');
const tocList = document.querySelector('#toc-list');
const weekMenu = document.querySelector('#week-menu');
const weekMenuButton = document.querySelector('#week-menu-button');
const prevWeek = document.querySelector('#prev-week');
const nextWeek = document.querySelector('#next-week');
const topButton = document.querySelector('#top-button');

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
}

function normalizeCodeText(value = '') {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function prepareLectureHtml(html = '') {
  return html.replace(/<pre data-lang="([^"]+)">([\s\S]*?)<\/pre>/g, (_, lang, code) => {
    return `<pre data-lang="${escapeHtml(lang)}">${escapeHtml(normalizeCodeText(code))}</pre>`;
  });
}

function renderPage() {
  if (!weekData || !lecture) {
    titleEl.textContent = '강의교안을 찾을 수 없습니다';
    contentEl.innerHTML = '<div class="callout yellow"><strong>안내</strong>요청한 주차의 강의교안 데이터가 없습니다.</div>';
    return;
  }

  document.title = `${week}주차 · ${weekData.title} | 웹프로젝트 실습`;
  weekEl.textContent = `WEEK ${String(week).padStart(2, '0')} · ${weekData.type === 'exam' ? 'EVALUATION' : 'LECTURE'}`;
  titleEl.textContent = weekData.title;
  summaryEl.textContent = weekData.summary;
  heroNumberEl.textContent = String(week).padStart(2, '0');
  keywordEl.innerHTML = weekData.keywords.map(keyword => `<span>${escapeHtml(keyword)}</span>`).join('');
  contentEl.innerHTML = prepareLectureHtml(lecture.content);

  enhanceCodeBlocks();
  buildToc();
  buildWeekMenu();
  buildPager();
}

function enhanceCodeBlocks() {
  const blocks = contentEl.querySelectorAll('pre[data-lang]');

  blocks.forEach(pre => {
    const lang = pre.dataset.lang || 'code';
    const codeText = pre.textContent.replace(/^\n+|\n+$/g, '');
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    wrapper.innerHTML = `
      <div class="code-toolbar">
        <span class="code-lang">${escapeHtml(lang)}</span>
        <button class="copy-code" type="button">복사</button>
      </div>
      <pre><code>${escapeHtml(codeText)}</code></pre>`;
    pre.replaceWith(wrapper);
  });

  contentEl.querySelectorAll('.copy-code').forEach(button => {
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block').querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = '복사됨';
        button.classList.add('is-copied');
        setTimeout(() => {
          button.textContent = '복사';
          button.classList.remove('is-copied');
        }, 1500);
      } catch {
        const area = document.createElement('textarea');
        area.value = code;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        button.textContent = '복사됨';
        button.classList.add('is-copied');
        setTimeout(() => {
          button.textContent = '복사';
          button.classList.remove('is-copied');
        }, 1500);
      }
    });
  });
}

function buildToc() {
  const headings = [...contentEl.querySelectorAll('h1, h2')];
  headings.forEach((heading, index) => {
    heading.id = `section-${index + 1}`;
  });

  tocList.innerHTML = headings.map(heading => {
    const depth = heading.tagName === 'H2' ? ' style="padding-left:18px;font-size:12px"' : '';
    return `<a href="#${heading.id}"${depth}>${escapeHtml(heading.textContent)}</a>`;
  }).join('');

  const links = [...tocList.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-110px 0px -70% 0px', threshold: 0 });
  headings.forEach(heading => observer.observe(heading));
}

function buildWeekMenu() {
  weekMenu.innerHTML = window.WEEK_DATA.map(item => `
    <a class="${item.week === week ? 'is-current' : ''}" href="./lecture.html?week=${String(item.week).padStart(2,'0')}">
      ${String(item.week).padStart(2,'0')}주차
    </a>`).join('');

  weekMenuButton.addEventListener('click', () => {
    const isOpen = !weekMenu.hidden;
    weekMenu.hidden = isOpen;
    weekMenuButton.setAttribute('aria-expanded', String(!isOpen));
  });
}

function buildPager() {
  const prev = window.WEEK_DATA.find(item => item.week === week - 1);
  const next = window.WEEK_DATA.find(item => item.week === week + 1);

  if (prev) {
    prevWeek.href = `./lecture.html?week=${String(prev.week).padStart(2,'0')}`;
    prevWeek.querySelector('strong').textContent = `${prev.week}주차 · ${prev.title}`;
  } else {
    prevWeek.style.visibility = 'hidden';
  }

  if (next) {
    nextWeek.href = `./lecture.html?week=${String(next.week).padStart(2,'0')}`;
    nextWeek.querySelector('strong').textContent = `${next.week}주차 · ${next.title}`;
  } else {
    nextWeek.style.visibility = 'hidden';
  }
}

const updateTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
window.addEventListener('scroll', updateTopButton, { passive: true });
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

renderPage();
updateTopButton();
