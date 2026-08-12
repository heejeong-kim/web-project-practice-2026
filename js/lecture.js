const params = new URLSearchParams(window.location.search);
const requestedWeek = Number(params.get('week')) || 1;
const week = Math.min(15, Math.max(1, requestedWeek));
const weekData = window.WEEK_DATA.find(item => item.week === week);
const READY_WEEKS = new Set([1, 2, 3]);

const titleEl = document.querySelector('#lecture-title');
const weekEl = document.querySelector('#lecture-week');
const summaryEl = document.querySelector('#lecture-summary');
const keywordEl = document.querySelector('#lecture-keywords');
const heroNumberEl = document.querySelector('#hero-week-number');
const contentEl = document.querySelector('#lecture-content');
const tocList = document.querySelector('#toc-list');
const weekSelect = document.querySelector('#week-select');
const mobileWeekSelect = document.querySelector('#mobile-week-select');
const prevWeek = document.querySelector('#prev-week');
const nextWeek = document.querySelector('#next-week');
const topButton = document.querySelector('#top-button');

function injectLectureImageStyles() {
  if (document.querySelector('#lecture-image-styles')) return;
  const style = document.createElement('style');
  style.id = 'lecture-image-styles';
  style.textContent = `
    .lecture-shell{width:min(1520px,calc(100% - 64px))!important}
    .toc-week-thumbnail{display:block;margin:12px 0 16px;border-radius:12px;overflow:hidden;border:1px solid #e1e6ee;background:#e8edf4}
    .toc-week-thumbnail img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
    @media(max-width:680px){.lecture-shell{width:min(100% - 28px,1520px)!important}}
  `;
  document.head.appendChild(style);
}

function setupTocThumbnail() {
  const tocCard = document.querySelector('.toc-card');
  if (!tocCard || !READY_WEEKS.has(week)) return;
  const oldThumbnail = tocCard.querySelector('.toc-week-thumbnail');
  if (oldThumbnail) oldThumbnail.remove();
  const title = tocCard.querySelector(':scope > strong');
  if (!title) return;
  const figure = document.createElement('div');
  figure.className = 'toc-week-thumbnail';
  figure.innerHTML = `<img src="./asset/${week}.png" alt="${week}주차 ${escapeHtml(weekData.title)} 썸네일">`;
  title.insertAdjacentElement('afterend', figure);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function inlineMarkdown(value = '') {
  return value
    .replace(/\\([\[\]~*`])/g, '$1')
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '<img class="lecture-image" src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function calloutClass(color = '') {
  if (color.includes('blue')) return 'blue';
  if (color.includes('purple')) return 'purple';
  if (color.includes('green')) return 'green';
  if (color.includes('yellow')) return 'yellow';
  if (color.includes('red')) return 'red';
  return 'gray';
}

function renderNotionMarkdown(source = '') {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inFence = false;
  let fenceLang = '';
  let fenceLines = [];
  let listType = null;

  const closeList = () => {
    if (listType) out.push(`</${listType}>`);
    listType = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const original = lines[i];
    const line = original.replace(/^\t+/, '');

    if (inFence) {
      if (line.startsWith('```')) {
        out.push(`<pre data-lang="${escapeHtml(fenceLang || 'code')}">${escapeHtml(fenceLines.join('\n'))}</pre>`);
        inFence = false;
        fenceLang = '';
        fenceLines = [];
      } else {
        fenceLines.push(original.replace(/^\t+/, ''));
      }
      continue;
    }

    if (line.startsWith('```')) {
      closeList();
      inFence = true;
      fenceLang = line.slice(3).trim();
      continue;
    }

    const calloutOpen = line.match(/^<callout\s+icon="([^"]*)"\s+color="([^"]*)">$/);
    if (calloutOpen) {
      closeList();
      out.push(`<div class="callout ${calloutClass(calloutOpen[2])}"><span class="callout-icon" aria-hidden="true">${escapeHtml(calloutOpen[1])}</span><div class="callout-body">`);
      continue;
    }
    if (line === '</callout>') {
      closeList();
      out.push('</div></div>');
      continue;
    }

    if (/^<embed\s/.test(line)) {
      closeList();
      const src = line.match(/src="([^"]+)"/)?.[1] || '';
      out.push(`<div class="notion-embed"><strong>첨부 실습 파일</strong><span>Notion 원문의 첨부 블록</span><code>${escapeHtml(decodeURIComponent(src))}</code></div>`);
      continue;
    }

    if (/^<details>|^<\/details>|^<summary>|^<\/summary>/.test(line)) {
      closeList();
      if (line.startsWith('<summary>')) {
        out.push(`<summary>${inlineMarkdown(line.replace('<summary>', '').replace('</summary>', ''))}</summary>`);
      } else {
        out.push(line);
      }
      continue;
    }

    if (/^<table|^<\/table>|^<colgroup|^<\/colgroup>|^<col\b|^<tr>|^<\/tr>|^<thead|^<\/thead>|^<tbody|^<\/tbody>/.test(line)) {
      closeList();
      out.push(line.replace(/ fit-page-width="true"| header-row="true"/g, ''));
      continue;
    }

    const cell = line.match(/^<(td|th)>([\s\S]*)<\/(td|th)>$/);
    if (cell) {
      closeList();
      out.push(`<${cell[1]}>${inlineMarkdown(cell[2])}</${cell[3]}>`);
      continue;
    }

    if (/^!\[[^\]]*\]\(https?:\/\//.test(line)) {
      closeList();
      out.push(inlineMarkdown(line));
      continue;
    }

    if (line === '---') {
      closeList();
      out.push('<hr>');
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(4, heading[1].length);
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const checkbox = line.match(/^- \[([ xX])\]\s+(.+)$/);
    if (checkbox) {
      if (listType !== 'ul') { closeList(); listType = 'ul'; out.push('<ul class="check-list">'); }
      const checked = checkbox[1].toLowerCase() === 'x';
      out.push(`<li><input type="checkbox" disabled ${checked ? 'checked' : ''}> ${inlineMarkdown(checkbox[2])}</li>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      if (listType !== 'ul') { closeList(); listType = 'ul'; out.push('<ul>'); }
      out.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      if (listType !== 'ol') { closeList(); listType = 'ol'; out.push('<ol>'); }
      out.push(`<li>${inlineMarkdown(numbered[1])}</li>`);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    if (/^<[^>]+>/.test(line)) {
      closeList();
      out.push(line);
      continue;
    }

    closeList();
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  if (inFence) {
    out.push(`<pre data-lang="${escapeHtml(fenceLang || 'code')}">${escapeHtml(fenceLines.join('\n'))}</pre>`);
  }
  return out.join('\n');
}

async function loadLectureSource() {
  const number = String(week).padStart(2, '0');
  const response = await fetch(`./data/lectures/week${number}.md`);
  if (!response.ok) throw new Error(`${week}주차 원문 파일을 불러오지 못했습니다.`);
  return response.text();
}

function renderPendingLecture() {
  document.title = `${week}주차 · 교안 준비중 | 웹프로젝트 실습`;
  summaryEl.textContent = '현재 강의교안을 준비하고 있습니다.';
  keywordEl.innerHTML = '<span>COMING SOON</span>';
  contentEl.innerHTML = `
    <section class="lecture-pending" role="status" aria-live="polite">
      <span class="lecture-pending-mark" aria-hidden="true">${String(week).padStart(2, '0')}</span>
      <h2>교안 준비중입니다.</h2>
      <p>해당 주차 강의교안은 준비가 완료된 후 공개됩니다.</p>
      <a href="./#weeks">주차별 수업으로 돌아가기</a>
    </section>`;
  if (tocList) tocList.innerHTML = '';
}

async function renderPage() {
  if (!weekData) return;

  document.title = `${week}주차 · ${weekData.title} | 웹프로젝트 실습`;
  weekEl.textContent = `WEEK ${String(week).padStart(2, '0')} · ${weekData.type === 'exam' ? '평가' : '수업'}`;
  titleEl.textContent = weekData.title;
  summaryEl.textContent = weekData.summary;
  heroNumberEl.textContent = String(week).padStart(2, '0');
  keywordEl.innerHTML = weekData.keywords.map(keyword => `<span>${escapeHtml(keyword)}</span>`).join('');

  buildWeekSelect();
  buildPager();

  if (!READY_WEEKS.has(week)) {
    renderPendingLecture();
    return;
  }

  setupTocThumbnail();

  try {
    const source = await loadLectureSource();
    contentEl.innerHTML = renderNotionMarkdown(source);
    enhanceCodeBlocks();
    buildToc();
  } catch (error) {
    console.error(error);
    contentEl.innerHTML = `<div class="callout red"><strong>강의교안 로드 오류</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function enhanceCodeBlocks() {
  contentEl.querySelectorAll('pre[data-lang]').forEach(pre => {
    const lang = pre.dataset.lang || 'code';
    const codeText = pre.textContent.replace(/^\n+|\n+$/g, '');
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    wrapper.innerHTML = `<div class="code-toolbar"><span class="code-lang">${escapeHtml(lang)}</span><button class="copy-code" type="button">복사</button></div><pre><code>${escapeHtml(codeText)}</code></pre>`;
    pre.replaceWith(wrapper);
  });

  contentEl.querySelectorAll('.copy-code').forEach(button => {
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block').querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        const area = document.createElement('textarea');
        area.value = code;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      button.textContent = '복사됨';
      button.classList.add('is-copied');
      setTimeout(() => {
        button.textContent = '복사';
        button.classList.remove('is-copied');
      }, 1500);
    });
  });
}

function buildToc() {
  const headings = [...contentEl.querySelectorAll('h1, h2')];
  headings.forEach((heading, index) => { heading.id = `section-${index + 1}`; });
  tocList.innerHTML = headings.map(heading => {
    const depth = heading.tagName === 'H2' ? ' class="toc-depth-2"' : '';
    return `<a href="#${heading.id}"${depth}>${escapeHtml(heading.textContent)}</a>`;
  }).join('');
}

function fillWeekSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = window.WEEK_DATA.map(item => {
    const number = String(item.week).padStart(2, '0');
    const selected = item.week === week ? ' selected' : '';
    return `<option value="${number}"${selected}>${number}주차 · ${escapeHtml(item.title)}</option>`;
  }).join('');

  selectEl.addEventListener('change', () => {
    window.location.href = `./lecture.html?week=${selectEl.value}`;
  });
}

function buildWeekSelect() {
  fillWeekSelect(weekSelect);
  fillWeekSelect(mobileWeekSelect);
}

function buildPager() {
  const prev = window.WEEK_DATA.find(item => item.week === week - 1);
  const next = window.WEEK_DATA.find(item => item.week === week + 1);
  if (prev) {
    prevWeek.href = `./lecture.html?week=${String(prev.week).padStart(2, '0')}`;
    prevWeek.querySelector('strong').textContent = `${prev.week}주차 · ${prev.title}`;
  } else prevWeek.style.visibility = 'hidden';
  if (next) {
    nextWeek.href = `./lecture.html?week=${String(next.week).padStart(2, '0')}`;
    nextWeek.querySelector('strong').textContent = `${next.week}주차 · ${next.title}`;
  } else nextWeek.style.visibility = 'hidden';
}

const updateTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
window.addEventListener('scroll', updateTopButton, { passive: true });
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

injectLectureImageStyles();
renderPage();
updateTopButton();
