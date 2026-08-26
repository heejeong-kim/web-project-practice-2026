const params = new URLSearchParams(window.location.search);
const weekParam = params.get('week');
const parsedWeek = weekParam === null ? 1 : Number(weekParam);
const requestedWeek = Number.isFinite(parsedWeek) ? parsedWeek : 1;
const week = Math.min(15, Math.max(0, requestedWeek));
const weekData = window.WEEK_DATA.find(item => item.week === week);
const READY_WEEKS = new Set([0, 1, 2, 3]);
const PROTECTED_WEEKS = new Set([2, 3]);
const LECTURE_PASSWORD = '8989';
const LECTURE_ACCESS_KEY = 'web-project-lecture-access';
const ASSET_VERSION = '20260815-1200';

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
const lectureLayout = document.querySelector('#lecture-layout');
const lectureSideToggle = document.querySelector('#lecture-side-toggle');
const LECTURE_SIDE_STORAGE_KEY = 'web-project-lecture-side-closed';

function requestLecturePassword(targetWeek) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.58);backdrop-filter:blur(4px)';
    overlay.innerHTML = `<form style="width:min(100%,360px);padding:28px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.3)"><h2 style="margin:0 0 8px;font-size:22px">${targetWeek}주차 강의교안</h2><p style="margin:0 0 18px;color:#667085">비밀번호를 입력해 주세요.</p><input type="password" inputmode="numeric" autocomplete="off" aria-label="강의교안 비밀번호" style="box-sizing:border-box;width:100%;height:46px;padding:0 13px;border:1px solid #cfd5df;border-radius:10px;font-size:18px"><p data-error role="alert" style="display:none;margin:8px 0 0;color:#dc2626;font-size:14px">비밀번호가 올바르지 않습니다.</p><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px"><button type="button" data-cancel style="min-height:42px;padding:0 15px;border:1px solid #d0d5dd;border-radius:9px;background:#fff">취소</button><button type="submit" style="min-height:42px;padding:0 17px;border:0;border-radius:9px;background:#172033;color:#fff;font-weight:700">확인</button></div></form>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('input');
    const close = result => { overlay.remove(); resolve(result); };
    overlay.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      if (input.value === LECTURE_PASSWORD) close(true);
      else { overlay.querySelector('[data-error]').style.display = 'block'; input.select(); }
    });
    overlay.querySelector('[data-cancel]').addEventListener('click', () => close(false));
    overlay.addEventListener('click', event => { if (event.target === overlay) close(false); });
    input.focus();
  });
}

async function requestLectureAccess(targetWeek) {
  if (!PROTECTED_WEEKS.has(targetWeek)) return true;
  return requestLecturePassword(targetWeek);
}

function grantNextLectureAccess(targetWeek) {
  try { sessionStorage.setItem(LECTURE_ACCESS_KEY, String(targetWeek)); } catch {}
}

async function verifyInitialLectureAccess() {
  if (!PROTECTED_WEEKS.has(week)) return true;
  try {
    if (sessionStorage.getItem(LECTURE_ACCESS_KEY) === String(week)) {
      sessionStorage.removeItem(LECTURE_ACCESS_KEY);
      return true;
    }
  } catch {}
  if (await requestLectureAccess(week)) return true;
  window.location.replace('../index.html#weeks');
  return false;
}

const lectureAccessPromise = verifyInitialLectureAccess();

function setupLectureSideToggle() {
  if (!lectureLayout || !lectureSideToggle) return;

  const setClosed = closed => {
    lectureLayout.classList.toggle('is-side-closed', closed);
    lectureSideToggle.setAttribute('aria-expanded', String(!closed));
    lectureSideToggle.innerHTML = closed
      ? '<span aria-hidden="true">▶</span> 왼쪽 영역 열기'
      : '<span aria-hidden="true">◀</span> 왼쪽 영역 닫기';
  };

  let savedClosed = false;
  try {
    savedClosed = localStorage.getItem(LECTURE_SIDE_STORAGE_KEY) === 'true';
  } catch {}
  setClosed(savedClosed);

  lectureSideToggle.addEventListener('click', () => {
    const closed = !lectureLayout.classList.contains('is-side-closed');
    setClosed(closed);
    try {
      localStorage.setItem(LECTURE_SIDE_STORAGE_KEY, String(closed));
    } catch {}
  });
}

function itemLabel(item) {
  return item?.week === 0 ? 'OT' : `${item?.week}주차`;
}

function injectLectureImageStyles() {
  if (document.querySelector('#lecture-image-styles')) return;
  const style = document.createElement('style');
  style.id = 'lecture-image-styles';
  style.textContent = `
    .lecture-shell{width:min(1520px,calc(100% - 64px))!important}
    .toc-week-thumbnail{display:block;margin:12px 0 16px;border-radius:12px;overflow:hidden;border:1px solid #e1e6ee;background:#e8edf4}
    .toc-week-thumbnail img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
    .chapter-image{display:block;margin:18px 0 34px;border-radius:18px;overflow:hidden;background:#eef1f5}
    .chapter-image img{display:block;width:100%;height:auto}
    .callout.no-icon{grid-template-columns:minmax(0,1fr)}
    .callout.no-icon .callout-icon{display:none}
    .callout-body>p:first-child{margin-top:0}
    .callout-body>p:last-child{margin-bottom:0}
    .lecture-content .practice-heading,.lecture-content .practice-heading *{color:#2563eb!important}
    .lecture-content .notion-blue{color:#2563eb!important}
    .lecture-content .notion-red{color:#dc2626!important}
    .lecture-content .notion-gray{color:#667085!important}
    .lecture-content .lecture-example::first-letter{font-weight:inherit!important}
    .callout.is-production-note{background:#f4f5f7!important;border-left-color:#98a2b3!important;color:#667085!important;font-size:13.5px!important}
    .callout.is-production-note .callout-body,.callout.is-production-note .callout-body p,.callout.is-production-note .callout-body li,.callout.is-production-note .callout-body span,.callout.is-production-note .callout-body strong{color:#667085!important;font-size:13.5px!important;line-height:1.65}
    @media(max-width:680px){
      .lecture-shell{width:min(100% - 28px,1520px)!important}
      .chapter-image{margin:14px 0 28px;border-radius:14px}
    }
  `;
  document.head.appendChild(style);
}

function setupTocThumbnail() {
  const tocCard = document.querySelector('.toc-card');
  if (!tocCard || !READY_WEEKS.has(week)) return;
  tocCard.querySelector('.toc-week-thumbnail')?.remove();
  const title = tocCard.querySelector(':scope > strong');
  if (!title) return;
  const figure = document.createElement('div');
  figure.className = 'toc-week-thumbnail';
  const thumbnail = week === 0 ? `../asset/ot.png?v=${ASSET_VERSION}` : `../asset/${week}.png?v=${ASSET_VERSION}`;
  figure.innerHTML = `<img src="${thumbnail}" alt="${itemLabel(weekData)} ${escapeHtml(weekData.title)} 썸네일">`;
  title.insertAdjacentElement('afterend', figure);
}

function insertChapterImages() {
  if (week !== 1) return;
  const chapterImages = [
    { prefix: '1.', src: `/web-project-practice-2026/asset/1_1.png?v=${ASSET_VERSION}`, alt: '1장 웹프로젝트 실습의 이해' },
    { prefix: '2.', src: `/web-project-practice-2026/asset/1_2.png?v=${ASSET_VERSION}`, alt: '2장 데이터 기반 웹서비스의 구조' },
    { prefix: '3.', src: `/web-project-practice-2026/asset/1_3.png?v=${ASSET_VERSION}`, alt: '3장 웹서비스 사례 분석과 프로젝트 탐색' }
  ];

  const h1List = [...contentEl.querySelectorAll('h1')];
  chapterImages.forEach(item => {
    const heading = h1List.find(h1 => h1.textContent.trim().startsWith(item.prefix));
    if (!heading) return;
    const existing = heading.nextElementSibling;
    if (existing?.classList.contains('chapter-image')) return;
    const figure = document.createElement('figure');
    figure.className = 'chapter-image';
    figure.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="eager">`;
    heading.insertAdjacentElement('afterend', figure);
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function notionInlineSpans(value = '') {
  return value.replace(/<span\s+color="([^"]+)">([\s\S]*?)<\/span>/g, (_, color, text) => {
    const className = color.includes('blue') ? 'notion-blue'
      : color.includes('red') ? 'notion-red'
      : color.includes('gray') ? 'notion-gray'
      : '';
    return className ? `<span class="${className}">${text}</span>` : `<span>${text}</span>`;
  });
}

function inlineMarkdown(value = '') {
  return notionInlineSpans(value)
    .replace(/\\([\[\]~*`|])/g, '$1')
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '<img class="lecture-image" src="$2" alt="$1" loading="lazy">')
    .replace(/!\[([^\]]*)\]\((\.\.?\/[^)]+)\)/g, '<img class="lecture-image" src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s>])\*\*(?=\s|[📌📦🖇️⚠️✅🚀💡])/g, '$1')
    .replace(/\*\*(?=\s*(?:<\/span>)?$)/g, '');
}

function calloutClass(color = '') {
  if (color.includes('blue')) return 'blue';
  if (color.includes('purple')) return 'purple';
  if (color.includes('green')) return 'green';
  if (color.includes('yellow')) return 'yellow';
  if (color.includes('red')) return 'red';
  return 'gray';
}

function normalizeLecturePaths(source = '') {
  return source
    .replaceAll('./data/', '../data/')
    .replaceAll('./asset/', '../asset/');
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

    const calloutOpen = line.match(/^<callout(?:\s+icon="([^"]*)")?\s+color="([^"]*)">$/);
    if (calloutOpen) {
      closeList();
      const preview = lines.slice(i + 1, Math.min(lines.length, i + 10)).join('\n');
      const productionNoteClass = preview.includes('교안 제작 참고') ? ' is-production-note' : '';
      const noIconClass = calloutOpen[1] ? '' : ' no-icon';
      const icon = calloutOpen[1] ? `<span class="callout-icon" aria-hidden="true">${escapeHtml(calloutOpen[1])}</span>` : '<span class="callout-icon" aria-hidden="true"></span>';
      out.push(`<div class="callout ${calloutClass(calloutOpen[2])}${productionNoteClass}${noIconClass}">${icon}<div class="callout-body">`);
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

    if (/^!\[[^\]]*\]\((https?:\/\/|\.\.?\/)/.test(line)) {
      closeList();
      out.push(inlineMarkdown(line));
      continue;
    }

    if (line === '---') {
      closeList();
      if (out[out.length - 1] !== '<hr>') out.push('<hr>');
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(4, heading[1].length);
      const practiceClass = /(?:🖇️\s*)?실습[｜|]/.test(heading[2]) ? ' class="practice-heading"' : '';
      out.push(`<h${level}${practiceClass}>${inlineMarkdown(heading[2])}</h${level}>`);
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

    if (/^<span\s+color="[^"]+">[\s\S]*<\/span>$/.test(line)) {
      closeList();
      out.push(inlineMarkdown(line));
      continue;
    }

    if (/^<[^>]+>/.test(line)) {
      closeList();
      out.push(notionInlineSpans(line));
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
  const response = await fetch(`../data/lectures/week${number}.md?v=${ASSET_VERSION}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${itemLabel(weekData)} 원문 파일을 불러오지 못했습니다.`);

  let source = await response.text();
  if (week === 2) {
    const syncResponse = await fetch(`../data/lectures/week02-2_5.md?v=${ASSET_VERSION}`, { cache: 'no-store' });
    if (!syncResponse.ok) throw new Error('2주차 2.5 동기화 원문을 불러오지 못했습니다.');
    const syncedSection = await syncResponse.text();
    const sectionMarker = '<summary><span color="blue">**\\[참고\\] 시장 분석 및 트랜드 보고서 (개인별 산출물에 포함)**</span></summary>\n</details>';
    if (!source.includes(sectionMarker)) throw new Error('2주차 2.5 삽입 위치를 찾지 못했습니다.');
    source = source.replace(sectionMarker, `<summary><span color="blue">**\\[참고\\] 시장 분석 및 트랜드 보고서 (개인별 산출물에 포함)**</span></summary>\n${syncedSection}\n</details>`);
  }

  return normalizeLecturePaths(source);
}

function renderPendingLecture() {
  const label = itemLabel(weekData);
  document.title = `${label} · 교안 준비중 | 웹프로젝트 실습`;
  summaryEl.textContent = '현재 강의교안을 준비하고 있습니다.';
  keywordEl.innerHTML = '<span>COMING SOON</span>';
  contentEl.innerHTML = `
    <section class="lecture-pending" role="status" aria-live="polite">
      <span class="lecture-pending-mark" aria-hidden="true">${week === 0 ? 'OT' : String(week).padStart(2, '0')}</span>
      <h2>교안 준비중입니다.</h2>
      <p>해당 주차 강의교안은 준비가 완료된 후 공개됩니다.</p>
      <a href="../index.html#weeks">주차별 수업으로 돌아가기</a>
    </section>`;
  if (tocList) tocList.innerHTML = '';
}

async function renderPage() {
  if (!weekData) return;

  const label = itemLabel(weekData);
  document.title = `${label} · ${weekData.title} | 웹프로젝트 실습`;
  weekEl.textContent = week === 0 ? 'OT · 오리엔테이션' : `WEEK ${String(week).padStart(2, '0')} · ${weekData.type === 'exam' ? '평가' : '수업'}`;
  titleEl.textContent = weekData.title;
  summaryEl.textContent = weekData.summary;
  heroNumberEl.textContent = week === 0 ? 'OT' : String(week).padStart(2, '0');
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
    insertChapterImages();
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
  const headings = [...contentEl.querySelectorAll('h1, h2')]
    .filter(heading => !heading.closest('details'));
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
    const disabled = READY_WEEKS.has(item.week) ? '' : ' disabled';
    const label = item.week === 0 ? 'OT' : `${number}주차 · ${escapeHtml(item.title)}`;
    return `<option value="${number}"${selected}${disabled}>${label}</option>`;
  }).join('');

  selectEl.addEventListener('change', async () => {
    const targetWeek = Number(selectEl.value);
    if (!await requestLectureAccess(targetWeek)) {
      selectEl.value = String(week).padStart(2, '0');
      return;
    }
    grantNextLectureAccess(targetWeek);
    window.location.href = `?week=${selectEl.value}`;
  });
}

function buildWeekSelect() {
  fillWeekSelect(weekSelect);
  fillWeekSelect(mobileWeekSelect);
}

function setPagerCard(element, target, direction) {
  const label = direction === 'prev' ? 'PREV' : 'NEXT';
  element.querySelector('small').textContent = label;
  element.classList.remove('is-disabled');
  element.removeAttribute('aria-disabled');
  element.removeAttribute('tabindex');

  if (!target) {
    element.removeAttribute('href');
    element.classList.add('is-disabled');
    element.setAttribute('aria-disabled', 'true');
    element.setAttribute('tabindex', '-1');
    element.querySelector('strong').textContent = direction === 'prev' ? '이전 주차 없음' : '다음 주차 없음';
    return;
  }

  element.querySelector('strong').textContent = `${itemLabel(target)} · ${target.title}`;
  if (!READY_WEEKS.has(target.week)) {
    element.removeAttribute('href');
    element.classList.add('is-disabled');
    element.setAttribute('aria-disabled', 'true');
    element.setAttribute('tabindex', '-1');
    return;
  }

  element.href = `?week=${String(target.week).padStart(2, '0')}`;
  if (PROTECTED_WEEKS.has(target.week)) {
    element.addEventListener('click', async event => {
      event.preventDefault();
      if (!await requestLectureAccess(target.week)) return;
      grantNextLectureAccess(target.week);
      window.location.href = element.href;
    });
  }
}

function buildPager() {
  const currentIndex = window.WEEK_DATA.findIndex(item => item.week === week);
  const prev = currentIndex > 0 ? window.WEEK_DATA[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < window.WEEK_DATA.length - 1 ? window.WEEK_DATA[currentIndex + 1] : null;

  prevWeek.style.visibility = 'visible';
  nextWeek.style.visibility = 'visible';
  setPagerCard(prevWeek, prev, 'prev');
  setPagerCard(nextWeek, next, 'next');
}

const updateTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
window.addEventListener('scroll', updateTopButton, { passive: true });
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

setupLectureSideToggle();
injectLectureImageStyles();
lectureAccessPromise.then(hasAccess => { if (hasAccess) renderPage(); });
updateTopButton();
