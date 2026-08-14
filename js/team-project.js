(() => {
  const STORAGE_KEY = 'webProjectPractice2026Teams';
  const OUTPUT_WEEKS = Array.from({ length: 13 }, (_, i) => i + 3);

  const form = document.querySelector('#team-form');
  const formMessage = document.querySelector('#form-message');
  const tableBody = document.querySelector('#team-table-body');
  const emptyState = document.querySelector('#empty-team-state');
  const filterButtons = [...document.querySelectorAll('[data-class-filter]')];
  const topButton = document.querySelector('#top-button');

  let currentFilter = 'all';
  let teams = loadTeams();

  function loadTeams() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('팀 데이터를 불러오지 못했습니다.', error);
      return [];
    }
  }

  function saveTeams() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getMember(formData, index) {
    const studentId = String(formData.get(`studentId${index}`) || '').trim();
    const name = String(formData.get(`studentName${index}`) || '').trim();
    return { studentId, name };
  }

  function validateOptionalMember(member, index) {
    if (!member.studentId && !member.name) return '';
    if (!member.studentId || !member.name) return `팀원 ${index}의 학번과 이름을 모두 입력해 주세요.`;
    return '';
  }

  function setMessage(text = '', type = '') {
    formMessage.textContent = text;
    formMessage.className = 'form-message';
    if (type) formMessage.classList.add(`is-${type}`);
  }

  function createTeam(event) {
    event.preventDefault();
    setMessage();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const classGroup = String(formData.get('classGroup') || '').trim();
    const teamName = String(formData.get('teamName') || '').trim();
    const members = [1, 2, 3].map(index => getMember(formData, index));

    const optionalError = validateOptionalMember(members[1], 2) || validateOptionalMember(members[2], 3);
    if (optionalError) {
      setMessage(optionalError, 'error');
      return;
    }

    const duplicateStudentIds = members
      .filter(member => member.studentId)
      .map(member => member.studentId)
      .filter((id, index, array) => array.indexOf(id) !== index);

    if (duplicateStudentIds.length) {
      setMessage('같은 학번을 한 팀에 중복 등록할 수 없습니다.', 'error');
      return;
    }

    const duplicatedTeam = teams.some(team => team.classGroup === classGroup && team.teamName.toLowerCase() === teamName.toLowerCase());
    if (duplicatedTeam) {
      setMessage('같은 분반에 동일한 팀명이 이미 등록되어 있습니다.', 'error');
      return;
    }

    const team = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      classGroup,
      teamName,
      members,
      outputs: Object.fromEntries(OUTPUT_WEEKS.map(week => [week, false])),
      createdAt: new Date().toISOString()
    };

    teams.push(team);
    saveTeams();
    form.reset();
    setMessage(`${classGroup}반 ${teamName} 팀이 등록되었습니다.`, 'success');
    renderTeams();
  }

  function renderMember(member) {
    if (!member || (!member.studentId && !member.name)) return '<span>-</span>';
    return `${escapeHtml(member.studentId)}<span>${escapeHtml(member.name)}</span>`;
  }

  function renderTeams() {
    const filtered = currentFilter === 'all'
      ? teams
      : teams.filter(team => team.classGroup === currentFilter);

    emptyState.hidden = filtered.length > 0;
    tableBody.innerHTML = filtered.map((team, index) => {
      const outputCells = OUTPUT_WEEKS.map(week => `
        <td>
          <label class="week-check" title="${week}주차 산출물 완료">
            <input type="checkbox" data-team-id="${escapeHtml(team.id)}" data-week="${week}" ${team.outputs?.[week] ? 'checked' : ''} aria-label="${escapeHtml(team.teamName)} ${week}주차 산출물 완료">
          </label>
        </td>
      `).join('');

      return `
        <tr>
          <td>${index + 1}</td>
          <td><span class="class-badge">${escapeHtml(team.classGroup)}</span></td>
          <td class="team-name-cell">${escapeHtml(team.teamName)}</td>
          <td class="member-cell">${renderMember(team.members?.[0])}</td>
          <td class="member-cell">${renderMember(team.members?.[1])}</td>
          <td class="member-cell">${renderMember(team.members?.[2])}</td>
          ${outputCells}
        </tr>
      `;
    }).join('');
  }

  function handleWeekCheck(event) {
    const checkbox = event.target.closest('input[data-team-id][data-week]');
    if (!checkbox) return;

    const team = teams.find(item => item.id === checkbox.dataset.teamId);
    if (!team) return;

    const week = Number(checkbox.dataset.week);
    team.outputs = team.outputs || {};
    team.outputs[week] = checkbox.checked;
    saveTeams();
  }

  function handleFilter(event) {
    const button = event.currentTarget;
    currentFilter = button.dataset.classFilter;
    filterButtons.forEach(item => item.classList.toggle('is-active', item === button));
    renderTeams();
  }

  form?.addEventListener('submit', createTeam);
  form?.addEventListener('reset', () => setTimeout(() => setMessage(), 0));
  tableBody?.addEventListener('change', handleWeekCheck);
  filterButtons.forEach(button => button.addEventListener('click', handleFilter));

  if (topButton) {
    const syncTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', syncTopButton, { passive: true });
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    syncTopButton();
  }

  renderTeams();
})();
