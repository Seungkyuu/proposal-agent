# Agent Skill 08: B2B 제안서 슬라이드 구조 명세 (V6. 18~20슬라이드 표준)

## 1. 개요

본 사양은 B2B 교육 제안서의 표준 슬라이드 구성과 각 슬라이드별 콘텐츠 명세를 정의한다.
슬라이드 수는 기본 18장이며, Skill 00 요구사항 정의서의 산출물 스펙에 따라 최대 20장까지 확장된다.

**알파코 회사 소개 슬라이드는 기존 레퍼런스 덱을 참고하여 사용자가 직접 제작하므로, 에이전트는 콘텐츠 기획 없이 구조 설계안에 슬라이드 번호만 지정한다.**

---

## 2. 표준 슬라이드 구성 (18장 기본)

```
[표지]                                          ← 항상 포함
[목차]                                          ← 항상 포함

── Section 1: 제안 배경 ──
  S1-1. 제안 배경 및 필요성

── Section 2: 알파코 소개 ──
  S2-1. 알파코 회사 소개                        ← 소스 덱에서 자동 제공
  S2-2. 수행 실적

── Section 3: 교육 설계 ──
  S3-1. 교수설계 철학
  S3-2. 교육 목표 및 과목 개요
  S3-3. 커리큘럼 상세표

── Section 4: 알파코 강점 ──
  S4-1. 3대 독보적 강점 (USP)

── Section 5: 운영 계획 ──
  S5-1. 교육 운영 일정
  S5-2. KPI 및 사후관리
  S5-3. 견적                                    ← Skill 00 5-3 포함 여부에 따라 결정

[클로징]                                        ← 항상 포함
```

**섹션 구분 슬라이드(SECTION_DIVIDER) 5개 + 콘텐츠 슬라이드 11개 + 표지·목차·클로징 3개 = 기본 18장**
견적 포함 시 19장, 추가 커리큘럼 슬라이드 필요 시 20장.

---

## 3. 슬라이드별 콘텐츠 명세

### 표지 (TITLE_SLIDE)
- 고객사명 + 교육과정명 핵심 헤드라인
- 교육 대상·인원·총 시간 요약
- 제안사명(알파코), 제안 연월
- layout_type: `TITLE_SLIDE`

### 목차 (TABLE_OF_CONTENTS)
- Section 1~5 제목 나열
- layout_type: `TABLE_OF_CONTENTS`

### 섹션 구분 슬라이드 × 5 (SECTION_DIVIDER)
- 해당 섹션 번호 + 제목
- layout_type: `SECTION_DIVIDER`

### S1-1. 제안 배경 및 필요성
- 좌측: 현재 고객사의 구조적 한계 (As-Is) — Skill 01 리서치 기반
- 우측: 교육 후 전환 성과 (To-Be)
- layout_type: `PROBLEM_VS_SOLUTION`

### S2-1. 알파코 회사 소개 (COMPANY_INTRO)
- 레퍼런스 덱에서 사용자가 직접 가져오는 슬라이드. 에이전트는 콘텐츠 작성 불필요.
- 03_content.md에서 해당 슬라이드는 "[알파코 회사 소개 — 기존 덱에서 그대로 사용]" 표시.
- layout_type: `COMPANY_INTRO`

### S2-2. 수행 실적 (VENDOR_PROFILE)
- Skill 00 4-1에서 확정된 레퍼런스 고객사명 기반 작성
- 공개 가능 고객사명 사용, 불가 시 업종+규모 익명 처리
- 익명 가상 데이터("서울시 투자기관 A") 사용 절대 금지
- 표 구성: 프로젝트명 | 고객사 | 과정 내용 | 기간 | 인원 | 만족도
- layout_type: `VENDOR_PROFILE`

### S3-1. 교수설계 철학 (FLOW_CHART)
- Skill 04에서 선택된 교수설계 모델 기반 3~4단계 흐름
- layout_type: `FLOW_CHART`

### S3-2. 교육 목표 및 과목 개요 (N_COLUMN_CARDS)
- 과목 수에 맞는 카드 구성 (2~4개)
- 각 카드: 과목명 + 핵심 역량 + 대표 산출물
- layout_type: `N_COLUMN_CARDS`

### S3-3. 커리큘럼 상세표 (CURRICULUM_TABLE)
- Skill 05 5열 고정 헤더: 차시 | 세부 주제 | 핵심 학습 내용 | 실습 도구 및 액티비티 | 최종 산출물
- Skill 00 2-5 인터넷 환경에 따른 실습 도구 적용 (Skill 05 §4-1 기준)
- layout_type: `CURRICULUM_TABLE`

### S4-1. 3대 독보적 강점 (N_COLUMN_CARDS)
- 알파코만의 USP 3개 카드
- 각 카드: 강점 제목 + 구체적 근거 + 고객사 연관성
- 가상의 강점 기재 금지 — 실제 제공 가능한 내용만
- layout_type: `N_COLUMN_CARDS`

### S5-1. 교육 운영 일정 (SCHEDULE)
- 월별 또는 주차별 교육 일정 타임라인
- 사전 준비 → 교육 실시 → 사후 관리 3단계 구조
- layout_type: `SCHEDULE`

### S5-2. KPI 및 사후관리 (EVALUATION_METRIC)
- **Skill 00 3-5에서 확정된 납품 범위 내에서만 기재**
- 기본 제공: Level 1 반응 평가 (만족도 조사)
- 선택 제공: Level 2~4는 사전 계약 확정 항목만 포함
- 실행 불가능한 평가 지표 기재 절대 금지
- layout_type: `EVALUATION_METRIC`

### S5-3. 견적 (PRICING) — 선택
- Skill 00 5-3에서 포함으로 확정된 경우에만 생성
- 과목별 단가 + 총액 구조
- layout_type: `PRICING`

### 클로징 (CLOSING_SLIDE)
- 마치는 인사 + 담당자 연락처
- layout_type: `CLOSING_SLIDE`

---

## 4. layout_type 전체 허용 목록

```
TITLE_SLIDE         표지
TABLE_OF_CONTENTS   목차
SECTION_DIVIDER     섹션 구분
COMPANY_INTRO       알파코 회사 소개
VENDOR_PROFILE      수행 실적
PROBLEM_VS_SOLUTION 제안 배경
FLOW_CHART          교수설계 흐름
N_COLUMN_CARDS      카드형 (과목 개요, USP 등)
CURRICULUM_TABLE    커리큘럼 표
SCHEDULE            교육 일정
EVALUATION_METRIC   KPI 및 사후관리
PRICING             견적 (선택)
CLOSING_SLIDE       클로징
```

> `COMPARISON_BENCHMARK`는 내부 검증 전용이며 제안서 슬라이드 layout_type으로 사용 금지 (Skill 06 §4 참조).

---

## 5. 슬라이드 수 결정 규칙

| 조건 | 슬라이드 수 |
|---|---|
| 기본 구성 | 18장 |
| 견적 슬라이드 포함 | +1장 = 19장 |
| 커리큘럼이 3과목 이상으로 테이블이 2페이지인 경우 | +1장 = 19~20장 |
| 최대 | 20장 |

슬라이드 수가 요구사항 정의서 5-1 값과 ±2 이내인지 Phase 2 GATE에서 검증한다.
