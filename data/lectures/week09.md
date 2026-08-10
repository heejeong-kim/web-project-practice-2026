<details>
<summary>트랙별 학습 안내</summary>
	<callout icon="✅" color="blue_bg">
		**필수 트랙**
		- JSON 데이터에 검색, 2개 이상의 결합 가능한 필터, 정렬을 구현한다.
		- 현재 결과 건수와 검색 결과 없음 상태를 함께 제공한다.
	</callout>
	<callout icon="🚀" color="purple_bg">
		**심화 트랙**
		- API나 클라우드 DB를 사용할 팀도 먼저 샘플 JSON에서 동일한 검색·필터·정렬 로직을 완성한다.
		- 외부 서비스 검색 기능에만 의존하지 않고 우리 서비스 사용자의 조건을 별도로 정의한다.
	</callout>
</details>
---
# 학습목표
- 검색(Search), 필터(Filter), 정렬(Sort)의 차이와 역할을 설명할 수 있다.
- 여러 검색·필터 조건을 결합해 JSON 데이터에서 원하는 결과를 만들 수 있다.
- 공통 프로젝트 B와 팀 프로젝트에 결과 건수·초기화·검색 결과 없음 상태를 포함한 탐색 기능을 구현할 수 있다.
---
# 준비물 및 수업환경
- 7주차까지 구현한 JSON 기반 목록 화면을 준비한다.
- 중간평가 피드백 중 검색·필터·데이터와 관련된 항목을 정리한다.
- Visual Studio Code와 로컬 서버 환경을 준비한다.
- 공통 프로젝트 B의 여행지 탐색 서비스 스타터 파일을 준비한다.
<callout icon="💡" color="yellow_bg">
	- 5\~7주차 공통 프로젝트 A에서는 데이터 → 화면 렌더링 패턴을 익혔다.
	- 9주차 공통 프로젝트 B에서는 같은 렌더링 구조에 검색·복수 필터·정렬을 추가해 데이터 → 조건 처리 → 화면 패턴으로 확장한다.
	- 공통 프로젝트 주제는 바뀌지만 renderItems처럼 이미 학습한 함수 구조는 그대로 재사용한다.
	- 검색·필터·정렬은 각각 따로 동작하는 기능이 아니라 하나의 결과 목록에 함께 적용되어야 한다.
</callout>
# 1. \[이론+실습\] 검색과 필터의 원리
## 1.1 검색(Search)
### 1.1.1 검색이 하는 일
- 검색은 사용자가 입력한 단어와 데이터의 특정 필드를 비교해 일치하는 항목을 찾는다.
- 제목만 검색할지 설명과 태그까지 검색할지 범위를 미리 정한다.
- 대소문자와 앞뒤 공백을 정리하면 검색 결과가 더 일관된다.
---
### 1.1.2 검색 예시
```javascript
function searchItems(items, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return items;

  return items.filter(item =>
    item.title.toLowerCase().includes(normalizedKeyword)
  );
}
```
- filter는 조건을 만족하는 항목만 새로운 배열로 만든다.
- 원본 배열을 직접 수정하지 않고 결과 배열을 만든다.
---
## 1.2 필터(Filter)
### 1.2.1 검색과 필터의 차이
- 검색은 사용자가 직접 입력한 단어를 기준으로 찾는다.
- 필터는 미리 정해진 조건을 선택해 범위를 좁힌다.
- 여행지 서비스에서는 지역, 테마, 비용, 실내·실외 여부가 필터가 될 수 있다.
---
### 1.2.2 단일 필터 예시
```javascript
function filterByRegion(items, region) {
  if (region === '전체') return items;

  return items.filter(item => item.region === region);
}
```
- 전체 조건은 원본 결과를 그대로 유지한다.
- 필터 값은 JSON에서 사용하는 값과 정확히 일치해야 한다.
---
## 1.3 복수 조건 결합
### 1.3.1 조건이 여러 개일 때
- 지역이 서울이고 실내이며 무료인 장소처럼 여러 조건을 동시에 적용할 수 있다.
- 각 필터를 독립적으로 처리한 뒤 순서대로 연결하거나 하나의 조건식으로 결합할 수 있다.
- 사용자에게는 현재 선택된 조건이 무엇인지 보여주는 것이 중요하다.
---
### 1.3.2 결합 필터 예시
```javascript
function applyFilters(items, region, theme, isFree) {
  return items.filter(item => {
    const matchRegion = region === '전체' || item.region === region;
    const matchTheme = theme === '전체' || item.theme === theme;
    const matchPrice = !isFree || item.price === 0;

    return matchRegion && matchTheme && matchPrice;
  });
}
```
---
# 2. \[이론+실습\] 정렬과 전체 조건 처리
## 2.1 정렬(Sort)
### 2.1.1 정렬이 하는 일
- 정렬은 결과에 포함되는 데이터 자체를 줄이지 않고 순서만 바꾼다.
- 이름순, 평점순, 가격순, 날짜순처럼 사용자가 판단하기 좋은 기준을 제공한다.
- 정렬 기준은 데이터의 자료형과 연결된다.
---
### 2.1.2 정렬 함수 예시
```javascript
function sortItems(items, sortType) {
  const copiedItems = [...items];

  if (sortType === 'rating-desc') {
    return copiedItems.sort((a, b) => b.rating - a.rating);
  }

  if (sortType === 'name-asc') {
    return copiedItems.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }

  return copiedItems;
}
```
- 원본 배열을 보호하기 위해 복사한 배열을 정렬한다.
- updateResults에서 호출하는 함수 이름과 실제 정의된 함수 이름을 일치시킨다.
- 높은 평점순인지 이름순인지 정렬 방향을 화면에 명확하게 표시한다.
---
## 2.2 검색·필터·정렬 처리 순서
### 2.2.1 하나의 결과 배열 만들기
- 원본 데이터에서 시작한다.
- 검색 조건을 적용한다.
- 필터 조건을 적용한다.
- 마지막으로 정렬한다.
- 최종 결과를 renderItems에 전달한다.
---
### 2.2.2 상태 선언과 전체 처리 예시
```javascript
let allItems = [];
let currentKeyword = '';
let currentRegion = '전체';
let currentTheme = '전체';
let currentFreeOnly = false;
let currentSort = 'rating-desc';

function updateResults() {
  let results = [...allItems];

  results = searchItems(results, currentKeyword);
  results = applyFilters(results, currentRegion, currentTheme, currentFreeOnly);
  results = sortItems(results, currentSort);

  renderItems(results);
}
```
- allItems에는 JSON에서 불러온 원본 배열을 보관한다.
- current로 시작하는 변수는 현재 화면의 검색·필터·정렬 상태를 보관한다.
- 7주차에서 만든 renderItems가 결과 건수와 빈 상태까지 함께 처리하므로 같은 결과 배열을 한 번 전달한다.
- 사용자 상태 값이 바뀔 때마다 updateResults를 다시 실행한다.
---
## 2.3 상태(State)
### 2.3.1 현재 조건을 변수로 관리하기
- 현재 검색어
- 현재 선택 지역
- 현재 선택 테마
- 무료만 보기 여부
- 현재 정렬 기준
- 이런 값은 현재 화면이 어떤 상태인지 설명하는 상태(State)로 볼 수 있다.
---
### 2.3.2 초기화 기능
- 모든 조건을 기본값으로 되돌린다.
- 검색 입력창도 비운다.
- 필터 버튼의 선택 상태도 해제한다.
- 결과 목록을 전체 데이터로 되돌린다.
---
# 3. \[실습\] 공통 프로젝트 B와 팀 프로젝트 적용
## 3.1 공통 프로젝트 B｜여행지 탐색 서비스
### 3.1.1 데이터 예시 필드
- id
- name
- region
- theme
- price
- rating
- indoor
- tags
- description
---
### 3.1.2 구현할 조건
- 장소명 검색
- 지역 필터
- 테마 필터
- 무료만 보기
- 평점 높은 순 정렬
- 이름순 정렬
- 결과 건수
- 조건 초기화
- 결과 없음 상태
---
## 3.2 검색 결과 없음 상태
### 3.2.1 사용자에게 알려줄 것
- 조건에 맞는 결과가 없다는 사실
- 현재 선택한 조건을 바꿔볼 수 있다는 안내
- 전체 조건을 초기화할 수 있는 행동
- 단순 빈 화면으로 두지 않는다.
---
### 3.2.2 문구 예시
- 선택한 조건에 맞는 장소가 없습니다.
- 지역이나 테마 조건을 변경해 보세요
- 모든 조건 초기화
---
## 3.3 팀 프로젝트 적용
### 3.3.1 필수 구현 기준
- 검색 1개 이상
- 동시에 적용 가능한 필터 2개 이상
- 정렬 1개 이상
- 결과 건수 표시
- 검색 결과 없음 상태
- 전체 조건 초기화
---
### 3.3.2 프로젝트별 조건 예시
<table header-row="true">
<tr><td>프로젝트</td><td>검색</td><td>필터</td><td>정렬</td></tr>
<tr><td>공모전</td><td>공모전명</td><td>분야, 참가대상</td><td>마감일순</td></tr>
<tr><td>자격증</td><td>자격증명</td><td>분야, 난이도</td><td>시험일순</td></tr>
<tr><td>식물</td><td>식물명</td><td>빛 환경, 관리 난이도</td><td>관리 쉬운 순</td></tr>
</table>
---
## 3.4 도메인 특화 핵심 기능
### 3.4.1 공통 기능만으로 끝내지 않기
- 모든 팀이 검색·필터·정렬을 구현하더라도 프로젝트마다 한 가지 이상의 특화 판단 기능을 추가한다.
- 공모전은 마감 임박 여부를 표시할 수 있다.
- 자격증은 직무 관심과 난이도를 함께 보여줄 수 있다.
- 식물은 빛 환경과 물주기 주기를 기준으로 적합 여부를 표시할 수 있다.
---
### 3.4.2 특화 기능 판단 기준
- 핵심 사용자 문제와 직접 연결되는가
- 기존 검색·필터를 단순 반복하는 기능이 아닌가
- 현재 데이터 구조로 구현 가능한가
- 결과를 사용자가 이해할 수 있는가
---
## 3.5 심화 트랙 준비
### 3.5.1 외부 데이터와 검색 처리
- 외부 API에서 검색 결과를 바로 받아오는 경우에도 우리 서비스의 추가 필터가 필요할 수 있다.
- API가 지원하지 않는 조건은 클라이언트에서 별도로 처리할 수 있다.
- 대량 데이터 API는 모든 데이터를 한 번에 가져오기보다 제공 방식과 호출 제한을 확인해야 한다.
---
# 9주차 핵심 정리
- 검색은 입력 단어, 필터는 미리 정한 조건, 정렬은 결과 순서를 다룬다.
- 검색·필터·정렬은 하나의 상태와 결과 배열로 연결해 처리한다.
- 원본 데이터와 현재 결과 데이터를 구분하면 조건 초기화와 디버깅이 쉬워진다.
- 결과 건수와 결과 없음 상태도 탐색 경험의 중요한 일부다.
- 팀프로젝트는 공통 탐색 기능 외에 도메인 특화 핵심 기능을 최소 하나 포함한다.
---
# 이번 주차 작업되어야 할 산출물
- 공통 프로젝트 B 검색·필터·정렬 구현 결과
- 팀 프로젝트 검색 기능
- 결합 가능한 필터 2개 이상
- 정렬 기능 1개 이상
- 결과 건수와 결과 없음 화면
- 전체 조건 초기화
- 도메인 특화 핵심 기능 정의
<callout icon="📌" color="gray_bg">
	매주차 산출물을 체크하지 않으나 최종 팀 프로젝트 완료 시 한꺼번에 취합한다.
</callout>
<details>
<summary>\[참고\] 9주차｜검색·필터·정렬 기능 점검 템플릿</summary>
	- 검색 대상 필드:
	- 필터 1:
	- 필터 2:
	- 추가 필터:
	- 정렬 기준:
	- 현재 조건 상태 변수:
	- 결과 건수 표시 위치:
	- 결과 없음 문구:
	- 초기화 동작:
	- 도메인 특화 핵심 기능:
	- 테스트 조건 1:
	- 테스트 조건 2:
	- 테스트 조건 3:
</details>