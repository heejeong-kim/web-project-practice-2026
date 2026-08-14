const SPREADSHEET_ID = '14SrmsTTOLCzWZUM-rEmKL9qT-ostphAk-IhHb3w3fAw';
const SHEET_NAME = '팀프로젝트';

const COL = {
  NUMBER: 1,
  CLASS_GROUP: 2,
  TEAM_NAME: 3,
  STUDENT_ID_1: 4,
  STUDENT_NAME_1: 5,
  STUDENT_ID_2: 6,
  STUDENT_NAME_2: 7,
  STUDENT_ID_3: 8,
  STUDENT_NAME_3: 9,
  WEEK_3: 10,
  CREATED_AT: 23,
  IDEA: 24,
  TRACK: 25,
  NOTION_URL: 26
};

function doGet(e) {
  try {
    initializeSheet();
    const params = (e && e.parameter) || {};
    const action = String(params.action || 'list');
    let result;

    if (action === 'list') {
      result = { success: true, teams: getTeams() };
    } else if (action === 'register') {
      result = registerTeam(params);
    } else if (action === 'updateTeam') {
      result = updateTeam(params);
    } else if (action === 'updateWeek') {
      result = updateWeek(params);
    } else {
      throw new Error('지원하지 않는 요청입니다.');
    }

    return output_(result, params.callback);
  } catch (error) {
    const callback = e && e.parameter ? e.parameter.callback : '';
    return output_({ success: false, message: error.message || String(error) }, callback);
  }
}

function initializeSheet() {
  const sheet = getSheet_();
  const headers = [
    '번호', '분반', '팀명',
    '팀원1학번', '팀원1이름',
    '팀원2학번', '팀원2이름',
    '팀원3학번', '팀원3이름',
    '3주차', '4주차', '5주차', '6주차', '7주차', '8주차', '9주차', '10주차', '11주차', '12주차', '13주차', '14주차', '15주차',
    '등록일', '아이디어', '트랙', '산출물 노션 URL'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    sheet.getRange(1, COL.IDEA).setValue('아이디어');
    sheet.getRange(1, COL.TRACK).setValue('트랙');
    sheet.getRange(1, COL.NOTION_URL).setValue('산출물 노션 URL');
  }
}

function getTeams() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const rows = sheet.getRange(2, 1, lastRow - 1, COL.NOTION_URL).getValues();
  return rows
    .filter(row => row[COL.NUMBER - 1] !== '' && row[COL.NUMBER - 1] !== null)
    .map(row => {
      const weeks = {};
      for (let week = 3; week <= 15; week += 1) {
        weeks[week] = Boolean(row[week + 6]);
      }

      return {
        number: Number(row[COL.NUMBER - 1]),
        classGroup: String(row[COL.CLASS_GROUP - 1] || ''),
        teamName: String(row[COL.TEAM_NAME - 1] || ''),
        idea: String(row[COL.IDEA - 1] || ''),
        track: String(row[COL.TRACK - 1] || ''),
        notionUrl: String(row[COL.NOTION_URL - 1] || ''),
        members: [
          { studentId: String(row[COL.STUDENT_ID_1 - 1] || ''), name: String(row[COL.STUDENT_NAME_1 - 1] || '') },
          { studentId: String(row[COL.STUDENT_ID_2 - 1] || ''), name: String(row[COL.STUDENT_NAME_2 - 1] || '') },
          { studentId: String(row[COL.STUDENT_ID_3 - 1] || ''), name: String(row[COL.STUDENT_NAME_3 - 1] || '') }
        ],
        weeks,
        createdAt: formatDate_(row[COL.CREATED_AT - 1])
      };
    });
}

function registerTeam(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const input = validateTeamInput_(data, null);
    const sheet = getSheet_();
    const number = getNextNumber_(sheet);

    const row = new Array(COL.NOTION_URL).fill('');
    row[COL.NUMBER - 1] = number;
    row[COL.CLASS_GROUP - 1] = input.classGroup;
    row[COL.TEAM_NAME - 1] = input.teamName;
    row[COL.STUDENT_ID_1 - 1] = input.members[0].studentId;
    row[COL.STUDENT_NAME_1 - 1] = input.members[0].name;
    row[COL.STUDENT_ID_2 - 1] = input.members[1].studentId;
    row[COL.STUDENT_NAME_2 - 1] = input.members[1].name;
    row[COL.STUDENT_ID_3 - 1] = input.members[2].studentId;
    row[COL.STUDENT_NAME_3 - 1] = input.members[2].name;
    row[COL.CREATED_AT - 1] = new Date();
    row[COL.IDEA - 1] = input.idea;
    row[COL.TRACK - 1] = input.track;
    row[COL.NOTION_URL - 1] = input.notionUrl;

    sheet.appendRow(row);
    SpreadsheetApp.flush();

    return { success: true, message: '팀이 등록되었습니다.', teams: getTeams() };
  } finally {
    lock.releaseLock();
  }
}

function updateTeam(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const number = Number(data.number);
    if (!Number.isInteger(number) || number <= 0) throw new Error('수정할 팀 번호가 올바르지 않습니다.');

    const sheet = getSheet_();
    const rowIndex = findTeamRow_(sheet, number);
    if (!rowIndex) throw new Error('수정할 팀을 찾을 수 없습니다.');

    const input = validateTeamInput_(data, number);
    const row = sheet.getRange(rowIndex, 1, 1, COL.NOTION_URL).getValues()[0];

    row[COL.CLASS_GROUP - 1] = input.classGroup;
    row[COL.TEAM_NAME - 1] = input.teamName;
    row[COL.STUDENT_ID_1 - 1] = input.members[0].studentId;
    row[COL.STUDENT_NAME_1 - 1] = input.members[0].name;
    row[COL.STUDENT_ID_2 - 1] = input.members[1].studentId;
    row[COL.STUDENT_NAME_2 - 1] = input.members[1].name;
    row[COL.STUDENT_ID_3 - 1] = input.members[2].studentId;
    row[COL.STUDENT_NAME_3 - 1] = input.members[2].name;
    row[COL.IDEA - 1] = input.idea;
    row[COL.TRACK - 1] = input.track;
    row[COL.NOTION_URL - 1] = input.notionUrl;

    sheet.getRange(rowIndex, 1, 1, COL.NOTION_URL).setValues([row]);
    SpreadsheetApp.flush();

    return { success: true, message: '팀 정보가 수정되었습니다.', teams: getTeams() };
  } finally {
    lock.releaseLock();
  }
}

function updateWeek(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const number = Number(data.number);
    const week = Number(data.week);
    if (!Number.isInteger(number) || number <= 0) throw new Error('팀 번호가 올바르지 않습니다.');
    if (!Number.isInteger(week) || week < 3 || week > 15) throw new Error('주차가 올바르지 않습니다.');

    const sheet = getSheet_();
    const rowIndex = findTeamRow_(sheet, number);
    if (!rowIndex) throw new Error('팀을 찾을 수 없습니다.');

    sheet.getRange(rowIndex, week + 7).setValue(String(data.checked) === 'true');
    SpreadsheetApp.flush();
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function validateTeamInput_(data, editingNumber) {
  const classGroup = String(data.classGroup || '').trim();
  const teamName = String(data.teamName || '').trim();
  const idea = String(data.idea || '').trim();
  const track = String(data.track || '').trim();
  const notionUrl = String(data.notionUrl || '').trim();
  const members = [
    { studentId: String(data.studentId1 || '').trim(), name: String(data.studentName1 || '').trim() },
    { studentId: String(data.studentId2 || '').trim(), name: String(data.studentName2 || '').trim() },
    { studentId: String(data.studentId3 || '').trim(), name: String(data.studentName3 || '').trim() }
  ];

  if (classGroup !== 'A' && classGroup !== 'B') throw new Error('분반을 선택해 주세요.');
  if (!teamName) throw new Error('팀명을 입력해 주세요.');
  if (!idea) throw new Error('아이디어를 입력해 주세요.');
  if (track !== '필수' && track !== '심화') throw new Error('트랙 구분을 선택해 주세요.');
  if (!notionUrl) throw new Error('산출물 노션 URL을 입력해 주세요.');
  if (!isNotionUrl_(notionUrl)) throw new Error('유효한 Notion URL을 입력해 주세요.');

  for (let i = 0; i < 2; i += 1) {
    if (!members[i].studentId || !members[i].name) throw new Error('팀원 ' + (i + 1) + '의 학번과 이름을 모두 입력해 주세요.');
  }
  if ((members[2].studentId && !members[2].name) || (!members[2].studentId && members[2].name)) {
    throw new Error('팀원 3은 학번과 이름을 모두 입력하거나 둘 다 비워 주세요.');
  }

  const ids = members.filter(member => member.studentId).map(member => member.studentId);
  if (new Set(ids).size !== ids.length) throw new Error('같은 학번을 한 팀에 중복 등록할 수 없습니다.');

  const teams = getTeams();
  const otherTeams = teams.filter(team => Number(team.number) !== Number(editingNumber));
  if (otherTeams.some(team => team.classGroup === classGroup && team.teamName.trim().toLowerCase() === teamName.toLowerCase())) {
    throw new Error('같은 분반에 동일한 팀명이 이미 등록되어 있습니다.');
  }

  const usedIds = {};
  otherTeams.forEach(team => {
    (team.members || []).forEach(member => {
      if (member.studentId) usedIds[member.studentId] = team.teamName;
    });
  });
  ids.forEach(id => {
    if (usedIds[id]) throw new Error('학번 ' + id + '은(는) 이미 ' + usedIds[id] + ' 팀에 등록되어 있습니다.');
  });

  return { classGroup, teamName, idea, track, notionUrl, members };
}

function isNotionUrl_(value) {
  return /^https?:\/\/(?:[^\/]+\.)?(?:notion\.so|notion\.site|notion\.com)(?:\/|$)/i.test(String(value || '').trim());
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function getNextNumber_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  const values = sheet.getRange(2, COL.NUMBER, lastRow - 1, 1).getValues().flat();
  return values.reduce((max, value) => Math.max(max, Number(value) || 0), 0) + 1;
}

function findTeamRow_(sheet, number) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, COL.NUMBER, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i += 1) {
    if (Number(values[i][0]) === Number(number)) return i + 2;
  }
  return 0;
}

function formatDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone() || 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  }
  return String(value);
}

function output_(payload, callback) {
  const json = JSON.stringify(payload);
  const callbackName = String(callback || '').trim();
  const useJsonp = /^[A-Za-z_$][0-9A-Za-z_$.]*$/.test(callbackName);
  const body = useJsonp ? callbackName + '(' + json + ');' : json;
  return ContentService.createTextOutput(body)
    .setMimeType(useJsonp ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
