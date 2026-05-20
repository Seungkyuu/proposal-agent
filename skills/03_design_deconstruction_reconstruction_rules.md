# Agent Skill: Reverse Design Engineering & Template Deconstruction-Reconstruction (V4. Clean Setup)

## 1. 개요 (Overview)
본 사양은 에이전트가 사용자가 업로드한 레거시 제안서 파일(PPTX, PDF, 이미지 등)을 입력받았을 때, 해당 문서의 '비주얼 DNA(Visual DNA)'와 '기획적 스토리 톤(Story Tone)'을 완벽하게 역공학(Reverse Engineering)하여 분석하고, 새롭게 기획될 제안서에 일관되게 이식·재구성하기 위한 기술 제어 규칙을 정의한다. 강사진 프로필 레이아웃은 전면 배제한다.

---

## 2. 양식 역공학 3대 분석 레이어 (Deconstruction Layers)

에이전트는 제공받은 기존 문서를 다음 3가지 핵심 축으로 정밀 분석(Deconstruct)하여 메모리 컨텍스트에 바인딩한다.

```
[레거시 파일 입력 (PPTX / PDF)]
│
├── LAYER 1: 비주얼 스타일 파싱 (Visual Style Extraction)
│     - 도미넌트/서브/액센트 컬러 세트 추출
│     - 텍스트 정렬 기준(Left/Center), 마진(여백) 크기, 라인 데코레이션 양식 감지
│     - 슬라이드 내 레이아웃별 정보 밀도(Density - 여백 대비 텍스트 비율) 분석
│
├── LAYER 2: 스토리라인 전개 흐름 분석 (Document Flow Extraction)
│     - 제안 논리의 빌드업 흐름 감지 (두괄식 결과 우선형 vs 귀납적 문제제기형)
│     - 장표 간의 전환(Transition)을 위한 브릿지 간지(Section Divider) 사용 주기 확인
│
└── LAYER 3: 문장 톤앤매너 추출 (Tone & Voice Extraction)
      - 사용 단어의 전문성 수준(학술 용어 vs 직관적 실무 용어) 분석
      - 불릿 포인트 뒤의 문맥 구조 및 어미 패턴 (~ 기여, ~ 추진 vs ~를 통한 가치 극대화)
```

---

## 3. 톤앤매너 이식 및 새 슬라이드 재구성 규칙 (Reconstruction Rules)

추출된 DNA를 기반으로 새로운 요구사항에 맞춤형 제안서를 재구성할 때, 에이전트는 다음 규칙을 강제 적용한다.

### 규칙 1: 템플릿 슬라이드 레이아웃의 '의도' 계승
* 에이전트는 기존 문서의 장표를 분석하여 '레이아웃 매핑 테이블'을 생성한다.
* 새 제안서를 기획할 때 임의의 레이아웃을 생성하지 않고, 기존에 분석된 매핑 테이블 안에서 가장 기능적으로 어울리는 레이아웃 슬라이드를 원본에서 복사하여(Clone) 뼈대로 삼는다.
* *예: 기존 제안서의 특정 슬라이드가 표지, 실적 테이블, 3단 블록 나열 등의 레이아웃을 사용했다면 ➔ 새로운 제안서의 `[제안사 소개 및 실적 레퍼런스]` 장표를 생성할 때 해당 슬라이드의 오브젝트 좌표와 표 서식을 1:1 복제한 뒤 텍스트 내용만 덮어쓴다 (강사 이력 프로필 카드 레이아웃 복제 전면 금지).*

### 규칙 2: 비주얼 여백(Breathing Room)의 비율 보존
* 기존 문서의 디자인 퀄리티가 높은 핵심 이유는 '적절한 비움의 미학'에 있다.
* 에이전트는 원본 문서의 평균 글자 수(Character Count per Slide)를 측정하고, 새로운 슬라이드를 기획할 때 원본 글자 수의 ±15% 한계선을 넘지 않도록 텍스트 다이어트 가중치를 동적으로 조절한다.

### 규칙 3: 문장 밀도 및 어미의 인공적 결합 (Semantic Copycat)
* 원본이 개조식 위주의 컴팩트한 명사형 종결을 썼다면 새 제안서도 100% 명사형으로 일치시킨다.
* 원본이 '~을 통한 ~의 실현'과 같은 대구법(Parallelism) 구조를 반복했다면, 에이전트가 새로 생성하는 슬라이드의 불릿 포인트 헤더 역시 동일한 대구적 리듬감을 살려 카피라이팅을 수행한다.

---

## 4. 백엔드(Python-pptx) 연동을 위한 메타데이터 구조 (JSON Bridge)

에이전트는 분해한 기존 템플릿의 슬라이드 번호(Slide Index) 및 플레이스홀더 이름 정보를 감지하여, 백엔드가 원본 PPTX에서 특정 장표를 복제해서 쓸 수 있도록 아래와 같은 매핑 JSON을 뱉어야 한다.

```json
{
  "reconstruction_strategy": {
    "source_template_file": "user_uploaded_reference.pptx",
    "target_output_file": "reconstructed_proposal.pptx",
    "visual_dna": {
      "primary_color": "#0F172A",
      "accent_color": "#E11D48",
      "font_family_detected": "나눔스퀘어 네오",
      "average_char_density": "low"
    }
  },
  "slides": [
    {
      "slide_number": 2,
      "clone_source_layout_idx": 1,
      "top_message": "검증된 프로젝트 수행 역량 기반 최적의 솔루션 제공",
      "placeholders": {
        "title_placeholder_text": "제안사 주요 대기업 DX 교육 실적 레퍼런스",
        "reference_table_data": {
          "headers": ["프로젝트명", "고객사", "만족도 평점"],
          "rows": [
            ["신임 팀장 대상 AI 혁신 과정", "H그룹", "4.9 / 5.0"],
            ["No-Code 업무 자동화 구축 실전 워크숍", "L전자", "4.8 / 5.0"]
          ]
        }
      }
    }
  ]
}
```

---

## 5. 기존 양식 분석 실패 시 예외 처리 (Fallback Rules)

1. **포맷 인식 불가 상황 (예: 스캔된 이미지 PDF 등):**
   * 에이전트가 마스터 구조를 뜯어볼 수 없는 이미지 형태의 문서를 수신했을 경우, 비전 분석(Vision API)을 구동하여 지배 색상(Hex Code)과 텍스트 영역(OCR)만 부분적으로 파싱한다.
   * 이후 비주얼 디자인은 에이전트 내부에 저장되어 있는 '가장 표준적인 범용 고가독성 오피스 템플릿(Default Light/Dark Theme)'으로 대체하되, 추출한 브랜드 컬러만 스포이트로 찍어 바르듯 주입하여 일치감을 준다.
