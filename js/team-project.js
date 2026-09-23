(() => {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxt1SLxfp6RwICIUVK-F1zxl4ek80zbMA0rUTczH9A5nyUsnJSV19xkFlVTrMnigMWp/exec';
  const form = document.querySelector('#team-form');
  const formMessage = document.querySelector('#form-message');
  const tableBody = document.querySelector('#team-table-body');
  const emptyState = document.querySelector('#empty-team-state');
  const filterButtons = [...document.querySelectorAll('[data-class-filter="A"], [data-class-filter="B"]')];
  const topButton = document.querySelector('#top-button');
  const submitButton = document.querySelector('#save-team-button');
  const resetButton = document.querySelector('#reset-team-button');
  const formTitle = document.querySelector('#team-form-title');
  const formDescription = document.querySelector('#team-form-description');
  const formSection = document.querySelector('#team-form-section');
  const teamNumberInput = document.querySelector('#team-number');
  const ideaInput = document.querySelector('#project-idea');
  const notionUrlInput = document.querySelector('#notion-url');
  const projectUrlInput = document.querySelector('#project-url');
  let currentFilter = 'A';
  let teams = [];
  let editingNumber = null;
  let jsonpSequence = 0;
  let ideaSuggestions = null;
  // 팀 목록 잠금 관련 요소 (비밀번호는 소스에 두지 않고 서버(Apps Script)에서만 검증함)
  const lockPanel = document.querySelector('#team-lock-panel');
  const lockForm = document.querySelector('#team-lock-form');
  const lockInput = document.querySelector('#team-lock-input');
  const lockButton = document.querySelector('#team-lock-button');
  const lockMessage = document.querySelector('#team-lock-message');
  const listContent = document.querySelector('#team-list-content');
  const filterBar = document.querySelector('#team-filters');
  const relockButton = document.querySelector('#team-relock-button');
  // 비밀번호는 저장하지 않고 메모리에만 보관 → 새로고침·재방문 시 항상 다시 입력해야 함
  let listKey = '';
  function clearKey() { listKey = ''; }
  function setLockMessage(text = '') { if (lockMessage) lockMessage.textContent = text; }
  function setLocked(locked) {
    if (lockPanel) lockPanel.hidden = !locked;
    if (listContent) listContent.hidden = locked;
    if (filterBar) filterBar.hidden = locked;
    if (relockButton) relockButton.hidden = locked;
  }

  function escapeHtml(value = '') {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }
  function getMember(formData, index) {
    return { studentId: String(formData.get(`studentId${index}`) || '').trim(), name: String(formData.get(`studentName${index}`) || '').trim() };
  }
  function setMessage(text = '', type = '') {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.className = 'form-message';
    if (type) formMessage.classList.add(`is-${type}`);
  }
  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? (editingNumber ? '수정 저장 중...' : '등록 중...') : (editingNumber ? '수정 저장' : '팀 등록');
  }
  function setEditingMode(team = null) {
    editingNumber = team ? Number(team.number) : null;
    if (teamNumberInput) teamNumberInput.value = editingNumber || '';
    if (formTitle) formTitle.textContent = editingNumber ? '팀 정보 수정' : '팀 정보 등록';
    if (formDescription) formDescription.textContent = editingNumber ? '선택한 팀 정보를 수정한 뒤 저장하세요.' : '팀원 1·2는 필수, 팀원 3은 선택입니다.';
    if (submitButton) submitButton.textContent = editingNumber ? '수정 저장' : '팀 등록';
    if (resetButton) resetButton.textContent = editingNumber ? '수정 취소' : '입력 초기화';
    form?.classList.toggle('is-editing', Boolean(editingNumber));
  }
  function jsonp(params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = `__teamProjectCallback${Date.now()}_${jsonpSequence++}`;
      const script = document.createElement('script');
      const query = new URLSearchParams({ ...params, callback: callbackName, _: Date.now() });
      const timeout = window.setTimeout(() => { cleanup(); reject(new Error('Google Sheet 응답 시간이 초과되었습니다.')); }, 12000);
      function cleanup() { window.clearTimeout(timeout); script.remove(); try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; } }
      window[callbackName] = result => { cleanup(); if (!result?.success) return reject(Object.assign(new Error(result?.message || '요청을 처리하지 못했습니다.'), { code: result?.code || '' })); resolve(result); };
      script.onerror = () => { cleanup(); reject(new Error('Google Apps Script에 연결하지 못했습니다.')); };
      script.src = `${GOOGLE_SCRIPT_URL}?${query.toString()}`;
      document.head.appendChild(script);
    });
  }
  // 비밀번호가 있을 때만 서버에 목록을 요청함 (성공 여부 반환)
  async function loadTeams() {
    if (!listKey) { teams = []; setLocked(true); renderTeams(); return false; }
    try {
      const result = await jsonp({ action: 'list', password: listKey });
      teams = Array.isArray(result.teams) ? result.teams : [];
      setLocked(false); setLockMessage(''); renderTeams(); renderIdeaSuggestions();
      return true;
    } catch (error) {
      teams = []; hideIdeaSuggestions();
      if (error.code === 'AUTH') { clearKey(); setLocked(true); renderTeams(); setLockMessage(error.message); }
      else { renderTeams(); setMessage(error.message || 'Google Sheet에서 팀 목록을 불러오지 못했습니다.', 'error'); }
      return false;
    }
  }
  function lockList() {
    clearKey(); teams = [];
    if (editingNumber) form?.reset();
    hideIdeaSuggestions(); renderTeams(); setLocked(true); setLockMessage('');
  }
  function validateTeamForm(formData) {
    const classGroup = String(formData.get('classGroup') || '').trim();
    const teamName = String(formData.get('teamName') || '').trim();
    const idea = String(formData.get('idea') || '').trim();
    const track = String(formData.get('track') || '').trim();
    const notionUrl = String(formData.get('notionUrl') || '').trim();
    const projectUrl = String(formData.get('projectUrl') || '').trim();
    const members = [1, 2, 3].map(index => getMember(formData, index));
    if (!classGroup) return { error: '분반을 선택해 주세요.' };
    if (!teamName) return { error: '팀명을 입력해 주세요.' };
    if (!idea) return { error: '아이디어를 입력해 주세요.' };
    if (!['필수', '심화'].includes(track)) return { error: '트랙 구분을 선택해 주세요.' };
    if (!notionUrl) return { error: '산출물 노션 URL을 입력해 주세요.' };
    for (let i = 0; i < 2; i += 1) if (!members[i].studentId || !members[i].name) return { error: `팀원 ${i + 1}의 학번과 이름을 모두 입력해 주세요.` };
    if ((members[2].studentId && !members[2].name) || (!members[2].studentId && members[2].name)) return { error: '팀원 3을 입력하려면 학번과 이름을 모두 입력해 주세요.' };
    const studentIds = members.filter(member => member.studentId).map(member => member.studentId);
    if (new Set(studentIds).size !== studentIds.length) return { error: '같은 학번을 한 팀에 중복 등록할 수 없습니다.' };
    const duplicateTeam = teams.some(team => Number(team.number) !== Number(editingNumber) && team.classGroup === classGroup && String(team.teamName || '').trim().toLowerCase() === teamName.toLowerCase());
    if (duplicateTeam) return { error: '같은 분반에 동일한 팀명이 이미 등록되어 있습니다.' };
    return { classGroup, teamName, idea, track, notionUrl, projectUrl, members };
  }
  async function saveTeam(event) {
    event.preventDefault(); setMessage(); hideIdeaSuggestions(); if (!form?.reportValidity()) return;
    const validation = validateTeamForm(new FormData(form));
    if (validation.error) return setMessage(validation.error, 'error');
    const { classGroup, teamName, idea, track, notionUrl, projectUrl, members } = validation;
    try {
      setSubmitting(true);
      const result = await jsonp({ action: editingNumber ? 'updateTeam' : 'register', password: listKey || '', number: editingNumber ? String(editingNumber) : '', classGroup, teamName, idea, track, notionUrl, projectUrl, studentId1: members[0].studentId, studentName1: members[0].name, studentId2: members[1].studentId, studentName2: members[1].name, studentId3: members[2].studentId, studentName3: members[2].name });
      const successText = editingNumber ? `${classGroup}반 ${teamName} 팀 정보가 수정되었습니다.` : `${classGroup}반 ${teamName} 팀이 등록되었습니다.${listKey ? '' : ' 등록된 목록은 비밀번호 입력 후 확인할 수 있습니다.'}`;
      form.reset(); setEditingMode(null); setMessage(successText, 'success'); teams = Array.isArray(result.teams) ? result.teams : teams; currentFilter = classGroup; syncTabs(); renderTeams(); hideIdeaSuggestions(); if (!Array.isArray(result.teams) && listKey) await loadTeams();
    } catch (error) { if (error.code === 'AUTH') lockList(); setMessage(error.message || (editingNumber ? '팀 수정에 실패했습니다.' : '팀 등록에 실패했습니다.'), 'error'); }
    finally { setSubmitting(false); }
  }
  function renderMember(member) {
    if (!member || (!member.studentId && !member.name)) return '<span>-</span>';
    return `${escapeHtml(member.studentId)}<span>${escapeHtml(member.name)}</span>`;
  }
  function renderNotionLink(value, teamName) {
    const raw = String(value || '').trim();
    if (!raw) return '<span class="notion-url-empty">-</span>';
    if (/^https?:\/\//i.test(raw)) return `<a class="notion-url-link" href="${escapeHtml(raw)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(teamName)} 산출물 노션 열기">노션 열기 <span aria-hidden="true">↗</span></a>`;
    return `<span class="notion-url-text">${escapeHtml(raw)}</span>`;
  }
  function renderProjectLink(value, teamName) {
    const raw = String(value || '').trim();
    if (!raw) return '<span class="project-url-empty">-</span>';
    if (/^https?:\/\//i.test(raw)) return `<a class="project-url-link" href="${escapeHtml(raw)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(teamName)} 프로젝트 열기">프로젝트 열기 <span aria-hidden="true">↗</span></a>`;
    return `<span class="project-url-text">${escapeHtml(raw)}</span>`;
  }
  function renderTeams() {
    // 분반별로 등록 순서(내부 번호)대로 정렬 후 1부터 다시 번호를 매김
    const filtered = teams.filter(team => team.classGroup === currentFilter).sort((a, b) => Number(a.number) - Number(b.number));
    if (emptyState) {
      emptyState.hidden = filtered.length > 0;
      const title = emptyState.querySelector('strong'); const copy = emptyState.querySelector('p');
      if (title) title.textContent = `${currentFilter}반에 아직 등록된 팀이 없습니다.`;
      if (copy) copy.textContent = '상단에서 팀을 등록하면 이곳에 목록이 표시됩니다.';
    }
    if (!tableBody) return;
    tableBody.innerHTML = filtered.map((team, index) => `<tr><td>${index + 1}</td><td><span class="class-badge">${escapeHtml(team.classGroup)}</span></td><td class="team-name-cell"><button type="button" class="team-edit-button" data-edit-team="${Number(team.number)}">${escapeHtml(team.teamName)}</button></td><td class="idea-cell">${escapeHtml(team.idea || '-')}</td><td><span class="track-badge ${team.track === '심화' ? 'is-advanced' : ''}">${escapeHtml(team.track || '-')}</span></td><td class="notion-url-cell">${renderNotionLink(team.notionUrl || '', team.teamName || '')}</td><td class="project-url-cell">${renderProjectLink(team.projectUrl || '', team.teamName || '')}</td><td class="member-cell">${renderMember(team.members?.[0])}</td><td class="member-cell">${renderMember(team.members?.[1])}</td><td class="member-cell">${renderMember(team.members?.[2])}</td></tr>`).join('');
  }
  function ensureIdeaSuggestions() {
    if (!ideaInput || ideaSuggestions) return ideaSuggestions;
    const field = ideaInput.closest('.field-group'); if (!field) return null;
    ideaInput.setAttribute('autocomplete', 'off'); ideaInput.setAttribute('aria-autocomplete', 'list'); ideaInput.setAttribute('aria-expanded', 'false'); ideaInput.setAttribute('aria-controls', 'idea-suggestions');
    ideaSuggestions = document.createElement('div'); ideaSuggestions.id = 'idea-suggestions'; ideaSuggestions.className = 'idea-suggestions'; ideaSuggestions.setAttribute('role', 'listbox'); ideaSuggestions.setAttribute('aria-label', '등록된 유사 아이디어'); ideaSuggestions.hidden = true; field.appendChild(ideaSuggestions); return ideaSuggestions;
  }
  function hideIdeaSuggestions() { if (!ideaSuggestions) return; ideaSuggestions.hidden = true; ideaSuggestions.innerHTML = ''; ideaInput?.setAttribute('aria-expanded', 'false'); }
  function highlightIdea(idea, query) {
    const source = String(idea || ''); const lowerSource = source.toLocaleLowerCase('ko-KR'); const lowerQuery = query.toLocaleLowerCase('ko-KR'); const index = lowerSource.indexOf(lowerQuery);
    if (index < 0) return escapeHtml(source);
    return `${escapeHtml(source.slice(0,index))}<mark>${escapeHtml(source.slice(index,index+query.length))}</mark>${escapeHtml(source.slice(index+query.length))}`;
  }
  function getIdeaMatches(query) {
    const normalized = query.trim().toLocaleLowerCase('ko-KR'); if (!normalized) return [];
    return teams.filter(team => Number(team.number) !== Number(editingNumber)).filter(team => String(team.idea || '').toLocaleLowerCase('ko-KR').includes(normalized)).slice(0,8);
  }
  function renderIdeaSuggestions() {
    const list = ensureIdeaSuggestions(); if (!list || !ideaInput) return; const query = ideaInput.value.trim(); if (!query) return hideIdeaSuggestions(); const matches = getIdeaMatches(query); if (!matches.length) return hideIdeaSuggestions();
    list.innerHTML = `<div class="idea-suggestions-head"><strong>유사한 등록 아이디어 ${matches.length}건</strong><span>중복 주제를 확인하세요</span></div>${matches.map((team,index)=>`<div class="idea-suggestion" role="option" tabindex="-1" data-idea-index="${index}"><span class="idea-suggestion-text">${highlightIdea(team.idea,query)}</span><span class="idea-suggestion-meta">${escapeHtml(team.classGroup)}반 · ${escapeHtml(team.teamName)}</span></div>`).join('')}`;
    list.hidden = false; ideaInput.setAttribute('aria-expanded','true');
    list.querySelectorAll('[data-idea-index]').forEach((item,index)=>item.addEventListener('mousedown',event=>{ event.preventDefault(); const team=matches[index]; if(!team)return; ideaInput.value=team.idea||''; hideIdeaSuggestions(); ideaInput.focus(); }));
  }
  function fillFormForEdit(team) {
    if (!form || !team) return; setEditingMode(team); form.querySelector(`[name="classGroup"][value="${team.classGroup}"]`)?.click(); form.querySelector('#team-name').value = team.teamName || ''; form.querySelector('#project-idea').value = team.idea || ''; if (notionUrlInput) notionUrlInput.value = team.notionUrl || ''; if (projectUrlInput) projectUrlInput.value = team.projectUrl || ''; const track = team.track || '필수'; form.querySelector(`[name="track"][value="${track}"]`)?.click();
    [1,2,3].forEach(index=>{ const member=team.members?.[index-1]||{}; form.querySelector(`[name="studentId${index}"]`).value=member.studentId||''; form.querySelector(`[name="studentName${index}"]`).value=member.name||''; }); hideIdeaSuggestions(); setMessage(`${team.teamName} 팀 정보를 수정 중입니다.`,'success'); formSection?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function syncTabs(){ filterButtons.forEach(button=>{ const active=button.dataset.classFilter===currentFilter; button.classList.toggle('is-active',active); button.setAttribute('aria-selected',String(active)); button.tabIndex=active?0:-1; }); }
  filterButtons.forEach(button=>button.addEventListener('click',()=>{ currentFilter=button.dataset.classFilter; syncTabs(); renderTeams(); }));
  form?.addEventListener('submit',saveTeam); form?.addEventListener('reset',()=>{ const wasEditing=Boolean(editingNumber); hideIdeaSuggestions(); setTimeout(()=>{setEditingMode(null);setMessage(wasEditing?'수정을 취소했습니다.':'');},0); });
  tableBody?.addEventListener('click',event=>{ const button=event.target.closest('[data-edit-team]'); if(!button)return; const team=teams.find(item=>Number(item.number)===Number(button.dataset.editTeam)); if(team)fillFormForEdit(team); });
  ensureIdeaSuggestions(); ideaInput?.addEventListener('input',renderIdeaSuggestions); ideaInput?.addEventListener('focus',renderIdeaSuggestions); ideaInput?.addEventListener('keydown',event=>{if(event.key==='Escape')hideIdeaSuggestions();}); ideaInput?.addEventListener('blur',()=>window.setTimeout(hideIdeaSuggestions,120));
  if(topButton){ const sync=()=>topButton.classList.toggle('is-visible',window.scrollY>500); window.addEventListener('scroll',sync,{passive:true}); topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})); sync(); }
  // 비밀번호 확인 → 서버 검증 성공 시에만 목록 표시
  lockForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const value = String(lockInput?.value || '').trim();
    if (!value) { setLockMessage('비밀번호를 입력해 주세요.'); lockInput?.focus(); return; }
    setLockMessage(''); listKey = value;
    if (lockButton) { lockButton.disabled = true; lockButton.textContent = '확인 중...'; }
    const ok = await loadTeams();
    if (lockButton) { lockButton.disabled = false; lockButton.textContent = '확인'; }
    if (ok) { if (lockInput) lockInput.value = ''; }
    else { if (!lockMessage?.textContent) setLockMessage('목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'); if (listKey && !teams.length) { /* 네트워크 오류 시 키는 유지하지 않음 */ clearKey(); setLocked(true); } lockInput?.select(); }
  });
  relockButton?.addEventListener('click', lockList);
  // 뒤로가기 캐시(bfcache)로 복원될 때도 다시 잠금
  window.addEventListener('pageshow', event => { if (event.persisted) lockList(); });
  syncTabs(); loadTeams();
})();