window.WEEK_DATA = [
  {week:0,title:'OT',type:'class',keywords:['성적 평가기준','수업 운영','교안 안내'],summary:'성적 평가기준과 수업 운영 방식, 강의교안 제작 안내를 확인한다',page:'./lecture/?week=00'},
  {week:1,title:'웹프로젝트 이해',type:'class',keywords:['웹서비스','JSON','LocalStorage'],summary:'웹페이지와 데이터 기반 웹서비스의 차이, 프로젝트 범위와 트랙을 이해한다',page:'./lecture/?week=01'},
  {week:2,title:'서비스 역분석 및 시장·트렌드 조사',type:'class',keywords:['Reverse Analysis','Market Trend','Opportunity'],summary:'기존 서비스를 사용자·문제·기능·데이터 관점에서 역분석하고 시장·경쟁서비스 비교를 통해 프로젝트 기회 영역을 찾는다',page:'./lecture/?week=02'},
  {week:3,title:'사용자 분석 및 프로젝트 문제 정의',type:'class',keywords:['Persona','Problem Statement','Value Proposition'],summary:'개인 아이디어를 팀에서 비교해 후보를 선택하고 핵심 사용자·문제·가치 제안을 정의해 프로젝트 주제와 트랙을 확정한다',page:'./lecture/?week=03'},
  {week:4,title:'서비스 구조 및 UX 설계',type:'class',keywords:['MVP','IA','User Flow'],summary:'핵심 기능, 정보구조, 사용자 흐름, 와이어프레임을 설계한다',page:''},
  {week:5,title:'JavaScript 프로젝트 기초',type:'class',keywords:['DOM','Event','Function'],summary:'정적 HTML·CSS에 JavaScript 상호작용을 연결하고 입력→처리→출력 구조를 익힌다',page:''},
  {week:6,title:'JSON 데이터셋 설계',type:'class',keywords:['Dataset','Field','ID'],summary:'검색·필터·정렬·상세보기에 필요한 JSON 데이터 구조와 명세를 설계한다',page:''},
  {week:7,title:'JSON 기반 화면 구현',type:'class',keywords:['fetch','Rendering','Empty State'],summary:'JSON을 불러와 반복 렌더링하고 결과 건수·빈 상태·오류 상태를 처리한다',page:''},
  {week:8,title:'중간평가',type:'exam',keywords:['필기시험','중간 자료 점검','Feedback'],summary:'1~7주차 필기평가와 중간 자료 점검을 통해 후반기 개발 우선순위를 조정한다',page:''},
  {week:9,title:'검색·필터·정렬 기능',type:'class',keywords:['Search','Filter','Sort'],summary:'검색과 복수 필터, 정렬을 하나의 상태와 결과 배열로 연결한다',page:''},
  {week:10,title:'상세보기 및 인터랙션 설계',type:'class',keywords:['Detail View','Modal','Interaction'],summary:'ID 기반 상세보기와 목록 복귀, 다음 행동까지 이어지는 인터랙션을 구현한다',page:''},
  {week:11,title:'LocalStorage 기초',type:'class',keywords:['Client Storage','Serialization','Favorite'],summary:'브라우저 개인 상태를 저장하고 JSON 기본 데이터와 사용자 상태를 구분한다',page:''},
  {week:12,title:'LocalStorage 활용 기능 구현',type:'class',keywords:['Personalization','API','Cloud DB'],summary:'개인화 기능을 통합하고 필요 팀은 외부 API 또는 클라우드 DB 심화를 시작한다',page:''},
  {week:13,title:'프로젝트 통합 및 사용자 테스트',type:'class',keywords:['Integration','Test Case','QA'],summary:'기능을 하나의 사용자 흐름으로 통합하고 교차 사용자 테스트와 오류 수정을 진행한다',page:''},
  {week:14,title:'프로젝트 개선 및 최종 완성',type:'class',keywords:['Deployment','Production','Demo'],summary:'최종 QA, 반응형 검수, 실제 배포와 발표 시연을 준비한다',page:''},
  {week:15,title:'기말평가',type:'exam',keywords:['필기시험','Final Demo','최종 자료 제출'],summary:'9~14주차 필기평가와 Final Demo, 최종 자료 제출을 진행한다',page:''}
];

(() => {
  if (!/\/lecture\/?$/.test(window.location.pathname)) return;

  const week = Number(new URLSearchParams(window.location.search).get('week'));
  const locks = {
    2: { hash: 'aaa635313e40478b612d05958cfc10a9f44932746c2acb5a92031baee1dba2e4', titles: ['1.4', '2.5', '3.5', '4.5', '활동내역 및 산출물'] },
    3: { hash: 'f7f7b664724bce5c7c5ec139634d8f5557fa1693090c19b400236d4e6cb6779c', titles: ['1.2', '2.3', '3.5'] }
  };
  const config = locks[week];
  if (!config) return;

  try { sessionStorage.setItem('web-project-lecture-access', String(week)); } catch {}

  const digest = async value => {
    const bytes = new TextEncoder().encode(value);
    const buffer = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const normalizeHeadingText = heading => {
    if (heading.dataset.sectionLockTitle) return heading.dataset.sectionLockTitle;
    const clone = heading.cloneNode(true);
    clone.querySelectorAll('.section-lock-cta').forEach(node => node.remove());
    return clone.textContent.trim();
  };

  const findTargetTitle = heading => {
    const text = normalizeHeadingText(heading);
    return config.titles.find(title => title === '활동내역 및 산출물'
      ? text.includes(title)
      : text === title || text.startsWith(`${title} `) || text.startsWith(`${title}.`));
  };

  const sectionAccessKey = title => `web-project-section-access-week-${week}-item-${config.titles.indexOf(title)}`;
  const isUnlocked = title => {
    try { return sessionStorage.getItem(sectionAccessKey(title)) === 'true'; }
    catch { return false; }
  };

  const headingLevel = element => Number(element.tagName.slice(1));
  const getSectionNodes = heading => {
    const level = headingLevel(heading);
    const nodes = [];
    let node = heading.nextElementSibling;
    while (node) {
      if (/^H[1-6]$/.test(node.tagName) && headingLevel(node) <= level) break;
      nodes.push(node);
      node = node.nextElementSibling;
    }
    return nodes;
  };

  const ensureStyles = () => {
    if (document.querySelector('#section-lock-styles')) return;
    const style = document.createElement('style');
    style.id = 'section-lock-styles';
    style.textContent = `
      .lecture-content [data-section-locked="true"]{cursor:pointer}
      .lecture-content .section-lock-cta{display:inline-flex;align-items:center;justify-content:center;margin-left:10px;padding:4px 9px;border:1px solid #ff8a3d;border-radius:7px;background:#fff3eb;color:#b95516;font:700 12px/1.2 "IBM Plex Sans KR",sans-serif;vertical-align:middle;cursor:pointer;transition:background .2s ease,border-color .2s ease,transform .2s ease}
      .lecture-content .section-lock-cta:hover{background:#ffe2cf;border-color:#e96f20;transform:translateY(-1px)}
      .lecture-content .section-lock-cta:focus-visible{outline:2px solid #ff8a3d;outline-offset:2px}
    `;
    document.head.appendChild(style);
  };

  const showSection = heading => {
    getSectionNodes(heading).forEach(node => { node.hidden = false; });
    heading.dataset.sectionLocked = 'false';
    heading.removeAttribute('role');
    heading.removeAttribute('tabindex');
    heading.removeAttribute('aria-label');
    heading.style.cursor = '';
    heading.querySelector('.section-lock-cta')?.remove();
  };

  const hideSection = (heading, title) => {
    getSectionNodes(heading).forEach(node => { node.hidden = true; });
    heading.dataset.sectionLockTitle = title;
    heading.dataset.sectionLocked = 'true';
    heading.setAttribute('role', 'button');
    heading.setAttribute('tabindex', '0');
    heading.setAttribute('aria-label', `${normalizeHeadingText(heading)} 내용 보기. 비밀번호 필요`);
    heading.style.cursor = 'pointer';
    if (!heading.querySelector('.section-lock-cta')) {
      const cta = document.createElement('button');
      cta.type = 'button';
      cta.className = 'section-lock-cta';
      cta.textContent = '[클릭]';
      cta.setAttribute('aria-label', `${normalizeHeadingText(heading)} 숨김 내용 열기`);
      heading.appendChild(cta);
    }
  };

  let dialogOpen = false;
  const requestPassword = (heading, title) => {
    if (dialogOpen || isUnlocked(title)) return;
    dialogOpen = true;
    const headingLabel = normalizeHeadingText(heading);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.58);backdrop-filter:blur(4px)';
    overlay.innerHTML = `<form style="box-sizing:border-box;width:min(100%,380px);padding:28px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.3)"><h2 style="margin:0 0 8px;font-size:22px">${week}주차 · ${headingLabel}</h2><p style="margin:0 0 18px;color:#667085">비밀번호를 입력하면 이 항목의 숨겨진 내용만 표시됩니다.</p><input type="password" inputmode="numeric" autocomplete="off" aria-label="${week}주차 ${headingLabel} 비밀번호" style="box-sizing:border-box;width:100%;height:46px;padding:0 13px;border:1px solid #cfd5df;border-radius:10px;font-size:18px"><p data-error role="alert" style="display:none;margin:8px 0 0;color:#dc2626;font-size:14px">비밀번호가 올바르지 않습니다.</p><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px"><button type="button" data-cancel style="min-height:42px;padding:0 15px;border:1px solid #d0d5dd;border-radius:9px;background:#fff">취소</button><button type="submit" style="min-height:42px;padding:0 17px;border:0;border-radius:9px;background:#172033;color:#fff;font-weight:700">확인</button></div></form>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('input');
    const close = () => { overlay.remove(); dialogOpen = false; heading.focus(); };
    overlay.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const inputHash = await digest(input.value);
      if (inputHash !== config.hash) {
        overlay.querySelector('[data-error]').style.display = 'block';
        input.select();
        return;
      }
      try { sessionStorage.setItem(sectionAccessKey(title), 'true'); } catch {}
      overlay.remove();
      dialogOpen = false;
      showSection(heading);
    });
    overlay.querySelector('[data-cancel]').addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    input.focus();
  };

  const bindHeading = (heading, title) => {
    if (heading.dataset.sectionLockBound === 'true') return;
    heading.dataset.sectionLockBound = 'true';
    heading.addEventListener('click', event => {
      if (heading.dataset.sectionLocked !== 'true') return;
      if (event.target.closest('.section-lock-cta')) event.preventDefault();
      requestPassword(heading, heading.dataset.sectionLockTitle || title);
    });
    heading.addEventListener('keydown', event => {
      if (heading.dataset.sectionLocked !== 'true') return;
      if (event.target.closest?.('.section-lock-cta')) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        requestPassword(heading, heading.dataset.sectionLockTitle || title);
      }
    });
  };

  const applyLocks = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    [...content.querySelectorAll('h1,h2,h3,h4,h5,h6')].forEach(heading => {
      const title = findTargetTitle(heading);
      if (!title) return;
      heading.dataset.sectionLockTitle = title;
      bindHeading(heading, title);
      if (isUnlocked(title)) showSection(heading);
      else hideSection(heading, title);
    });
  };

  const start = () => {
    const content = document.querySelector('#lecture-content');
    if (!content) return;
    ensureStyles();
    applyLocks();
    new MutationObserver(applyLocks).observe(content, { childList: true, subtree: false });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
