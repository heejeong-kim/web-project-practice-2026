## 🎯 학습 목표
1. 6주차 JSON의 각 필드가 `JSON → fetch → 렌더링 → 화면` 흐름을 거쳐 화면 어디에 표시되는지 설명할 수 있다
2. 반복 렌더링(Rendering)을 이용해 데이터 수에 따라 목록 화면이 자동으로 생성되는 원리를 이해할 수 있다
3. 화면에서 비어 있거나 잘못 표시된 값을 찾고 원인이 데이터인지 코드인지 판단할 수 있다
4. 팀 project에 JSON을 연결하고 화면을 보며 점검·수정한 뒤 데이터에 맞게 인터페이스를 변경할 수 있다
---
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="426">
<col>
</colgroup>
<tr>
<td>고민해볼 문제</td>
<td>이번 주차에서 연결되는 내용</td>
</tr>
<tr>
<td>JSON 파일은 어떤 과정을 거쳐 브라우저 화면에 나타날까?</td>
<td>fetch와 데이터 흐름</td>
</tr>
<tr>
<td>JSON을 고친 결과는 어디에서 확인해야 할까?</td>
<td>GitHub Pages 배포 확인</td>
</tr>
<tr>
<td>데이터가 300건이면 HTML 카드도 300개 직접 작성해야 할까?</td>
<td>반복 렌더링</td>
</tr>
<tr>
<td>목록이 비어 있을 때 사용자는 결과 없음과 불러오기 실패를 어떻게 구분할까?</td>
<td>상태 화면과 빈 상태(Empty State)</td>
</tr>
<tr>
<td>이미지나 설명이 없는 데이터가 섞여 있으면 화면은 어떻게 보여야 할까?</td>
<td>누락 데이터 처리</td>
</tr>
<tr>
<td>화면에 이상한 값이 보이면 코드와 JSON 중 무엇을 먼저 고쳐야 할까?</td>
<td>화면으로 데이터 점검하기</td>
</tr>
</table>
---
<callout color="green_bg">
	7주차는 6주차에 만든 JSON을 `fetch`로 팀 project에 연결하고 실제 화면으로 열어 보며 데이터가 의도대로 표시되는지 점검하고 수정하는 단계로, 코드를 새로 작성하는 것이 아니라 `JSON → fetch → JavaScript 데이터 → 반복 렌더링 → 화면`으로 이어지는 흐름을 이해하고 화면에서 발견한 문제를 JSON에서 바로잡은 뒤 데이터에 맞게 인터페이스를 변경하는 데 초점을 둠
	개념을 익힌 뒤 3.3 실습에서 교수자 카공 샘플 실행 화면을 먼저 확인하고, 같은 방식으로 팀 `project/`에 JSON을 연결해 데이터 흐름·상태를 확인한 뒤 JSON을 점검·수정하고 인터페이스를 변경
	7주차 결과물인 점검된 JSON과 7주차 버전 project는 이후 주차에 검색·필터·정렬·상세보기를 고도화하는 기준이 됨
</callout>
---
<details>
<summary>트랙별 학습 안내</summary>
	<callout icon="✅" color="blue_bg">
		필수 트랙
		모든 팀이 공통으로 수행하는 기본 범위<br>HTML·CSS, JavaScript, JSON, 검색·필터·정렬, 상세보기, LocalStorage 개인화, 사용자 테스트와 실제 배포까지 하나의 서비스로 연결 <br>\[참고\] 필수 트랙 완료시 18점 만점으로 채점
	</callout>
	<callout icon="🚀" color="purple_bg">
		심화 트랙
		필수 트랙을 완성한 뒤 프로젝트 목적에 필요한 경우 외부 API, Supabase·Firebase와 같은 클라우드 DB, 간단한 인증과 배포 환경 연동을 선택적으로 적용. <br>기술의 개수보다 사용자 문제 해결에 필요한 이유와 안정적인 구현을 우선<br>\[참고\] 심화 트랙으로 완료 시 20점 만점으로 채점<br><br>⚠️ 단, API나 클라우드 DB를 적용했다는 사실 자체가 높은 평가를 보장하지 않음. 사용자 문제 해결과 서비스 완성도, 안정적인 동작이 우선
	</callout>
</details>
---
<details>
<summary>준비물 및 수업환경</summary>
	- 4주차 화면 상태 정의 5종(초기·로딩·결과 없음·오류·저장 완료)
	- 5주차 화면 명세(클래스·id 이름 목록)
	- 6주차 데이터 명세서(필드명·자료형·필수 여부·허용값)와 3.5.2 검수 결과
	- 6주차 ID 규칙(`data-id` 대응)과 이미지 경로 규칙(`asset/` 폴더)
	- 6주차에 JSON 파일을 `data/` 폴더에 넣은 팀 `project/` 폴더(GitHub 저장소)
	- Visual Studio Code와 브라우저(Chrome 권장)
	- 팀 GitHub Pages 배포 주소(5주차에 등록한 저장소)
	- JSON 수정 방식은 직접 수정과 AI 도구 활용 중 팀이 선택 가능(3.2 참고)
</details>
---
# 1. JSON 데이터 불러오기
## 1.1 fetch와 데이터 흐름
### 1.1.1 JSON에서 화면까지
JSON 파일은 브라우저가 그대로 화면에 보여주는 문서가 아님. JavaScript가 JSON 파일을 요청해 받아 오고, 객체와 배열로 변환한 뒤 HTML 요소를 만들어 넣어야 사용자가 볼 수 있는 화면이 됨. 이번 주차의 모든 내용은 아래 5단계 흐름 중 어디에 해당하는지로 정리할 수 있음
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="160">
<col width="330">
<col width="300">
</colgroup>
<tr>
<td>단계</td>
<td>하는 일</td>
<td>카공 예시의 코드</td>
</tr>
<tr>
<td>① JSON</td>
<td>6주차에 만든 `data/` 폴더의 원본 데이터</td>
<td>`DATA_URL`(`data/items.json`)</td>
</tr>
<tr>
<td>② fetch</td>
<td>파일을 요청하고 응답을 JavaScript 데이터로 변환</td>
<td>`loadData()`</td>
</tr>
<tr>
<td>③ JavaScript 데이터</td>
<td>배열인지·건수·필수 필드를 확인하고 원본 배열로 보관</td>
<td>`checkData()`, `places`</td>
</tr>
<tr>
<td>④ 렌더링</td>
<td>배열을 카드 HTML로 바꿔 목록 영역에 넣음</td>
<td>`renderList()` → `card()`, `badges()`</td>
</tr>
<tr>
<td>⑤ 화면</td>
<td>결과 건수·카드·상태 화면을 사용자에게 보여줌</td>
<td>`#count`, `#cards`, `empty()`, `showLoadError()`</td>
</tr>
</table>
- 각 단계는 앞 단계의 결과를 입력으로 받으므로 화면이 이상하다면 ①부터 순서대로 어디서 문제가 생겼는지 확인
- 3.3 실습에서는 이 5단계를 팀 project 화면에서 하나씩 확인하고 화면에서 발견한 문제를 ① JSON에서 고치는 방식으로 진행하며, 팀 코드의 함수 이름이 다르면 표의 ‘하는 일’을 기준으로 각 단계에 해당하는 곳을 찾음
---
6주차에 만든 JSON을 이번 주차에 `fetch`로 연결하면 화면이 코드 안의 배열 대신 실제 데이터로 동작함. 이번 주차는 JSON을 연결하고 **화면을 보며 JSON이 명세대로 작성되었는지 점검·수정한 뒤 데이터에 맞게 인터페이스를 변경**하는 단계이며, 기능 자체를 고도화하는 작업은 이후 주차에 진행하므로 작업 범위를 먼저 구분
#### **범위 구분표**
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="354">
<col width="340">
</colgroup>
<tr>
<td>이번 주차에 만들 것</td>
<td>이번 주차에 만들지 않을 것</td>
</tr>
<tr>
<td>JSON 연결과 데이터 점검·수정</td>
<td>검색·복수 필터·정렬 조건 로직의 고도화(이후 주차)</td>
</tr>
<tr>
<td>추가 필드를 넣은 JSON 데이터셋</td>
<td>즐겨찾기 등 개인 상태 저장 확장(이후 주차)</td>
</tr>
<tr>
<td>추가 필드를 보여주는 인터페이스 변경</td>
<td>외부 API·클라우드 DB 연동(심화 트랙)</td>
</tr>
</table>
<callout icon="⚠️" color="yellow_bg">
	화면에 이상한 값이 보이면 코드보다 JSON을 먼저 확인하고, JSON 점검·수정을 끝낸 뒤 추가 필드를 화면에 보여주도록 인터페이스를 변경. AI 도구를 사용할 때는 결과에 범위 구분표의 ‘이번 주차에 만들지 않을 것’이 포함되지 않았는지 확인
</callout>
---
### 1.1.2 기본 fetch 예시
```javascript
fetch('./data/items.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });
```
- `fetch`는 파일 경로로 데이터를 요청하고, 응답이 도착하면 `then` 안의 코드가 순서대로 실행됨
- `response.json()`은 JSON 문자열을 JavaScript 배열·객체로 변환함 — 6주차 1.3의 문법 오류가 남아 있으면 이 단계에서 실패
- 경로가 틀리거나 파일이 없으면 `catch`로 넘어가므로 오류 화면 표시는 `catch` 안에서 처리
- 카공 예시의 `loadData()`도 같은 구조이며, 응답이 정상인지(`response.ok`) 확인하는 한 줄이 더 들어 있음
---
### 1.1.3 GitHub Pages에서 확인하는 이유
HTML 파일을 더블클릭해 열면 주소가 `file://`로 시작하며, 브라우저는 보안상 이 상태에서 `fetch`로 JSON 파일을 읽는 것을 막음. 이번 수업은 GitHub Pages에 배포한 주소(`https://아이디.github.io/저장소/`)에서 화면을 확인하므로, JSON을 수정한 뒤에는 커밋·푸시하고 배포 주소에서 결과를 확인
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="140">
<col width="330">
<col width="300">
</colgroup>
<tr>
<td>단계</td>
<td>하는 일</td>
<td>확인할 점</td>
</tr>
<tr>
<td>① 수정</td>
<td>VS Code에서 `data/` 폴더의 JSON을 수정하고 저장</td>
<td>VS Code에 빨간 밑줄이 없는지</td>
</tr>
<tr>
<td>② 커밋·푸시</td>
<td>변경 내용을 커밋하고 GitHub에 푸시</td>
<td>커밋 메시지에 수정한 내용을 적었는지(예: id 12 closeTime 수정)</td>
</tr>
<tr>
<td>③ 배포 확인</td>
<td>저장소의 Actions 탭에서 Pages 배포가 완료되었는지 확인</td>
<td>보통 1\~2분 걸리며 초록색 체크가 표시됨</td>
</tr>
<tr>
<td>④ 화면 확인</td>
<td>배포 주소를 열고 강력 새로고침(Windows `Ctrl+Shift+R`, Mac `Cmd+Shift+R`)</td>
<td>이전 JSON이 브라우저에 남아 있지 않은지</td>
</tr>
</table>
> <span color="gray">예시) 배포 주소에서 바뀐 값이 보이지 않으면 코드보다 먼저 ③ 배포 완료 여부와 ④ 강력 새로고침을 확인하고, 그래도 같으면 개발자 도구 Network 탭에서 JSON 파일을 눌러 수정한 값이 들어 있는지 확인</span>
---
## 1.2 결과 없음과 불러오기 실패
- 결과 없음 : 데이터는 불러왔지만 조건에 맞는 항목이 0건인 상태로, 조건을 넓히는 안내를 보여줌
- 불러오기 실패 : JSON 파일을 불러오지 못한 상태(경로 오류·JSON 문법 오류)로, `catch`에서 오류 안내를 보여줌
- 둘 다 카드가 0개지만 원인이 다르므로 결과 없음은 JSON 값을, 불러오기 실패는 파일 경로와 JSON 문법을 먼저 확인
---
## 1.3 원본 데이터와 화면 데이터
### 1.3.1 원본 배열을 보존하는 이유
JSON에서 읽은 데이터는 서비스의 원본이므로 화면에 보여줄 때마다 바꾸지 않고 그대로 보관함. 필터·정렬은 원본 배열에서 조건에 맞는 결과 배열을 새로 만들어 화면에 전달하는 방식으로 처리
```javascript
// 5주차: 코드 안에 직접 적은 배열
// const places = [ {id:1, name:'논스탑 스터디바', ...}, ... ];

// 7주차: JSON에서 읽은 데이터를 원본 배열로 보존
let places = [];

// 목록 처리: 원본에서 조건에 맞는 결과 배열을 새로 만들어 화면에 전달
function results() {
  return places.filter(p => /* 지역·검색어·필터 조건 */);
}
```
- 원본 배열을 직접 계속 변경하면 조건 초기화(↺)를 눌러도 처음 데이터로 돌아갈 수 없음
- `filter`는 원본을 바꾸지 않고 새 배열을 돌려주므로 조건을 몇 번 바꿔도 `places`는 그대로 유지
- 상세보기·즐겨찾기처럼 id로 찾는 곳은 `places.find()`를 사용하므로 JSON의 id가 중복되면 다른 공간의 상세가 열림 → id 중복은 화면만 봐서는 알기 어려우므로 데이터 점검으로 찾아야 함
---
### 1.3.2 데이터 확인 체크리스트
화면을 점검하기 전에 데이터가 예상한 구조로 들어왔는지 확인해야 렌더링 문제와 데이터 문제를 구분할 수 있음. 카공 예시의 `checkData()`는 아래 항목을 Console에 자동으로 출력하고, 필수 필드가 빠진 항목은 화면에서 제외함
- 배열인지 확인
- 데이터 건수 확인
- 첫 번째 객체의 필드 확인
- ID가 존재하고 자료형이 6주차 ID 규칙과 같은지, 중복되지 않는지 확인
- 6주차 명세서의 필수 필드가 모든 항목에 있는지 확인
- 6주차 허용값 목록 밖의 값, 명세와 다른 자료형이 있는지 확인
- 필드별 빈 값(`null`) 수 확인
```plain text
▼ [데이터 점검] ../data/items.json
  배열인가? true
  데이터 건수: 380
  첫 번째 객체의 필드(22개): ['id', 'name', 'area', 'address', 'lat', 'lng', 'hasOutlet', …]
  첫 번째 id와 자료형: 1 'number'
  빈 값(null) 수: {hasOutlet: 11, noiseLevel: 11, seatType: 11, …}
  경고: 없음
  화면에 표시할 건수: 380
```
- 경고가 있으면 노란색 줄로 `허용값 밖: id 1 noiseLevel = "silent"`처럼 어느 항목의 어떤 값이 문제인지 표시됨
- 아래 `checkData()`를 팀 `app.js`에 추가하고, `REQUIRED`·`ALLOWED`·`TYPES`만 팀 데이터 명세서에 맞게 바꿈(3.3 실습 1단계에서 적용)
```javascript
// 6주차 데이터 명세서 기준으로 바꿀 부분
const REQUIRED = ['id', 'name', 'area'];                         // 필수 필드
const ALLOWED = { noiseLevel: ['quiet', 'normal', 'talkable'] };  // 허용값이 정해진 필드
const TYPES = { id: 'number', name: 'string', area: 'string', hasOutlet: 'boolean', closeTime: 'string' }; // 필드별 자료형

// 배열 여부·건수·필드·id·빈 값·자료형·허용값·필수 필드를 Console에 출력하고, 필수 필드가 빠진 항목은 제외해 돌려줌
function checkData(data, source) {
  console.group('[데이터 점검]', source);
  console.log('배열인가?', Array.isArray(data));
  if (!Array.isArray(data)) { console.groupEnd(); return []; }
  console.log('데이터 건수:', data.length);
  console.log('첫 번째 객체의 필드:', Object.keys(data[0] || {}));
  console.log('첫 번째 id와 자료형:', data[0]?.id, typeof data[0]?.id);
  const warn = [], ids = new Set(), nulls = {};
  data.forEach(p => {
    if (ids.has(p.id)) warn.push(`id 중복: ${p.id}`);
    ids.add(p.id);
    Object.entries(TYPES).forEach(([k, type]) => {
      const v = p[k];
      if (v === null || v === undefined || v === '') { nulls[k] = (nulls[k] || 0) + 1; return; }
      if (typeof v !== type) warn.push(`자료형: id ${p.id} ${k} = ${JSON.stringify(v)} (${type} 이어야 함)`);
      else if (ALLOWED[k] && !ALLOWED[k].includes(v)) warn.push(`허용값 밖: id ${p.id} ${k} = "${v}"`);
    });
  });
  const valid = data.filter(p => {
    const miss = REQUIRED.filter(k => p[k] === null || p[k] === undefined || p[k] === '');
    if (miss.length) warn.push(`필수 필드 누락: id ${p.id} ${miss.join('·')} → 화면에서 제외`);
    return !miss.length;
  });
  console.log('빈 값(null) 수:', nulls);
  if (warn.length) warn.forEach(w => console.warn(w)); else console.log('경고: 없음');
  console.log('화면에 표시할 건수:', valid.length);
  console.groupEnd();
  return valid;
}

// 사용 위치: fetch로 받은 배열을 한 번 통과시킨 뒤 원본 배열에 보관
// .then(data => { places = checkData(data, './data/items.json'); /* 기존 화면 그리기 코드 */ })
```
---
---
# 2. 반복 렌더링과 카드 UI
## 2.1 렌더링(Rendering)
### 2.1.1 렌더링의 의미
렌더링(Rendering)은 데이터를 사용자가 볼 수 있는 화면 요소로 변환하는 과정임. 데이터가 300건이라면 HTML 카드 300개를 직접 작성하는 대신, 5주차에 만든 카드 1개의 구조를 JavaScript가 데이터 수만큼 반복 생성
<table fit-page-width="true" header-row="true">
<tr>
<td>구분</td>
<td>5주차 정적 화면</td>
<td>7주차 렌더링 화면</td>
</tr>
<tr>
<td>카드 작성 방식</td>
<td>HTML에 카드를 직접 작성</td>
<td>카드 구조 1개를 함수로 만들어 반복 생성</td>
</tr>
<tr>
<td>데이터 수정</td>
<td>HTML 문구를 직접 고침</td>
<td>JSON만 고치면 화면이 자동 반영</td>
</tr>
<tr>
<td>데이터 300건</td>
<td>카드 300개 작성</td>
<td>코드 변경 없음</td>
</tr>
<tr>
<td>이후 검색·필터</td>
<td>카드마다 숨김 처리 필요</td>
<td>결과 배열을 같은 함수에 다시 전달</td>
</tr>
</table>
- 이 구조를 사용하면 데이터 수가 바뀌어도 HTML을 다시 작성할 필요가 없음
- 목록 영역(`#cards`)은 HTML에 빈 상태로 두고 카드는 JavaScript가 채움
- 화면에 보이는 값이 틀렸다면 HTML이 아니라 JSON의 해당 값을 고쳐야 함 — 이번 주차 점검·수정 실습의 기본 원리
---
## 2.2 반복 처리
### 2.2.1 forEach 예시
```javascript
items.forEach(item => {
  console.log(item.name);
});
```
- `forEach`는 배열의 각 항목을 순서대로 하나씩 꺼내 처리할 때 사용
- 카공 `checkData()`도 `forEach`로 모든 항목을 하나씩 꺼내 빈 값·허용값·자료형을 확인함
---
### 2.2.2 map과 join으로 카드 목록 만들기
화면에 넣을 카드 목록을 만들 때는 배열을 다른 배열로 바꿔 주는 `map`을 주로 사용함. `map`으로 데이터 1건을 카드 HTML 1개로 바꾸고 `join('')`으로 하나의 문자열로 합친 뒤 목록 영역에 한 번에 넣음
```javascript
const cards = items.map(item => `<article class="card">${item.name}</article>`);
// ['<article…>12Hz</article>', '<article…>공차 명지대점</article>', …]

$('#cards').innerHTML = cards.join('');
```
<table fit-page-width="true" header-row="true">
<tr>
<td>구분</td>
<td>forEach</td>
<td>map</td>
</tr>
<tr>
<td>결과</td>
<td>돌려주는 값이 없음</td>
<td>같은 개수의 새 배열을 돌려줌</td>
</tr>
<tr>
<td>주 용도</td>
<td>Console 출력, 항목마다 실행할 작업</td>
<td>데이터 → 카드 HTML 변환</td>
</tr>
<tr>
<td>카공 예시 사용</td>
<td>데이터 점검(`checkData()`)</td>
<td>카드 목록 생성(`renderList()`)</td>
</tr>
</table>
- 카드를 하나씩 화면에 추가하는 것보다 문자열을 모두 만든 뒤 한 번에 넣는 편이 빠르고 코드도 짧음
---
### 2.2.3 렌더링 함수
카공 예시의 `renderList()`는 **원본 `places`에서 조건에 맞는 결과 배열을 만들고 결과 건수·결과 없음·카드 목록을 한 번에 갱신**함. 카드 1개는 `card()`, 카드 안의 배지는 `badges()`가 만들기 때문에 `renderList()`는 “배열 → 화면” 흐름만 담당
```javascript
function renderList() {
  const arr = results();                    // 원본 places에서 조건에 맞는 결과 배열
  arr.sort(SORTERS[state.sort]);
  $('#count').textContent = `총 ${arr.length}개 공간`;

  if (arr.length === 0) {
    $('#cards').innerHTML = empty('조건에 맞는 공간이 없습니다', …);
    return;
  }

  // 처음 30곳만 그리고, 목록 끝까지 스크롤하면 30곳씩 더 그림
  $('#cards').innerHTML = arr.slice(0, 30).map(card).join('');
}
```
- 결과 건수(`#count`)는 결과 배열의 `length`로 표시하므로 조건을 바꿔도 실제 결과 수와 항상 일치
- 결과 없음 처리도 같은 함수 안에 두어 렌더링 코드와 빈 상태 코드를 따로 중복 작성하지 않음
- 데이터가 380건이어도 처음 30곳만 그리고 스크롤할 때 30곳씩 이어서 그리므로 화면이 느려지지 않음
---
## 2.3 템플릿 리터럴(Template Literal)
### 2.3.1 데이터와 HTML 연결
템플릿 리터럴은 따옴표 대신 백틱 기호로 감싼 문자열로, `${ }` 안에 데이터 값을 넣어 HTML 구조를 만들 수 있음. 카드 템플릿의 클래스 이름(`.card`·`.thumb`·`.badge`)은 5주차 화면 그대로, `${ }` 안의 필드명은 6주차 데이터 명세서와 그대로 일치해야 함
```javascript
function card(p) {
  return `<article class="card" data-id="${p.id}">
    <a class="card-link" href="detail.html?id=${p.id}">
      <div class="thumb" aria-hidden="true"></div>
      <div>
        <h2>${esc(p.name)}</h2>
        <p>${esc(p.area)}</p>
        ${badges(p)}
      </div>
    </a>
  </article>`;
}
```
- JSON의 필드명이 명세와 다르면(예: `name` 대신 `Name`) 오류 없이 카드 제목만 비어 보이므로 화면 점검으로 찾아야 함
- 카공 예시는 상세 링크 주소(`detail.html?id=3`)로 id를 넘기고, 상세 화면에서 `Number(params.get('id'))`로 숫자로 바꿔 `places.find()`로 찾음 — 주소의 값은 항상 문자열이므로 6주차 ID 규칙대로 변환
- 데이터에 `<`, `"` 같은 문자가 섞여도 태그로 해석되지 않도록 `esc()`로 감싸서 넣음
---
### 2.3.2 카드 정보 우선순위
카드에는 사용자가 목록에서 비교·판단하는 데 필요한 핵심 정보만 배치하고 나머지는 상세보기로 넘김. 6주차 명세서의 ‘사용 화면’ 열이 이 구분의 기준이며, 이번 주차 필드 → 화면 위치 대응표의 기준이 됨
<table fit-page-width="true" header-row="true">
<tr>
<td>정보</td>
<td>목록 카드</td>
<td>상세보기</td>
<td>카공 예시 필드</td>
</tr>
<tr>
<td>제목</td>
<td>필수</td>
<td>필수</td>
<td>`name`</td>
</tr>
<tr>
<td>핵심 분류</td>
<td>필수</td>
<td>필수</td>
<td>`area`</td>
</tr>
<tr>
<td>대표 이미지</td>
<td>권장</td>
<td>권장</td>
<td>`image`</td>
</tr>
<tr>
<td>판단 조건</td>
<td>배지로 일부</td>
<td>전체</td>
<td>`hasOutlet`·`noiseLevel`·`closeTime`·`isOpen24h`</td>
</tr>
<tr>
<td>긴 설명</td>
<td>표시 안 함</td>
<td>전체</td>
<td>`description`</td>
</tr>
<tr>
<td>세부 정보</td>
<td>표시 안 함</td>
<td>전체</td>
<td>`address`·`openTime`·`hasTimeLimit`·`hasWifi`·`seatType`·`avgPrice` 등</td>
</tr>
<tr>
<td>위치</td>
<td>표시 안 함</td>
<td>지도</td>
<td>`lat`·`lng`</td>
</tr>
</table>
> <span color="gray">예시) 카공 카드는 사용자가 “지금 가서 공부할 수 있는가”를 판단해야 하므로 콘센트·소음·마감 시각을 배지로 보여주고, 주소·와이파이·가격·위치 지도는 상세보기로 넘김</span>
---
## 2.4 빈 상태(Empty State)
데이터가 0건일 때 화면을 비워두면 사용자는 로딩 중인지, 오류인지, 정말 결과가 없는지 구분하기 어려우므로 현재 상황·이유·다음 행동을 함께 안내
- 조건 하나만 눌렀는데 0건이 나오면 해당 필드 값이 비어 있거나 한쪽으로 치우친 데이터일 수 있으므로 JSON을 점검
> <span color="gray">예시) 카공 예시는 “조건에 맞는 공간이 없습니다”와 함께 “조용함을 해제하면 2곳을 볼 수 있습니다” 안내와 조용함 해제 버튼을 보여주고, 불러오기에 실패하면 “공간 정보를 불러오지 못했습니다”와 다시 시도 버튼을 보여줌</span>
---
## 2.5 이미지와 필드 누락 처리
### 2.5.1 이미지 누락
이미지는 값이 아예 없는 경우와 경로는 있지만 파일이 없는 경우 두 가지로 나눠 처리해야 레이아웃이 깨지지 않음
<table fit-page-width="true" header-row="true">
<tr>
<td>상황</td>
<td>예시 값</td>
<td>처리 방법</td>
</tr>
<tr>
<td>값이 없음</td>
<td>`"image": null`</td>
<td>기본 이미지 사용(카공 예시는 이미지가 모두 `null`이라 회색 이미지 자리 `.thumb`로 표시)</td>
</tr>
<tr>
<td>경로는 있지만 파일이 없음</td>
<td>`"./asset/raon.jpg"`(파일 미업로드)</td>
<td>`onerror`에서 기본 이미지로 교체</td>
</tr>
<tr>
<td>파일명 대소문자 불일치</td>
<td>`Raon.JPG` ↔ `raon.jpg`</td>
<td>로컬에서는 보여도 GitHub Pages에서 깨질 수 있으므로 6주차 경로 규칙대로 원본 수정</td>
</tr>
</table>
- `alt`에는 파일명이 아니라 “카페 라온 대표 이미지”처럼 콘텐츠를 식별할 수 있는 설명을 작성
---
### 2.5.2 필드 누락
6주차 명세서의 필수 여부에 따라 처리 방식이 다름. 필수 필드가 빠진 것은 데이터 오류이고, 선택 필드가 빠진 것은 정상적인 데이터 상황임
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="150">
<col width="200">
<col width="340">
<col width="300">
</colgroup>
<tr>
<td>구분</td>
<td>예시</td>
<td>화면 처리</td>
<td>데이터 처리</td>
</tr>
<tr>
<td>필수 필드 누락</td>
<td>`name: null`</td>
<td>`checkData()`가 해당 항목을 화면에서 제외하고 Console 경고</td>
<td>원본 JSON을 수정</td>
</tr>
<tr>
<td>선택 필드 누락</td>
<td>`hasWifi: null`, `closeTime: null`</td>
<td>카드는 해당 배지를 생략하고 상세는 ‘정보 없음’으로 표시(빈 칸이나 “null”을 표시하지 않음)</td>
<td>확인되면 채우고, 확인할 수 없으면 `null` 유지</td>
</tr>
<tr>
<td>허용값 밖의 값</td>
<td>`noiseLevel: "silent"`</td>
<td>배지를 생략하고 상세는 ‘정보 없음’, Console 경고</td>
<td>6주차 허용값 목록 기준으로 수정</td>
</tr>
<tr>
<td>자료형이 다른 값</td>
<td>`hasOutlet: "true"`</td>
<td>오류 없이 조건 결과에서 조용히 빠짐, Console 경고</td>
<td>명세의 자료형(true/false)으로 수정</td>
</tr>
</table>
```javascript
// 값이 확인된 조건만 배지로 표시하고, 모두 비어 있으면 '이용 조건 조사 전'
function badges(p) {
  const list = [];
  if (p.hasOutlet === true) list.push('콘센트');
  else if (p.hasOutlet === false) list.push('콘센트 없음');
  if (NOISE_LABEL[p.noiseLevel]) list.push(NOISE_LABEL[p.noiseLevel]);
  if (p.closeTime) list.push(p.closeTime + '까지');
  if (!list.length) list.push('이용 조건 조사 전');
  …
}
```
- 선택 필드를 확인하지 않고 그대로 넣으면 카드에 `null까지`, `undefined` 같은 문구가 그대로 노출됨
- `hasOutlet === true`처럼 불리언을 정확히 비교하면 값이 `null`(미조사)인 경우와 `false`(없음)인 경우를 구분할 수 있으며, 문자열 `"true"`는 조건에 맞지 않아 결과에서 빠짐
- 상세 화면에 ‘정보 없음’이 많이 보이는 공간은 6주차 3.1.1 ② 직접 조사로 다시 채울 대상으로 기록
---
---
# 3. 팀 프로젝트 적용
## 3.1 5·6주차 산출물 재사용 확인
이번 주차에는 6주차에 JSON 파일을 넣은 팀 `project/`를 그대로 열어 진행하며, 새 폴더나 새 `index.html`을 만들지 않음
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="300">
<col width="440">
</colgroup>
<tr>
<td>이전 주차 산출물</td>
<td>7주차에서 쓰는 곳</td>
</tr>
<tr>
<td>5주차 화면(클래스·id)</td>
<td>추가 필드를 보여줄 카드·상세 위치</td>
</tr>
<tr>
<td>6주차 JSON 파일을 넣은 project</td>
<td>fetch로 연결하고 점검·수정할 화면과 JSON</td>
</tr>
<tr>
<td>6주차 데이터 명세서</td>
<td>필드명·자료형·허용값 확인 기준, 추가한 필드도 함께 기록</td>
</tr>
</table>
<callout icon="⚠️" color="yellow_bg">
	5주차 클래스·id나 6주차 필드명을 바꾸면 이후 주차 기능 연결이 어긋나므로, 바꿔야 한다면 데이터 명세서·JSON·`app.js`를 함께 수정
</callout>
---
## 3.2 AI 도구로 JSON을 점검·수정하는 경우
AI 도구 사용은 선택 사항이며 평가에 영향을 주지 않음. 결과는 아래 기준으로 확인
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="340">
<col width="430">
</colgroup>
<tr>
<td>자주 발생하는 문제</td>
<td>확인 방법</td>
</tr>
<tr>
<td>JSON 점검만 요청했는데 HTML·JS까지 바뀜</td>
<td>VS Code 소스 제어에서 바뀐 파일 확인</td>
</tr>
<tr>
<td>조사하지 않은 값을 그럴듯하게 채움</td>
<td>확인할 수 없는 값은 `null`로 남겼는지 확인</td>
</tr>
<tr>
<td>필드명·허용값·자료형을 임의로 바꿈</td>
<td>데이터 명세서와 Console 경고로 확인</td>
</tr>
<tr>
<td>일부 데이터만 출력하고 나머지를 생략함</td>
<td>수정 전후 Console 데이터 건수가 같은지 확인</td>
</tr>
</table>
> <span color="gray">예시) “JSON 고쳐줘” 대신 “명세서와 다른 값만 찾아 표로 정리해줘, JSON과 코드는 수정하지 않음”처럼 찾기와 고치기를 나누어 요청</span>
---
## <span color="blue">3.3 🖇️ 실습｜팀 project JSON 점검과 인터페이스 변경</span>
#### 카공 샘플 확인
교수자 카공 샘플(서대문구 카페 380곳)은 6주차 JSON을 `fetch`로 연결해 점검·수정하고 데이터에 맞게 인터페이스를 변경한 7주차 결과물임. 실습 전에 아래 실행 화면에서 탐색·상세·결과 없음 화면을 이동하며 필드가 화면 어디에 어떻게 표시되는지 먼저 확인
<callout icon="🖥️" color="gray_bg">
	[실행 화면 삽입 위치]
</callout>
- 카공 샘플에서 데이터에 맞게 바꾼 인터페이스 : 데이터 필드 기준의 조건 버튼 15종, 상세 정보 항목(스터디룸·주차·1인당 평균 가격·입점일 등), `lat`·`lng`를 이용한 위치 지도, 결과 건수와 30곳씩 이어 보기
#### 실습 절차
1. 팀 `app.js`에서 코드 안의 배열 대신 1.1.2 `fetch`로 `data/` 폴더의 JSON을 불러오도록 바꾸고, 1.3.2 `checkData()`를 함께 추가해 커밋·푸시
2. 팀 GitHub Pages 주소를 열고 `F12`를 눌러 Console 탭에서 `[데이터 점검]`의 데이터 건수와 경고를 확인
3. 목록·상세 화면을 둘러보며 아래 표와 같은 문제를 찾아 적음
4. 찾은 문제를 `data/` 폴더의 JSON에서 직접 고침
5. 커밋·푸시한 뒤 배포 주소에서 강력 새로고침(Windows `Ctrl+Shift+R`, Mac `Cmd+Shift+R`)하고 경고가 사라졌는지 확인
6. 서비스에 필요한 필드를 JSON에 추가하고(6주차 명세서에도 같은 이름으로 추가), 그 필드가 카드·상세·조건 버튼에 보이도록 HTML·JS를 수정(아래 예시 참고)
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="270">
<col width="270">
<col width="330">
</colgroup>
<tr>
<td>화면에서 보이는 문제</td>
<td>JSON에서 고칠 곳</td>
<td>카공 예시</td>
</tr>
<tr>
<td>제목·배지 등 글자가 비어 보임</td>
<td>필드 이름 오타</td>
<td>`Name` → `name`</td>
</tr>
<tr>
<td>조건 버튼을 눌러도 결과에서 빠짐</td>
<td>따옴표로 감싼 true·숫자</td>
<td>`"hasOutlet": "true"` → `true`</td>
</tr>
<tr>
<td>배지가 안 보이거나 ‘정보 없음’으로 나옴</td>
<td>허용값 밖의 값</td>
<td>`"noiseLevel": "조용"` → `"quiet"`</td>
</tr>
<tr>
<td>다른 공간의 상세가 열림</td>
<td>같은 id가 두 번 들어감</td>
<td>겹친 id를 다른 번호로 수정</td>
</tr>
<tr>
<td>Console에 `필수 필드 누락` 경고</td>
<td>이름·지역 같은 필수 값이 빈 항목</td>
<td>`"name": null` → 공간 이름 입력</td>
</tr>
</table>
#### 점검 결과 확인
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="300">
<col width="470">
</colgroup>
<tr>
<td>확인할 것</td>
<td>통과 기준</td>
</tr>
<tr>
<td>Console 경고</td>
<td>경고가 없거나, 남은 경고의 이유를 데이터 점검 결과에 적음</td>
</tr>
<tr>
<td>화면 표시</td>
<td>목록·상세에 `null`·`undefined` 글자나 빈 칸이 보이지 않음</td>
</tr>
<tr>
<td>배포 확인</td>
<td>고친 JSON을 커밋·푸시하고 팀 GitHub Pages 주소에서 확인함</td>
</tr>
<tr>
<td>추가 필드</td>
<td>추가한 필드가 명세서와 같은 이름·자료형이고 화면에 표시됨</td>
</tr>
<tr>
<td>수정 기록</td>
<td>무엇을 왜 고치고 추가했는지 데이터 점검 결과에 적음</td>
</tr>
</table>
> <span color="gray">예시) 카공 샘플은 7주차에 추가한 </span><span color="gray">`hasStudyRoom`</span><span color="gray">·</span><span color="gray">`hasParking`</span><span color="gray">·</span><span color="gray">`avgPrice`</span><span color="gray"> 필드를 상세 정보와 조건 버튼(스터디룸·주차 가능·5천원 이하)에 연결하고, </span><span color="gray">`lat`</span><span color="gray">·</span><span color="gray">`lng`</span><span color="gray"> 필드로 상세에 위치 지도를 추가함</span>
---
## \[옵션\] 심화 트랙 준비
### 데이터 출처를 바꿀 수 있는 구조
- `renderList()`·`card()`는 JSON 파일을 직접 알 필요 없이 `places` 배열만 사용하므로, 이후 API나 클라우드 DB로 출처가 바뀌어도 `loadData()`만 교체하면 됨
- 외부 데이터는 6주차에 만든 외부 필드 → 내부 필드 대응표대로 내부 구조로 변환한 뒤 `checkData()`로 같은 기준을 점검하고 화면에 전달
### 대체 데이터 유지
- 같은 구조의 예비 JSON을 유지하면 API 호출이 실패해도 화면 개발을 계속할 수 있으며, 실패 시 Console 경고가 표시되는지 함께 확인
- 심화 트랙을 검토 중인 팀은 `loadData()` 안에서 데이터 출처를 바꾸는 지점을 팀 문서에 한 줄로 기록
---
## 3.4 이후 주차 구현 준비 연결
이번 주차에 점검한 데이터와 기록은 이후 주차 기능 구현의 기준이 되므로 어디에서 어떻게 쓰이는지 확인하고 부족한 부분을 이번 주에 보완
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="273">
<col width="431">
</colgroup>
<tr>
<td>7주차 산출물</td>
<td>이후 주차에서의 사용 방식</td>
</tr>
<tr>
<td>추가 필드를 넣은 JSON 데이터셋</td>
<td>검색·필터·정렬·상세보기의 기준 데이터</td>
</tr>
<tr>
<td>인터페이스를 변경한 7주차 버전 project</td>
<td>검색·필터·정렬·상세보기를 고도화하는 기준 화면</td>
</tr>
<tr>
<td>데이터 점검 결과</td>
<td>300건 이상으로 데이터를 늘릴 때 반복하는 점검 기준</td>
</tr>
</table>
---
## 3.5 핵심 정리
- JSON은 `fetch → JavaScript 데이터 → 렌더링 → 화면` 흐름을 거쳐야 화면이 되며, 화면에 문제가 보이면 어느 단계에서 생긴 문제인지 먼저 구분
- `fetch`는 파일을 더블클릭해 연 상태에서는 동작하지 않으므로 JSON 수정 결과는 커밋·푸시 후 GitHub Pages 배포 주소에서 확인
- 렌더링은 카드 구조 1개를 데이터 수만큼 반복하는 것이므로 JSON만 고치면 코드 수정 없이 화면이 바뀜
- 화면에 이상한 값이 보이면 코드보다 원본 JSON을 먼저 점검·수정한 뒤 데이터에 맞게 인터페이스를 변경
- 필수 필드 누락·허용값 밖의 값·자료형 섞임·id 중복은 JSON 문법상 정상이므로 결과 건수와 Console 점검으로 찾아야 함
---
# 📝 활동내역 및 산출물
7주차 산출물은 아래 순서대로 팀 프로젝트 문서 한 곳에 정리하고, 각 항목이 6주차 데이터 명세와 연결되도록 근거를 함께 기록
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="350">
<col width="384">
<col width="384">
</colgroup>
<tr>
<td>구분</td>
<td>핵심 작업</td>
<td>최종 산출물에 포함할 내용</td>
</tr>
<tr>
<td>데이터 점검 결과</td>
<td>팀 화면과 Console에서 JSON 데이터 문제를 찾아 고침</td>
<td>수정 전·후 Console 점검 결과, 고친 내용</td>
</tr>
<tr>
<td>추가 필드를 넣은 JSON 데이터셋</td>
<td>서비스에 필요한 필드를 데이터셋에 추가</td>
<td>추가한 필드 목록(필드명·자료형·값 출처)과 `data/` 폴더의 JSON 파일</td>
</tr>
<tr>
<td>\[GitHub\] 인터페이스를 변경한 7주차 최종 버전 project</td>
<td>추가한 필드가 화면에 보이도록 HTML·CSS·JS를 수정해 GitHub에 업데이트</td>
<td>인터페이스를 변경한 7주차 버전 project 폴더 커밋·배포</td>
</tr>
</table>
<callout icon="📌" color="gray_bg">
	매주차 산출물을 체크하지 않으나 최종 팀 프로젝트 완료 시 한꺼번에 취합. 다만 산출물이 누락되면 이후 주차의 입력값이 사라지므로 팀 문서에 계속 누적
</callout>
<details>
<summary>**\[예시\] 실습 샘플**</summary>
	**프로젝트: 카공 공간 조건 탐색 서비스**
	- ① 데이터 점검 결과 : 허용값 밖의 값·따옴표로 감싼 true를 고친 뒤 Console 380건 · 경고 없음
	- ② 추가 필드를 넣은 JSON 데이터셋 : 6주차 13개 필드 → 22개 필드
	<table header-row="true">
<tr>
<td>추가한 필드</td>
<td>값 출처</td>
<td>화면 반영</td>
</tr>
<tr>
<td>`lat`·`lng`</td>
<td>인허가 정보 좌표를 위도·경도로 변환</td>
<td>상세 위치 지도</td>
</tr>
<tr>
<td>`openedAt`</td>
<td>인허가 정보의 인허가일자</td>
<td>상세 입점일, 신규 입점 조건·정렬</td>
</tr>
<tr>
<td>`popularity`</td>
<td>실습용 임의 데이터</td>
<td>인기순 정렬, 홈 인기 있는 공간</td>
</tr>
<tr>
<td>`hasStudyRoom`·`hasParking`·`isPetFriendly`</td>
<td>실습용 임의 데이터</td>
<td>상세 항목, 조건 버튼</td>
</tr>
<tr>
<td>`isOpen24h`</td>
<td>실습용 임의 데이터</td>
<td>24시간 배지·조건 버튼</td>
</tr>
<tr>
<td>`avgPrice`</td>
<td>실습용 임의 데이터</td>
<td>1인당 평균 가격, 5천원 이하 조건 버튼</td>
</tr>
	</table>
	- ③ 인터페이스를 변경한 7주차 최종 버전 : 조건 버튼 3종 → 15종, 상세 정보 항목 추가, 위치 지도 추가
</details>
