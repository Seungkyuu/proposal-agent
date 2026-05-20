# Agent Skill: Brain-to-Renderer JSON Data Contract Spec (V4. 9-Slide Aligned)

## 1. 개요 (Overview)
본 사양은 에이전트의 기획 모듈(Claude)이 기획을 마치고 생성한 데이터를 백엔드 자동화 엔진(Python-pptx)으로 안전하게 전달하기 위해 양자 간의 엄격한 데이터 필드 규격(Data Contract)을 정의한다. 이를 통해 사소한 키값 불일치 및 스키마 유효성 위반으로 인한 빌드 에러를 원천 예방한다.

---

## 2. JSON 스키마 메타 사양 (Meta Schema Constraints)

1. **엄격한 데이터 타입 매칭:**
   - 숫자는 반드시 `Integer` 또는 `Float` 타입이어야 한다.

2. **Null 값 방지 (No Undefined Rules):**
   - 기획안에 특정 항목 정보가 없다면, 빈 문자열(`""`) 혹은 빈 배열(`[]`)을 반환해야 하며, 필드 자체를 생략(Key Omission)하거나 `null` 값을 넘겨서는 안 된다.

---

## 3. 슬라이드별 데이터 스키마 상세 규격 (Required JSON Struct)

최종 출력될 JSON 데이터는 반드시 아래의 명세 구조를 정확히 준수하여 패키징되어야 한다.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "B2B_Proposal_Data_Package",
  "type": "object",
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "client_name": { "type": "string" },
        "proposal_title": { "type": "string" },
        "pitch_style": { "type": "string", "enum": ["HEAVY_ACADEMIC", "LIGHT_AGILE"] },
        "theme_color": { "type": "string" }
      },
      "required": ["client_name", "proposal_title", "pitch_style", "theme_color"]
    },
    "design_system": {
      "type": "object",
      "properties": {
        "theme_type": { "type": "string", "enum": ["LIGHT", "DARK"] },
        "color_palette": {
          "type": "object",
          "properties": {
            "client_raw_color": { "type": "string" },
            "dominant_bg": { "type": "string" },
            "sub_text": { "type": "string" },
            "accent_color": { "type": "string" },
            "accent_rgb": {
              "type": "array",
              "items": { "type": "integer" },
              "minItems": 3,
              "maxItems": 3
            }
          }
        }
      }
    },
    "slides": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "slide_number": { "type": "integer" },
          "layout_type": {
            "type": "string",
            "enum": [
              "TITLE_SLIDE",
              "VENDOR_PROFILE",
              "PROBLEM_VS_SOLUTION",
              "FLOW_CHART",
              "COMPARISON_BENCHMARK",
              "CURRICULUM_TABLE",
              "N_COLUMN_CARDS",
              "EVALUATION_METRIC",
              "CLOSING_SLIDE"
            ]
          },
          "top_message": { "type": "string" },
          "content": {
            "type": "object",
            "properties": {
              "bullets": { "type": "array", "items": { "type": "string" } },
              "left_block": {
                "type": "object",
                "properties": {
                  "title": { "type": "string" },
                  "bullets": { "type": "array", "items": { "type": "string" } }
                }
              },
              "right_block": {
                "type": "object",
                "properties": {
                  "title": { "type": "string" },
                  "bullets": { "type": "array", "items": { "type": "string" } }
                }
              },
              "cards": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "header": { "type": "string" },
                    "body": { "type": "string" },
                    "highlight": { "type": "boolean" }
                  },
                  "required": ["header", "body"]
                }
              },
              "table_data": {
                "type": "object",
                "properties": {
                  "headers": { "type": "array", "items": { "type": "string" } },
                  "rows": {
                    "type": "array",
                    "items": { "type": "array", "items": { "type": "string" } }
                  }
                }
              }
            }
          }
        },
        "required": ["slide_number", "layout_type", "top_message", "content"]
      }
    }
  },
  "required": ["metadata", "slides"]
}
```

---

## 4. 데이터 정합성 자가 검증 (Self-Validation Constraint)

에이전트는 JSON 출력을 완료한 후, 렌더링 스크립트로 데이터를 밀어 넣기 직전 'JSON 스키마 유효성 검사' 모듈을 직접 실행하여 포맷이 깨졌는지 체크한다. 검증에 실패할 경우, 에이전트는 에러 메시지를 스스로 파싱하여 올바른 JSON 규격으로 자가 보정(Self-Correction)한 뒤 재출력해야 한다.

---

## 5. 완성된 JSON 패키지 예시 (Full Output Example)

```json
{
  "metadata": {
    "client_name": "S전자",
    "proposal_title": "S전자 신임 팀장급 대상\nAX 업무 자동화 부트캠프 제안",
    "pitch_style": "LIGHT_AGILE",
    "theme_color": "#1428A0"
  },
  "design_system": {
    "theme_type": "LIGHT",
    "color_palette": {
      "client_raw_color": "#1428A0",
      "dominant_bg": "#F8FAF8",
      "sub_text": "#334155",
      "accent_color": "#1428A0",
      "accent_rgb": [20, 40, 160]
    }
  },
  "slides": [
    {
      "slide_number": 1,
      "layout_type": "TITLE_SLIDE",
      "top_message": "S전자 신임 팀장 AX 역량 강화\n업무 자동화 30% 달성 전략 제안",
      "content": {
        "bullets": ["제안사: (주)에이아이에듀", "제안일: 2026년 5월", "대상: 신임 팀장급 30명"]
      }
    },
    {
      "slide_number": 2,
      "layout_type": "VENDOR_PROFILE",
      "top_message": "대기업 AX 교육 검증 실적 기반\n최적의 파트너십 제안",
      "content": {
        "table_data": {
          "headers": ["프로젝트명", "고객사", "규모", "만족도"],
          "rows": [
            ["신임 팀장 AI 혁신 과정", "H그룹", "50명", "4.9/5.0"],
            ["No-Code 업무 자동화 워크숍", "L전자", "40명", "4.8/5.0"],
            ["AX 전사 확산 리더 과정", "K은행", "60명", "4.7/5.0"]
          ]
        }
      }
    }
  ]
}
```
