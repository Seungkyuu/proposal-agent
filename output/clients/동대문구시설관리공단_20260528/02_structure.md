# Phase 2 - 슬라이드 구조

> 고객사: 동대문구시설관리공단
> 작성일: 2026-05-28
> 상태: 완료 ✓

---

## 슬라이드 목록 (총 13장)

| # | layout_type | 제목/주제 | 소스 장표 추천 |
|---|-------------|---------|-------------|
| 01 | TITLE_SLIDE | 동대문구시설관리공단 임직원 / AI 활용 업무혁신 3일 부트캠프 제안 | (알파코)AIDP_KB국민은행 S01 — 이미지 표지 |
| 02 | TABLE_OF_CONTENTS | 4개 챕터 목차 | 신한금융그룹_AX혁신리더 S02 — 멀티셰이프 목차 |
| 03 | PROBLEM_VS_SOLUTION | 제안 배경: 현재 한계 vs 교육 후 전환 성과 | 신한금융그룹_AX혁신리더 S04 — 좌우 2컬럼 |
| 04 | VENDOR_PROFILE | 알파코 회사 소개 + 수행 실적 | 신한금융그룹_AX혁신리더 S20 — 테이블+멀티셰이프 |
| 05 | FLOW_CHART | SAM 애자일 교수설계 적용 3단계 | KB_메타인지해커톤 S10 — 단계별 흐름 |
| 06 | COMPARISON_BENCHMARK | 글로벌 커리큘럼 벤치마킹 (AS=88%) | 한화투자증권_DXAX S12 — 좌우 비교+테이블 |
| 07 | N_COLUMN_CARDS | 3대 AI 실무 핵심 과목 (데이터분석/이미지영상/챗봇) | 신한금융그룹_AX혁신리더 S07 — 3열 카드 |
| 08 | CURRICULUM_TABLE | 1일차 커리큘럼: AI 데이터 분석 | 신한은행_퓨처아카데미 S03 — 5열 커리큘럼 |
| 09 | CURRICULUM_TABLE | 2일차 커리큘럼: AI 이미지·영상 제작 | 신한은행_퓨처아카데미 S03 — 동일 구조 반복 |
| 10 | CURRICULUM_TABLE | 3일차 커리큘럼: AI 챗봇 구현 | 신한은행_퓨처아카데미 S03 — 동일 구조 반복 |
| 11 | N_COLUMN_CARDS | 알파코 3대 독보적 강점 (USP) | 신한금융그룹_AX혁신리더 S07 — 동일 구조 |
| 12 | EVALUATION_METRIC | KPI 및 사후관리 (커크패트릭 4단계) | 신한금융그룹_AX혁신리더 S68 — KPI 카드 |
| 13 | CLOSING_SLIDE | 동대문구시설관리공단의 AI 혁신 여정, 알파코가 함께 | S-Oil_독서통신 S28 — 이미지 배경 마감 |

> **소스 장표 추천 기준**: 알파코 보유 기존 제안서에서 레이아웃 유형별 최적 슬라이드 선별.
> 사용자가 해당 파일을 PowerPoint로 열어 참고하며 디자인 제작.
> `layout_type` 컬럼 값은 `templates/layout_positions.json` 및 `renderer/pptx_builder.py`와 동일.

---

## 텍스트박스 스캐폴드 PPTX 생성

콘텐츠가 담긴 텍스트박스 배치 파일만 빠르게 생성하려면:

```bash
pip install python-pptx
python renderer/pptx_builder.py output/dongdaemun_proposal.json output/dongdaemun_scaffold.pptx
```

생성된 PPTX는 텍스트 배치 기준으로 활용하고, 실제 디자인은 소스 장표를 참고해 사용자가 제작.

---

## 승인 여부: [✓] 승인
