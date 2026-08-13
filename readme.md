# 웹프로젝트 실습 · 2026-2

2026년 2학기 **웹프로젝트 실습** 강의 및 실습용 GitHub Pages 저장소입니다.

- Live site: https://heejeong-kim.github.io/web-project-practice-2026/
- 기술 범위: HTML, CSS, JavaScript, JSON, LocalStorage
- 기본 트랙: 반응형 UI, 데이터 렌더링, 검색·필터·정렬, 상세보기, 개인화, 배포
- 심화 트랙: 프로젝트 목적에 필요한 경우 API 및 Cloud DB 선택 적용

## 현재 공개 교안

- OT
- 1주차 · 웹프로젝트 이해

2~15주차 강의교안은 준비가 완료될 때까지 비활성화합니다.

## 저장소 구조

```text
web-project-practice-2026/
├─ index.html
├─ readme.md
├─ asset/
│  ├─ ot.png
│  └─ 1.png ... 15.png
├─ css/
│  ├─ course.css
│  └─ lecture.css
├─ data/
│  ├─ weeks.js
│  ├─ lectures/
│  │  ├─ week00.md
│  │  └─ week01.md
│  └─ samples/
│     ├─ caferaon.html
│     └─ caferaon_db.html
├─ js/
│  ├─ course.js
│  └─ lecture.js
└─ lecture/
   └─ index.html
```

## 페이지 구조

- 메인: `/index.html`
- 강의교안: `/lecture/?week=00`, `/lecture/?week=01`
- 미공개 주차는 메인 카드와 강의교안 셀렉트에서 비활성화

## 교안 표시 기준

- 강의 본문 기본 글자 크기: 18px
- 콜아웃: 아이콘 + 본문 그리드 정렬
- 테이블: 첫 행 회색 배경, 내용 길이에 따른 유동 높이
- 연속 구분선은 하나만 표시
- 교안 헤더는 스크롤 시 상단 고정
- 모바일에서는 본문 시작 전에 주차 선택 셀렉트 표시
- `교안 제작 참고`는 회색 톤, 13.5px로 표시

## 데이터 디렉토리

기존 `data`와 `dataset` 중복 구조를 `data`로 통합합니다. 수업용 샘플 HTML은 `data/samples/`에서 관리합니다.
