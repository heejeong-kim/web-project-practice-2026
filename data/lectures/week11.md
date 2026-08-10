<details>
<summary>트랙별 학습 안내</summary>
	<callout icon="✅" color="blue_bg">
		**필수 트랙**
		- LocalStorage를 즐겨찾기, 최근 본 항목, 완료 상태, 설정과 같은 개인 브라우저 상태에 사용한다.
		- 가능하면 전체 객체가 아니라 데이터 ID와 필요한 상태만 저장한다.
	</callout>
	<callout icon="🚀" color="purple_bg">
		**심화 트랙**
		- 여러 사용자 또는 여러 기기에서 같은 상태를 공유해야 하는 경우 LocalStorage의 한계를 확인하고 12주차 클라우드 DB 선택 실습으로 연결한다.
		- 필수 개인화 기능을 먼저 완성한 뒤 심화 저장 방식을 선택한다.
	</callout>
</details>
---
# 학습목표
- LocalStorage의 특징과 한계를 JSON 기본 데이터 및 클라우드 데이터베이스와 비교해 설명할 수 있다.
- 문자열 저장과 JSON.stringify·JSON.parse를 이용해 사용자 상태를 저장하고 복원할 수 있다.
- 공통 프로젝트 C와 팀 프로젝트에 즐겨찾기·최근 본 항목·완료 상태 같은 개인화(Personalization) 기능을 설계할 수 있다.
---
# 준비물 및 수업환경
- 10주차까지 완성한 목록·검색·필터·정렬·상세보기 기능을 준비한다.
- 각 데이터가 고유 ID를 가지고 있는지 확인한다.
- Visual Studio Code와 브라우저 개발자 도구를 준비한다.
- 공통 프로젝트 C의 학습 콘텐츠·목표 관리 스타터 파일을 준비한다.
<callout icon="💡" color="yellow_bg">
	- LocalStorage는 팀 공용 데이터베이스가 아니다.
	- 이번 주에는 서비스 기본 데이터는 JSON에 두고 사용자마다 달라지는 브라우저 상태만 LocalStorage에 저장한다.
</callout>
# 1. \[이론+실습\] LocalStorage 이해
## 1.1 클라이언트 저장소(Client-side Storage)
### 1.1.1 LocalStorage란 무엇인가
- LocalStorage는 웹브라우저가 현재 사이트에 제공하는 저장 공간이다.
- 페이지를 새로 고쳐도 저장한 값이 남을 수 있다.
- 서버에 전송하거나 다른 사용자와 공유되는 저장소가 아니다.
- 같은 서비스라도 브라우저나 기기가 바뀌면 저장 상태가 달라질 수 있다.
---
### 1.1.2 LocalStorage가 적합한 데이터
- 즐겨찾기한 항목 ID
- 최근 본 항목 ID
- 학습 완료 여부
- 다크모드 같은 화면 설정
- 최근 사용한 필터 조건
- 사용자의 개인 메모처럼 현재 브라우저에서만 사용해도 되는 정보
---
### 1.1.3 LocalStorage가 부적합한 데이터
- 모든 사용자가 함께 봐야 하는 게시글
- 사용자 간 공유되는 댓글과 리뷰
- 팀원 모두가 같은 상태를 봐야 하는 일정
- 결제 정보와 비밀번호 같은 민감 정보
- 서버에서 검증해야 하는 로그인 권한 정보
---
## 1.2 JSON과 LocalStorage 비교
### 1.2.1 역할을 다시 구분하기
<table header-row="true">
<tr><td>구분</td><td>JSON</td><td>LocalStorage</td></tr>
<tr><td>데이터 성격</td><td>서비스 공통 기본 데이터</td><td>사용자 개인 상태</td></tr>
<tr><td>예시</td><td>학습 콘텐츠 30건</td><td>완료한 콘텐츠 ID</td></tr>
<tr><td>GitHub 공유</td><td>가능</td><td>불가</td></tr>
<tr><td>다른 브라우저 공유</td><td>배포된 JSON은 동일</td><td>불가</td></tr>
<tr><td>사용자별 변경</td><td>기본적으로 읽기 중심</td><td>가능</td></tr>
</table>
---
## 1.3 저장·조회·삭제 기본 사용
### 1.3.1 문자열 저장
```javascript
localStorage.setItem('theme', 'dark');
```
---
### 1.3.2 값 불러오기
```javascript
const theme = localStorage.getItem('theme');
```
---
### 1.3.3 값 삭제
```javascript
localStorage.removeItem('theme');
```
- LocalStorage는 기본적으로 문자열을 저장한다.
- 배열과 객체는 바로 저장하지 않고 문자열로 변환해야 한다.
---
# 2. \[이론+실습\] 배열과 객체 상태 저장
## 2.1 직렬화(Serialization)와 역직렬화(Deserialization)
### 2.1.1 JSON.stringify
```javascript
const favorites = [1, 3, 7];
localStorage.setItem('favorites', JSON.stringify(favorites));
```
- 배열을 문자열로 변환해 저장한다.
---
### 2.1.2 JSON.parse와 손상 데이터 처리
```javascript
function loadStoredArray(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`${key} 저장 데이터를 읽을 수 없습니다`, error);
    localStorage.removeItem(key);
    return [];
  }
}

const favorites = loadStoredArray('favorites');
```
- 저장된 문자열을 다시 배열로 변환한다.
- 처음 방문한 사용자처럼 저장값이 없으면 빈 배열을 사용한다.
- 개발 중 잘못된 문자열이 저장되었거나 데이터가 손상된 경우 JSON.parse에서 오류가 발생할 수 있으므로 예외를 처리한다.
- 배열을 기대하는 키에 객체나 다른 자료형이 저장된 경우도 기본값으로 복구한다.
---
## 2.2 ID만 저장하는 이유
### 2.2.1 전체 객체 저장과 ID 저장 비교
- JSON 원본에 이미 제목·설명·이미지가 있다면 LocalStorage에 같은 정보를 중복 저장할 필요가 없다.
- 즐겨찾기 목록에는 ID만 저장하고 화면을 그릴 때 JSON 원본에서 같은 ID를 찾는다.
- 원본 데이터가 수정되면 최신 기본 정보를 그대로 사용할 수 있다.
<table header-row="true">
<tr><td>저장 방식</td><td>예시</td><td>판단</td></tr>
<tr><td>전체 객체 중복 저장</td><td>제목·이미지·설명 전체</td><td>중복이 많아 관리가 어려움</td></tr>
<tr><td>ID 저장</td><td>1, 3, 7</td><td>원본 데이터와 연결하기 쉬움</td></tr>
</table>
---
## 2.3 즐겨찾기 토글(Toggle)
### 2.3.1 추가·제거·화면 갱신
```javascript
function toggleFavorite(id) {
  const favorites = loadStoredArray('favorites');

  const nextFavorites = favorites.includes(id)
    ? favorites.filter(itemId => itemId !== id)
    : [...favorites, id];

  localStorage.setItem('favorites', JSON.stringify(nextFavorites));

  updateResults();
  openDetail(id);
}
```
- 이미 저장된 ID면 제거하고 없으면 추가한다.
- 저장 직후 9주차의 updateResults를 다시 호출해 현재 목록의 즐겨찾기 상태를 갱신한다.
- 상세화면에서 실행한 경우 openDetail로 같은 데이터를 다시 그려 목록과 상세의 상태를 맞춘다.
- 상세 모달이 열려 있지 않은 화면에서는 openDetail 호출을 생략하도록 프로젝트 구조에 맞게 분기할 수 있다.
---
# 3. \[실습\] 공통 프로젝트 C와 개인화 설계
## 3.1 공통 프로젝트 C｜학습 콘텐츠·목표 관리
### 3.1.1 JSON 기본 데이터
- 학습 콘텐츠 약 30건
- 제목
- 카테고리
- 난이도
- 예상 시간
- 태그
- 설명
---
### 3.1.2 LocalStorage 사용자 상태
- 즐겨찾기 ID
- 완료한 콘텐츠 ID
- 최근 본 콘텐츠 ID
- 개인 메모
- 화면 설정
---
## 3.2 최근 본 항목
### 3.2.1 최근 본 데이터 설계
- 상세보기를 열 때 선택한 ID를 최근 본 목록 앞에 추가한다.
- 같은 ID가 이미 있다면 중복을 제거한 뒤 앞으로 이동할 수 있다.
- 최근 5개 또는 10개처럼 표시 개수를 제한할 수 있다.
---
### 3.2.2 사용자 경험 예시
- 사용자가 어제 확인한 학습 콘텐츠를 다시 찾을 때 검색을 반복하지 않아도 된다.
- 여행지·공모전·자격증 서비스에도 같은 패턴을 적용할 수 있다.
---
## 3.3 완료 상태와 개인화 화면
### 3.3.1 JSON과 사용자 상태 결합
- JSON에는 콘텐츠 자체의 정보가 있다.
- LocalStorage에는 사용자가 완료했는지 여부가 있다.
- 화면을 그릴 때 ID를 기준으로 두 상태를 연결한다.
<table header-row="true">
<tr><td>기본 데이터</td><td>사용자 상태</td><td>최종 화면</td></tr>
<tr><td>학습 콘텐츠 ID 3</td><td>완료 ID 목록에 3 포함</td><td>완료 표시된 카드</td></tr>
<tr><td>공모전 ID 8</td><td>즐겨찾기 목록에 8 포함</td><td>별표가 활성화된 카드</td></tr>
</table>
---
## 3.4 개인화(Personalization) 기능 후보
### 3.4.1 프로젝트별 예시
<table header-row="true">
<colgroup><col><col width="310"></colgroup>
<tr><td>프로젝트</td><td>개인화 기능 예시</td></tr>
<tr><td>공모전</td><td>관심 공모전, 최근 본 공모전, 관심 분야 기억</td></tr>
<tr><td>자격증</td><td>준비 목록, 확인 완료, 최근 본 자격증</td></tr>
<tr><td>식물</td><td>관심 식물, 최근 본 식물, 관리 난이도 설정</td></tr>
<tr><td>운동</td><td>찜한 루틴, 완료 체크, 선호 난이도</td></tr>
</table>
---
## 3.5 팀 프로젝트 개인화 설계
### 3.5.1 최소 기준
- 프로젝트 목적에 맞는 개인화 기능을 최종적으로 3개 이상 목표로 한다.
- 11주차에는 최소 1\~2개를 먼저 구현한다.
- 각 기능이 사용자 문제와 어떤 관계가 있는지 작성한다.
- 단순히 LocalStorage를 사용했다는 이유만으로 기능을 추가하지 않는다.
---
### 3.5.2 저장 키(Key) 규칙
- 키 이름만 보고 저장 내용을 이해할 수 있게 정한다.
- 한 기능에 필요한 상태를 여러 키로 지나치게 분산하지 않는다.
- 팀원끼리 저장 키와 데이터 형식을 문서로 공유한다.
---
## 3.6 LocalStorage 한계 직접 확인
### 3.6.1 실습
- Chrome에서 즐겨찾기 데이터를 저장한다.
- 다른 브라우저 또는 시크릿 창에서 같은 서비스에 접속한다.
- 저장 상태가 공유되지 않는 것을 확인한다.
- 브라우저 저장 데이터를 삭제한 뒤 상태가 사라지는 것을 확인한다.
---
### 3.6.2 이 한계가 의미하는 것
- LocalStorage는 실제 다중 사용자 서비스의 데이터베이스를 대신하지 않는다.
- 사용자별 계정 동기화가 필요하면 서버 또는 클라우드 DB가 필요하다.
- 이 경험을 바탕으로 12주차 심화 트랙에서 API와 클라우드 DB의 역할을 비교한다.
<callout icon="📌" color="blue_bg">
	- 참고 자료｜[MDN Web Storage API](https://developer.mozilla.org/ko/docs/Web/API/Web_Storage_API)
</callout>
---
# 11주차 핵심 정리
- LocalStorage는 현재 브라우저에 사용자 상태를 저장한다.
- 배열과 객체는 JSON.stringify로 저장하고 JSON.parse로 복원한다.
- 서비스 기본 데이터와 사용자 상태는 분리해 관리한다.
- 전체 객체를 중복 저장하기보다 ID 중심으로 상태를 연결하는 방식이 유용하다.
- 다른 사용자와 데이터를 공유해야 하는 요구가 있다면 LocalStorage가 아니라 클라우드 저장 방식이 필요하다.
---
# 이번 주차 작업되어야 할 산출물
- 공통 프로젝트 C LocalStorage 저장 결과
- 팀 프로젝트 개인화 기능 1\~2개 구현
- 저장 키와 데이터 형식 정의
- JSON 기본 데이터 + LocalStorage 사용자 상태 결합 화면
- LocalStorage 한계 확인 기록
<callout icon="📌" color="gray_bg">
	매주차 산출물을 체크하지 않으나 최종 팀 프로젝트 완료 시 한꺼번에 취합한다.
</callout>
<details>
<summary>\[참고\] 11주차｜LocalStorage 개인화 설계 템플릿</summary>
	- 개인화 기능 1:
	- 해결하는 사용자 문제:
	- 저장 키:
	- 저장 데이터 형식:
	- JSON과 연결할 ID:
	- 개인화 기능 2:
	- 저장 키:
	- 기본값:
	- 저장 데이터가 없을 때 처리:
	- 다른 브라우저에서 테스트 결과:
	- LocalStorage로 해결할 수 없는 요구:
</details>