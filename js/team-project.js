(() => {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxt1SLxfp6RwICIUVK-F1zxl4ek80zbMA0rUTczH9A5nyUsnJSV19xkFlVTrMnigMWp/exec';
  const OUTPUT_WEEKS = Array.from({ length: 13 }, (_, i) => i + 3);

  const form = document.querySelector('#team-form');
  const formMessage = document.querySelector('#form-message');
  const tableBody = document.querySelector('#team-table-body');
  const emptyState = document.querySelector('#empty-team-state');
  const filterButtons = [...document.querySelectorAll('[data-class-filter]')];
  const topButton = document.querySelector('#top-button');
  const submitButton = form?.querySelector('button[type="submit"]');

  let currentFilter = 'all';
  let teams = [];
  let jsonpSequence = 0;

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getMember(formData, index) {
    return {
      studentId: String(formData.get(`studentId${index}`) || '').trim(),
      name: String(formData.get(`studentName${index}`) || '').trim()
    };
  }

  function validateOptionalMember(member, index) {
    if (!member.studentId && !member.name) return '';
    if (!member.studentId || !member.name) return `팀원 ${index}의 학번과 이름을 모두 입력해 주세요.`;
    return '';
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
    submitButton.textContent = isSubmitting ? '등록 중...' : '팀 등록';
  }

  function jsonp(params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = `__teamProjectCallback${Date.now()}_${jsonpSequence++}`;
      const script = document.createElement('script');
      const query = new URLSearchParams({
        ...params,
        callback: callbackName,
        _: Date.now()
      });
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('Google Sheet 응답 시간이 초과되었습니다.'));
      }, 12000);

      function cleanup() {
        window.clearTimeout(timeout);
        script.remove();
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
      }

      window[callbackName] = result => {
        cleanup();
        if (!result?.success) {
          reject(new Error(result?.message || '요청을 처리하지 못했습니다.'));
          return;
        }
        resolve(result);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('Google Apps Script에 연결하지 못했습니다.'));
      };

      script.src = `${GOOGLE_SCRIPT_URL}?${query.toString()}`;
      document.head.appendChild(script);
    });
  }

  async function loadTeams() {
    try {
      const result = await jsonp({ action: 'list' });
      teams = Array.isArray(result.teams) ? result.teams : [];
      renderTeams();
    } catch (error) {
      console.error('팀 데이터를 불러오지 못했습니다.', error);
      teams = [];
      renderTeams();
      setMessage(error.message || 'Google Sheet에서 팀 목록을 불러오지 못했습니다.', 'error');
    }
  }

  async function createTeam(event) {
    event.preventDefault();
    setMessage();
    if (!form?.reportValidity()) return;

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

    if (teams.some(team => team.classGroup === classGroup && String(team.teamName || '').toLowerCase() === teamName.toLowerCase())) {
      setMessage('같은 분반에 동일한 팀명이 이미 등록되어 있습니다.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const result = await jsonp({
        action: 'register',
        classGroup,
        teamName,
        studentId1: members[0].studentId,
        studentName1: members[0].name,
        studentId2: members[1].studentId,
        studentName2: members[1].name,
        studentId3: members[2].studentId,
        studentName3: members[2].name
      });

      form.reset();
      setMessage(`${classGroup}반 ${teamName} 팀이 등록되었습니다.`, 'success');
      teams = Array.isArray(result.teams) ? result.teams : teams;
      renderTeams();
      if (!Array.isArray(result.teams)) await loadTeams();
    } catch (error) {
      console.error('팀 등록에 실패했습니다.', error);
      setMessage(error.message || '팀 등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function renderMember(member) {
    if (!member || (!member.studentId && !member.name)) return '<span>-</span>';
    return `${escapeHtml(member.studentId)}<span>${escapeHtml(member.name)}</span>`;
  }

  function renderTeams() {
    const filtered = currentFilter === 'all' ? teams : teams.filter(team => team.classGroup === currentFilter);
    if (emptyState) emptyState.hidden = filtered.length > 0;
    if (!tableBody) return;

    tableBody.innerHTML = filtered.map(team => {
      const number = Number(team.number);
      const weeks = team.weeks || {};
      const outputCells = OUTPUT_WEEKS.map(week => `
        <td><label class="week-check" title="${week}주차 산출물 완료">
          <input type="checkbox" data-team-number="${number}" data-week="${week}" ${weeks[week] ? 'checked' : ''} aria-label="${escapeHtml(team.teamName)} ${week}주차 산출물 완료">
        </label></td>
      `).join('');

      return `<tr>
        <td>${number}</td>
        <td><span class="class-badge">${escapeHtml(team.classGroup)}</span></td>
        <td class="team-name-cell">${escapeHtml(team.teamName)}</td>
        <td class="member-cell">${renderMember(team.members?.[0])}</td>
        <td class="member-cell">${renderMember(team.members?.[1])}</td>
        <td class="member-cell">${renderMember(team.members?.[2])}</td>
        ${outputCells}
      </tr>`;
    }).join('');
  }

  async function handleWeekCheck(event) {
    const checkbox = event.target.closest('input[data-team-number][data-week]');
    if (!checkbox) return;

    const number = Number(checkbox.dataset.teamNumber);
    const week = Number(checkbox.dataset.week);
    const checked = checkbox.checked;
    checkbox.disabled = true;

    try {
      await jsonp({ action: 'updateWeek', number, week, checked: String(checked) });
      const team = teams.find(item => Number(item.number) === number);
      if (team) {
        team.weeks = team.weeks || {};
        team.weeks[week] = checked;
      }
    } catch (error) {
      console.error('주차별 산출물 상태 저장에 실패했습니다.', error);
      checkbox.checked = !checked;
      setMessage(error.message || `${week}주차 완료 상태를 저장하지 못했습니다.`, 'error');
    } finally {
      checkbox.disabled = false;
    }
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

  loadTeams();
})();
