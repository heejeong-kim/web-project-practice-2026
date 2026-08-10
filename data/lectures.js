window.LECTURE_DATA = {
1:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>HTML·CSS, JavaScript, JSON, 검색·필터·정렬, 상세보기, LocalStorage 개인화 기능을 공통으로 학습한다.</li><li>서버 없이도 사용자의 핵심 목표를 완료할 수 있는 데이터 기반 웹서비스를 완성한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>필수 트랙을 기반으로 프로젝트 목적에 필요한 경우 외부 API, 클라우드 DB, 간단한 인증 기능을 선택적으로 적용할 수 있다.</li><li>심화 기술의 개수보다 사용자 문제 해결에 실제로 필요한지와 안정적으로 동작하는지를 우선한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>웹프로젝트 실습의 목표와 한 학기 프로젝트 진행 구조를 설명할 수 있다.</li><li>정적 웹페이지와 데이터 기반 웹서비스의 차이를 사용자 행동과 데이터 흐름 관점에서 구분할 수 있다.</li><li>JSON 기본 데이터셋과 LocalStorage 사용자 데이터의 역할을 구분하고 프로젝트 사례에 적용할 수 있다.</li></ul>
<h1>준비물 및 수업환경</h1><ul><li>개인 노트북과 Chrome 또는 Edge 최신 버전을 준비한다.</li><li>Visual Studio Code를 설치하고 HTML, CSS, JavaScript 파일을 열고 수정할 수 있는 상태를 확인한다.</li><li>수업 자료와 프로젝트 파일을 저장할 개인 폴더를 생성한다.</li></ul><div class="callout yellow"><strong>💡 참고</strong>1주차에는 복잡한 개발환경 설정을 요구하지 않으며 브라우저와 Visual Studio Code를 중심으로 수업을 진행한다.</div>
<h1>1. [이론] 웹프로젝트 실습의 이해</h1>
<h2>1.1 웹페이지에서 웹서비스로</h2><ul><li>웹페이지는 브라우저에서 사용자가 보는 하나의 문서 또는 화면으로 이해한다.</li><li>웹사이트는 여러 웹페이지가 하나의 목적과 정보구조에 따라 연결된 형태로 이해한다.</li><li>페이지 수가 많다고 해서 자동으로 웹서비스가 되는 것은 아니다.</li><li>한 화면만 있어도 사용자가 검색 조건을 선택하고 결과가 바뀌며 선택 상태를 저장할 수 있다면 웹서비스의 성격을 가질 수 있다.</li></ul>
<table><thead><tr><th>예시</th><th>사용자가 하는 일</th><th>성격</th></tr></thead><tbody><tr><td>학과 소개 페이지</td><td>교육과정과 교수진 정보를 읽는다.</td><td>정보 제공형 웹페이지</td></tr><tr><td>대학 홈페이지</td><td>여러 메뉴를 이동하며 정보를 찾는다.</td><td>정보 제공형 웹사이트</td></tr><tr><td>교과목 검색 화면</td><td>학과·학년·요일 조건을 선택해 강의를 찾는다.</td><td>데이터 기반 웹서비스</td></tr></tbody></table>
<h2>1.2 정적 웹페이지와 데이터 기반 웹서비스 비교</h2><ul><li>정적 웹페이지와 데이터 기반 웹서비스는 사용하는 HTML·CSS 기술만으로 구분하지 않는다.</li><li>데이터 기반 서비스는 사용자의 검색·선택·저장 행동에 따라 처리되는 데이터와 화면 결과가 달라진다.</li><li>이번 학기의 핵심은 기능을 많이 만드는 것이 아니라 사용자의 목적을 완료하는 흐름을 설계하는 것이다.</li></ul>
<h2>1.3 사례로 이해하기</h2><h3>1.3.1 카페 소개 페이지</h3><ul><li>카페 한 곳의 정보를 HTML에 직접 작성해 전달하는 정보 제공형 페이지를 생각한다.</li><li>메뉴 정보가 변경되면 HTML을 직접 수정해야 하며 조건에 따라 결과를 바꾸는 기능은 기본적으로 포함되지 않는다.</li></ul>
<pre data-lang="html">
&lt;article class="cafe"&gt;
  &lt;h2&gt;카페 라온&lt;/h2&gt;
  &lt;p&gt;성수동 · 09:00~22:00&lt;/p&gt;
  &lt;p&gt;아메리카노 4,500원&lt;/p&gt;
&lt;/article&gt;
</pre>
<h3>1.3.2 카페 탐색 서비스</h3><ul><li>여러 카페 데이터를 JSON으로 관리하고 사용자가 지역·가격·편의시설 조건으로 결과를 좁힌다고 가정한다.</li><li>같은 데이터셋을 검색·필터·정렬·상세보기·즐겨찾기에 반복 활용하는 구조가 데이터 기반 웹서비스의 핵심이다.</li></ul>
<pre data-lang="json">
[
  {
    "id": 1,
    "name": "카페 라온",
    "area": "성수동",
    "priceLevel": "보통",
    "hasOutlet": true,
    "hasWifi": true,
    "tags": ["카공", "넓은좌석"]
  }
]
</pre>
<h1>2. [이론+실습] 데이터 기반 웹서비스의 구조</h1><h2>2.1 화면·기본 데이터·사용자 데이터</h2><table><thead><tr><th>구분</th><th>역할</th><th>이번 학기 도구</th></tr></thead><tbody><tr><td>화면</td><td>데이터를 보여주고 사용자의 입력을 받는다.</td><td>HTML·CSS·JavaScript</td></tr><tr><td>기본 데이터</td><td>서비스가 공통으로 제공하는 항목 정보를 관리한다.</td><td>JSON</td></tr><tr><td>사용자 데이터</td><td>즐겨찾기·최근 본 항목·설정처럼 개인 상태를 저장한다.</td><td>LocalStorage</td></tr></tbody></table>
<h2>2.2 JSON과 LocalStorage</h2><ul><li>JSON은 여러 팀원이 함께 관리하는 서비스 기본 데이터다.</li><li>LocalStorage는 해당 브라우저 안에서만 유지되는 개인 상태다.</li><li>클라우드 DB는 여러 사용자·브라우저가 공유하고 변경해야 하는 데이터가 필요할 때 심화 트랙에서 선택한다.</li></ul><div class="callout blue"><strong>핵심 문장</strong>JSON은 서비스 데이터, LocalStorage는 사용자의 브라우저 상태, 클라우드 DB는 여러 사용자가 공유하는 변경 데이터다.</div>
<h1>3. [실습] 한 학기 프로젝트 범위 이해</h1><h2>3.1 필수 구현 범위</h2><ul><li>JSON 데이터 30건 이상과 의미 있는 필드 최소 8개를 준비한다.</li><li>검색, 동시에 적용 가능한 필터 2개 이상, 정렬, 상세보기를 구현한다.</li><li>LocalStorage 개인화 기능을 3개 이상 구현한다.</li><li>결과 없음·오류 상태와 모바일 반응형 화면을 포함한다.</li><li>사용자 테스트 후 실제 URL로 배포한다.</li></ul>
<h2>3.2 심화 구현 범위</h2><ul><li>외부 API, Supabase·Firebase 같은 클라우드 DB, 간단한 인증을 필요할 때만 선택한다.</li><li>심화 기술 사용 여부만으로 성적을 차등하지 않는다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>관심 웹서비스 사례 분석 메모.</li><li>사용자·문제·기능·데이터 구분 결과.</li><li>2주차에서 비교할 유사 서비스 2개 선정.</li></ul></div>`},
2:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>기존 서비스의 사용자, 문제, 기능, 데이터, 사용자 흐름을 분석한다.</li><li>JSON과 LocalStorage만으로 해결 가능한 서비스 구조를 우선적으로 찾는다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>기존 서비스가 외부 API, 사용자 간 공유 데이터, 로그인 상태를 실제로 필요로 하는지 추가로 관찰한다.</li><li>기술이 있다는 이유가 아니라 사용자 문제 때문에 필요한 경우에만 심화 후보로 표시한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>기존 웹서비스를 사용자, 문제, 핵심 가치, 기능, 데이터, 사용자 흐름의 관점에서 체계적으로 역분석할 수 있다.</li><li>유사·경쟁 서비스를 동일한 기준으로 비교하고 공통 기능, 차별 기능, 불편점, 기회 영역을 도출할 수 있다.</li><li>시장·트렌드 조사 결과를 3주차 프로젝트 문제 정의와 주제 선정의 근거로 활용할 수 있다.</li></ul>
<h1>준비물 및 수업환경</h1><ul><li>1주차에 선정한 관심 웹서비스와 유사 서비스 2개 이상을 준비한다.</li><li>서비스 화면을 캡처하거나 메모할 수 있는 도구를 준비한다.</li><li>Google Trends, 공식 웹사이트, 앱스토어 소개 페이지, 공식 도움말을 활용한다.</li></ul>
<h1>1. [이론+실습] 서비스 역분석 방법</h1><h2>1.1 서비스 역분석의 개념</h2><ul><li>서비스 역분석은 이미 완성된 서비스에서 사용자 문제, 목적, 핵심 기능, 데이터 구조, 사용자 흐름을 거꾸로 추론하는 활동이다.</li><li>화면의 디자인만 보는 것이 아니라 왜 이런 정보가 먼저 보이는지, 왜 이런 순서로 행동하게 하는지 살펴본다.</li></ul>
<table><thead><tr><th>구분</th><th>좋지 않은 분석</th><th>좋은 분석</th></tr></thead><tbody><tr><td>사용자</td><td>대학생이 사용한다.</td><td>공강 시간에 참여할 비교과 프로그램을 빠르게 찾고 싶은 1~2학년 학생이 사용한다.</td></tr><tr><td>문제</td><td>검색이 필요하다.</td><td>프로그램 수가 많아 자신에게 맞는 정보를 짧은 시간 안에 찾기 어렵다.</td></tr><tr><td>기능</td><td>필터가 있다.</td><td>분야·대상·일정 필터를 통해 신청 가능한 프로그램만 좁혀볼 수 있다.</td></tr></tbody></table>
<h2>1.2 서비스 역분석의 일곱 가지 관점</h2><h3>1.2.1 핵심 사용자(Target User)</h3><ul><li>나이·성별보다 사용 상황과 목적을 중심으로 구체화한다.</li><li>대학생보다 이번 학기에 취업 준비를 시작해 교내 취업 프로그램을 찾는 3학년 학생처럼 작성한다.</li></ul><h3>1.2.2 사용자 문제(Pain Point)와 요구(Needs)</h3><ul><li>“정보가 너무 많아 원하는 프로그램을 빠르게 찾기 어렵다”는 Pain Point에 해당한다.</li><li>“나에게 해당되는 프로그램만 빠르게 좁혀보고 싶다”는 Needs에 해당한다.</li><li>기능을 먼저 정하지 않고 Pain Point → Needs → Feature 순으로 연결한다.</li></ul><h3>1.2.3 핵심 가치(Value Proposition)</h3><ul><li>기능 목록이 아니라 사용자가 얻는 결과를 한 문장으로 정리한다.</li></ul><h3>1.2.4 핵심 기능(Core Feature)과 보조 기능(Supporting Feature)</h3><ul><li>핵심 기능은 없으면 사용자 목표 달성이 어려운 기능이다.</li><li>보조 기능은 기본 과업은 가능하지만 반복 이용 편의를 높이는 기능이다.</li></ul><h3>1.2.5 데이터(Data)</h3><ul><li>목록 카드와 상세화면에 반복 등장하는 필드를 찾는다.</li><li>사용자 상태와 서비스 기본 데이터를 구분한다.</li></ul><h3>1.2.6 정보구조(Information Architecture, IA)</h3><ul><li>메뉴와 화면이 어떤 위계로 구성되는지 살펴본다.</li></ul><h3>1.2.7 사용자 흐름(User Flow)</h3><ul><li>진입 → 탐색 → 조건 적용 → 상세 확인 → 저장과 같은 대표 과업 흐름을 기록한다.</li></ul>
<h1>2. [실습] 경쟁서비스 비교</h1><h2>2.1 동일한 기준으로 비교하기</h2><table><thead><tr><th>비교 항목</th><th>서비스 A</th><th>서비스 B</th><th>관찰 근거</th></tr></thead><tbody><tr><td>핵심 사용자</td><td></td><td></td><td></td></tr><tr><td>대표 과업</td><td></td><td></td><td></td></tr><tr><td>검색·필터</td><td></td><td></td><td></td></tr><tr><td>상세 정보</td><td></td><td></td><td></td></tr><tr><td>저장 기능</td><td></td><td></td><td></td></tr><tr><td>불편점</td><td></td><td></td><td></td></tr></tbody></table>
<h2>2.2 공통 레퍼런스 프로젝트 사전 안내</h2><div class="callout yellow"><strong>공통 실습 주제</strong>5~12주차에는 영화·도서 콘텐츠 탐색, 여행지 탐색, 학습 콘텐츠·목표 관리 프로젝트를 수업 공통 실습으로 사용하므로 동일하거나 매우 유사한 주제는 팀프로젝트에서 선택하지 않는다.</div>
<h1>3. [실습] 시장·트렌드와 기회 영역 도출</h1><ul><li>트렌드는 유행하는 화면 스타일을 모으는 것이 아니라 반복되는 사용자 행동과 문제 해결 패턴을 찾는 데 활용한다.</li><li>관찰한 불편이 프로젝트로 해결 가능한지, 데이터 30건 이상을 구성할 수 있는지, 핵심 기능 4~6개로 범위를 통제할 수 있는지 평가한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>서비스 역분석 보고서.</li><li>유사·경쟁 서비스 2~3개 비교표.</li><li>공통 기능·차별 기능·불편점·기회 영역 정리.</li><li>3주차 문제 정의에 사용할 근거 3개 이상.</li></ul></div>`},
3:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>사용자 문제를 중심으로 프로젝트 주제를 정하고 JSON·LocalStorage 기반으로 구현 가능한 범위를 판단한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>외부 API·공유 DB·인증이 문제 해결에 필요한 경우 이유와 사용 지점을 함께 기록한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>사용자 세분화(User Segmentation)를 통해 핵심 사용자(Target User)를 선정할 수 있다.</li><li>페르소나(Persona), Pain Point, Needs를 연결해 프로젝트 문제를 구체화할 수 있다.</li><li>문제 정의문(Problem Statement)과 가치 제안(Value Proposition)을 바탕으로 팀프로젝트 주제를 확정할 수 있다.</li></ul>
<h1>1. [이론] 사용자 세분화와 핵심 사용자 선정</h1><h2>1.1 넓은 사용자에서 구체적인 사용자로</h2><ul><li>“대학생”처럼 넓은 집단 대신 상황·목표·제약이 드러나는 사용자를 정의한다.</li><li>누구나 사용하는 서비스보다 한 사용자의 대표 과업을 분명히 완료하는 서비스를 우선한다.</li></ul>
<h2>1.2 페르소나(Persona)와 사용자 문제(Pain Point)</h2><table><thead><tr><th>항목</th><th>작성 내용</th></tr></thead><tbody><tr><td>상황</td><td>언제, 어디서, 어떤 상황에서 서비스를 사용하는가.</td></tr><tr><td>목표</td><td>사용자가 최종적으로 무엇을 완료하고 싶은가.</td></tr><tr><td>Pain Point</td><td>현재 과정에서 무엇이 어렵고 번거로운가.</td></tr><tr><td>Needs</td><td>문제를 해결하기 위해 어떤 상태를 원하는가.</td></tr></tbody></table>
<h1>2. [이론+실습] 문제 정의와 가치 제안</h1><h2>2.1 문제 정의문(Problem Statement)</h2><div class="callout blue"><strong>문장 구조</strong>[핵심 사용자]가 [상황]에서 [목표]를 달성하려 할 때 [문제] 때문에 어려움을 겪는다.</div><h2>2.2 가치 제안(Value Proposition)</h2><div class="callout green"><strong>문장 구조</strong>우리 서비스는 [사용자]가 [문제]를 해결하도록 [핵심 방식]을 제공해 [결과]를 얻도록 돕는다.</div>
<h1>3. [실습] 프로젝트 주제 선정</h1><h2>3.1 후보 3개 만들기</h2><ul><li>각 팀은 문제 근거가 있는 후보 주제 3개를 만든다.</li><li>각 후보에 사용자, 문제, 핵심 데이터, 대표 기능, 트랙을 함께 적는다.</li></ul><h2>3.2 주제 판단 기준</h2><table><thead><tr><th>기준</th><th>확인 질문</th></tr></thead><tbody><tr><td>문제 명확성</td><td>누가 어떤 어려움을 겪는지 설명할 수 있는가.</td></tr><tr><td>데이터 가능성</td><td>최종 30건 이상의 구조화된 데이터를 만들 수 있는가.</td></tr><tr><td>기능 적합성</td><td>검색·복수 필터·정렬·상세·개인화가 문제 해결에 연결되는가.</td></tr><tr><td>범위</td><td>15주 안에 안정적으로 완성 가능한가.</td></tr><tr><td>차별성</td><td>2주차 분석에서 발견한 기회 영역이 반영되는가.</td></tr></tbody></table>
<h2>3.3 주제 예시</h2><ul><li>교내 비교과 프로그램 탐색, 대학생 공모전 탐색, 대외활동 탐색, 장학금 탐색, 자격증 탐색 및 준비.</li><li>직무·기업 탐색, 전공·학과 탐색, 교환학생 대학 탐색, 봉사활동 탐색, 동아리 탐색.</li><li>캠퍼스 시설·스터디 공간·전시·공연·축제·박물관·산책로·반려동물 동반 장소 탐색.</li><li>취미 클래스, 식재료 기반 메뉴, 알레르기·식단 조건 음식, 패션 코디, 화장품 성분, 디지털 도구, 생산성 도구, 보드게임, 식물 키우기 가이드 등.</li></ul>
<div class="callout yellow"><strong>선택 불가</strong>공통 실습으로 진행하는 영화·도서 콘텐츠 탐색, 여행지 탐색, 학습 콘텐츠·목표 관리와 동일하거나 매우 유사한 주제는 선택하지 않는다.</div>
<h2>3.4 최종 선정 절차</h2><ol><li>팀 구성.</li><li>후보 3개 제출.</li><li>교수자와 중복·난이도 조정.</li><li>최종 주제와 필수/심화 트랙 확정.</li></ol>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>팀 구성.</li><li>후보 주제 3개와 비교표.</li><li>최종 주제.</li><li>핵심 사용자와 Pain Point.</li><li>한 줄 프로젝트 정의.</li><li>필수/심화 트랙 분류와 이유.</li></ul></div>`},
4:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>최소 기능 제품(Minimum Viable Product, MVP), 정보구조(Information Architecture, IA), 사용자 흐름(User Flow), 와이어프레임을 설계한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>API·클라우드 DB가 필요한 지점을 서비스 구조도와 데이터 흐름에 선택적으로 표시한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>사용자 문제를 해결하는 핵심 기능 4~6개를 선정하고 MVP 범위를 정할 수 있다.</li><li>서비스의 정보구조와 대표 사용자 흐름을 설계할 수 있다.</li><li>와이어프레임과 데이터 요구사항을 연결할 수 있다.</li></ul>
<h1>1. [이론] 최소 기능 제품과 기능 구조</h1><h2>1.1 MVP의 목적</h2><ul><li>MVP는 기능이 적은 서비스가 아니라 사용자의 핵심 문제를 최소 범위로 해결하는 첫 완성 버전이다.</li><li>반드시 필요한 기능과 나중에 추가할 기능을 구분해 프로젝트의 완성 가능성을 높인다.</li></ul><h2>1.2 핵심 기능 4~6개</h2><ul><li>목록 탐색, 검색, 복수 필터, 정렬, 상세보기, 개인화가 기본 골격이 된다.</li><li>프로젝트 주제별로 사용자 문제를 직접 해결하는 도메인 특화 기능 1개를 추가한다.</li></ul>
<h1>2. [이론+실습] 정보구조(IA)와 사용자 흐름</h1><h2>2.1 정보구조(Information Architecture, IA)</h2><ul><li>메인, 탐색 목록, 상세, 저장 목록처럼 사용자가 이동하는 주요 화면을 정의한다.</li><li>화면 수를 늘리기보다 대표 과업이 끊기지 않는 구조를 우선한다.</li></ul><h2>2.2 사용자 흐름(User Flow)</h2><div class="callout blue"><strong>대표 흐름 예시</strong>서비스 진입 → 관심 분야 선택 → 조건 필터 → 결과 비교 → 상세 확인 → 관심 항목 저장.</div>
<h1>3. [실습] 와이어프레임과 데이터 요구사항</h1><h2>3.1 와이어프레임(Wireframe)</h2><ul><li>검색창, 필터, 정렬, 결과 건수, 카드, 상세 영역, 저장 상태가 어디에 보이는지 구조를 그린다.</li><li>화려한 시각 디자인보다 사용자 행동과 정보 우선순위를 확인한다.</li></ul><h2>3.2 데이터 요구사항</h2><table><thead><tr><th>기능</th><th>필요 데이터 예시</th></tr></thead><tbody><tr><td>검색</td><td>title, description, tags</td></tr><tr><td>필터</td><td>category, target, location, status</td></tr><tr><td>정렬</td><td>date, deadline, rating, name</td></tr><tr><td>상세</td><td>description, image, contact, link</td></tr><tr><td>개인화</td><td>item id와 사용자 상태</td></tr></tbody></table>
<h2>3.3 심화 트랙 데이터 흐름</h2><ul><li>외부 API를 사용한다면 외부 응답을 내부 데이터 구조로 변환하는 지점을 표시한다.</li><li>공유 DB를 사용한다면 어떤 데이터가 여러 사용자에게 공유되어야 하는지 명확히 구분한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>MVP 기능 목록 4~6개.</li><li>IA 또는 사이트맵.</li><li>대표 User Flow.</li><li>주요 화면 와이어프레임.</li><li>필요 JSON 필드 초안.</li><li>심화 트랙은 외부 데이터 소스 또는 클라우드 DB 역할 정리.</li></ul></div>`},
5:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>JavaScript와 문서 객체 모델(Document Object Model, DOM)을 연결하고 이벤트 기반 상호작용을 구현한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>향후 데이터 소스를 교체할 수 있도록 UI 로직과 데이터 획득 로직을 분리하는 관점을 함께 익힌다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>HTML 요소를 JavaScript로 선택하고 내용을 변경할 수 있다.</li><li>이벤트(Event)와 함수(Function)를 연결해 입력 → 처리 → 출력 흐름을 구현할 수 있다.</li><li>공통 레퍼런스 프로젝트 A의 정적 화면에 JavaScript 상호작용을 추가할 수 있다.</li></ul>
<h1>준비물 및 수업환경</h1><ul><li>공통 프로젝트 A 스타터 파일을 준비한다.</li><li>Visual Studio Code와 브라우저 개발자 도구(Developer Tools)의 콘솔(Console)을 사용할 수 있게 준비한다.</li></ul>
<h1>1. [이론] JavaScript와 DOM 연결</h1><h2>1.1 DOM 요소 선택</h2><pre data-lang="javascript">
const searchInput = document.querySelector('#search-input');
const resultText = document.querySelector('#result-text');
</pre><ul><li>querySelector는 CSS 선택자와 같은 방식으로 첫 번째 요소를 선택한다.</li><li>선택한 요소는 변수에 저장해 여러 이벤트에서 다시 사용할 수 있다.</li></ul>
<h2>1.2 이벤트(Event)와 함수(Function)</h2><pre data-lang="javascript">
function showKeyword() {
  const keyword = searchInput.value.trim();
  resultText.textContent = keyword ? '검색어: ' + keyword : '검색어를 입력하세요.';
}

searchInput.addEventListener('input', showKeyword);
</pre>
<h1>2. [실습] 공통 레퍼런스 프로젝트 A</h1><h2>2.1 콘텐츠 탐색 서비스 화면</h2><pre data-lang="html">
&lt;section class="search-area"&gt;
  &lt;label for="search-input"&gt;콘텐츠 검색&lt;/label&gt;
  &lt;input id="search-input" type="search" placeholder="제목을 입력하세요"&gt;
  &lt;p id="result-text"&gt;검색어를 입력하세요.&lt;/p&gt;
&lt;/section&gt;
</pre><h2>2.2 배열과 객체</h2><pre data-lang="javascript">
const items = [
  { id: 1, title: '콘텐츠 A', category: '영화' },
  { id: 2, title: '콘텐츠 B', category: '도서' }
];

console.log(items[0].title);
</pre><ul><li>배열은 여러 항목을 순서대로 관리하고 객체는 하나의 항목을 여러 속성으로 표현한다.</li><li>6주차 JSON 데이터셋은 이 배열·객체 구조를 파일로 분리한 형태라고 이해한다.</li></ul>
<h1>3. [실습] 팀프로젝트 적용</h1><ul><li>팀프로젝트의 검색창 또는 필터 UI 하나를 DOM으로 선택한다.</li><li>이벤트가 발생했을 때 현재 입력값을 읽고 화면의 안내 문구를 바꾸는 작은 상호작용부터 구현한다.</li><li>아직 실제 프로젝트 데이터를 완성하지 않아도 UI와 JavaScript가 연결되는 구조를 먼저 확인한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>공통 프로젝트 A JavaScript 실습 결과.</li><li>팀프로젝트 HTML·CSS 기본 화면.</li><li>DOM 선택과 이벤트가 연결된 기능 1개 이상.</li></ul></div>`},
6:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>최종 30건 이상으로 확장할 수 있는 JSON 데이터 구조를 설계한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>외부 API·DB를 사용할 팀은 외부 필드와 내부 데이터 구조의 매핑 규칙을 함께 설계한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>데이터 명세(Data Specification)와 필드(Field)의 의미를 설명할 수 있다.</li><li>식별자(Identifier, ID), 필수값(Required Field), 선택값(Optional Field)을 구분할 수 있다.</li><li>검색·필터·정렬·상세보기 기능과 직접 연결되는 JSON 스키마를 설계할 수 있다.</li></ul>
<h1>1. [이론] JSON 데이터 명세</h1><h2>1.1 필드 설계 원칙</h2><ul><li>최종 데이터는 30건 이상을 기준으로 한다.</li><li>의미 있는 필드는 최소 8개 이상, 8~10개를 권장한다.</li><li>ID는 항목마다 유일해야 하며 프로젝트 전체에서 숫자 또는 문자열 중 한 자료형으로 통일한다.</li><li>검색·필터·정렬에 사용할 필드는 기능 구현 전에 먼저 정의한다.</li></ul>
<h2>1.2 예시 스키마</h2><pre data-lang="json">
{
  "id": 1,
  "title": "진로 탐색 워크숍",
  "category": "진로",
  "target": "전체 학년",
  "location": "학생회관",
  "startDate": "2026-09-10",
  "deadline": "2026-09-05",
  "description": "직무 탐색과 진로 설계를 돕는 프로그램",
  "image": "./images/program-01.jpg"
}
</pre>
<h1>2. [실습] 데이터 검증</h1><h2>2.1 자주 발생하는 오류</h2><pre data-lang="json">
[
  {
    "id": 1,
    "title": "프로그램 A",
    "category": "진로",
    "deadline": "2026/09/15"
  },
  {
    "id": "2",
    "name": "프로그램 B",
    "category": ["취업"],
    "deadline": "9월 20일"
  }
]
</pre><ul><li>첫 번째와 두 번째 항목의 ID 자료형이 다르다.</li><li>title과 name처럼 같은 의미의 필드명이 달라진다.</li><li>category 자료형이 문자열과 배열로 섞인다.</li><li>날짜 형식이 일관되지 않는다.</li></ul>
<h2>2.2 데이터 명세표</h2><table><thead><tr><th>필드</th><th>자료형</th><th>필수 여부</th><th>용도</th></tr></thead><tbody><tr><td>id</td><td>number</td><td>필수</td><td>상세보기·저장 상태 연결.</td></tr><tr><td>title</td><td>string</td><td>필수</td><td>검색·카드 제목.</td></tr><tr><td>category</td><td>string</td><td>필수</td><td>필터.</td></tr><tr><td>deadline</td><td>string</td><td>필수</td><td>정렬·상세.</td></tr><tr><td>description</td><td>string</td><td>필수</td><td>상세보기·검색.</td></tr></tbody></table>
<h1>3. [실습] 팀프로젝트 JSON 초안</h1><ul><li>먼저 5~10건의 샘플 데이터를 만들어 구조를 검증한다.</li><li>7주차 렌더링이 안정적으로 동작한 뒤 최종 30건 이상으로 확장한다.</li><li>데이터를 사람이 읽었을 때도 같은 항목끼리 동일한 규칙을 사용하는지 검토한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>JSON 데이터 명세표.</li><li>샘플 JSON 5~10건.</li><li>필드 최소 8개 이상.</li><li>검색·필터·정렬·상세보기와 필드 연결표.</li></ul></div>`},
7:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>JSON 파일을 fetch로 불러오고 반복 렌더링해 목록 화면을 완성한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>데이터 획득 함수와 화면 렌더링 함수를 분리해 이후 API·DB로 교체 가능한 구조를 만든다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>fetch로 JSON 파일을 비동기 로드할 수 있다.</li><li>배열 데이터를 map().join('') 방식으로 HTML 카드로 변환할 수 있다.</li><li>결과 건수, 빈 상태(Empty State), 오류 상태를 함께 처리할 수 있다.</li></ul>
<h1>준비물 및 실행환경</h1><ul><li>Visual Studio Code에서 Live Server 확장을 설치한다.</li><li>index.html을 우클릭해 Open with Live Server로 실행한다.</li><li>주소가 file://이 아니라 localhost 또는 127.0.0.1로 시작하는지 확인한다.</li></ul>
<h1>1. [이론] fetch와 렌더링(Rendering)</h1><pre data-lang="javascript">
async function loadItems() {
  const response = await fetch('./data/items.json');

  if (!response.ok) {
    throw new Error('데이터를 불러오지 못했습니다.');
  }

  return response.json();
}
</pre>
<h1>2. [실습] 목록 렌더링</h1><pre data-lang="javascript">
const list = document.querySelector('#item-list');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');

function renderItems(items) {
  resultCount.textContent = '총 ' + items.length + '건';
  emptyState.hidden = items.length !== 0;

  list.innerHTML = items.map(item =>
    '<article class="item-card" data-id="' + item.id + '">' +
      '<h3>' + item.title + '</h3>' +
      '<p>' + item.category + '</p>' +
      '<p>' + item.description + '</p>' +
    '</article>'
  ).join('');
}
</pre><div class="callout yellow"><strong>왜 map().join('')을 사용하는가.</strong>반복할 때마다 innerHTML += 를 실행하지 않고 문자열을 한 번 만들어 DOM에 한 번 대입하면 구조가 단순하고 이후 이벤트 처리도 관리하기 쉽다.</div>
<h1>3. [실습] 초기 실행과 오류 상태</h1><pre data-lang="javascript">
async function init() {
  try {
    const items = await loadItems();
    renderItems(items);
  } catch (error) {
    console.error(error);
    list.innerHTML = '<p class="error-message">데이터를 불러오지 못했습니다.</p>';
  }
}

init();
</pre>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>JSON fetch 성공 화면.</li><li>데이터 기반 카드 목록 렌더링.</li><li>결과 건수 표시.</li><li>0건 상태 또는 오류 상태.</li><li>팀프로젝트 JSON 목록 화면 1차 구현.</li></ul></div>`},
8:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>1~7주차 학습 내용을 필기시험과 프로젝트 중간 결과로 확인한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>심화 기술은 구현 완료 여부가 아니라 필요성·적용 계획·데이터 흐름의 타당성을 확인한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>1~7주차 핵심 개념을 개인 필기시험에서 설명할 수 있다.</li><li>팀프로젝트의 사용자 문제, MVP, 데이터 구조, 현재 구현 상태를 설명할 수 있다.</li><li>중간 피드백을 바탕으로 후반기 개발 우선순위를 조정할 수 있다.</li></ul>
<h1>1. 중간고사｜개인 필기시험</h1><h2>1.1 평가 범위</h2><ul><li>웹페이지와 데이터 기반 웹서비스.</li><li>서비스 역분석과 사용자 문제.</li><li>Persona, Problem Statement, Value Proposition.</li><li>MVP, IA, User Flow, Wireframe.</li><li>DOM, Event, Function.</li><li>JSON 데이터 명세와 Field.</li><li>fetch와 Rendering.</li></ul><h2>1.2 평가 방식</h2><ul><li>주관식 + 객관식 필기시험으로 운영한다.</li><li>개념 암기보다 프로젝트 상황에서 왜 필요한지 설명할 수 있는지를 확인한다.</li></ul>
<h1>2. 팀 프로젝트 중간평가</h1><h2>2.1 발표 항목</h2><ol><li>프로젝트명과 한 줄 서비스 정의.</li><li>핵심 사용자와 Pain Point.</li><li>문제 정의와 가치 제안.</li><li>MVP 핵심 기능 4~6개.</li><li>IA와 User Flow.</li><li>와이어프레임.</li><li>JSON 데이터 명세와 샘플 데이터.</li><li>현재 목록 렌더링 결과.</li><li>필수/심화 트랙 분류.</li></ol>
<h2>2.2 중간 피드백 기준</h2><table><thead><tr><th>영역</th><th>확인 질문</th></tr></thead><tbody><tr><td>문제</td><td>사용자의 실제 어려움과 기능이 연결되는가.</td></tr><tr><td>범위</td><td>후반기에 완성 가능한 크기인가.</td></tr><tr><td>데이터</td><td>검색·필터·상세를 구현할 필드가 준비되어 있는가.</td></tr><tr><td>구현</td><td>JSON을 화면에 렌더링하는 기본 흐름이 동작하는가.</td></tr><tr><td>심화</td><td>외부 기술이 실제로 필요한 이유를 설명할 수 있는가.</td></tr></tbody></table>
<h1>3. 후반기 개발 우선순위</h1><ul><li>기능 추가보다 필수 데이터와 핵심 사용자 흐름을 먼저 안정화한다.</li><li>9~12주차에는 검색·필터·정렬·상세보기·LocalStorage를 완성한다.</li><li>13~14주차에는 통합 테스트, 사용자 테스트, 개선, 배포를 완료한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>중간 필기시험.</li><li>팀 중간발표 자료.</li><li>1~7주차 누적 산출물.</li><li>중간 피드백과 후반기 수정 계획.</li></ul></div>`},
9:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>검색·복수 필터·정렬을 하나의 상태와 결과 배열로 연결한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>외부 데이터 소스를 사용하더라도 먼저 내부 배열을 기준으로 같은 탐색 로직이 동작하도록 만든다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>검색어가 비어 있을 때 전체 데이터를 반환하는 검색 로직을 구현할 수 있다.</li><li>2개 이상의 필터를 동시에 적용할 수 있다.</li><li>검색 → 필터 → 정렬 → 렌더링 순서로 결과를 갱신할 수 있다.</li></ul>
<h1>1. 공통 프로젝트 B로 전환</h1><div class="callout blue"><strong>프로젝트 전환 이유</strong>프로젝트 A가 데이터 → 화면 패턴을 익히는 데 집중했다면 프로젝트 B는 데이터 → 조건 처리 → 화면 패턴을 집중적으로 연습한다.</div>
<h1>2. [실습] 검색</h1><pre data-lang="javascript">
function searchItems(items, keyword) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter(item =>
    item.name.toLowerCase().includes(normalized) ||
    item.description.toLowerCase().includes(normalized)
  );
}
</pre>
<h1>3. [실습] 복수 필터</h1><pre data-lang="javascript">
function filterItems(items, region, theme, freeOnly) {
  return items.filter(item => {
    const regionMatch = !region || item.region === region;
    const themeMatch = !theme || item.theme === theme;
    const freeMatch = !freeOnly || item.isFree === true;
    return regionMatch && themeMatch && freeMatch;
  });
}
</pre>
<h1>4. [실습] 정렬</h1><pre data-lang="javascript">
function sortItems(items, sortValue) {
  const copied = [...items];

  if (sortValue === 'rating-desc') {
    copied.sort((a, b) => b.rating - a.rating);
  }

  if (sortValue === 'name-asc') {
    copied.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }

  return copied;
}
</pre>
<h1>5. 상태를 하나로 연결하기</h1><pre data-lang="javascript">
let allItems = [];
let currentKeyword = '';
let currentRegion = '';
let currentTheme = '';
let currentFreeOnly = false;
let currentSort = 'rating-desc';

function updateResults() {
  let results = searchItems(allItems, currentKeyword);
  results = filterItems(results, currentRegion, currentTheme, currentFreeOnly);
  results = sortItems(results, currentSort);
  renderItems(results);
}
</pre><ul><li>사용자가 어떤 컨트롤을 변경하더라도 상태 변수만 바꾸고 updateResults를 호출한다.</li><li>필터 조건을 각각 따로 렌더링하지 않고 하나의 결과 흐름으로 통합한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>검색 기능.</li><li>동시에 적용 가능한 필터 2개 이상.</li><li>정렬 기능.</li><li>결과 건수와 0건 상태.</li><li>팀프로젝트 탐색 기능 1차 완성.</li></ul></div>`},
10:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>ID 기반으로 목록과 상세를 연결하고 사용자 다음 행동까지 이어지는 인터랙션을 설계한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>외부 데이터 로딩 실패·빈 결과·지연 상태에서도 상세 흐름이 깨지지 않게 처리한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>카드의 data-id와 데이터의 id를 이용해 상세 항목을 찾을 수 있다.</li><li>모달 또는 별도 상세 영역을 구현할 수 있다.</li><li>별도 페이지 방식에서는 URLSearchParams로 상세 ID와 필요한 상태를 전달할 수 있다.</li></ul>
<h1>1. [이론] 상세보기의 역할</h1><ul><li>목록은 비교와 탐색을 위한 최소 정보만 보여주고 상세에서는 결정에 필요한 추가 정보를 제공한다.</li><li>상세보기는 목록에서 사용한 동일한 데이터 항목을 ID로 찾아 렌더링한다.</li></ul>
<h1>2. [실습] ID 기반 상세보기</h1><pre data-lang="javascript">
function openDetail(id) {
  const item = allItems.find(item => item.id === id);
  if (!item) return;
  renderDetail(item);
}

function renderDetail(item) {
  detailTitle.textContent = item.name;
  detailDescription.textContent = item.description;
  detailModal.hidden = false;
}
</pre><h2>2.1 ID 자료형 주의</h2><ul><li>6주차에서 숫자 ID를 사용했다면 Number(card.dataset.id)로 변환해 비교할 수 있다.</li><li>문자열 ID를 사용한 팀은 강제로 Number로 변환하지 않는다.</li><li>한 프로젝트 안에서는 ID 자료형을 끝까지 통일한다.</li></ul>
<pre data-lang="javascript">
list.addEventListener('click', event => {
  const card = event.target.closest('[data-id]');
  if (!card) return;

  const id = Number(card.dataset.id);
  openDetail(id);
});
</pre>
<h1>3. 별도 상세 페이지 방식</h1><pre data-lang="javascript">
const params = new URLSearchParams();
params.set('id', item.id);
params.set('keyword', currentKeyword);
params.set('region', currentRegion);

location.href = './detail.html?' + params.toString();
</pre><ul><li>별도 페이지로 이동한다면 검색·필터 상태를 쿼리스트링에 함께 전달하면 목록으로 돌아왔을 때 상태를 복원할 수 있다.</li></ul>
<h1>4. 인터랙션 설계</h1><ul><li>상세 열기와 닫기.</li><li>상세에서 즐겨찾기 또는 다음 행동으로 연결.</li><li>ESC 키·바깥 영역 클릭 등 사용자가 기대하는 닫기 행동 제공.</li><li>모바일에서 상세 내용이 화면 밖으로 잘리지 않는지 확인.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>ID 기반 상세보기.</li><li>상세 닫기 또는 목록 복귀.</li><li>목록과 상세의 필드명 통일.</li><li>검색·필터 결과에서 상세로 이어지는 대표 흐름.</li></ul></div>`},
11:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>LocalStorage를 이용해 개인 브라우저 상태를 저장하고 기본 데이터와 결합한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>LocalStorage의 공유 한계를 직접 경험하고 어떤 경우에 클라우드 DB가 필요한지 판단한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>LocalStorage가 문자열만 저장한다는 특징을 설명할 수 있다.</li><li>JSON.stringify와 JSON.parse를 이용해 배열·객체 상태를 저장할 수 있다.</li><li>손상된 저장 데이터에 대한 예외 처리를 구현할 수 있다.</li></ul>
<h1>1. [이론] LocalStorage 기초</h1><table><thead><tr><th>JSON</th><th>LocalStorage</th></tr></thead><tbody><tr><td>서비스가 제공하는 공통 기본 데이터.</td><td>현재 브라우저 사용자의 개인 상태.</td></tr><tr><td>프로젝트 파일로 팀원이 공유한다.</td><td>브라우저·기기·origin마다 별도 저장된다.</td></tr><tr><td>카드 정보·카테고리·설명 등.</td><td>즐겨찾기·최근 본 항목·개인 설정 등.</td></tr></tbody></table>
<h1>2. [실습] 안전한 저장과 불러오기</h1><pre data-lang="javascript">
function loadStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn(key + ' 저장값을 복구합니다.', error);
    localStorage.removeItem(key);
    return [];
  }
}

function saveArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
</pre>
<h1>3. [실습] 즐겨찾기</h1><pre data-lang="javascript">
let favorites = loadStoredArray('favorites');

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(itemId => itemId !== id);
  } else {
    favorites.push(id);
  }

  saveArray('favorites', favorites);
  updateResults();

  if (!detailModal.hidden) {
    openDetail(id);
  }
}
</pre>
<h1>4. LocalStorage의 한계</h1><ul><li>팀원의 LocalStorage는 서로 공유되지 않는다.</li><li>브라우저나 기기가 달라지면 저장 상태가 달라진다.</li><li>브라우저 데이터를 삭제하면 저장값도 사라진다.</li><li>LocalStorage 데이터는 Git이나 GitHub 저장소에 포함되지 않는다.</li><li>따라서 공동 게시글·공유 일정·실시간 투표 같은 기능의 공동 데이터 저장소로 사용하지 않는다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>LocalStorage 저장·불러오기 코드.</li><li>즐겨찾기 또는 최근 본 항목 등 개인화 기능 1~2개.</li><li>JSON 데이터와 저장된 ID를 결합한 화면.</li></ul></div>`},
12:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>LocalStorage 개인화 기능을 최종 3개 이상으로 완성하고 화면 상태와 동기화한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>필요한 팀은 외부 API 또는 클라우드 DB 연동을 시작한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>LocalStorage 상태를 한 번 읽어 userState로 관리하고 반복 렌더링에 재사용할 수 있다.</li><li>즐겨찾기·최근 본 항목·완료·메모·설정 중 3개 이상을 구현할 수 있다.</li><li>API와 클라우드 DB의 역할을 LocalStorage와 비교해 설명할 수 있다.</li></ul>
<h1>1. [실습] 개인화 상태 통합</h1><pre data-lang="javascript">
const userState = {
  favorites: loadStoredArray('favorites'),
  recent: loadStoredArray('recent'),
  completed: loadStoredArray('completed'),
  notes: JSON.parse(localStorage.getItem('notes') || '{}')
};

function isFavorite(id) {
  return userState.favorites.includes(id);
}
</pre><ul><li>렌더링할 때마다 LocalStorage를 다시 읽지 않고 현재 상태 객체를 사용한다.</li><li>상태가 변경될 때 객체와 LocalStorage를 함께 갱신한다.</li></ul>
<h2>1.1 개인 메모</h2><pre data-lang="javascript">
function saveNote(id, text) {
  userState.notes[id] = text;
  localStorage.setItem('notes', JSON.stringify(userState.notes));
}

function getNote(id) {
  return userState.notes[id] || '';
}
</pre>
<h1>2. JSON + LocalStorage 결합 화면</h1><ul><li>전체·완료·미완료·즐겨찾기·최근 본 항목과 같은 보기 상태를 만든다.</li><li>카드에 즐겨찾기·완료 여부를 동시에 표시한다.</li><li>상세화면에서 개인 메모를 저장하고 다시 열었을 때 복원한다.</li></ul>
<h1>3. [선택 심화] 외부 API</h1><h2>3.1 실제 공개 API 예시</h2><pre data-lang="javascript">
async function loadSeoulWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,precipitation';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('날씨 데이터를 불러오지 못했습니다.');
  }

  const data = await response.json();
  return data.current;
}
</pre><ul><li>외부 API 응답을 그대로 화면 전체에 의존시키지 말고 필요한 필드만 내부 데이터 모양으로 가공한다.</li><li>로딩·실패·0건 상태를 반드시 제공한다.</li><li>비밀 키나 서버 전용 자격증명을 브라우저 JavaScript와 공개 저장소에 노출하지 않는다.</li></ul>
<h1>4. [선택 심화] 클라우드 DB</h1><table><thead><tr><th>저장 방식</th><th>적합한 데이터</th></tr></thead><tbody><tr><td>JSON</td><td>서비스가 공통으로 제공하는 정적·기본 데이터.</td></tr><tr><td>LocalStorage</td><td>한 브라우저 사용자의 개인 상태.</td></tr><tr><td>클라우드 DB</td><td>여러 사용자·브라우저가 공유하고 변경해야 하는 데이터.</td></tr></tbody></table><ul><li>Supabase 또는 Firebase/Cloud Firestore를 선택할 수 있다.</li><li>보안 규칙, RLS 또는 접근 권한을 배포 전에 반드시 확인한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>필수 트랙 산출물</strong><ul><li>LocalStorage 개인화 기능 3개 이상.</li><li>JSON + 사용자 상태 결합 화면 1개 이상.</li></ul></div><div class="callout purple"><strong>심화 트랙 산출물</strong><ul><li>API 또는 클라우드 DB 적용 계획·초기 연결 결과.</li><li>외부 기술을 선택한 이유와 실패 상태 처리 계획.</li></ul></div>`},
13:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>전체 기능을 하나의 사용자 흐름으로 통합하고 테스트 케이스(Test Case)와 사용자 테스트를 진행한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>API·DB 네트워크 실패, 권한 실패, 공유 데이터 동기화도 추가 검증한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>정상·경계·오류 상황을 포함한 테스트 케이스를 만들 수 있다.</li><li>다른 팀 사용자 테스트를 통해 사용성 문제와 기능 오류를 구분할 수 있다.</li><li>수정 후 회귀 테스트(Regression Test)를 수행할 수 있다.</li></ul>
<h1>1. [이론] 테스트 케이스 만들기</h1><table><thead><tr><th>구분</th><th>예시</th><th>기대 결과</th></tr></thead><tbody><tr><td>정상</td><td>검색어를 입력한다.</td><td>일치하는 결과만 표시된다.</td></tr><tr><td>경계</td><td>검색어가 비어 있다.</td><td>전체 결과가 표시된다.</td></tr><tr><td>오류</td><td>JSON 파일 경로가 잘못됐다.</td><td>오류 안내가 표시된다.</td></tr><tr><td>저장</td><td>즐겨찾기 후 새로고침한다.</td><td>상태가 유지된다.</td></tr></tbody></table>
<h1>2. [실습] 버그 기록과 우선순위</h1><ul><li>재현 절차, 기대 결과, 실제 결과, 환경, 스크린샷을 기록한다.</li><li>Severity는 문제가 얼마나 심각한지, Priority는 얼마나 먼저 수정해야 하는지를 구분한다.</li></ul><pre data-lang="text">
[버그 제목]
환경: Chrome / 모바일 390px
재현 절차:
1. 지역 필터를 선택한다.
2. 즐겨찾기 보기로 이동한다.
3. 뒤로 돌아온다.

기대 결과: 선택한 지역 필터가 유지된다.
실제 결과: 전체 지역으로 초기화된다.
</pre>
<h1>3. [실습] 교차 사용자 테스트</h1><ul><li>기본 2개 팀을 1조로 구성하고 홀수 팀인 경우 한 조만 3개 팀으로 운영한다.</li><li>한 라운드는 약 15분을 권장하며 진행자와 사용자 역할을 교대한다.</li><li>다른 팀 사용자 최소 2명에게 대표 과업 2개 이상을 수행하게 한다.</li><li>사용자의 행동·망설임·오류·발화를 관찰하고 해결 방법을 먼저 설명하지 않는다.</li></ul>
<h1>4. 회귀 테스트(Regression Test)</h1><ul><li>버그를 수정한 뒤 수정한 기능만 확인하지 않고 기존 핵심 흐름이 다시 깨지지 않았는지 점검한다.</li><li>검색 → 필터 → 정렬 → 상세 → 개인화 → 새로고침 흐름을 대표 회귀 테스트로 사용한다.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>테스트 케이스.</li><li>교차 사용자 테스트 기록.</li><li>버그·사용성 문제 목록.</li><li>수정 우선순위.</li><li>회귀 테스트 결과.</li></ul></div>`},
14:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>최종 품질 보증(Quality Assurance, QA)을 완료하고 정적 호스팅으로 실제 URL을 배포한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>API·DB가 실제 배포 주소에서도 정상 동작하고 권한·보안·환경 설정이 적절한지 검증한다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>기능·데이터·반응형·접근 경로를 최종 QA 관점에서 점검할 수 있다.</li><li>표준 폴더 구조와 상대경로를 이용해 실제 서비스 URL로 배포할 수 있다.</li><li>시연(Demo) 흐름과 실패 대비안을 준비할 수 있다.</li></ul>
<h1>1. [실습] 마지막 품질 보증(QA)</h1><ul><li>검색·복수 필터·정렬·상세보기·LocalStorage 개인화 기능이 대표 사용자 흐름에서 모두 연결되는지 확인한다.</li><li>데이터 30건 이상, 의미 있는 필드 최소 8개, 결과 없음 상태를 확인한다.</li><li>모바일·태블릿·데스크톱에서 핵심 흐름을 완료할 수 있는지 확인한다.</li></ul>
<h1>2. 표준 폴더 구조와 경로</h1><pre data-lang="text">
project/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ app.js
├─ data/
│  └─ items.json
├─ images/
└─ README.md
</pre><pre data-lang="javascript">
const response = await fetch('./data/items.json');
</pre><ul><li>루트부터 시작하는 절대경로보다 현재 프로젝트 폴더를 기준으로 하는 상대경로를 사용한다.</li><li>파일명 대소문자 차이는 로컬에서는 보이지 않다가 배포 환경에서 오류가 될 수 있으므로 확인한다.</li></ul>
<h1>3. 실제 서비스 배포(Deployment)</h1><ul><li>GitHub Pages, Netlify, Vercel 등 정적 호스팅을 사용할 수 있다.</li><li>배포 후 새 URL에서 JSON 경로, 이미지, LocalStorage, 모바일 레이아웃을 다시 확인한다.</li><li>배포는 필수 트랙의 최종 완료 조건이다.</li></ul>
<h1>4. [선택 심화] 운영 환경 점검</h1><ul><li>API 호출이 배포 origin에서도 허용되는지 확인한다.</li><li>브라우저에 노출되면 안 되는 비밀키가 코드에 포함되어 있지 않은지 확인한다.</li><li>Supabase RLS 또는 Firebase Security Rules 등 접근 권한을 검토한다.</li><li>네트워크 실패 시 필수 기능이 가능한 범위에서 유지되도록 한다.</li></ul>
<h1>5. 시연(Demo) 준비</h1><ul><li>서비스 진입 → 탐색 → 상세 → 개인화 → 새로고침 후 상태 유지 순서로 대표 시연 흐름을 정한다.</li><li>발표용 브라우저의 LocalStorage 상태를 미리 확인한다.</li><li>네트워크 문제에 대비해 로컬 실행본과 핵심 화면 캡처를 준비한다.</li></ul>
<h1>1~14주차 누적 산출물 체크리스트</h1><ul><li>1주차 서비스 사례 분석.</li><li>2주차 역분석·경쟁서비스 비교.</li><li>3주차 사용자·문제·주제 확정.</li><li>4주차 MVP·IA·User Flow·Wireframe.</li><li>5주차 JavaScript 기본 연결.</li><li>6주차 JSON 명세와 샘플 데이터.</li><li>7주차 JSON 목록 렌더링.</li><li>8주차 중간평가와 수정 계획.</li><li>9주차 검색·필터·정렬.</li><li>10주차 상세보기·인터랙션.</li><li>11주차 LocalStorage 기초 기능.</li><li>12주차 개인화 3개 이상 및 선택 심화.</li><li>13주차 사용자 테스트·버그·회귀 테스트.</li><li>14주차 최종 QA·배포·시연 준비.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>산출물</strong><ul><li>최종 배포 URL.</li><li>최종 QA 체크 결과.</li><li>발표 시연 시나리오.</li><li>1~14주차 누적 산출물 정리.</li></ul></div>`},
15:{content:String.raw`
<details class="track-toggle"><summary>트랙별 학습 안내</summary><div class="track-toggle-body"><div class="callout blue"><strong>✅ 필수 트랙</strong><ul><li>JSON 기반 데이터 서비스, 검색·필터·정렬, 상세보기, LocalStorage 개인화, 사용자 테스트와 실제 배포 결과를 중심으로 최종 완성도를 평가한다.</li><li>기말고사는 9~14주차 학습 내용을 범위로 하는 개인별 주관식 + 객관식 필기시험으로 함께 운영한다.</li></ul></div><div class="callout purple"><strong>🚀 심화 트랙</strong><ul><li>API·클라우드 DB·인증 등 선택 기술은 프로젝트 문제 해결에 실제로 필요한지, 안정적으로 동작하는지, 팀이 구조를 설명할 수 있는지를 확인한다.</li><li>심화 기술을 사용했다는 사실만으로 추가 점수를 부여하지 않는다.</li></ul></div></div></details>
<h1>학습목표</h1><ul><li>9~14주차 핵심 개념을 필기시험에서 설명하고 적용할 수 있다.</li><li>프로젝트 문제와 해결 과정, 핵심 기능, 데이터 구조, 사용자 테스트와 개선 결과를 논리적으로 발표할 수 있다.</li><li>실제 배포된 웹서비스를 안정적으로 시연하고 프로젝트의 성과·한계·다음 단계를 설명할 수 있다.</li></ul>
<h1>준비물 및 평가환경</h1><ul><li>최종 배포 URL과 프로젝트 저장소를 준비한다.</li><li>발표용 노트북에서 배포 URL이 정상 접속되는지 확인한다.</li><li>JSON 데이터와 이미지 경로가 배포 환경에서 정상인지 확인한다.</li><li>발표 전 LocalStorage 초기 상태와 시연용 저장 상태를 각각 확인한다.</li><li>네트워크 문제에 대비해 실행 가능한 로컬 프로젝트 파일과 화면 캡처를 함께 준비한다.</li></ul>
<h1>1. 기말고사｜개인 필기시험</h1><h2>1.1 평가 범위</h2><ul><li>9주차 검색·필터·정렬.</li><li>10주차 상세보기와 인터랙션.</li><li>11주차 LocalStorage 기초.</li><li>12주차 개인화 기능과 선택형 API·클라우드 DB.</li><li>13주차 프로젝트 통합·테스트·버그 기록.</li><li>14주차 QA·배포·운영 환경.</li></ul><h2>1.2 평가 방식</h2><ul><li>개인별 주관식 + 객관식 필기시험으로 운영한다.</li><li>코드 일부를 보고 오류 원인이나 실행 결과를 판단하는 문항을 포함할 수 있다.</li></ul>
<h1>2. 최종 팀프로젝트 발표</h1><h2>2.1 발표 흐름</h2><ol><li>프로젝트명과 한 줄 서비스 정의.</li><li>핵심 사용자(Target User)와 사용자 문제(Pain Point).</li><li>조사에서 발견한 기회 영역과 핵심 가치(Value Proposition).</li><li>MVP와 핵심 기능.</li><li>데이터 구조와 JSON 기본 데이터 역할.</li><li>대표 사용자 흐름(User Flow) 시연.</li><li>검색·복수 필터·정렬·상세보기 시연.</li><li>LocalStorage 개인화 기능 3개 이상 시연.</li><li>도메인 특화 핵심 기능 시연.</li><li>사용자 테스트에서 발견한 문제와 개선 결과.</li><li>실제 배포 URL과 최종 서비스 상태.</li><li>프로젝트 한계와 다음 단계.</li></ol>
<h2>2.2 발표 운영 기준</h2><ul><li>팀별 발표는 약 7~10분을 기준으로 운영한다.</li><li>질의응답은 팀당 약 3~5분을 기준으로 운영한다.</li><li>모든 팀원이 발표 또는 시연 과정에서 자신의 담당 영역을 설명한다.</li><li>발표 자료만 보여주지 않고 실제 배포 서비스를 반드시 시연한다.</li></ul>
<h1>3. 팀프로젝트 평가 기준</h1><table><thead><tr><th>평가 영역</th><th>확인 내용</th><th>우수 기준</th></tr></thead><tbody><tr><td>문제 정의와 기획</td><td>사용자·문제·조사 근거·MVP 연결.</td><td>기능이 사용자 문제와 직접 연결되고 범위가 명확하다.</td></tr><tr><td>데이터와 핵심 기능</td><td>JSON 30건 이상, 최소 8개 의미 있는 필드, 검색·복수 필터·정렬·상세.</td><td>데이터 구조가 일관되고 모든 핵심 기능이 연결되어 동작한다.</td></tr><tr><td>개인화와 특화 기능</td><td>LocalStorage 개인화 3개 이상, 도메인 특화 기능.</td><td>실제 사용자 편의와 판단을 개선한다.</td></tr><tr><td>사용성·테스트·개선</td><td>빈 상태·오류 상태·반응형·사용자 테스트·회귀 테스트.</td><td>발견한 문제를 근거로 품질을 실제 개선한다.</td></tr><tr><td>배포와 발표</td><td>실제 URL·안정성·설명력·시연.</td><td>배포 환경에서도 안정적으로 동작하고 구조와 한계를 설명한다.</td></tr></tbody></table>
<div class="callout blue"><strong>평가 원칙</strong>팀프로젝트는 팀원 평가와 교수자 평가를 50:50으로 반영하며 심화 기술 사용 여부 자체는 점수가 아니다.</div>
<h1>4. 최종 제출 항목</h1><ul><li>실제 접속 가능한 배포 URL.</li><li>최종 프로젝트 전체 파일 또는 저장소 주소.</li><li>최종 발표자료.</li><li>프로젝트 보고서.</li><li>13주차 사용자 테스트 결과서와 오류·개선 목록.</li><li>14주차 최종 QA 체크 결과.</li><li>팀원별 역할과 기여도 정리.</li><li>개인 회고서.</li></ul>
<h1>5. 최종 발표 전 체크리스트</h1><ul><li>배포 URL이 정상적으로 열린다.</li><li>JSON 데이터가 30건 이상 준비되어 있다.</li><li>의미 있는 필드가 최소 8개 이상이다.</li><li>검색, 복수 필터, 정렬, 상세보기가 정상 동작한다.</li><li>LocalStorage 개인화 기능이 3개 이상 동작한다.</li><li>결과 없음과 주요 오류 상태가 처리되어 있다.</li><li>모바일에서도 대표 사용자 흐름을 완료할 수 있다.</li><li>모든 팀원이 자신의 역할과 구현 내용을 설명할 수 있다.</li></ul>
<h1>6. 프로젝트 회고(Project Retrospective)</h1><ul><li>내가 담당한 역할과 실제 작업.</li><li>가장 어려웠던 문제와 해결 과정.</li><li>처음 계획에서 변경된 내용과 변경 이유.</li><li>사용자 테스트에서 가장 중요했던 발견.</li><li>다시 만든다면 가장 먼저 개선할 부분.</li><li>이번 프로젝트에서 이해하게 된 웹서비스 데이터 흐름.</li><li>팀 협업에서 잘된 점과 다음에 바꾸고 싶은 점.</li></ul>
<h1>이번 주차 작업되어야 할 산출물</h1><div class="callout green"><strong>최종 제출</strong><ul><li>기말 필기시험.</li><li>최종 실행 URL·파일.</li><li>발표자료와 프로젝트 보고서.</li><li>테스트 결과서와 QA 결과.</li><li>개인 회고서.</li></ul></div>`}
};
