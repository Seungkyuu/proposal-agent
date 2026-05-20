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
* **AS < 85%:** '보완 필요(Gap Detected)'. 에이전트는 외부에 존재하지만 우리 초안에 누락된 핵심 키워드(Gap)를 분석하여, 세부 차시에 '피드백 반영(Refinement)' 루프를 가동해 누락된 과목을 자동 추가 정렬한다.

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
