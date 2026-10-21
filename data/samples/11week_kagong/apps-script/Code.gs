// 카공 12주차 [심화 B] — 구글 시트 한줄평(memo)·정보 수정 제보(report) 저장용 Apps Script
// 1) 구글 시트에 memo·report 탭을 만들고 1행에 아래 COLS의 열 이름을 그대로 입력
// 2) 확장 프로그램 → Apps Script에 이 코드를 붙여 넣고 저장
// 3) 배포 → 새 배포 → 유형 '웹 앱', 실행 계정 '나', 액세스 권한 '모든 사용자' → /exec 주소를 js/app.js의 SHEET_URL에 입력
const COLS = {
  memo:   ['createdAt', 'placeId', 'rating', 'text', 'nickname'],
  report: ['createdAt', 'placeId', 'field', 'current', 'suggested', 'note']
};
const out = obj => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);

// 쓰기 : 화면에서 보낸 JSON을 해당 탭 맨 아래 행으로 추가
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.type === 'likes') return postLike(body);
  const cols = COLS[body.type];
  if (!cols) return out({ ok: false, error: '알 수 없는 type' });
  if (body.type === 'memo' && !(body.rating >= 1 && body.rating <= 5 && String(body.text || '').trim().length <= 60))
    return out({ ok: false, error: '입력값 오류' });               // 화면 검증을 우회한 요청도 다시 검사
  const row = cols.map(c => c === 'createdAt' ? new Date() : String(body[c] ?? '').slice(0, 200));
  SpreadsheetApp.getActive().getSheetByName(body.type).appendRow(row);
  return out({ ok: true });
}

// 읽기 : 한줄평만 공간 id로 골라 최신순 20개(제보는 공개하지 않음)
function doGet(e) {
  if (e.parameter.type === 'likes') return getLikes(e);
  const [head, ...rows] = SpreadsheetApp.getActive().getSheetByName('memo').getDataRange().getValues();
  const id = Number(e.parameter.placeId);
  const items = rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])))
                    .filter(m => Number(m.placeId) === id).reverse().slice(0, 20);
  return out({ ok: true, items });
}

// 공용 좋아요: likes 탭을 자동 생성. 익명 브라우저별 중복 방지이며 로그인 사용자 인증은 별도.
function likesSheet() {
  const book = SpreadsheetApp.getActive();
  let sheet = book.getSheetByName('likes');
  if (!sheet) { sheet = book.insertSheet('likes'); sheet.appendRow(['placeId', 'clientId', 'liked', 'updatedAt']); }
  return sheet;
}
function likeClientValid(id) { return typeof id === 'string' && /^[a-zA-Z0-9-]{20,80}$/.test(id); }
function likeSnapshot(sheet, clientId) {
  const rows = sheet.getDataRange().getValues().slice(1), counts = {}, liked = [];
  rows.forEach(row => {
    if (row[2] !== true && String(row[2]) !== 'true') return;
    const id = Number(row[0]); counts[id] = (counts[id] || 0) + 1;
    if (String(row[1]) === clientId) liked.push(id);
  });
  return {ok:true, counts:counts, liked:liked};
}
function getLikes(e) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); return out(likeSnapshot(likesSheet(), String(e.parameter.clientId || ''))); }
  catch (error) { return out({ok:false,error:'집계 조회 실패'}); }
  finally { if (lock.hasLock()) lock.releaseLock(); }
}
function postLike(body) {
  const id = Number(body.placeId), client = body.clientId;
  if (!Number.isInteger(id) || id < 1 || id > 380 || !likeClientValid(client) || typeof body.liked !== 'boolean') return out({ok:false,error:'좋아요 입력값 오류'});
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = likesSheet(), rows = sheet.getDataRange().getValues();
    const rowIndex = rows.findIndex((row, index) => index > 0 && Number(row[0]) === id && String(row[1]) === client);
    const row = [id, client, body.liked, new Date()];
    if (rowIndex < 0) sheet.appendRow(row); else sheet.getRange(rowIndex + 1, 1, 1, 4).setValues([row]);
    const snapshot = likeSnapshot(sheet, client);
    return out({ok:true,count:snapshot.counts[id] || 0,liked:body.liked});
  } catch (error) { return out({ok:false,error:'좋아요 반영 실패'}); }
  finally { if (lock.hasLock()) lock.releaseLock(); }
}
