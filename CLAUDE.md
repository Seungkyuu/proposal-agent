# B2B 교육 제안서 자동 기획 에이전트

## 프로젝트 개요
고객사명과 교육 주제를 입력하면 3-Phase 파이프라인으로 B2B 교육 제안서 기획안을 자동 수립하고, 최종적으로 PPTX 렌더링용 JSON을 생성하는 에이전트.

## 디렉터리 구조
```
proposal-agent/
├── skills/                          # 12개 마스터 룰북 (에이전트 두뇌)
│   ├── 01_proposal_strategy_discovery_rules.md
│   ├── 02_client_color_system_spec.md
│   ├── 03_design_deconstruction_reconstruction_rules.md
│   ├── 04_instructional_design_engine_rules.md
│   ├── 05_curriculum_generation_rules.md
│   ├── 06_curriculum_validation_benchmarking_rules.md
│   ├── 07_b2b_proposal_copywriting_rules.md
│   ├── 08_proposal_structure_and_operations_spec.md
│   ├── 09_pipeline_orchestration_rules.md
│   ├── 10_agent_coherence_propagation_rules.md
│   ├── 11_pipeline_flow_validation.md
│   └── 12_data_contract_schema_spec.md
├── chatbot/                         # Claude API 터미널 챗봇 (예정)
│   └── agent.py
├── renderer/                        # python-pptx PPTX 렌더러 (예정)
│   └── pptx_builder.py
└── CLAUDE.md
```

## 3-Phase 파이프라인

| 페이즈 | 스킬 | 주요 출력 |
|--------|------|-----------|
| Phase 1 | 01~03 | 고객사 리서치 + 기획서 초안 + 브랜드 컬러 |
| Phase 2 | 04~07 | 교수설계 모델 + 커리큘럼 + 벤치마크 검증 |
| Phase 3 | 08~12 | USP + KPI + JSON 데이터 패키지 |
| Phase 4 | renderer | PPTX 실물 파일 생성 |

## 에이전트 행동 규칙
- 고객사명 + 교육 주제 입력 즉시 웹 검색 선행 (스킬 01 참조)
- 각 Phase 완료 후 반드시 Integrity Pass Audit 보고서 출력 (스킬 09 참조)
- 강사 개인 프로필/이력은 제안서에 절대 포함 금지 (스킬 03 참조)
- 카피라이팅 금지 어휘: `이해`, `파악`, `학습`, `교육`, `습득` (스킬 07 참조)
- JSON 출력 시 null 값 금지 — 빈 문자열("") 또는 빈 배열([]) 사용 (스킬 12 참조)

## API 키 설정 (필수)
```bash
# .env 파일 생성 후 Anthropic API 키 입력
ANTHROPIC_API_KEY=sk-ant-...
```
API 키는 https://console.anthropic.com 에서 발급.
