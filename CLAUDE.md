# 알파코 B2B 교육 제안서 자동 기획 에이전트

## 역할 분담
- **Claude (나)**: 제안서 콘텐츠 작성 (전략, 커리큘럼, 카피라이팅, 슬라이드별 텍스트)
- **사용자**: 레이아웃·디자인·PPTX 직접 제작 (02_content.md 텍스트를 복붙하여 제작)

> **Phase 4(python-pptx 자동 렌더러)는 완성도 문제로 파이프라인에서 제거되었다.**
> Skills 12, 13, 14는 폐기(DEPRECATED) 상태이며 참조하지 않는다.
>
> **Phase 2(슬라이드 구조 설계)는 B안 채택으로 파이프라인에서 제거되었다.**
> 레이아웃 힌트는 Phase 2(콘텐츠) 블록 내에 포함된다. Skill 08은 레이아웃 타입 참고용으로만 유지.

---

## 디렉터리 구조

```
proposal-agent/
├── skills/                          # 에이전트 행동 규칙 (유효)
│   ├── 00_requirements_definition_rules.md
│   ├── 01_proposal_strategy_discovery_rules.md   ← 01_strategy.md 10개 섹션 정의
│   ├── 02_client_color_system_spec.md
│   ├── 03_design_deconstruction_reconstruction_rules.md
│   ├── 04_instructional_design_engine_rules.md
│   ├── 05_curriculum_generation_rules.md
│   ├── 06_curriculum_validation_benchmarking_rules.md
│   ├── 07_b2b_proposal_copywriting_rules.md
│   ├── 08_proposal_structure_and_operations_spec.md  ← 레이아웃 타입 참고 (파이프라인 단계 아님)
│   ├── 09_pipeline_orchestration_rules.md        ← 파이프라인 총괄 (B안 3-Phase)
│   ├── 10_agent_coherence_propagation_rules.md   ← 변경 전파 + 파일 체인
│   ├── 15_content_design_output_spec.md          ← Phase 2 출력 표준 (마스터)
│   └── _archive/                   # 폐기 파일 보관
│       └── 11_pipeline_flow_validation.md        ← 09와 통합됨
│   (12, 13, 14는 DEPRECATED — 참조 금지)
├── scripts/
│   └── new_client.py                # 새 고객사 폴더 생성 + 현황 조회
├── output/
│   └── clients/
│       ├── _index.md                # 전체 고객사 현황 대시보드
│       └── [고객사명]_[날짜]/
│           ├── metadata.json        # 고객사 기본정보 + Phase 상태 + 도구 체계
│           ├── research_brief.md    # Phase 1 리서치 발견 (전략 기준점)
│           ├── 00_requirements.md   # Phase 0 산출물
│           ├── 01_strategy.md       # Phase 1 기획안 (콘텐츠 직결 마스터 — 10개 섹션)
│           └── 02_content.md        # Phase 2 최종 콘텐츠 (복붙용)
└── CLAUDE.md
```

---

## 3-Phase 파이프라인 (B안)

| Phase | 산출물 | 저장 파일 | GATE |
|-------|--------|---------|------|
| **Phase 0** | 요구사항 정의서 (5개 블록 질문) | `00_requirements.md` | GATE 0 |
| **Phase 1** | 리서치 브리프 + 기획안 고도화 | `research_brief.md` + `01_strategy.md` | GATE 1 |
| **Phase 2** | 슬라이드별 콘텐츠 (복붙용 텍스트 + 레이아웃 힌트) | `02_content.md` | — |

> Phase 1 → Phase 2 직행. 별도 슬라이드 구조 단계 없음.
> 레이아웃은 02_content.md 각 블록 내 `레이아웃 힌트:` 필드로 표현.

---

## 01_strategy.md — 콘텐츠 직결 마스터 (10개 섹션)

Phase 1의 핵심 산출물. 이 파일이 Phase 2 콘텐츠의 직접 원천이다.

| # | 섹션 | 역할 | Phase 2 직결 |
|---|------|------|-------------|
| 1 | 고객사 리서치 요약 | research_brief §1~3 요약 | 제안 배경 메시지 |
| 2 | 전략 포지셔닝 | 핵심 포지션·차별화·피치 스타일 | 표지·개요 상단 메시지 |
| 3 | 교수설계 모델 | 모델 선택 + 근거 | 커리큘럼 설계 원칙 |
| 4 | 커리큘럼 (5열표) | 차시별 5열 구성 | 커리큘럼 표 슬라이드 직결 |
| **5** | **내러티브 아크** | **시리즈 전체 Why→What→How→Result + 회차별 위치** | **교육과정 개요 스토리 구조** |
| **6** | **차시별 핵심 논지 + 불릿 초안** | **회차당 핵심 메시지 1줄 + 주요 불릿 3문장** | **Phase 2 상단 메시지·불릿 직접 원천** |
| **7** | **페인포인트 → 회차 매핑** | **3개 페인 × 해소 회차 × 해소 방식** | **제안 설득 논리** |
| 8 | 핵심 카피라이팅 | 전체 메시지·헤드라인·불릿 후보군 | Phase 2 카피 원천 |
| 9 | 디자인 시스템 | 브랜드 컬러·4색 팔레트 | 레이아웃 힌트 색상 |
| 10 | Integrity Pass | CV 검증 10항목 전체 | 품질 보증 |

**§5·§6·§7은 B안의 핵심 추가 섹션**이다. 이 3개가 구조 단계 없이도 콘텐츠를 직행할 수 있게 한다.

---

## 슬라이드별 텍스트 출력 형식

Phase 2 완료 시 `02_content.md`에 아래 형식으로 저장 (Skill 15 §4 포맷 100% 준수):

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
- **research_brief.md 먼저 저장**: Phase 1 시작 직후 리서치 완료 즉시 저장 → 01_strategy.md 전략 기준점으로 사용 (Skill 01 §7)
- **01_strategy.md 10개 섹션 필수**: §5(내러티브 아크)·§6(차시별 핵심 논지)·§7(페인포인트 매핑) 누락 금지 — Phase 2 콘텐츠의 직접 원천
- **강사 개인 프로필 절대 금지**: 강사 이름·약력·이력 불포함 (Skill 01 §8)
- **금지 어휘**: `이해`, `파악`, `학습`, `교육`, `습득` (Skill 15 §2-1이 마스터)
- **타 고객사명 금지**: 실적 슬라이드 외 다른 고객사명 언급 금지
- **망분리 환경 확인**: 인터넷 접속 여부에 따라 실습 도구 전면 변경 (Skill 05 §4-1)
- **API 도구 조건부 포함**: Anthropic API 등 API 기반 도구는 metadata.json 도구 체계에 명시된 경우에만 커리큘럼에 포함 (Skill 05 §3 ③)
- **Phase 2 출력 포맷**: 반드시 Skill 15 §4 포맷을 100% 준수하여 02_content.md 생성
- **브랜드 컬러**: Phase 1에서 WebSearch로 고객사 브랜드 컬러 확보 → 01_strategy.md §9 디자인 시스템 블록에 명시 (Skill 15 §3-1)

---

## 의존성

```bash
# Phase 파일 생성 — Python 표준 라이브러리만 사용
python scripts/new_client.py
```

> python-pptx는 더 이상 사용하지 않습니다. PPTX 제작은 사용자가 02_content.md를 참고하여 직접 수행합니다.
