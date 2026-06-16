# 알파코 B2B 교육 제안서 자동 기획 에이전트

## 역할 분담
- **Claude (나)**: 제안서 콘텐츠 작성 (전략, 커리큘럼, 카피라이팅, 슬라이드별 텍스트)
- **사용자**: 레이아웃·디자인·PPTX 직접 제작 (03_content.md 텍스트를 복붙하여 제작)

> **Phase 4(python-pptx 자동 렌더러)는 완성도 문제로 파이프라인에서 제거되었다.**
> Skills 12, 13, 14는 폐기(DEPRECATED) 상태이며 참조하지 않는다.

---

## 디렉터리 구조

```
proposal-agent/
├── skills/                          # 에이전트 행동 규칙 (12개 유효)
│   ├── 00_requirements_definition_rules.md
│   ├── 01_proposal_strategy_discovery_rules.md
│   ├── 02_client_color_system_spec.md
│   ├── 03_design_deconstruction_reconstruction_rules.md
│   ├── 04_instructional_design_engine_rules.md
│   ├── 05_curriculum_generation_rules.md
│   ├── 06_curriculum_validation_benchmarking_rules.md
│   ├── 07_b2b_proposal_copywriting_rules.md
│   ├── 08_proposal_structure_and_operations_spec.md
│   ├── 09_pipeline_orchestration_rules.md     ← 파이프라인 총괄
│   ├── 10_agent_coherence_propagation_rules.md
│   ├── 11_pipeline_flow_validation.md
│   └── 15_content_design_output_spec.md       ← Phase 3 출력 표준
│   (12, 13, 14는 DEPRECATED — 참조 금지)
├── scripts/
│   └── new_client.py                # 새 고객사 폴더 생성 + 현황 조회
├── output/
│   └── clients/
│       ├── _index.md                # 전체 고객사 현황 대시보드
│       └── [고객사명]_[날짜]/
│           ├── metadata.json        # 고객사 기본정보 + Phase 상태
│           ├── 00_requirements.md   # Phase 0 산출물
│           ├── 01_strategy.md       # Phase 1 기획안
│           ├── 02_structure.md      # Phase 2 슬라이드 구조
│           └── 03_content.md        # Phase 3 최종 콘텐츠 (복붙용)
└── CLAUDE.md
```

---

## 4-Phase 파이프라인

| Phase | 산출물 | 저장 파일 | GATE |
|-------|--------|---------|------|
| **Phase 0** | 요구사항 정의서 (5개 블록 질문) | `00_requirements.md` | GATE 0 |
| **Phase 1** | 기획안 (전략 + 커리큘럼 + 카피 + 디자인 시스템) | `01_strategy.md` | GATE 1 |
| **Phase 2** | 슬라이드 구조 설계 | `02_structure.md` | GATE 2 |
| **Phase 3** | 슬라이드별 콘텐츠 (복붙용 텍스트) | `03_content.md` | — |

---

## 슬라이드별 텍스트 출력 형식

Phase 3 완료 시 `03_content.md`에 아래 형식으로 저장 (Skill 15 §4 포맷 100% 준수):

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
슬라이드 02 | 제안 배경
레이아웃 힌트: 좌우 2컬럼 비교 (layout_type: PROBLEM_VS_SOLUTION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[상단 메시지]
AI 혁신 비전 선포 이후
현장 실행력 확보가 핵심 과제

[왼쪽 — 현재의 한계]
• ...
• ...

[오른쪽 — 교육 후 전환 성과]
• ...
• ...
```

---

## 새 고객사 시작 방법

### 방법 1 — 스크립트
```bash
python scripts/new_client.py "고객사명" "교육 주제"
```

### 방법 2 — 직접 대화
```
고객사: 동대문구시설관리공단, 교육 주제: AI 업무혁신 3일 과정
```
Claude가 Phase 0 질문부터 자동 시작, 각 Phase 완료 시 파일 자동 저장

### 기존 작업 이어받기
```
동대문구시설관리공단 제안서 이어서 해줘
```
Claude가 `output/clients/동대문구시설관리공단_*/` 폴더를 읽어 중단된 Phase부터 재개

---

## 에이전트 핵심 행동 규칙

- **Phase 0 최우선 실행**: 고객사명 입력 시 즉시 5개 블록 질문 시작
- **GATE 없이 진행 금지**: 각 Phase 완료 후 사용자 승인 대기
- **각 Phase 완료 시 파일 저장**: 승인 받은 즉시 해당 .md 파일에 기록하고 metadata.json Phase 상태 업데이트
- **강사 개인 프로필 절대 금지**: 강사 이름·약력·이력 불포함 (Skill 01 §7)
- **금지 어휘**: `이해`, `파악`, `학습`, `교육`, `습득` (Skill 07 / Skill 15 §2-1)
- **타 고객사명 금지**: 실적 슬라이드 외 다른 고객사명 언급 금지
- **망분리 환경 확인**: 인터넷 접속 여부에 따라 실습 도구 전면 변경 (Skill 05 §4-1)
- **Phase 3 출력 포맷**: 반드시 Skill 15 §4 포맷을 100% 준수하여 03_content.md 생성
- **브랜드 컬러**: Phase 1에서 고객사 브랜드 컬러 확보 → 01_strategy.md 디자인 시스템 블록에 명시 (Skill 02 §4)

---

## 의존성

```bash
# Phase 파일 생성 — Python 표준 라이브러리만 사용
python scripts/new_client.py
```

> python-pptx는 더 이상 사용하지 않습니다. PPTX 제작은 사용자가 03_content.md를 참고하여 직접 수행합니다.
