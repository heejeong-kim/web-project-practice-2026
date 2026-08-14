(() => {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxt1SLxfp6RwICIUVK-F1zxl4ek80zbMA0rUTczH9A5nyUsnJSV19xkFlVTrMnigMWp/exec';
  const OUTPUT_WEEKS = Array.from({ length: 13 }, (_, i) => i + 3);

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

  let currentFilter = 'A';
  let teams = [];
  let editingNumber = null;
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

  function setMessage(text = '', type = '') {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.className = 'form-message';
    if (type) formMessage.classList.add(`is-${type}`);
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? (editingNumber ? '수정 저장 중...' : '등록 중...')
      : (editingNumber ? '수정 저장' : '팀 등록');
  }

  function setEditingMode(team = null) {
    editingNumber = team ? Number(team.number) : null;
    if (teamNumberInput) teamNumberInput.value = editingNumber || '';
    if (formTitle) formTitle.textContent = editingNumber ? '팀 정보 수정' : '팀 정보 등록';
    if (formDescription) {
      formDescription.textContent = editingNumber
        ? '선택한 팀 정보를 수정한 뒤 저장하세요.'
        : '팀원 1·2는 필수, 팀원 3은 선택입니다.';
    }
    if (submitButton) submitButton.textContent = editingNumber ? '수정 저장' : '팀 등록';
    if (resetButton) resetButton.textContent = editingNumber ? '수정 취소' : '입력 초기화';
    form?.classList.toggle('is-editing', Boolean(editingNumber));
  }

  function jsonp(params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = `__teamProjectCallback${Date.now()}_${jsonpSequence++}`;
      const script = document.createElement('script');
      const query = new URLSearchParams({ ...params, callback: callbackName, _: Date.now() });
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

  function validateTeamForm(formData) {
    const classGroup = String(formData.get('classGroup') || '').trim();
    const teamName = String(formData.get('teamName') || '').trim();
    const idea = String(formData.get('idea') || '').trim();
    const track = String(formData.get('track') || '').trim();
    const members = [1, 2, 3].map(index => getMember(formData, index));

    if (!classGroup) return { error: '분반을 선택해 주세요.' };
    if (!teamName) return { error: '팀명을 입력해 주세요.' };
    if (!idea) return { error: '아이디어를 입력해 주세요.' };
    if (!['필수', '심화'].includes(track)) return { error: '트랙 구분을 선택해 주세요.' };

    for (let i = 0; i < 2; i += 1) {
      if (!members[i].studentId || !members[i].name) {
        return { error: `팀원 ${i + 1}의 학번과 이름을 모두 입력해 주세요.` };
      }
    }

    if ((members[2].studentId && !members[2].name) || (!members[2].studentId && members[2].name)) {
      return { error: '팀원 3을 입력하려면 학번과 이름을 모두 입력해 주세요.' };
    }

    const studentIds = members.filter(member => member.studentId).map(member => member.studentId);
    if (new Set(studentIds).size !== studentIds.length) {
      return { error: '같은 학번을 한 팀에 중복 등록할 수 없습니다.' };
    }

    const duplicateTeam = teams.some(team =>
      Number(team.number) !== Number(editingNumber) &&
      team.classGroup === classGroup &&
      String(team.teamName || '').trim().toLowerCase() === teamName.toLowerCase()
    );

    if (duplicateTeam) {
      return { error: '같은 분반에 동일한 팀명이 이미 등록되어 있습니다.' };
    }

    return { classGroup, teamName, idea, track, members };
  }

  async function saveTeam(event) {
    event.preventDefault();
    setMessage();
    if (!form?.reportValidity()) return;

    const formData = new FormData(form);
    const validation = validateTeamForm(formData);
    if (validation.error) {
      setMessage(validation.error, 'error');
      return;
    }

    const { classGroup, teamName, idea, track, members } = validation;

    try {
      setSubmitting(true);

      const params = {
        action: editingNumber ? 'updateTeam' : 'register',
        number: editingNumber ? String(editingNumber) : '',
        classGroup,
        teamName,
        idea,
        track,
        studentId1: members[0].studentId,
        studentName1: members[0].name,
        studentId2: members[1].studentId,
        studentName2: members[1].name,
        studentId3: members[2].studentId,
        studentName3: members[2].name
      };

      const result = await jsonp(params);
      const successText = editingNumber
        ? `${classGroup}반 ${teamName} 팀 정보가 수정되었습니다.`
        : `${classGroup}반 ${teamName} 팀이 등록되었습니다.`;

      form.reset();
      setEditingMode(null);
      setMessage(successText, 'success');
      teams = Array.isArray(result.teams) ? result.teams : teams;
      currentFilter = classGroup;
      syncTabs();
      renderTeams();
      if (!Array.isArray(result.teams)) await loadTeams();
    } catch (error) {
      console.error(editingNumber ? '팀 수정에 실패했습니다.' : '팀 등록에 실패했습니다.', error);
      setMessage(error.message || (editingNumber ? '팀 수정에 실패했습니다.' : '팀 등록에 실패했습니다.'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function renderMember(member) {
    if (!member || (!member.studentId && !member.name)) return '<span>-</span>';
    return `${escapeHtml(member.studentId)}<span>${escapeHtml(member.name)}</span>`;
  }

  function renderTeams() {
    const filtered = teams.filter(team => team.classGroup === currentFilter);

    if (emptyState) {
      emptyState.hidden = filtered.length > 0;
      const title = emptyState.querySelector('strong');
      const copy = emptyState.querySelector('p');
      if (title) title.textContent = `${currentFilter}반에 아직 등록된 팀이 없습니다.`;
      if (copy) copy.textContent = '상단에서 팀을 등록하면 이곳에 목록이 표시됩니다.';
    }

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
        <td class="team-name-cell">
          <button type="button" class="team-edit-button" data-edit-team="${number}" title="${escapeHtml(team.teamName)} 팀 정보 수정">
            ${escapeHtml(team.teamName)}
          </button>
        </td>
        <td class="idea-cell">${escapeHtml(team.idea || '-')}</td>
        <td><span class="track-badge ${team.track === '심화' ? 'is-advanced' : ''}">${escapeHtml(team.track || '-')}</span></td>
        <td class="member-cell">${renderMember(team.members?.[0])}</td>
        <td class="member-cell">${renderMember(team.members?.[1])}</td>
        <td class="member-cell">${renderMember(team.members?.[2])}</td>
        ${outputCells}
      </tr>`;
    }).join('');
  }

  function fillFormForEdit(team) {
    if (!form || !team) return;

    setEditingMode(team);
    form.querySelector(`[name="classGroup"][value="${team.classGroup}"]`)?.click();
    form.querySelector('#team-name').value = team.teamName || '';
    form.querySelector('#project-idea').value = team.idea || '';

    const track = team.track || '필수';
    form.querySelector(`[name="track"][value="${track}"]`)?.click();

    [1, 2, 3].forEach(index => {
      const member = team.members?.[index - 1] || {};
      form.querySelector(`[name="studentId${index}"]`).value = member.studentId || '';
      form.querySelector(`[name="studentName${index}"]`).value = member.name || '';
    });

    setMessage(`${team.teamName} 팀 정보를 수정 중입니다.`, 'success');
    formSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleTeamEdit(event) {
    const button = event.target.closest('[data-edit-team]');
    if (!button) return;
    const number = Number(button.dataset.editTeam);
    const team = teams.find(item => Number(item.number) === number);
    if (team) fillFormForEdit(team);
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

  function syncTabs() {
    filterButtons.forEach(button => {
      const isActive = button.dataset.classFilter === currentFilter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
  }

  function handleFilter(event) {
    currentFilter = event.currentTarget.dataset.classFilter;
    syncTabs();
    renderTeams();
  }

  function handleReset() {
    const wasEditing = Boolean(editingNumber);
    setTimeout(() => {
      setEditingMode(null);
      setMessage(wasEditing ? '수정을 취소했습니다.' : '');
    }, 0);
  }

  filterButtons.forEach(button => button.addEventListener('click', handleFilter));
  syncTabs();

  form?.addEventListener('submit', saveTeam);
  form?.addEventListener('reset', handleReset);
  tableBody?.addEventListener('click', handleTeamEdit);
  tableBody?.addEventListener('change', handleWeekCheck);

  if (topButton) {
    const syncTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', syncTopButton, { passive: true });
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    syncTopButton();
  }

  loadTeams();
})();