# B2B Proposal Agent: Pipeline Flow & Validation Architecture (V5)

본 문서는 B2B 제안서 기획 챗봇 에이전트의 3대 배치 페이즈(Batch Phase) 구동 시 적용되는 마스터 스킬 작동 흐름 및 페이즈 경계선에서의 자가 검증 리포팅(Integrity Pass Report) 구조를 정의한다.

---

## 1. 3대 페이즈별 실시간 스킬 바인딩 & 검증 매핑 (Flow Map)

에이전트는 독립된 스킬들을 무대 뒤에서 동시에 구동하여 연산 지연을 단축하며, 페이즈 종료와 동시에 엄격한 정합성 보고서(Audit)를 발행한다.

```
[인풋 수신: 기업명 & 거친 요구사항]
│
├── [PHASE 1] Discovery & Strategy Alignment (1차 검토 마일스톤)
│     ├── 01_proposal_strategy_discovery_rules.md ──► 주제 연동형 고객사 자동 사전 리서치 & 교육제안 기획서 수립
│     ├── 02_client_color_system_spec.md ────────────► 브랜드 컬러 60-30-10 추출
│     └── 03_design_deconstruction_reconstruction_rules.md ──► 회사 소개서 실적 매칭 (강사 배제)
│     │
│     └── [Phase 1 Integrity Pass Audit] — Skill 09 Section 3 기준
│           - [CV] 고객사 웹 검색 완료 여부 (Fallback 적용 시 사유 명시)
│           - [CV] 강사 배제 정규식 스캔 (Skill 01 Section 7 기준)
│           - [CV] 브랜드 HEX 채도/명도 필터 통과
│           - [CV] color_palette 3필드 완전 정의
│           - [CV] 피치 스타일 ↔ 대상 직급 정합성
│           - [RV: PENDING-RENDER] 60-30-10 실제 슬라이드 적용
│
├── [PHASE 2] Curriculum & Instructional Design (2차 검토 마일스톤)
│     ├── 04_instructional_design_engine_rules.md ──► 교수설계 최적 모델 매핑
│     ├── 05_curriculum_generation_rules.md ────────► 직무/직급별 시간표 수립
│     ├── 06_curriculum_validation_benchmarking_rules.md ──► 글로벌 syllabus 벤치마크 (AS ≥ 85%)
│     └── 07_b2b_proposal_copywriting_rules.md ─────► 행동형 종결 카피라이팅 튜닝
│     │
│     └── [Phase 2 Integrity Pass Audit] — Skill 09 Section 3 기준
│           - [CV] 교수설계 M_k 재연산 일치
│           - [CV] 벤치마킹 AS ≥ 85% (검색 실패 시 Degraded 75%)
│           - [CV] 금지 어휘 0건 정규식 스캔
│           - [CV] CURRICULUM_TABLE 5열 헤더 정확히 일치
│
├── [PHASE 3] USP & KPI Evaluation (3차 최종 검토 마일스톤)
│     ├── 08_proposal_structure_and_operations_spec.md ──► 특장점 USP 3대 카드 도출
│     └── 04_instructional_design_engine_rules.md ──► 커크패트릭 4단계 사후 케어 연동
│     │
│     └── [Phase 3 Integrity Pass Audit] — Skill 09 Section 3 기준
│           - [CV] JSON 스키마 required 필드 완전성
│           - [CV] layout_type enum 유효성 (9개 허용값)
│           - [CV] top_message 세만틱 줄바꿈 삽입 (25자 초과 시 \n 필수)
│           - [RV: PENDING-RENDER] PPTX 네이티브 표 렌더링
│           - [RV: PENDING-RENDER] 폰트 위계 30/18/14pt 적용
│
└── [PHASE 4] Auto-Rendering Pipeline (자동 PPTX 생성)
      └── 12_data_contract_schema_spec.md ➔ renderer/pptx_builder.py ➔ 실물 제안서 생성
```

---

## 2. 3대 페이즈 정합성 보고서 자가 진단 및 예외 조치 프로토콜 (Exception Handling)

* **진단 결과 `[FAIL]` 감지 시:**
  에이전트는 해당 페이즈 결과를 기획자에게 절대 출력하지 않으며, 감지된 위반 내역(예: "레퍼런스에 강사 개인 이력이 검출됨")을 분석하여 스스로 기획 내용을 재수정(Self-Correction Loop)한 후 정합성 보고서가 전원 `[PASS]`될 때까지 루프를 가동한다.

* **사용자 기획 수정 피드백 수신 시:**
  피드백이 접수되면 에이전트는 `10_agent_coherence_propagation_rules.md`를 발동시켜 해당 페이즈는 물론 연동된 모든 이전/이후 단계의 정합성 검사를 전방위적으로 재수행하고, 갱신된 검증 통과 보고서를 기획자에게 다시 보고한다.
