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
├── templates/                       # 템플릿 라이브러리 (디자인 DNA)
│   ├── source_decks/                # 알파코 기존 제안서 PPTX (원본 소스)
│   ├── master/                      # 컴파일된 마스터 덱
│   │   ├── alpaco_master.pptx       # 레이아웃 모음 (11슬라이드)
│   │   └── slide_index.json         # layout_type → 마스터 슬라이드 번호 매핑
│   └── slide_catalog.json           # 소스 파일별 슬라이드 분석 + 추천
├── scripts/
│   ├── analyze_sources.js           # 소스 PPTX 분석 → slide_catalog.json 생성 (Node.js)
│   └── compile_master.py            # slide_catalog → alpaco_master.pptx 컴파일 (Python)
├── renderer/
│   └── pptx_builder.py              # 마스터 덱 클론 + 텍스트 주입 렌더러 (Python)
├── chatbot/                         # Claude API 터미널 챗봇 (예정)
│   └── agent.py
├── output/                          # 생성된 제안서 PPTX 저장
└── CLAUDE.md
```

## 렌더링 아키텍처 (V2 — 템플릿 클론 방식)

```
[소스 PPTX 12개]  →  analyze_sources.js  →  slide_catalog.json
                       compile_master.py  →  alpaco_master.pptx + slide_index.json
[Claude 콘텐츠 JSON]  →  pptx_builder.py  →  최종 제안서.pptx
```

**핵심 원칙:** 에이전트는 디자인을 코드로 생성하지 않는다.
알파코 실제 슬라이드를 복제하고 텍스트만 교체한다.

## 4+1 Phase 파이프라인

| 페이즈 | 스킬 | 주요 출력 |
|--------|------|-----------|
| **Phase 0** | 01 §0 | 제안사 자산 Pre-Flight 체크 (PPTX양식/브랜드/레퍼런스) |
| Phase 1 | 01~03 | 고객사 리서치 + 기획서 초안 + 브랜드 컬러 |
| Phase 2 | 04~07 | 교수설계 모델 + 커리큘럼 + 벤치마크 검증 |
| Phase 3 | 08~12 | USP + KPI + JSON 데이터 패키지 |
| Phase 4 | renderer | 마스터 덱 클론 → PPTX 실물 파일 생성 |

## 렌더러 실행 방법

```bash
# 1. 소스 분석 (최초 1회)
node scripts/analyze_sources.js

# 2. 마스터 덱 컴파일 (최초 1회 또는 소스 변경 시)
pip install python-pptx
python scripts/compile_master.py

# 3. 제안서 생성
python renderer/pptx_builder.py output/proposal.json output/result.pptx
```

## 에이전트 행동 규칙
- **Phase 0 필수**: 고객사명 입력 전 PPTX 양식·브랜드 가이드·레퍼런스 덱 확인 (스킬 01 §0)
- 고객사명 + 교육 주제 입력 즉시 웹 검색 선행 (스킬 01 참조)
- 각 Phase 완료 후 반드시 Integrity Pass Audit 보고서 출력 (스킬 09 참조)
- 강사 개인 프로필/이력은 제안서에 절대 포함 금지 (스킬 01 §7)
- 카피라이팅 금지 어휘: `이해`, `파악`, `학습`, `교육`, `습득` (스킬 07 참조)
- JSON 출력 시 null 값 금지 — 빈 문자열("") 또는 빈 배열([]) 사용 (스킬 12 참조)

## API 키 설정 (필수)
```bash
# .env 파일 생성 후 Anthropic API 키 입력
ANTHROPIC_API_KEY=sk-ant-...
```
API 키는 https://console.anthropic.com 에서 발급.

## 의존성
```bash
pip install python-pptx   # 렌더러 실행에 필요
# Node.js v18+ 필요 (analyze_sources.js 실행)
```
