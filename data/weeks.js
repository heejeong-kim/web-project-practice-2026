window.WEEK_DATA = [
  {week:0,title:'OT',type:'class',keywords:['성적 평가기준','수업 운영','교안 안내'],summary:'성적 평가기준과 수업 운영 방식, 강의교안 제작 안내를 확인한다',page:'./lecture/index.html?week=00'},
  {week:1,title:'웹프로젝트 이해',type:'class',keywords:['웹서비스','JSON','LocalStorage'],summary:'웹페이지와 데이터 기반 웹서비스의 차이, 프로젝트 범위와 트랙을 이해한다',page:'./lecture/index.html?week=01'},
  {week:2,title:'서비스 역분석 및 시장·트렌드 조사',type:'class',keywords:['Reverse Analysis','Market Trend','Opportunity'],summary:'기존 서비스를 사용자·문제·기능·데이터 관점에서 역분석하고 시장·경쟁서비스 비교를 통해 프로젝트 기회 영역을 찾는다',page:'./lecture/index.html?week=02'},
  {week:3,title:'사용자 분석 및 프로젝트 문제 정의',type:'class',keywords:['Persona','Problem Statement','Value Proposition'],summary:'개인 아이디어를 팀에서 비교해 후보를 선택하고 핵심 사용자·문제·가치 제안을 정의해 프로젝트 주제와 트랙을 확정한다',page:'./lecture/index.html?week=03'},
  {week:4,title:'서비스 구조 및 UX 설계',type:'class',keywords:['MVP','IA','User Flow'],summary:'핵심 기능, 정보구조, 사용자 흐름, 와이어프레임을 설계한다',page:'./lecture/index.html?week=04'},
  {week:5,title:'JavaScript 프로젝트 기초',type:'class',keywords:['DOM','Event','Function'],summary:'정적 HTML·CSS에 JavaScript 상호작용을 연결하고 입력→처리→출력 구조를 익힌다',page:''},
  {week:6,title:'JSON 데이터셋 설계',type:'class',keywords:['Dataset','Field','ID'],summary:'검색·필터·정렬·상세보기에 필요한 JSON 데이터 구조와 명세를 설계한다',page:'./lecture/index.html?week=06'},
  {week:7,title:'JSON 기반 화면 구현',type:'class',keywords:['fetch','Rendering','Data Check'],summary:'JSON 데이터를 fetch로 연결해 점검·수정하고 추가한 필드를 화면에 보여주도록 인터페이스를 변경한다',page:'./lecture/index.html?week=07'},
  {week:8,title:'중간평가',type:'exam',keywords:['1~6주차','주관식·객관식','3시간 필기시험'],summary:'1~6주차의 서비스 문제 정의·구조 설계·JavaScript·JSON 연결 흐름을 주관식과 객관식 필기시험으로 평가한다',page:'./lecture/index.html?week=08'},
  {week:9,title:'검색·필터·정렬 기능',type:'class',keywords:['Search','Filter','Sort'],summary:'7주차 JSON 위에 검색·복수 필터·정렬을 하나의 상태와 결과 배열로 연결한다',page:'./lecture/index.html?week=09'},
  {week:10,title:'프로토타이핑 전환 및 상세보기 기능 구현',type:'class',keywords:['Prototyping','Detail View','Interaction'],summary:'와이어프레임을 작동하는 프로토타입으로 전환하고 ID 기반 상세보기·목록 복귀·예외 처리를 핵심 사용자 흐름으로 구현한다',page:'./lecture/index.html?week=10'},
  {week:11,title:'LocalStorage 기초',type:'class',keywords:['Client Storage','Serialization','Favorite'],summary:'즐겨찾기·최근 본 공간·비교와 비교 메뉴를 구현하고 프로토타입 좋아요를 실제 공용 집계와 구분한다',page:'./lecture/index.html?week=11'},
  {week:12,title:'개인화 통합·테스트·개선',type:'class',keywords:['Integration','User Test','Regression'],summary:'개인화 기능을 통합하고 사용자 테스트·주요 수정·회귀 테스트 후 최종 IA를 정리한다. 외부 연동은 선택 심화로 적용한다',page:'./lecture/index.html?week=12'},
  {week:13,title:'프로젝트 발표 준비',type:'class',keywords:['발표 구성','리허설','최종 QA'],summary:'8개 발표 흐름에 근거 자료를 연결하고 발표자료·시연·리허설·최종 IA 대조·QA와 발표 버전 고정을 완료한다',page:'./lecture/index.html?week=13'},
  {week:14,title:'프로젝트 발표',type:'class',keywords:['발표','시연','질의응답'],summary:'13주차에 준비한 자료와 고정한 배포 버전으로 팀별 발표·시연·질의응답·상호 피드백을 진행한다',page:'./lecture/index.html?week=14'},
  {week:15,title:'기말평가',type:'exam',keywords:['9~14주차','주관식·객관식','3시간 필기시험'],summary:'9~14주차의 탐색·상세·개인화·테스트·배포 흐름을 주관식과 객관식 필기시험으로 평가한다',page:'./lecture/index.html?week=15'}
];

(() => {
  if (!/\/lecture\/?$/.test(window.location.pathname)) return;
  const week = Number(new URLSearchParams(window.location.search).get('week'));
  if (week !== 4) return;

  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[char]));
  const inline = value => String(value || '')
    .replace(/<span\s+color="([^"]+)">([\s\S]*?)<\/span>/g, (_, color, text) => `<span class="${color.includes('blue') ? 'notion-blue' : color.includes('red') ? 'notion-red' : color.includes('gray') ? 'notion-gray' : ''}">${text}</span>`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const renderMarkdown = source => {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let listType = null;
    const closeList = () => { if (listType) out.push(`</${listType}>`); listType = null; };
    const unescapeNotion = value => String(value || '').replace(/\\([\[\]~|])/g, '$1');
    for (let i = 0; i < lines.length; i += 1) {
      const line = unescapeNotion(lines[i].replace(/^\t+/, ''));
      const callout = line.match(/^<callout(?:\s+icon="([^"]*)")?\s+color="([^"]*)">$/);
      if (callout) {
        closeList();
        const color = callout[2].includes('blue') ? 'blue' : callout[2].includes('purple') ? 'purple' : callout[2].includes('green') ? 'green' : callout[2].includes('yellow') ? 'yellow' : callout[2].includes('red') ? 'red' : 'gray';
        const icon = callout[1] ? `<span class="callout-icon" aria-hidden="true">${escapeHtml(callout[1])}</span>` : '<span class="callout-icon" aria-hidden="true"></span>';
        out.push(`<div class="callout ${color}${callout[1] ? '' : ' no-icon'}">${icon}<div class="callout-body">`);
        continue;
      }
      if (line === '</callout>') { closeList(); out.push('</div></div>'); continue; }
      if (/^<details>|^<\/details>/.test(line)) { closeList(); out.push(line); continue; }
      if (line.startsWith('<summary>')) { closeList(); out.push(`<summary>${inline(line.replace('<summary>', '').replace('</summary>', ''))}</summary>`); continue; }
      if (/^<table|^<\/table>|^<colgroup|^<\/colgroup>|^<col\b|^<tr>|^<\/tr>|^<thead|^<\/thead>|^<tbody|^<\/tbody>/.test(line)) { closeList(); out.push(line.replace(/ fit-page-width="true"| header-row="true"/g, '')); continue; }
      const cell = line.match(/^<(td|th)>([\s\S]*)<\/(td|th)>$/);
      if (cell) { closeList(); out.push(`<${cell[1]}>${inline(cell[2])}</${cell[3]}>`); continue; }
      if (line === '---') { closeList(); if (out[out.length - 1] !== '<hr>') out.push('<hr>'); continue; }
      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        closeList();
        const level = Math.min(4, heading[1].length);
        const practiceClass = /(?:🖇️\s*)?실습[｜|]/.test(heading[2]) ? ' class="practice-heading"' : '';
        out.push(`<h${level}${practiceClass}>${inline(heading[2])}</h${level}>`);
        continue;
      }
      const bullet = line.match(/^[-*]\s+(.+)$/);
      if (bullet) { if (listType !== 'ul') { closeList(); listType = 'ul'; out.push('<ul>'); } out.push(`<li>${inline(bullet[1])}</li>`); continue; }
      const numbered = line.match(/^\d+[.)]\s+(.+)$/);
      if (numbered) { if (listType !== 'ol') { closeList(); listType = 'ol'; out.push('<ol>'); } out.push(`<li>${inline(numbered[1])}</li>`); continue; }
      if (!line.trim()) { closeList(); continue; }
      if (/^<span\s+color=/.test(line)) { closeList(); out.push(inline(line)); continue; }
      if (line.startsWith('> ')) { closeList(); out.push(`<p class="lecture-example">${inline(line.slice(2))}</p>`); continue; }
      closeList(); out.push(`<p>${inline(line)}</p>`);
    }
    closeList();
    return out.join('\n');
  };

  const buildToc = content => {
    const toc = document.querySelector('#toc-list');
    if (!toc) return;
    const headings = [...content.querySelectorAll('h1,h2')].filter(heading => !heading.closest('details'));
    headings.forEach((heading, index) => { heading.id = `section-${index + 1}`; });
    toc.innerHTML = headings.map(heading => `<a href="#${heading.id}"${heading.tagName === 'H2' ? ' class="toc-depth-2"' : ''}>${escapeHtml(heading.textContent)}</a>`).join('');
  };

  const enhanceWeek4Content = content => {
    if (!document.querySelector('#week4-preview-styles')) {
      const style = document.createElement('style');
      style.id = 'week4-preview-styles';
      style.textContent = `
        .lecture-content .week4-chapter-image{display:block;margin:18px 0 34px;border-radius:18px;overflow:hidden;background:#eef1f5}
        .lecture-content .week4-chapter-image img{display:block;width:100%;height:auto}
        .lecture-content .week4-wireframe-wrap{margin:18px 0 24px}
        .lecture-content .week4-wireframe-frame{display:block;width:100%;height:min(78vh,900px);min-height:620px;border:1px solid #dfe4eb;border-radius:14px;background:#fff}
        .lecture-content .week4-wireframe-actions{display:flex;justify-content:flex-end;margin-top:10px}
        .lecture-content .week4-wireframe-open{display:inline-flex;align-items:center;min-height:40px;padding:0 13px;border:1px solid #ffb27f;border-radius:9px;background:#fff;color:#b95516!important;text-decoration:none!important;font-size:13px;font-weight:800}
        .lecture-content .week4-wireframe-open:hover{background:#fff3eb;border-color:#ff8a3d}
        .lecture-content table.week4-nowrap-category th:first-child,.lecture-content table.week4-nowrap-category td:first-child{white-space:nowrap;width:1%}
        @media(max-width:680px){.lecture-content .week4-chapter-image{margin:14px 0 28px;border-radius:14px}.lecture-content .week4-wireframe-frame{min-height:560px;height:72vh}}
      `;
      document.head.appendChild(style);
    }

    const chapterImages = [
      { prefix: '0.', src: '../asset/4_0.png?v=20260831-1145', alt: '0장 팀 작업 준비' },
      { prefix: '1.', src: '../asset/4_1.png?v=20260831-1145', alt: '1장 사용자 시나리오와 기능 구조' },
      { prefix: '2.', src: '../asset/4_2.png?v=20260831-1145', alt: '2장 정보구조와 사용자 흐름 설계' },
      { prefix: '3.', src: '../asset/4_3.png?v=20260831-1145', alt: '3장 와이어프레임과 데이터 연결' },
      { prefix: '4.', src: '../asset/4_4.png?v=20260831-1145', alt: '4장 설계 검토와 구현 범위 확정' }
    ];
    const h1List = [...content.querySelectorAll('h1')];
    chapterImages.forEach(item => {
      const heading = h1List.find(h1 => h1.textContent.trim().startsWith(item.prefix));
      if (!heading || heading.nextElementSibling?.classList.contains('week4-chapter-image')) return;
      const figure = document.createElement('figure');
      figure.className = 'week4-chapter-image';
      figure.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="eager">`;
      heading.insertAdjacentElement('afterend', figure);
    });

    [...content.querySelectorAll('table')].forEach(table => {
      const firstCell = table.querySelector('tr:first-child > th:first-child, tr:first-child > td:first-child');
      if (firstCell?.textContent.trim() === '구분') table.classList.add('week4-nowrap-category');
    });

    const targetDetails = [...content.querySelectorAll('details')].find(details => details.querySelector('summary')?.textContent.includes('와이어프레임 및 화면별 데이터 매핑'));
    if (targetDetails && !targetDetails.querySelector('.week4-wireframe-wrap')) {
      const placeholder = [...targetDetails.querySelectorAll('.callout')].find(node => node.textContent.includes('[도면 삽입 위치]'));
      if (placeholder) {
        const wrap = document.createElement('div');
        wrap.className = 'week4-wireframe-wrap';
        wrap.innerHTML = `<iframe class="week4-wireframe-frame" src="../data/samples/4week_kagong-wireframe.html?v=20261021-restore46" title="카공 공간 조건 탐색 서비스 로우파이 와이어프레임" loading="lazy"></iframe><div class="week4-wireframe-actions"><a class="week4-wireframe-open" href="../data/samples/4week_kagong-wireframe.html?v=20261021-restore46" target="_blank" rel="noopener noreferrer">새창으로 열기 ↗</a></div>`;
        placeholder.replaceWith(wrap);
      }
    }
  };

  const renderPreview = async () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    try {
      const response = await fetch('../data/lectures/week04.md?v=20260831-1130', { cache: 'no-store' });
      if (!response.ok) throw new Error('4주차 교안 원문을 불러오지 못했습니다.');
      const source = await response.text();
      const data = window.WEEK_DATA.find(item => item.week === 4);
      document.title = `4주차 · ${data.title} | 웹프로젝트 실습`;
      document.querySelector('#lecture-summary').textContent = data.summary;
      document.querySelector('#lecture-keywords').innerHTML = data.keywords.map(keyword => `<span>${escapeHtml(keyword)}</span>`).join('');
      content.innerHTML = renderMarkdown(source);
      enhanceWeek4Content(content);
      buildToc(content);
    } catch (error) {
      content.innerHTML = `<div class="callout red"><strong>강의교안 로드 오류</strong><p>${escapeHtml(error.message)}</p></div>`;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(renderPreview, 0), { once: true });
  else setTimeout(renderPreview, 0);
})();
// 4주차 로우파이 와이어프레임 도면 삽입
// - 도면 자리표시([도면 삽입 위치])는 비밀번호 잠금 영역 안에 있으므로, 잠금 해제 후 내용이 추가될 때도 교체해야 함
// - /lecture/, /lecture/index.html, 로컬(file://) 경로 모두에서 동작
(() => {
  const week = Number(new URLSearchParams(window.location.search).get('week'));
  if (week !== 4 || !/\/lecture\/(index\.html)?$/.test(window.location.pathname)) return;

  const WIREFRAME_SRC = '../data/samples/4week_kagong-wireframe.html?v=20261021-restore46';

  // 도면 영역 스타일 (한 번만 추가)
  const ensureStyles = () => {
    if (document.querySelector('#week4-wireframe-styles')) return;
    const style = document.createElement('style');
    style.id = 'week4-wireframe-styles';
    style.textContent = `
      .lecture-content .week4-wireframe-wrap{margin:18px 0 24px}
      .lecture-content .week4-wireframe-frame{display:block;width:100%;height:min(78vh,900px);min-height:620px;border:1px solid #dfe4eb;border-radius:14px;background:#fff}
      .lecture-content .week4-wireframe-actions{display:flex;justify-content:flex-end;margin-top:10px}
      .lecture-content .week4-wireframe-open{display:inline-flex;align-items:center;min-height:40px;padding:0 13px;border:1px solid #ffb27f;border-radius:9px;background:#fff;color:#b95516!important;text-decoration:none!important;font-size:13px;font-weight:800}
      .lecture-content .week4-wireframe-open:hover{background:#fff3eb;border-color:#ff8a3d}
      @media(max-width:680px){.lecture-content .week4-wireframe-frame{min-height:560px;height:72vh}}
    `;
    document.head.appendChild(style);
  };

  // [도면 삽입 위치] 콜아웃을 iframe과 새 창 보기 버튼으로 교체
  const insertWireframe = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    content.querySelectorAll('.callout').forEach(node => {
      if (!node.textContent.includes('[도면 삽입 위치]')) return;
      ensureStyles();
      const wrap = document.createElement('div');
      wrap.className = 'week4-wireframe-wrap';
      wrap.innerHTML = `<iframe class="week4-wireframe-frame" src="${WIREFRAME_SRC}" title="카공 공간 조건 탐색 서비스 로우파이 와이어프레임" loading="lazy"></iframe><div class="week4-wireframe-actions"><a class="week4-wireframe-open" href="${WIREFRAME_SRC}" target="_blank" rel="noopener noreferrer">새 창에서 크게 보기</a></div>`;
      node.replaceWith(wrap);
    });
    // 잠금 영역(암호화된 원문)에 예전 파일명(kagong-wireframe.html)으로 들어 있는 도면·링크를 새 파일로 교체
    content.querySelectorAll('iframe[src*="kagong-wireframe"], a[href*="kagong-wireframe"]').forEach(node => {
      const attr = node.tagName === 'IFRAME' ? 'src' : 'href';
      const value = node.getAttribute(attr) || '';
      if (value.includes('4week_kagong-wireframe.html')) return;
      ensureStyles();
      node.setAttribute(attr, WIREFRAME_SRC);
    });
  };

  const start = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    insertWireframe();
    // 교안 렌더링·잠금 해제로 내용이 바뀔 때마다 다시 확인
    new MutationObserver(insertWireframe).observe(content, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
// 7·9~14주차 카공 project 실행 화면 삽입
// - 교안의 [실행 화면 삽입 위치] 콜아웃을 카공 실행 화면(iframe)으로 교체 — 7주차 data/samples/7week_kagong, 9~13주차 data/samples/Nweek_kagong(14주차는 13주차 버전)
// - 주차마다 해당 기능을 확인할 화면에서 시작(9 탐색, 10 상세, 11·12 마이, 13·14 홈)
(() => {
  const week = Number(new URLSearchParams(window.location.search).get('week'));
  const SAMPLES = {
    7: ['index.html', '7주차 전용 와이어프레임: JSON 카드·추천/인기/신규 구조·수동 가로 넘김·출처와 실제/더미를 점검. 검색·저장·API 요청은 이후 주차에 연결'],
    9: ['pages/list.html', '버전 내용을 열고 강조 켜기를 선택하면 9주차 업데이트를 표시: 검색어·지역·조건·정렬을 바꾸며 결과 건수가 함께 바뀌는지, ‘영업 중’ 조건과 ‘가까운 순(내 위치)’ 정렬(거리 km)·위치 거부 시 기본 정렬 복귀를 확인'],
    10: ['pages/list.html', '버전 내용을 열고 강조 켜기를 선택하면 10주차 업데이트를 표시: 검색·필터 → 카드 선택 → 상세(위치 지도·추천·공유하기) → ‹ 목록 복귀 순서로 실행하고 탐색 조건이 유지되는지 확인'],
    11: ['pages/list.html', '버전 내용을 열고 강조 켜기를 선택하면 11주차 업데이트를 표시: 별(☆) 저장·최근 본 공간·마이 탭, 상세의 ‘비교 담기’와 공간 비교 페이지를 확인하고 Application 탭에서 kagong-pages- 키 확인'],
    12: ['pages/my.html', '12주차 통합·테스트 대상: 개인 상태·초기화·화면 간 동기화·예외를 검증하고 테스트 기록지 작성 후 마지막에 최종 IA를 정리. 외부 API·구글 시트는 선택 심화이며 미연결 임시 저장을 실제 공용 저장과 구분'],
    13: ['index.html', '발표 준비용 프로토타입: 대표 과업 시연을 리허설하고 최종 QA·배포 점검·발표 버전 고정을 완료'],
    14: ['index.html', '발표 시연 참고: 13주차에 준비한 버전으로 홈 → 탐색 → 상세 → 저장 → 마이 흐름을 설명']
  };
  if (!SAMPLES[week] || !/\/lecture\/(index\.html)?$/.test(window.location.pathname)) return;

  // 7주차는 전용 7week_kagong, 9주차부터는 주차별 폴더(9week_kagong/9week_kagong.html …), 14주차는 13주차에 고정한 발표 버전 사용
  const SAMPLE_DIR = week === 7 ? '7week_kagong' : `${Math.min(week, 13)}week_kagong`;
  const sampleUrl = SAMPLES[week][0].replace(/^index\.html/, `${SAMPLE_DIR}.html`);
  const SAMPLE_SRC = `../data/samples/${SAMPLE_DIR}/` + sampleUrl + (week >= 10 ? (sampleUrl.includes('?') ? '&' : '?') + 'prototype=1' : '');

  // 실행 화면 영역 스타일 (한 번만 추가)
  const ensureStyles = () => {
    if (document.querySelector('#week7-sample-styles')) return;
    const style = document.createElement('style');
    style.id = 'week7-sample-styles';
    style.textContent = `
      .lecture-content .week7-sample-wrap{margin:18px 0 24px}
      .lecture-content .week7-sample-frame{display:block;width:100%;height:min(80vh,820px);min-height:600px;border:1px solid #dfe4eb;border-radius:14px;background:#f5f6f8}
      .lecture-content .week7-sample-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px}
      .lecture-content .week7-sample-note{font-size:13px;color:#8b95a5}
      .lecture-content .week7-sample-open{display:inline-flex;align-items:center;flex:0 0 auto;min-height:40px;padding:0 13px;border:1px solid #ffb27f;border-radius:9px;background:#fff;color:#b95516!important;text-decoration:none!important;font-size:13px;font-weight:800}
      .lecture-content .week7-sample-open:hover{background:#fff3eb;border-color:#ff8a3d}
      @media(max-width:680px){.lecture-content .week7-sample-frame{min-height:560px;height:72vh}.lecture-content .week7-sample-actions{flex-direction:column;align-items:flex-start}}
    `;
    document.head.appendChild(style);
  };

  // [실행 화면 삽입 위치] 콜아웃을 iframe과 새 창 보기 버튼으로 교체
  const insertSample = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    content.querySelectorAll('.callout').forEach(node => {
      if (!node.textContent.includes('[실행 화면 삽입 위치]')) return;
      ensureStyles();
      // 더블클릭(file://)으로 연 경우 fetch가 차단되므로 안내 문구를 바꿔 표시
      const note = SAMPLES[week][1];
      const wrap = document.createElement('div');
      wrap.className = 'week7-sample-wrap';
      wrap.innerHTML = `<iframe class="week7-sample-frame" src="${SAMPLE_SRC}" title="${week}주차 참고 샘플 카공 project 실행 화면" loading="lazy"></iframe><div class="week7-sample-actions"><span class="week7-sample-note">${note}</span><a class="week7-sample-open" href="${SAMPLE_SRC}" target="_blank" rel="noopener noreferrer">새 창에서 크게 보기</a></div>`;
      node.replaceWith(wrap);
    });
  };

  const start = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    insertSample();
    // 교안 렌더링으로 내용이 바뀔 때마다 다시 확인
    new MutationObserver(insertSample).observe(content, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
// 6주차 3.1.1 필드 묶음 표 비율 조정
// - '필드 묶음'·'단계' 열은 항목명과 데이터가 한 줄로 보이도록 줄바꿈 없이 내용 너비만 차지
// - 남는 너비는 '카공 필드'·'확보 방법' 열이 사용
(() => {
  const week = Number(new URLSearchParams(window.location.search).get('week'));
  if (week !== 6 || !/\/lecture\/(index\.html)?$/.test(window.location.pathname)) return;

  const ensureStyles = () => {
    if (document.querySelector('#week6-field-group-styles')) return;
    const style = document.createElement('style');
    style.id = 'week6-field-group-styles';
    style.textContent = `
      .lecture-content table.week6-field-group td:first-child,
      .lecture-content table.week6-field-group td:last-child{white-space:nowrap;width:1%}
      .lecture-content table.week6-field-group td:last-child{text-align:center}
      @media(max-width:680px){.lecture-content table.week6-field-group td:nth-child(2){min-width:170px}.lecture-content table.week6-field-group td:nth-child(3){min-width:190px}}
    `;
    document.head.appendChild(style);
  };

  // 첫 행이 '필드 묶음 … 단계'인 표에 클래스 부여
  const markTable = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    content.querySelectorAll('table:not(.week6-field-group)').forEach(table => {
      const cells = [...(table.querySelector('tr')?.children || [])].map(cell => cell.textContent.trim());
      if (cells[0] !== '필드 묶음' || cells[cells.length - 1] !== '단계') return;
      ensureStyles();
      table.classList.add('week6-field-group');
    });
  };

  const start = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    markTable();
    new MutationObserver(markTable).observe(content, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
// 7주차 실습 표 비율 조정
// - 첫 열이 '확인할 상황'·'단계'인 표와 2.5.2 필드 누락 표는 첫 열(① 정상 목록 등)이 한 줄로 보이도록 줄바꿈 없이 내용 너비만 차지
// - 남는 너비는 나머지 열이 나눠 사용
(() => {
  const week = Number(new URLSearchParams(window.location.search).get('week'));
  if (week !== 7 || !/\/lecture\/(index\.html)?$/.test(window.location.pathname)) return;

  const ensureStyles = () => {
    if (document.querySelector('#week7-check-table-styles')) return;
    const style = document.createElement('style');
    style.id = 'week7-check-table-styles';
    style.textContent = `
      .lecture-content table.week7-check-table td:first-child{white-space:nowrap;width:1%}
      @media(max-width:680px){.lecture-content table.week7-check-table td:not(:first-child){min-width:180px}}
    `;
    document.head.appendChild(style);
  };

  const markTable = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    content.querySelectorAll('table:not(.week7-check-table)').forEach(table => {
      const head = [...(table.querySelector('tr')?.children || [])].map(cell => cell.textContent.trim());
      // 1.1.1·1.1.3·1.4·2.6 표, 2.5.2 필드 누락 표(구분·예시·화면 처리·데이터 처리)
      const target = head[0] === '확인할 상황' || head[0] === '단계' || (head[0] === '구분' && head[1] === '예시');
      if (!target) return;
      ensureStyles();
      table.classList.add('week7-check-table');
    });
  };

  const start = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    markTable();
    new MutationObserver(markTable).observe(content, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
