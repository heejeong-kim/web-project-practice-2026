## 🎯 학습 목표
1. 4주차 와이어프레임을 HTML·CSS 화면으로 옮길 수 있다
2. HTML·CSS로 만든 정적 화면에 JavaScript를 연결해 사용자 행동에 반응하는 화면을 만들 수 있다
3. DOM·이벤트·함수·배열·객체의 역할을 프로젝트 관점에서 설명할 수 있다
4. 화면 처리와 데이터 처리 로직을 분리해 이후 JSON·API·클라우드 DB로 확장 가능한 기본 구조를 만들 수 있다
---
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="454">
<col width="250.359375">
</colgroup>
<tr>
<td>고민해볼 문제</td>
<td>이번 주차에서 연결되는 내용</td>
</tr>
<tr>
<td>버튼이 화면에 보이는 것과 실제 기능이 동작하는 것은 무엇이 다를까?</td>
<td>DOM과 이벤트</td>
</tr>
<tr>
<td>사용자 입력은 어떤 순서로 화면 변화로 이어질까?</td>
<td>입력 → 처리 → 출력</td>
</tr>
<tr>
<td>함수를 나누면 이후 JSON 연결이 왜 쉬워질까?</td>
<td>데이터 처리와 렌더링 분리</td>
</tr>
<tr>
<td>오류가 생겼을 때 코드를 다시 쓰기 전에 무엇을 확인해야 할까?</td>
<td>개발자 도구와 Console</td>
</tr>
</table>
---
<callout color="green_bg">
	5주차는 4주차 설계 도면을 실제 화면으로 옮기는 것으로 시작해 정적 화면을 서비스 동작으로 바꾸는 JavaScript 구현까지 진행
	먼저 와이어프레임을 HTML·CSS로 제작한 뒤 DOM 선택과 이벤트를 통해 사용자의 행동을 읽고, 함수·배열·객체를 이용해 처리 결과를 화면에 반영하는 기본 패턴을 팀 프로젝트에 직접 적용하고, 그 결과를 6주차 데이터 설계의 입력값으로 정리
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
	- 4주차 로우파이(Lo-fi) 와이어프레임과 핵심 User Flow
	- 4주차 화면별 데이터 항목과 자료형 정리본
	- Visual Studio Code와 Chrome 또는 Edge
	- 4주차 화면 상태 정의 5종(초기·로딩·결과 없음·오류·저장 완료)
	- 4주차 Must 기능 목록과 기능별 완료 조건
	- 4주차 대표 사용자 흐름 A
	- HTML·CSS 기초는 선수 범위로 전제하며 이번 주차에서 별도로 다루지 않음
	- 코드 작성 방식은 직접 작성과 AI 도구 활용 중 팀이 선택 가능(1.3 참고)
	- **📎 산출물 GitHub 업로드와 URL 공유 **
		- 배포 환경 점검은 14주차에서 정식으로 다루며, 이번 주차부터 결과물을 모을 저장소와 확인용 실행 URL을  깃허브에 만들어 두는 것까지 진행 [팀별 현황 \| 웹프로젝트 실습 2026-2](https://heejeong-kim.github.io/web-project-practice-2026/team-project.html) 내에 프로젝트 URL(깃허브 주소) 공유
</details>
---
# 1. 와이어프레임을 html로 옮기기
4주차에서 작성한 로우파이(Lo-fi) 와이어프레임은 설계 도면이므로 JavaScript를 연결하려면 먼저 HTML·CSS 화면으로 만들고 팀별로 목록 화면을 먼저 제작한 뒤 그 화면에 상호작용을 연결하는 순서로 진행
## 1.1  화면 범위 정의
와이어프레임 전체를 한 번에 구현하면 JavaScript 실습 시간이 남지 않으므로 범위를 제한
- 주요 화면 1개를 우선 완성하고 나머지 화면은 이후 주차에 확장
- 상세 영역은 별도 페이지 대신 숨김 영역으로 만들어 두고 10주차에 연결
- 4주차 사이트맵의 뎁스는 정보 구조의 깊이를 의미하며 HTML 파일 수와 일치하지 않음. 단일 페이지 안의 영역 전환으로 구현해야 목록 복귀 시 이전 조건을 유지하기 쉬움
- 데이터 카드는 JSON 연결 전이므로 2\~3건만 직접 작성해 구조를 확인
- 색상·폰트 같은 시각 디자인보다 영역 구획과 모바일 표시를 우선
#### **범위 구분표**
화면을 한 번에 완성하면 이후 주차의 학습 범위가 사라지므로 이번 주차에 만들 범위와 만들지 않을 범위를 먼저 구분
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="328">
<col width="345">
</colgroup>
<tr>
<td>이번 주차에 만들 것</td>
<td>이번 주차에 만들지 않을 것</td>
</tr>
<tr>
<td>목록 화면 HTML 구조와 CSS 배치</td>
<td>JSON 파일 불러오기(7주차)</td>
</tr>
<tr>
<td>반복될 카드 1건 구조와 직접 작성한 데이터 2\~3건</td>
<td>데이터 반복 렌더링(7주차)</td>
</tr>
<tr>
<td>상태 영역 5종을 숨김 상태로 배치</td>
<td>검색·필터·정렬 처리 로직(9주차)</td>
</tr>
<tr>
<td>클릭·입력 이벤트 연결과 화면 상태 전환</td>
<td>선택 항목과 상세 데이터 연결(10주차)</td>
</tr>
<tr>
<td>함수 단위로 분리한 기본 구조</td>
<td>LocalStorage 저장과 개인화(11\~12주차)</td>
</tr>
</table>
<callout icon="⚠️" color="yellow_bg">
	범위를 넘겨 기능을 미리 완성하면 7주차 이후 학습 목표를 확인할 수 없고, 이후 주차에 데이터 구조가 확정되면서 대부분 다시 수정하게 됨
	특히 AI 도구를 사용하는 경우 요청 범위를 제한하지 않으면 서비스 전체가 한 번에 생성되므로 위 오른쪽 항목이 포함되지 않았는지 반드시 확인
</callout>
---
## 1.2 와이어프레임 영역을 HTML 구조로 옮기기
4주차 와이어프레임이 그대로 HTML 요소가 되므로 화면을 새로 구상하지 않고 순서대로 옮기는 방식으로 작업
예시)
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="224.46875">
<col width="299.265625">
<col width="297.265625">
</colgroup>
<tr>
<td>와이어프레임 영역</td>
<td>HTML 요소</td>
<td>JavaScript 연결 시 역할</td>
</tr>
<tr>
<td>상단 고정·현재 탐색 범위</td>
<td>header 안의 제목과 범위 표시 요소</td>
<td>선택된 조건에 따라 텍스트 변경</td>
</tr>
<tr>
<td>검색창</td>
<td>input 요소에 id 부여</td>
<td>입력값을 읽는 대상</td>
</tr>
<tr>
<td>조건 필터</td>
<td>button 묶음과 각 버튼의 식별 속성</td>
<td>클릭 이벤트와 선택 상태 클래스 변경</td>
</tr>
<tr>
<td>결과 건수</td>
<td>숫자를 표시할 단일 요소</td>
<td>처리 결과를 반영해 값 변경</td>
</tr>
<tr>
<td>카드 목록</td>
<td>목록 요소와 반복될 카드 1개 구조</td>
<td>7주차에 JSON으로 반복 생성될 틀</td>
</tr>
<tr>
<td>결과 없음·오류 상태</td>
<td>기본 숨김 상태의 별도 영역</td>
<td>조건에 따라 보이기·숨기기 전환</td>
</tr>
<tr>
<td>로딩 상태</td>
<td>기본 숨김 상태의 로딩 표시 영역</td>
<td>7주차 데이터 요청 시작과 완료 시점에 전환</td>
</tr>
<tr>
<td>저장 상태 표시</td>
<td>카드 안의 저장 아이콘과 상세 영역의 저장 버튼</td>
<td>11\~12주차 개인 저장 상태를 반영해 표시 변경</td>
</tr>
</table>
> <span color="gray">예시) 결과 없음 영역을 처음부터 만들지 않으면 9주차 검색 기능을 구현할 때 HTML을 다시 수정해야 하므로, 보이지 않는 상태라도 이번 주차에 미리 작성</span>
---
## 1.3 JavaScript 연결을 고려한 작성 규칙
화면을 먼저 만들고 나중에 JavaScript를 붙이려면 선택할 요소를 다시 찾아 클래스를 추가하는 작업이 반복되므로 처음부터 연결을 전제로 작성
- JavaScript가 선택할 요소에는 id 또는 클래스를 미리 부여
- 상태에 따라 바뀌는 영역은 고정 텍스트와 섞지 않도록 별도 요소로 분리
- 반복 생성될 카드는 한 개만 완성도 있게 만들고 같은 클래스 이름을 재사용
- 4주차에서 정리한 데이터 항목 이름을 클래스·속성 이름과 맞춰 6주차 JSON 필드와 연결
- 모바일 세로 화면에서 핵심 흐름이 완료되는지 먼저 확인
#### AI 도구를 활용하는 경우
화면 제작에 AI 도구를 사용하는 것은 선택 사항이며, 사용 여부가 평가에 영향을 주지 않지만 AI가 생성한 화면은 요청 범위와 이름 규칙을 명시하지 않으면 이후 주차와 연결되지 않으므로, 4주차 산출물을 그대로 요청 문서로 사용
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="266.890625">
<col width="258.6875">
</colgroup>
<tr>
<td>요청에 반드시 포함할 항목</td>
<td>근거가 되는 4주차 산출물</td>
</tr>
<tr>
<td>화면 영역 구성과 순서</td>
<td>로우파이 와이어프레임</td>
</tr>
<tr>
<td>선택 대상 요소의 id·클래스 이름 목록</td>
<td>화면별 데이터 항목과 자료형</td>
</tr>
<tr>
<td>상태 영역 5종과 각각의 초기 표시 여부</td>
<td>화면 상태 정의</td>
</tr>
<tr>
<td>모바일 세로 화면 우선</td>
<td>페르소나의 제약 조건</td>
</tr>
<tr>
<td>이번 주차에 만들지 않을 범위</td>
<td>1.1의 범위 구분 표</td>
</tr>
</table>
> <span color="gray">예시) “탐색 서비스 만들어줘”처럼 요청하면 검색·필터·저장 기능까지 한 번에 생성되므로, “목록 화면의 HTML 구조와 CSS만 작성하고 데이터 연결과 기능 로직은 작성하지 않음”처럼 범위를 명시</span>
---
## <span color="blue">1.4 🖇️  실습｜팀 프로젝트 화면 제작</span>
<div class="secure-section-placeholder" data-secure-section="w05-0"></div>

---
# 2. JavaScript와 DOM 연결
## 2.1 JavaScript의 역할
### 2.1.1 HTML·CSS·JavaScript의 역할 비교
HTML은 화면의 구조와 의미를 만들고, CSS는 배치와 시각적 표현을 담당하며, JavaScript는 사용자 행동과 데이터 변화에 따라 화면 상태를 바꾸는 역할을 담당하는 것으로 세 기술은 서로 대체하는 관계가 아니라 하나의 화면을 구성하는 서로 다른 층으로 이해
<table header-row="true">
<colgroup>
<col>
<col width="175.546875">
<col width="274.703125">
</colgroup>
<tr>
<td>상황</td>
<td>HTML·CSS만 있을 때</td>
<td>JavaScript가 연결되면</td>
</tr>
<tr>
<td>필터 버튼</td>
<td>버튼 모양만 보임</td>
<td>버튼 선택에 따라 목록이 바뀜</td>
</tr>
<tr>
<td>상세보기</td>
<td>고정된 설명만 보임</td>
<td>선택한 데이터에 따라 내용이 달라짐</td>
</tr>
<tr>
<td>즐겨찾기</td>
<td>아이콘만 보임</td>
<td>사용자 선택 상태를 저장하고 다시 표시</td>
</tr>
</table>
---
### 2.1.2 역할에 따라 파일을 분리하기
세 기술의 역할이 다르므로 파일도 역할별로 나누어 관리하는 것으로 한 파일에 구조와 스타일과 동작이 섞여 있으면 수정할 위치를 찾기 어렵고, 팀원이 같은 파일을 동시에 고칠 때 충돌이 생기므로 이번 주차의 폴더 구조는 마지막 차시 배포 기준과 동일하므로 처음부터 같은 형태로 만들어 두면 이후 경로를 다시 수정하지 않아도 됨
```plain text
project/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ app.js
├─ data/
└─ images/
```
<table fit-page-width="true" header-row="true">
<tr>
<td>구분</td>
<td>파일</td>
<td>담당 역할</td>
</tr>
<tr>
<td>HTML</td>
<td>index.html</td>
<td>화면의 구조와 의미</td>
</tr>
<tr>
<td>CSS</td>
<td>css/style.css</td>
<td>배치와 시각적 표현</td>
</tr>
<tr>
<td>JavaScript</td>
<td>js/app.js</td>
<td>사용자 행동과 화면 상태 변경</td>
</tr>
<tr>
<td>데이터</td>
<td>data 폴더</td>
<td>6주차부터 사용할 JSON 기본 데이터</td>
</tr>
<tr>
<td>이미지</td>
<td>images 폴더</td>
<td>카드·상세에 사용할 이미지</td>
</tr>
</table>
- index.html에는 화면 구조만 작성하고 style 속성과 script 코드를 직접 넣지 않음
- CSS는 head에서 link로 연결
- JavaScript는 body 끝에서 script로 연결하거나 defer를 사용해 요소가 만들어진 뒤에 실행되도록 함
- 경로는 ./css/style.css처럼 상대경로로 작성
- data와 images 폴더는 이번 주차에 비어 있더라도 미리 만들어 자리를 확보
- js 폴더는 11주차 이후 저장·기능별 파일이 늘어날 자리이므로 처음부터 분리
- 파일명과 폴더명은 영문 소문자로 작성(준비물의 GitHub 안내 참고)
<callout icon="📌" color="blue_bg">
	AI 도구는 별도로 요청하지 않으면 HTML 한 파일에 CSS와 JavaScript를 모두 넣어 생성하는 경우가 많으므로 1.3의 요청 항목에 위 폴더 구조를 포함해 파일을 나누어 작성하도록 명시
</callout>
---
## 2.2 문서 객체 모델(Document Object Model, DOM)
### 2.2.1 DOM이 필요한 이유
브라우저는 HTML을 JavaScript가 다룰 수 있는 객체 구조인 DOM(Document Object Model)으로 해석하므로 JavaScript는 DOM을 통해 제목·버튼·입력창·목록 영역 같은 요소를 찾고 텍스트·클래스·속성·표시 상태를 변경
- 즉, 선택하려는 HTML 요소가 없거나 선택자가 잘못되면 이후 이벤트와 화면 변경 코드가 모두 동작하지 않으므로 요소 선택 확인이 기능 구현의 첫 단계로 봄 
---
### 2.2.2 요소 선택 예시
```javascript
const title = document.querySelector('.page-title');
const searchInput = document.querySelector('#search-input');
const cards = document.querySelectorAll('.content-card');
```
- querySelector는 조건에 맞는 첫 번째 요소를 선택
- querySelectorAll은 조건에 맞는 여러 요소를 선택
- 변수 이름은 화면에서 맡는 역할을 알 수 있게 작성
---
### 2.2.3 DOM 변경 예시
```javascript
const resultText = document.querySelector('#result-text');
resultText.textContent = '검색 결과 8건';
```
- JavaScript는 선택한 요소의 텍스트, 클래스, 속성 등을 변경할 수 있음
- 화면 변경은 사용자의 행동 또는 데이터 처리 결과와 연결될 때 의미가 있음
---
## 2.3 개발자 도구(Developer Tools)와 콘솔(Console)
### 2.3.1 콘솔을 사용하는 이유
- 화면에서 기능이 보이지 않아도 JavaScript 내부 값은 콘솔에서 확인할 수 있음
- 오류 메시지는 문제 위치와 원인을 좁힐 수 있는 중요한 정보임
- 오류가 발생했을 때 코드를 무작정 다시 작성하거나 전체를 다시 생성하기보다 메시지와 현재 값을 먼저 확인
---
### 2.3.2 개발자 도구 열기와 탭 구성
개발자 도구는 브라우저에 기본 포함된 기능으로 별도 설치가 필요하지 않으며, 목적에 따라 서로 다른 탭을 사용
- Windows｜F12 또는 Ctrl+Shift+I
- Mac｜Cmd+Option+I
- 확인할 화면 요소에서 우클릭 → 검사
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="241.8125">
<col width="313.3125">
<col width="235.875">
</colgroup>
<tr>
<td>탭</td>
<td>확인할 내용</td>
<td>사용 시점</td>
</tr>
<tr>
<td>Console</td>
<td>오류 메시지와 변수 값 출력</td>
<td>5주차부터 모든 구현 주차</td>
</tr>
<tr>
<td>Elements</td>
<td>HTML 구조와 클래스·id, 현재 적용된 CSS</td>
<td>5주차 요소 선택과 상태 전환 확인</td>
</tr>
<tr>
<td>Device Toolbar</td>
<td>모바일 화면 폭에서의 표시 상태</td>
<td>5주차 1.4 모바일 확인</td>
</tr>
<tr>
<td>Network</td>
<td>파일 요청 성공 여부와 404 발생</td>
<td>7주차 JSON 불러오기</td>
</tr>
<tr>
<td>Application → Local Storage</td>
<td>저장된 사용자 상태 값</td>
<td>11\~12주차 개인화</td>
</tr>
</table>
- 이번 주차에는 Console·Elements·Device Toolbar 세 가지를 사용하고 나머지는 위치만 확인
- Device Toolbar는 Ctrl+Shift+M(Win) 또는 Cmd+Shift+M(Mac)으로 전환
- Elements 탭에서는 4주차 명세대로 클래스·id가 붙었는지, 버튼 클릭 시 활성 클래스가 실제로 바뀌는지, 숨김 영역이 display 속성으로 숨겨져 있는지를 눈으로 확인
---
### 2.3.3 오류 메시지 읽기
빨간 오류 메시지는 한 덩어리가 아니라 세 가지 정보로 구성되어 있으며, 세 번째 위치 정보를 먼저 보면 확인할 코드 범위가 한 줄로 좁혀짐
```plain text
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
    at app.js:12
```
<table fit-page-width="true" header-row="true">
<tr>
<td>구성</td>
<td>예시</td>
<td>의미</td>
</tr>
<tr>
<td>오류 종류</td>
<td>TypeError</td>
<td>어떤 성격의 문제인지</td>
</tr>
<tr>
<td>설명</td>
<td>Cannot read properties of null</td>
<td>무엇이 잘못되었는지</td>
</tr>
<tr>
<td>위치</td>
<td>app.js:12</td>
<td>어느 파일 몇 번째 줄에서 발생했는지</td>
</tr>
</table>
- 줄 번호를 클릭하면 해당 코드 위치로 바로 이동
- 오류가 여러 개일 때는 가장 위에 나타난 첫 오류부터 해결. 뒤의 오류는 첫 오류 때문에 연쇄적으로 발생한 경우가 많음
- 오류가 없는데도 화면이 바뀌지 않는다면 문법 문제가 아니라 조건이나 값의 문제이므로 2.3.5로 확인
---
### 2.3.4 자주 만나는 오류
오류 메시지를 새로 해석하기보다 유형을 알아두면 원인을 빠르게 특정할 수 있으며, 5\~7주차에서 발생하는 오류는 대부분 아래 다섯 가지에 해당
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="273.890625">
<col width="256.109375">
<col width="463">
</colgroup>
<tr>
<td>오류 메시지</td>
<td>주요 원인</td>
<td>확인할 것</td>
</tr>
<tr>
<td>Cannot read properties of null</td>
<td>요소 선택 실패</td>
<td>선택자 이름이 HTML과 같은지, script가 body 끝 또는 defer로 연결되었는지</td>
</tr>
<tr>
<td>xxx is not defined</td>
<td>이름 오타 또는 파일 미연결</td>
<td>변수·함수 이름과 HTML의 script 경로</td>
</tr>
<tr>
<td>SyntaxError</td>
<td>괄호·따옴표 짝이 맞지 않음</td>
<td>오류 줄 주변의 여는 괄호와 닫는 괄호</td>
</tr>
<tr>
<td>404 (Not Found)</td>
<td>파일 경로 오류</td>
<td>2.1.2 폴더 구조와 상대경로, 파일명 대소문자</td>
</tr>
<tr>
<td>Failed to fetch</td>
<td>로컬 서버 없이 파일을 직접 열었음</td>
<td>주소가 [localhost](http://localhost) 형태인지(7주차)</td>
</tr>
</table>
<callout icon="📌" color="blue_bg">
	첫 번째 오류가 5주차에 가장 많이 발생함. 2.2.1에서 설명한 “선택하려는 요소가 없으면 이후 코드가 모두 동작하지 않는다”는 상황이 실제 화면에서는 이 메시지로 나타남
</callout>
---
### 2.3.5 console.log로 확인하기
```javascript
const searchInput = document.querySelector('#search-input');
console.log(searchInput);

const keyword = searchInput.value;
console.log(keyword, typeof keyword);
```
<table fit-page-width="true" header-row="true">
<colgroup>
<col>
<col width="168.46875">
<col width="371">
</colgroup>
<tr>
<td>확인 목적</td>
<td>방법</td>
<td>판단 기준</td>
</tr>
<tr>
<td>요소를 찾았는가</td>
<td>선택 결과를 출력</td>
<td>null이면 선택자 또는 연결 위치 문제</td>
</tr>
<tr>
<td>값이 들어왔는가</td>
<td>변수 값을 출력</td>
<td>빈 문자열이나 undefined 여부</td>
</tr>
<tr>
<td>자료형이 맞는가</td>
<td>typeof로 함께 출력</td>
<td>문자열과 숫자 구분(10주차 상세 연결에 영향)</td>
</tr>
<tr>
<td>실행이 되는가</td>
<td>이벤트 안에 문구를 출력</td>
<td>출력이 없으면 이벤트가 연결되지 않은 상태</td>
</tr>
</table>
- 오류가 없는데 기능이 동작하지 않는 경우는 이 네 가지를 순서대로 확인해 어느 단계에서 끊겼는지 찾음
- 확인이 끝난 console.log는 그대로 두지 않고 정리(14주차 최종 점검 항목)
---
### 2.3.6 확인 순서
오류를 해결할 때는 코드를 처음부터 다시 쓰기보다 증상 → 오류 메시지 → 현재 값 → 수정 결과 순서로 범위를 좁혀야 함. 아래 절차는 이후 모든 구현 주차에서 반복해서 사용하는 기본 디버깅 루틴으로 활용
- 브라우저에서 개발자 도구를 열음
- Console 탭을 확인
- 빨간 오류 메시지의 파일명과 줄 번호를 확인
- 변수 값과 선택 결과를 console.log로 확인
- 원인을 특정한 뒤 해당 부분만 수정
- 수정 후 새로 고침해 같은 오류가 다시 발생하는지 확인
<callout icon="📌" color="blue_bg">
	AI 도구를 사용하는 경우에도 순서는 동일하게 오류가 발생했을 때 전체를 다시 생성하면 문제가 사라진 것처럼 보이지만 원인을 확인하지 못해 같은 오류가 다른 위치에서 반복되며, 이미 점검을 마친 화면 구조까지 함께 바뀌는 문제가 생기므로 전체 재생성 대신 오류 메시지와 해당 코드 범위를 전달해 부분 수정을 요청
</callout>
#### AI에 전달할 세 가지
오류를 설명할 때 “안 되는데 다시 만들어줘”처럼 전달하면 전체가 다시 생성되므로, 2.3.3에서 읽은 정보를 그대로 전달해 수정 범위를 좁혀야 함
- 오류 메시지 전체 문장
- 파일명과 줄 번호
- 해당 줄 주변의 코드
> <span color="gray">예시) “app.js 12번째 줄에서 Cannot read properties of null 오류가 발생함. #search-input 선택 결과가 null인데 이 부분만 수정”처럼 전달하면 다른 기능을 건드리지 않고 해당 부분만 고칠 수 있음</span>
<callout icon="💡" color="blue_bg">
	오류 메시지를 읽는 것은 디버깅 기술이면서 동시에 AI에게 정확히 질문하는 기술로 메시지를 읽지 못하면 직접 고칠 수도, 정확히 물어볼 수도 없기 때문에 구현 방식과 관계없이 반드시 익혀야 하는 능력
</callout>
---
# 3. 이벤트와 함수
## 3.1 이벤트(Event)
### 3.1.1 이벤트란 무엇인가
이벤트(Event)는 클릭·입력·선택 변경처럼 사용자가 화면에서 발생시키는 행동을 의미하는 것으로 웹서비스는 이벤트를 감지한 뒤 필요한 데이터 처리와 화면 변경을 실행하므로, 버튼이 존재한다는 사실만으로 기능이 완성되는 것은 아님
화면 요소 → 이벤트 감지 → 처리 로직 → 화면 변화가 연결되어야 실제 상호작용이 완성
---
### 3.1.2 클릭 이벤트 예시
```javascript
const filterButton = document.querySelector('#filter-button');

filterButton.addEventListener('click', function () {
  console.log('필터 버튼 클릭');
});
```
- addEventListener는 특정 요소에 이벤트가 발생했을 때 실행할 동작을 연결
- 처음에는 콘솔로 이벤트 발생 여부를 확인하고 이후 실제 기능을 연결
---
## 3.2 함수(Function)
### 3.2.1 함수를 사용하는 이유
함수는 코드를 짧게 만드는 문법이 아니라 하나의 역할을 분리해 다시 사용하고 오류 위치를 찾기 쉽게 만드는 구조화 도구로 이후 JSON·검색·LocalStorage 기능이 늘어날수록 역할이 분리된 함수가 프로젝트 유지보수에 직접 영향을 줌
- 같은 작업을 여러 곳에서 반복하지 않도록 함
- 하나의 기능을 작은 단위로 나누면 오류 위치를 찾기 쉬움
- 함수 이름은 무엇을 하는지 알 수 있게 작성
<table header-row="true">
<tr>
<td>역할</td>
<td>함수 이름 예시</td>
</tr>
<tr>
<td>목록 출력</td>
<td>renderItems</td>
</tr>
<tr>
<td>검색</td>
<td>filterItems</td>
</tr>
<tr>
<td>즐겨찾기 저장</td>
<td>saveFavorite</td>
</tr>
</table>
---
### 3.2.2 입력과 출력 생각하기
함수를 작성하기 전에 코드부터 입력하기보다 무엇을 받아서 무엇을 반환하거나 변경해야 하는지를 먼저 문장으로 정의하면 기능의 경계가 명확해지는데 특히 데이터 계산 함수와 화면 변경 함수를 분리하면 이후 데이터 출처가 바뀌어도 재사용하기 쉬움
- 함수가 무엇을 받아야 하는지 먼저 생각함
- 함수 실행 후 어떤 결과가 나와야 하는지 정함
- 화면을 바꾸는 함수와 데이터를 계산하는 함수를 가능하면 구분함
---
## 3.3 배열(Array)과 객체(Object) 복습
### 3.3.1 객체는 데이터 1건
```javascript
const item = {
  id: 1,
  title: '웹 디자인 기초',
  category: '디자인',
  year: 2026
};
```
- 객체는 한 항목에 필요한 여러 정보를 이름과 값의 쌍으로 묶음
- 6주차 JSON 데이터 1건도 같은 구조로 이해할 수 있음
---
### 3.3.2 배열은 여러 데이터의 목록
```javascript
const items = [
  { id: 1, title: '웹 디자인 기초', category: '디자인' },
  { id: 2, title: 'JavaScript 입문', category: '개발' },
  { id: 3, title: 'UX 리서치', category: '기획' }
];
```
- 배열은 여러 데이터 항목을 순서대로 보관함
- 검색·필터·정렬 기능은 대부분 원본 배열을 조건에 따라 처리한 결과 배열을 만듦
---
## 3.4 조건문(Conditional)
### 3.4.1 조건문이 필요한 이유
조건문은 상황에 따라 다른 결과를 만들도록 분기하는 문법으로, 검색어가 제목에 포함되는지 선택한 카테고리와 같은지처럼 데이터를 남길지 제외할지 판단하는 기준이 되며 검색·필터 기능은 결국 조건 비교의 반복이므로 이번 주차에서는 기능을 완성하지 않더라도 비교의 기본 형태를 확인
---
### 3.4.2 기본 비교 예시
```javascript
const keyword = '기초';
const item = { title: '웹 디자인 기초', category: '디자인' };

if (item.title.includes(keyword)) {
  console.log('검색어와 일치하는 항목');
}
```
- includes는 문자열 안에 특정 단어가 포함되어 있는지 확인
- 값이 정확히 같은지 비교할 때는 일치 연산자를 사용
- 조건이 둘 이상이면 그리고 조건으로 연결해 모두 만족하는 경우만 남김
- 9주차 검색과 복수 필터는 이 비교를 배열 전체에 반복 적용한 결과임
---
# 4. 팀 프로젝트 적용
1\~3장에서 만든 팀 화면과 JavaScript 기초를 팀 프로젝트에 직접 적용하는 단계로, 이번 장의 결과물이 6주차 데이터 설계의 입력값이 됨
## 4.1 적용 기능 선정
- 4주차 와이어프레임에서 JavaScript 상호작용이 필요한 요소를 표시
- 4주차 Must 기능 중 JSON 데이터 없이 화면 상태만으로 구현 가능한 부분 2개를 고름
- 필터 선택 상태 전환, 상세 영역 열고 닫기처럼 4주차 Must에서 직접 파생된 기능을 우선
- 4주차에 작성한 기능별 완료 조건을 이번 주차의 판정 기준으로 그대로 사용
- 팀원끼리 각 기능의 입력, 처리, 출력을 설명
---
## <span color="blue">4.2 🖇️  실습｜상호작용 구현</span>
<div class="secure-section-placeholder" data-secure-section="w05-1"></div>

---
## 4.3 입력 → 처리 → 출력 정리
### 4.3.1 기능을 세 단계로 나누기
- 입력(Input)은 사용자가 검색어를 입력하거나 필터를 선택하는 단계임
- 처리(Processing)는 JavaScript가 조건을 확인하고 데이터를 계산하는 단계임
- 출력(Output)은 처리 결과를 목록, 문구, 상세정보로 다시 보여주는 단계임
<table header-row="true">
<tr>
<td>기능</td>
<td>입력</td>
<td>처리</td>
<td>출력</td>
</tr>
<tr>
<td>검색</td>
<td>검색어</td>
<td>제목 포함 여부 확인</td>
<td>일치 항목 목록</td>
</tr>
<tr>
<td>필터</td>
<td>카테고리</td>
<td>같은 카테고리만 선택</td>
<td>필터된 목록</td>
</tr>
<tr>
<td>상세보기</td>
<td>선택한 id</td>
<td>해당 데이터 찾기</td>
<td>상세정보</td>
</tr>
</table>
---
## <span color="blue">4.4 🖇️  실습｜6주차로 넘길 데이터 정리</span>
<div class="secure-section-placeholder" data-secure-section="w05-2"></div>

---
## \[옵션\] 심화 트랙 준비
### 데이터 출처와 화면 출력 분리
- 심화 트랙에서도 화면을 그리는 방법 자체는 필수 트랙과 크게 다르지 않음
- 데이터가 JSON인지 API인지 DB인지와 관계없이 렌더링 함수가 같은 형태의 데이터를 받도록 설계하는 것이 좋음
- 6주차부터 내부 데이터 구조를 명확히 정의하면 이후 외부 데이터 변환이 쉬워짐
---
## 4.5 6주차 구현 준비 연결
5주차 산출물은 이후 주차의 입력값이 되므로 어느 주차에서 어떻게 쓰이는지 확인하고 부족한 부분을 이번 주에 보완
<table fit-page-width="true" header-row="true">
<colgroup>
<col width="206.359375">
<col width="164">
<col width="328">
</colgroup>
<tr>
<td>5주차 산출물</td>
<td>사용 주차</td>
<td>사용 방식</td>
</tr>
<tr>
<td>목록 화면 HTML·CSS</td>
<td>7주차</td>
<td>카드 1건 구조가 반복 렌더링 템플릿이 됨</td>
</tr>
<tr>
<td>화면 명세와 선택 요소 목록</td>
<td>7·9·10주차</td>
<td>렌더링·필터·상세 연결의 대상 요소</td>
</tr>
<tr>
<td>4.4.1 카드 배열·객체</td>
<td>6주차</td>
<td>같은 필드명으로 JSON 파일로 분리</td>
</tr>
<tr>
<td>4.4.2 인계 정리표</td>
<td>6주차</td>
<td>필드명·자료형·식별자·필터 허용값·검색 필드를 데이터 명세서에 그대로 옮김</td>
</tr>
<tr>
<td>상태 영역 5종</td>
<td>7·9·11주차</td>
<td>영역은 그대로 두고 전환 로직만 추가</td>
</tr>
<tr>
<td>상호작용 기능 2개</td>
<td>9·10주차</td>
<td>상태 전환에 데이터 처리를 결합</td>
</tr>
<tr>
<td>입력 → 처리 → 출력 정리</td>
<td>9주차</td>
<td>검색·필터 함수 설계 근거</td>
</tr>
<tr>
<td>디버깅 루틴과 오류 기록</td>
<td>7\~13주차, 8주차</td>
<td>각 주차 오류 처리의 공통 절차이자 중간평가 준비 자료</td>
</tr>
</table>
## 4.6 핵심 정리
- JavaScript는 사용자 행동과 데이터 변화를 화면에 연결
- DOM은 JavaScript가 HTML 요소를 찾아 변경하기 위한 구조임
- 이벤트는 사용자 행동을 감지하고 함수는 기능을 작은 단위로 나누는 도구임
- 배열과 객체는 이후 JSON 데이터와 검색·필터 기능의 기본 구조가 됨
- 기능을 입력 → 처리 → 출력으로 나누면 구현과 디버깅이 쉬워짐
- 조건문은 데이터를 남길지 제외할지 판단하는 기준으로 9주차 검색·필터의 기본이 됨
- 이번 주차 결과물을 배열로 정리해 두면 6주차 데이터 설계를 처음부터 다시 하지 않아도 됨
---
# 📝 활동내역 및 산출물
<div class="secure-section-placeholder" data-secure-section="w05-3"></div>
