# Agent Skill 11: Pipeline Flow & Validation Architecture (V8 — 4-Phase)

본 문서는 B2B 제안서 기획 에이전트의 4단계 파이프라인 구동 흐름과 각 Phase 경계에서의 자가 검증 및 사용자 승인 게이트 구조를 정의한다.

---

## 1. 전체 파이프라인 흐름

```
[입력: 고객사명 & 교육 주제]
│
├── [PHASE 0] 요구사항 정의서 작성 ★ 최우선 실행
│     └── 00_requirements_definition_rules.md 전체 실행
│           - 5개 블록 질문 수집
│           - 요구사항 정의서 작성 및 출력
│           - 내부 검증 실행
│     │
│     └── ★ GATE 0: 사용자 승인
│           승인 전 Phase 1 진입 절대 금지
│
├── [PHASE 1] 기획안 작성
│     ├── 01_proposal_strategy_discovery_rules.md ──► 고객사 리서치 & 기획서 수립
│     ├── 02_client_color_system_spec.md ────────────► 브랜드 컬러 60-30-10 추출
│     ├── 03_design_deconstruction_reconstruction_rules.md ──► 레퍼런스 덱 tone/DNA 분석
│     ├── 04_instructional_design_engine_rules.md ──► 교수설계 모델 선택
│     ├── 05_curriculum_generation_rules.md ────────► 커리큘럼 설계 + 망분리 도구 선택
│     ├── 06_curriculum_validation_benchmarking_rules.md ──► AS 내부 검증 (슬라이드 출력 금지)
│     └── 07_b2b_proposal_copywriting_rules.md ─────► 카피라이팅 튜닝
│     │
│     └── [Phase 1 Integrity Pass — 3회 반복]
│           - [CV] 웹 리서치 완료 또는 Fallback 적용
│           - [CV] 강사 관련 텍스트 0건
│           - [CV] 금지 어휘 0건 (이해·파악·학습·교육·습득)
│           - [CV] 브랜드 HEX 채도/명도 필터 통과
│           - [CV] 브랜드 컬러 3필드 완전 정의
│           - [CV] 피치 스타일 ↔ 대상 직급 정합성
│           - [CV] 커리큘럼 5열 구성 일치
│           - [CV] 벤치마킹 AS ≥ 85% (내부 검증 전용)
│           - [CV] 망분리 환경 → 실습 도구 일치 (Skill 05 §4-1)
│     │
│     └── ★ GATE 1: 사용자 기획안 검토·승인
│
├── [PHASE 2] 슬라이드 구조 설계
│     └── 08_proposal_structure_and_operations_spec.md ──► 슬라이드 수·순서·layout_type 확정
│     │
│     └── [Phase 2 Integrity Pass]
│           - [CV] 전체 슬라이드 layout_type 명시
│           - [CV] 슬라이드 수 요구사항 ±2 이내
│           - [CV] 섹션 구분 슬라이드 포함 여부 요구사항 일치
│           - [CV] COMPANY_INTRO 슬라이드 포함
│           - [CV] CURRICULUM_TABLE 슬라이드 포함
│     │
│     └── ★ GATE 2: 사용자 구조 설계안 검토·승인
│
└── [PHASE 3] 슬라이드별 콘텐츠 작성
      └── 15_content_design_output_spec.md ──► 슬라이드별 복붙용 텍스트 생성
      │
      └── [Phase 3 Integrity Pass]
            - [CV] Phase 2 슬라이드 수·순서 일치
            - [CV] 슬라이드별 텍스트 누락 없음
            - [CV] 강사 관련 텍스트 최종 스캔 0건
            - [CV] 금지 어휘 최종 스캔 0건
            - [CV] 타 고객사명 미포함 (수행 실적 제외)
            - [CV] top_message 2줄 구성 (\n 존재)
            - [CV] KPI 슬라이드 내용이 납품 범위 이내
      │
      └── ★ 03_content.md 저장 → 사용자 전달
```

---

## 2. FAIL 처리 원칙

- `[CV: FAIL]` 감지 시: 자가 수정 후 해당 항목 재검증. 3회 재시도 후에도 FAIL이면 사용자에게 수동 확인 요청.
- 사용자가 GATE에서 수정 요청 시: Skill 10 Dependency Map 발동 → 연관 단계 전체 재검증.
- 사용자가 'back' 입력 시: 이전 Phase로 복귀하여 해당 Phase부터 재실행.

---

## 3. 파이프라인 역할 분담

| 담당 | 산출물 |
|---|---|
| Claude (에이전트) | 00_requirements.md, 01_strategy.md, 02_structure.md, 03_content.md |
| 사용자 | PPTX 디자인·제작 (03_content.md 텍스트를 복붙하여 직접 제작) |

> Phase 4(python-pptx 자동 렌더러)는 완성도 문제로 파이프라인에서 제거되었다.
> Skill 12, 13, 14는 폐기(DEPRECATED) 상태이며 참조하지 않는다.
