# Agent Skill: Curriculum Benchmarking & Validation Rules

## 1. 개요 (Overview)
본 사양은 에이전트가 설계한 커리큘럼의 시장 정합성 및 학술적 공신력을 확보하기 위해, 실시간 웹 탐색(Web Search)을 통해 글로벌 우수 대학(MIT, Stanford, 서울대 등) 및 대표 에듀테크 플랫폼(Coursera, edX)의 유사 과정을 벤치마킹하고 검증(Validation)하는 기술적 규칙을 정의한다.

---

## 2. 벤치마킹 데이터 수집 파이프라인 (Data Sourcing)

에이전트는 Step 5(제안 커리큘럼) 도중 또는 직후, 다음 3가지 경로를 통해 실시간으로 벤치마크 대상 커리큘럼(Syllabus)을 수집해야 한다.

```
[커리큘럼 초안 생성 완료]
│
├── 1단계: 글로벌 우수 대학(Academic Class) 실러버스 서칭
│     - 검색 쿼리: "{주제} syllabus MIT", "{주제} course Stanford", "서울대 {주제} 강의 계획서"
│
├── 2단계: 글로벌 에듀테크 플랫폼(Industry Class) 벤치마킹
│     - 검색 쿼리: "{주제} Coursera professional certificate", "{주제} edX program"
│
└── 3단계: 시장 경쟁사 및 자격 인증 과정(Professional Class) 매칭
      - 검색 쿼리: "{주제} 국비지원 우수 훈련과정", "Microsoft/AWS {주제} official training"
```

---

## 3. 커리큘럼 정합성 검증 알고리즘 (Validation Algorithm)

에이전트는 수집한 외부 벤치마크 커리큘럼들의 핵심 키워드 집합 C_bench와 에이전트가 자체 생성한 커리큘럼 초안의 키워드 집합 C_gen을 비교하여 '정합성 얼라인먼트 점수(Alignment Score, AS)'를 계산한다.

### [수학적 검증 모델]
자체 생성한 커리큘럼이 글로벌 표준 대비 얼마나 필수 주제를 누락 없이 반영했는지에 대한 일치율(AS)은 다음과 같이 계산한다.

```
AS = |C_gen ∩ C_bench| / |C_bench| × 100 (%)
```

* **AS ≥ 85%:** '검증 완료(Verified)'. 바로 최종 제안서 커리큘럼으로 확정한다.
* **AS < 85%:** '보완 필요(Gap Detected)'. Section 3-1의 Gap 보완 알고리즘을 즉시 실행한다.

### 3-1. Gap 보완 상세 알고리즘 (Gap Refinement Logic)

AS < 85% 감지 시 에이전트는 아래 3단계 자동 보완 루프를 구동한다.

#### Step 1: Gap 키워드 추출
- C_bench(외부 기준) - C_gen(자체 초안)의 차집합 계산
- 예: `["RAG 패턴", "보안 망분리 대응", "API 연동 설계"]` 누락 감지

#### Step 2: 누락 모듈 자동 삽입 (Skill 05 커리큘럼 행렬 연동)
- 누락 키워드 기반으로 Skill 05의 CURRICULUM_TABLE에 신규 세션 추가
- **총 교육 시간 유지 원칙:** 기존 차시를 시간 분할하여 삽입, 원래 핵심은 압축 버전으로 유지
  - 예: "3차시 (2h) → 3a차시(1h: 기존 핵심) + 3b차시(1h: 신규 RAG 패턴 실습)"
- 추가된 세션은 Skill 05의 5열 고정 포맷을 준수하여 JSON에 반영

#### Step 3: 재검증 및 사용자 알림
- 보완 후 신규 AS 재계산
- **AS ≥ 85% 달성:** Phase 2 통과. 사용자에게 "Gap 보완 완료 (AS: {이전}% → {신규}%)" 알림
- **AS < 85% 여전히 미달:** 사용자에게 3가지 선택지 제시:
  * **옵션 A:** 교육 일수 확장 (예: 2일 → 3일) → 전파 규칙 Skill 10 Section 2 Variable 2 발동
  * **옵션 B:** 비핵심 토픽 제거 후 AS 재산정
  * **옵션 C:** 현재 AS로 진행 (리스크 인수 — 제안서 내 면책 문구 자동 삽입)

---

## 4. 제안서 내 '벤치마크 및 정합성 검증' 슬라이드 출력 규격

에이전트는 검증 결과를 바탕으로 제안서 내에 "글로벌 표준 벤치마킹 및 검증 내역" 슬라이드를 인포그래픽 형태로 구성하도록 데이터를 전송한다.

### [데이터 구조 (JSON 계약 연동)]
```json
{
  "layout_type": "COMPARISON_BENCHMARK",
  "top_message": "글로벌 Top-tier 교육과정 분석을 통한 실무 정합성 및 공신력 검증 완료",
  "content": {
    "left_block": {
      "title": "Stanford/Coursera 표준 커리큘럼",
      "bullets": ["업무 자동화 개론", "API 프롬프트 엔지니어링", "RAG 기반 사내 정보 검색"]
    },
    "right_block": {
      "title": "본 제안사 맞춤형 설계 안 (AS = 92%)",
      "bullets": ["S사 맞춤형 프롬프트 설계", "사내 보안 망분리 극복 Q&A 봇 제작", "업무 30% 절감 해커톤"]
    }
  }
}
```

---

## 5. 실무 적용을 위한 프롬프트 가이드라인 (Prompt Guidelines)

1. **출처 명시 규칙 (Attribution Rule):**
   * 제안서에 단순히 "검증되었습니다"라고 쓰지 않는다. 구체적인 대학명, 플랫폼명, 혹은 최신 보고서(예: Gartner, McKinsey 2026 하이프 사이클)의 타이틀을 반드시 텍스트로 명시하여 신뢰도를 배가시킨다.

2. **최신성 필터링 (Recency Filter):**
   * IT/AX/DX 도메인의 경우 최소 최근 1년 이내에 개설되거나 개정된 커리큘럼만 수집 필터에 걸러지도록 검색 범위를 제한한다. (예: 3년 전의 구형 기술 스택 교육과정은 벤치마크 대상에서 자동 탈락시킴)

---

## 5-1. 웹 검색 실패 시 Fallback 프로토콜 (Benchmarking Search Failure Fallback)

Section 2의 벤치마킹 데이터 수집 검색이 실패할 경우 아래 순서로 처리한다.

1. **대체 쿼리 시도:** 플랫폼명 대신 주제 중심 쿼리로 전환
   - `"{주제} best practices 2025"`, `"{주제} enterprise training framework"`
2. **내부 지식 기반 대체 (Claude Knowledge Fallback):**
   - Claude의 학습 데이터 내 유사 커리큘럼 구조를 활용하여 C_bench를 추정 구성
   - **필수 명시:** 벤치마크 슬라이드 `top_message`에 `"★ 내부 지식 기반 추정 — 온라인 검증 권장"` 문구 삽입
3. **AS 기준 하향 조정 (Degraded Mode):**
   - 검색 불가 상황에서는 AS 기준을 85% → 75%로 하향 적용
   - Skill 09 Phase 2 Audit 보고서에 사유 자동 기재: `"[DEGRADED] 벤치마킹 검색 실패로 AS 기준 75% 적용"`
4. **사용자 알림:** "벤치마킹 검색에 실패하여 내부 지식 기반으로 대체 진행합니다. 결과물 검토 후 수동 보완을 권장합니다."
