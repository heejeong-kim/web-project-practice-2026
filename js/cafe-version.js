/* 수업용 안내는 기본 닫힘, 업데이트 점선은 기본 꺼짐. */
(() => {
  document.body.classList.add('wk-off');
  const main = document.querySelector('main');
  if (!main) return;
  const week = Number(document.body.dataset.week) || (new URLSearchParams(location.search).get('prototype') === '1' ? 10 : 7);
  const descriptions = {
    7: 'JSON 화면 연결과 데이터 점검 · 추천 공간·가로 넘김 추가 · 히어로는 X 박스 · 데이터 출처·실제/더미 구분',
    9: '검색·지역·복수 필터·정렬 · 영업 중 조건·가까운 순 · 추천 기준과 탐색 연결 · 와이어프레임 유지',
    10: '프로토타입 전환 · 실제 배너·배경 모션·카페 썸네일 · 추천 자동 이동 · 상세·지도·공유·목록 복귀',
    11: '별 즐겨찾기·최근 본 공간 저장 · 하트 좋아요 수 프로토타입 · 마이 화면 · 비교함에 담기와 비교함',
    12: '개인 상태 통합·초기화 · 통합·교차 사용자 테스트 · 주요 오류 수정·회귀 테스트 후 최종 IA 정리 · API·DB는 선택 심화',
    13: '발표자료·시연·백업·리허설 · 12주차 최종 IA·테스트 근거 확인 · 마지막 수정·검토 후 버전 고정 · 14주차 발표'
  };
  const panel = document.createElement('details');
  panel.className = 'cafe-version-panel';
  const summary = document.createElement('summary');
  summary.textContent = `${week}주차 버전 내용`;
  const content = document.createElement('div');
  content.className = 'cafe-version-content';
  const text = document.createElement('p');
  text.textContent = descriptions[week] || `${week}주차 샘플`;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'cafe-version-highlight';
  button.textContent = '강조 켜기'; button.setAttribute('aria-pressed', 'false');
  const help = document.createElement('p');
  help.className = 'cafe-version-help';
  help.textContent = '강조 켜기를 누르면 이번 주차 업데이트를 점선으로 표시합니다.';
  const notes = document.createElement('div'); notes.className = 'cafe-version-notes';
  content.append(text, button, help, notes); panel.append(summary, content); main.prepend(panel);
  if (week === 12 || week === 13) {
    const practice = document.createElement('a');
    practice.href = (document.body.dataset.page === 'home' ? './' : '../') + 'practice.html';
    practice.textContent = week === 12 ? '통합·사용자 테스트 기록지 열기' : '발표 준비·마지막 검토 기록지 열기';
    practice.target = '_blank'; practice.rel = 'noopener';
    content.append(practice);
  }
  button.onclick = () => {
    const enabled = document.body.classList.contains('wk-off');
    document.body.classList.toggle('wk-off', !enabled);
    button.textContent = enabled ? '강조 끄기' : '강조 켜기';
    button.setAttribute('aria-pressed', String(enabled));
    panel.open = true;
  };
  panel.addEventListener('toggle', () => {
    if (!panel.open) { document.body.classList.add('wk-off'); button.textContent = '강조 켜기'; button.setAttribute('aria-pressed', 'false'); }
  });
  const gather = () => {
    if (!document.body.dataset.week && week === 7) {
      main.querySelectorAll('#recommend-section,.card .badges,.src-chip,.type-tag').forEach(el => el.classList.add('wk-new'));
    }
    // 비동기로 생성한 이미지·출처·버전 안내도 같은 패널로 이동.
    document.querySelectorAll('.wk-banner').forEach(old => old.remove());
    document.querySelectorAll('.image-source-note,.hero-image-credit,.recent-sample-note').forEach(note => {
      if (!panel.contains(note)) notes.append(note);
    });
    document.querySelectorAll('main p.muted').forEach(note => {
      if (!panel.contains(note) && note.textContent.startsWith('기본 정보(공간명')) notes.append(note);
    });
  };
  gather();
  new MutationObserver(gather).observe(main, {childList: true, subtree: true});
})();
