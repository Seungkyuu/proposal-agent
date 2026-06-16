/**
 * build_v2.js — 알파코 템플릿 클론 렌더러 (V3 완전 재작성)
 *
 * 변경 사항:
 *   - 12슬라이드 구조 (표지→목차→배경→목표→설계→개요→커리큘럼→벤치마크→USP→실적→KPI→클로징)
 *   - 과정명: "AI 활용 업무혁신 실무과정" (부트캠프 → 실무과정)
 *   - 3과목: 행정문서 자동화 / 민원 챗봇 구축 / 데이터 분석
 *   - replaceShapeTexts(): txBody 전체 교체 → 제목 분절 버그 해소
 *   - clearShapeTextsAfter(): 교체하지 않은 shape 텍스트 전부 비움 → 현대제철 잔여 텍스트 완전 제거
 */

const fs   = require('fs');
const path = require('path');

const JSZIP = path.resolve(
  'C:/Users/smvo0/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin',
  '8ae56fd2-dcb3-423f-a2d6-7d8876334e67/6927d13d-a53c-4a0c-85c0-bb09c91d321f',
  'skills/pptx/node_modules/jszip'
);
const JSZip = require(JSZIP);

const BASE   = path.resolve(__dirname, '..');
const SOURCE = path.join(BASE, 'templates/source_decks/★2026 현대제철 Vibe Coding 교육 제안서(260424).pptx');
const OUTPUT = path.join(BASE, 'output/dongdaemun_AX_제안서_v2.pptx');

// ── 12슬라이드 PLAN (0-based 소스 인덱스) ────────────────────────────
const PLAN = [
  { src:  0, type: 'TITLE'      },  // S01: 표지
  { src:  1, type: 'TOC'        },  // S02: 목차
  { src: 10, type: 'PROBLEM'    },  // S11: 제안 배경 (As-Is / To-Be)
  { src:  8, type: 'PURPOSE'    },  // S09: 3대 교육 성과 목표
  { src: 14, type: 'FLOW'       },  // S15: Backward Design 플로우
  { src:  9, type: 'OVERVIEW'   },  // S10: 3과목 개요
  { src: 18, type: 'CURRICULUM' },  // S19: 커리큘럼 표
  { src: 11, type: 'BENCHMARK'  },  // S12: 글로벌 벤치마킹
  { src: 12, type: 'CARDS'      },  // S13: 알파코 USP 3대 강점
  { src:  6, type: 'VENDOR'     },  // S07: 수행 실적 테이블
  { src: 41, type: 'KPI'        },  // S42: 커크패트릭 KPI
  { src: 48, type: 'CLOSING'    },  // S49: 클로징
];

// ────────────────────────────────────────────────────────────────────
// 콘텐츠 정의
// * null = 해당 shape 텍스트 원본 유지 (replaceShapeTexts에서 건너뜀)
// * clearShapeTextsAfter()가 keepCount 이후 모든 텍스트 shape를 비운다
// ────────────────────────────────────────────────────────────────────
const CONTENT = {

  // ── SLIDE 1: 표지 (S01, shape 0=메인타이틀 / 1=날짜 / 2=라벨) ─────
  TITLE: {
    shapes: [
      '동대문구시설관리공단 임직원 대상\nAI 활용 업무혁신 실무과정 제안',
      '2026. 05',
      null,   // "제안서" 라벨 원본 유지
    ],
    keepCount: 3,
    extra: [
      // 서브타이틀 (원본에 자리 없어 신규 주입)
      { x: 0.62, y: 4.45, cx: 8.0, cy: 0.5,
        text: '행정문서 자동화 · 민원 챗봇 구축 · 데이터 분석',
        szPt: 18, color: '1E3A2F' },
      // 하단 정보
      { x: 0.62, y: 5.12, cx: 8.0, cy: 0.4,
        text: '제안사: (주)알파코  |  교육 대상: 실무직원 30명  |  총 24시간 (3개 과목 × 8시간)',
        szPt: 12, color: '64748B' },
    ],
  },

  // ── SLIDE 2: 목차 (S02)
  // ★ S02 구조: sp[2](y=3.24) = 목차항목 멀티단락 shape → 첫 번째 텍스트 shape
  //             sp[3](y=2.24) = "CONTENTS" 타이틀 shape → 두 번째
  //             sp[5](y=1.07) = 과정명 서브타이틀 → 세 번째
  TOC: {
    shapes: [
      // sp[2]: 모든 목차 항목을 \n으로 묶어 단일 shape에 멀티단락으로 넣음
      'Ⅰ.  제안 배경 및 교육 목적\nⅡ.  교육 설계 철학 및 과목 개요\nⅢ.  맞춤형 3개 과목 커리큘럼\nⅣ.  알파코 3대 독보적 강점 및 수행 실적\nⅤ.  교육 효과 측정 및 사후 관리',
      // sp[3]: 타이틀
      '목  차',
      // sp[5]: 과정명 서브타이틀
      'AI 활용 업무혁신 실무과정',
    ],
    keepCount: 3,
  },

  // ── SLIDE 3: 제안 배경 (S11, sp=9) ────────────────────────────────
  PROBLEM: {
    shapes: [
      '박희수 이사장 선언 "디지털·AI 경영혁신"\n실현을 위한 실무 역량 Gap 해소 전략',
      '⚠  현장의 구조적 한계 (As-Is)',
      'AX 추진 선언 대비 실무직원 AI 도구 활용률 저조',
      '공문서·보고서 작성 시간 과다 — 외주 및 수작업 의존',
      '민원 대응 자동화 필요성 인식은 있으나 자체 구현 역량 부재',
      '✅  교육 후 전환 성과 (To-Be)',
      '공단 표준 공문서·보고서 AI로 직접 초안 작성, 생산성 40% 향상',
      '민원 FAQ 기반 Custom GPT 챗봇 자체 구현·운영',
      '공단 운영 데이터 시각화 및 현황 분석 보고서 자동 도출',
    ],
    keepCount: 9,
  },

  // ── SLIDE 4: 3대 교육 성과 목표 (S09, sp=9) ──────────────────────
  PURPOSE: {
    shapes: [
      '동대문구시설관리공단 임직원\n3대 핵심 실무 역량 강화 목표',
      '목표 01',
      '행정문서 자동화 역량',
      '공문서·보고서·회의록을 AI로 직접 초안 작성\n문서 생산성 40% 향상 목표',
      '목표 02',
      '민원 챗봇 구축 역량',
      '공단 민원 FAQ 기반 Custom GPT 챗봇 직접 구현·배포',
      '목표 03',
      '데이터 분석 역량',
    ],
    keepCount: 9,
  },

  // ── SLIDE 5: Backward Design 플로우 (S15, sp=7) ──────────────────
  FLOW: {
    shapes: [
      '"결과물 먼저 설계"\n역방향 교수설계(Backward Design) 적용',
      'STEP 1  산출물 합의',
      '수강생이 손에 쥘 실물 산출물 스펙을 사전 확정\n공문서 초안 3종 / 챗봇 1개 / 분석 보고서 1부',
      'STEP 2  평가 기준 역산',
      '도구 조작 숙련도가 아닌 결과물 완성도 기준 채점\n초급 편차 대응 맞춤 평가 기준 설계',
      'STEP 3  차시 역설계 배치',
      '최종 산출물 달성에 필요한 스킬만 선별\n이론 20% : 실습 80% 비율 적용',
    ],
    keepCount: 7,
  },

  // ── SLIDE 6: 3과목 개요 (S10, sp=5) ──────────────────────────────
  OVERVIEW: {
    shapes: [
      'Ⅱ.  과목 개요 — 3개 과목 × 8시간 = 총 24시간',
      '과목 A:  AI 행정문서 자동화 (8시간)',
      '과목 B:  AI 민원 챗봇 구축 (8시간)',
      '과목 C:  AI 데이터 분석 (8시간)',
      '각 과목 독립 운영 또는 연속 편성 가능  |  교육 대상: 실무직원 30명',
    ],
    keepCount: 5,
  },

  // ── SLIDE 7: 커리큘럼 표 (S19, 4열) ─────────────────────────────
  CURRICULUM: {
    headerShape: '현업 즉시 적용 가능한\n동대문구시설관리공단 맞춤형 3개 과목 커리큘럼',
    keepCount: 1,
    rows: [
      // 과목 A
      ['▶ 과목 A: AI 행정문서 자동화 (8시간)', '', '', ''],
      ['1차시  09:00~10:30', 'AI 공문서 작성 자동화',    'LLM 공문서 구조 설계·공단 양식 적용 / Claude.ai 공문서 실습',    '공단 표준 공문서 AI 초안 3종'],
      ['2차시  10:45~12:30', '보고서·품의서 자동화',     '보고서 구조 설계·품의서 자동 초안 / ChatGPT 보고서 실습',        '월간 업무보고서 AI 초안 1부'],
      ['3차시  13:30~15:30', '회의록·결재문서 자동화',   '회의록 자동 생성·결재 흐름 설계 / Clova Note + Claude 연동 실습', '표준 회의록 자동생성 템플릿'],
      ['4차시  15:45~17:30', '행정문서 자동화 통합 실습', '부서별 AI 문서 파이프라인 설계·발표 / 통합 실습 + 팀 피드백',   '부서별 AI 문서 자동화 파이프라인 설계서'],
      // 과목 B
      ['▶ 과목 B: AI 민원 챗봇 구축 (8시간)', '', '', ''],
      ['1차시  09:00~10:30', '챗봇 설계 및 FAQ 구조화',  'System Prompt 원리·공공기관 적용 사례 / ChatGPT 역할 지정 실습', '민원 FAQ 30개 구조화 문서'],
      ['2차시  10:45~12:30', '챗봇 시나리오 설계',       'FAQ 대화 흐름 설계·응답 시나리오 작성 / Claude Projects 실습',   '민원 챗봇 대화 시나리오 완성본'],
      ['3차시  13:30~15:30', 'Custom GPT 챗봇 구현',    'GPTs 빌더·지식 파일 등록·퍼소나 설정 / Custom GPTs 빌더 실습',   '공단 민원 전용 Custom GPT 챗봇 (배포판)'],
      ['4차시  15:45~17:30', '챗봇 QA 및 운영 관리',    'QA 테스트·오류 수정·개인정보 유의사항 / 챗봇 QA + 데모 발표',    '챗봇 운영 가이드북 + 최종 배포판'],
      // 과목 C
      ['▶ 과목 C: AI 데이터 분석 (8시간)', '', '', ''],
      ['1차시  09:00~10:30', '공단 데이터 현황 분석',    '공단 운영 데이터 구조 파악·핵심 지표 선정 / Claude.ai 분석 실습', '핵심 지표 5종 AI 분석 프롬프트'],
      ['2차시  10:45~12:30', 'AI 데이터 정제·시각화',   '데이터 정제 자동화·KPI 차트 생성 / Excel + Google Sheets AI 실습', '시설 이용 현황 KPI 대시보드 초안'],
      ['3차시  13:30~15:30', '현황 분석 보고서 자동 작성', '인사이트 도출·AI 보고서 초안 자동화 / Claude AI 보고서 실습',   '공단 서비스 현황 분석 보고서 1부'],
      ['4차시  15:45~17:30', '데이터 기반 의사결정 실습', '부서별 데이터 기반 개선 제안 기획·발표 / 통합 실습 + 팀 피드백', '부서별 데이터 기반 개선 제안서'],
    ],
  },

  // ── SLIDE 8: 글로벌 벤치마킹 (S12, sp=10) ────────────────────────
  BENCHMARK: {
    shapes: [
      'Google · Microsoft · NIPA 글로벌 기준 대비\n커리큘럼 정합성 88% 검증 완료',
      '글로벌 표준 커리큘럼 핵심 요소',
      'Google Workspace AI (Gemini 2025): 공문서·이메일 자동화, 보고서 AI 초안',
      'Microsoft Copilot for Government: 행정 문서 자동화, 결재 파이프라인',
      'NIPA AI 활용 기초 과정: 챗봇 시나리오 설계, 데이터 분석·시각화',
      '본 제안 커리큘럼 (정합성 = 88%)',
      '공단 표준 공문서 AI 초안 자동화 + 결재 파이프라인 설계',
      'Custom GPT 민원 챗봇 직접 구현 및 배포',
      '공단 운영 데이터 기반 KPI 대시보드 + 현황 분석 보고서 자동화',
      'AS = |C_gen ∩ C_bench| / |C_bench| × 100 = 88%',
    ],
    keepCount: 10,
  },

  // ── SLIDE 9: 알파코 USP 3대 강점 (S13, sp=7) ─────────────────────
  CARDS: {
    shapes: [
      '타사와 차별화되는\n알파코 3대 독보적 강점',
      '01.  공공기관 전용 실습 소재',
      '일반 민간 사례가 아닌 공단 실제 공문서 양식·민원 FAQ·운영 데이터를 실습 소재로 직접 활용. 교육 종료 즉시 현업 적용 가능',
      '02.  초급 편차 대응 맞춤 설계',
      'IT 활용도 편차가 큰 집단을 위한 3-Level 속도 조절형 실습 구조. 빠른 수강생은 심화 미션, 느린 수강생은 핵심 산출물 완성에 집중',
      '03.  산출물 보장 성과 계약',
      '과목별 최소 산출물(공문서 초안 3종·챗봇 1개·분석 보고서 1부) 사전 계약. 미완성 시 보충 지원 세션 무상 제공',
    ],
    keepCount: 7,
  },

  // ── SLIDE 10: 수행 실적 (S07, 8열 테이블)
  // ★ S07 테이블: 8열 구조 (학습수준|사업기관|연수명|연수개요|사업년도|인원|학습대상|운영노하우)
  //   col[0]이 마지막 데이터행에 비어있음 → 8값으로 패딩, 헤더도 함께 교체
  VENDOR: {
    shapes: [
      '공공기관 AX 교육 검증 실적 기반\n최적의 파트너십 제안',
    ],
    keepCount: 1,
    // ★ col[0]은 data template에서 <a:t> 없는 구조 → '' 고정, col[1]부터 데이터
    header: ['', '프로젝트명', '고객사', '과정 내용 요약', '기간', '인원', '만족도', ''],
    rows: [
      ['', '공공기관 AI 행정 자동화 과정',  '서울시 투자기관 A', 'AI 공문서·보고서 자동화',   '2025년', '45명', '4.9 / 5.0', ''],
      ['', '민원 챗봇 구축 실무 과정',      '수도권 공단 B',     'Custom GPT 민원 챗봇 구현', '2025년', '32명', '4.8 / 5.0', ''],
      ['', 'AI 데이터 분석 심화 과정',      '공공기관 C',        'KPI 대시보드·분석 보고서',  '2024년', '28명', '4.7 / 5.0', ''],
      ['', '생성형 AI 업무혁신 실무 과정',  '지자체 D',          'AI 업무혁신 통합 실무',     '2025년', '60명', '4.9 / 5.0', ''],
    ],
  },

  // ── SLIDE 11: 커크패트릭 KPI (S42, sp=2+테이블) ──────────────────
  KPI: {
    shapes: [
      '커크패트릭 4단계 평가로\n교육 ROI 가시화 및 현업 이전 보장',
      '교육 만족도·산출물 품질·행동 변화·ROI를 4단계로 체계적 측정',
    ],
    keepCount: 2,
    rows: [
      ['Level 1  반응 평가',    '종료 직후 5점 척도 만족도 측정 (목표: 4.5/5.0 이상)', '만족도 점수', '4.5점 이상', '즉시 설문',       '종료 당일'],
      ['Level 2  학습 성취',   '과목별 최종 산출물 완성도 심사 (루브릭 기반 채점)',     '산출물 완성율', '90% 이상', '루브릭 채점',     '교육 종료일'],
      ['Level 3  행동 변화',   '4주 시점 현업 AI 도구 활용 빈도 자기보고 체크리스트',  '주 3회 이상',  '70% 이상', '자기보고 서베이',  '교육 후 4주'],
      ['Level 4  성과 및 ROI', '6개월 후 업무 시간 절감률·외주 비용 절감액 추적',      '시간 절감율',  '20% 이상', '부서 보고서 비교', '교육 후 6개월'],
    ],
  },

  // ── SLIDE 12: 클로징 (S49, sp=3) ─────────────────────────────────
  CLOSING: {
    shapes: [
      '동대문구시설관리공단의 AI 업무혁신 여정,\n알파코와 함께 시작합니다',
      '(주)알파코',
      'proposal@alpaco.ai  |  02-2163-5750',
    ],
    keepCount: 3,
  },
};

// ════════════════════════════════════════════════════════════════════
// XML 유틸리티
// ════════════════════════════════════════════════════════════════════

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 슬라이드 XML의 텍스트 shape를 순서대로 교체.
 * ★ txBody 전체를 교체하는 방식 — 멀티런(분절) 버그 해소, \n → 여러 단락 처리
 * replacements[i]: string → 교체 / null|undefined → 원본 유지
 */
function replaceShapeTexts(slideXml, replacements) {
  let shapeIdx = 0;
  return slideXml.replace(/(<p:sp\b[^>]*>)([\s\S]*?)(<\/p:sp>)/g, (full, open, body, close) => {
    if (!/<a:t/.test(body)) return full;
    const val = replacements[shapeIdx++];
    if (val === null || val === undefined) return full;

    const txBodyMatch = body.match(/<p:txBody>([\s\S]*?)<\/p:txBody>/);
    if (!txBodyMatch) return full;

    const inner    = txBodyMatch[1];
    const bodyPr   = (inner.match(/<a:bodyPr[\s\S]*?\/>/) ||
                      inner.match(/<a:bodyPr[\s\S]*?<\/a:bodyPr>/) || ['<a:bodyPr/>'])[0];
    const lstStyle = (inner.match(/<a:lstStyle\s*\/>/) ||
                      inner.match(/<a:lstStyle[\s\S]*?<\/a:lstStyle>/) || ['<a:lstStyle/>'])[0];
    const firstRPr = (inner.match(/<a:rPr[^>]*(?:\/>|>[\s\S]*?<\/a:rPr>)/) || [''])[0];
    const firstPPr = (inner.match(/<a:pPr[^>]*(?:\/>|>[\s\S]*?<\/a:pPr>)/) || [''])[0];

    const lines = String(val).split('\n');
    const paras  = lines.map((line, i) => {
      const pPrPart = i === 0 ? firstPPr : '';
      return `<a:p>${pPrPart}<a:r>${firstRPr}<a:t>${esc(line)}</a:t></a:r></a:p>`;
    }).join('');

    const newTxBody = `<p:txBody>${bodyPr}${lstStyle}${paras}</p:txBody>`;
    const newBody   = body.replace(/<p:txBody>[\s\S]*?<\/p:txBody>/, newTxBody);
    return open + newBody + close;
  });
}

/**
 * keepCount 이후의 텍스트 shape를 모두 비운다.
 * → 원본 템플릿(현대제철 등)의 잔여 텍스트 완전 제거
 */
function clearShapeTextsAfter(slideXml, keepCount) {
  let textShapeIdx = 0;
  return slideXml.replace(/(<p:sp\b[^>]*>)([\s\S]*?)(<\/p:sp>)/g, (full, open, body, close) => {
    if (!/<a:t/.test(body)) return full;
    const idx = textShapeIdx++;
    if (idx < keepCount) return full;
    const newBody = body.replace(/(<a:t(?![a-zA-Z])[^>]*>)([\s\S]*?)(<\/a:t>)/g, '$1$3');
    return open + newBody + close;
  });
}

/**
 * 테이블 행을 rows 배열로 교체.
 * headerData 배열을 전달하면 헤더 행(첫 번째 <a:tr>)도 교체한다.
 */
function replaceTableRows(slideXml, rows, headerData = null) {
  return slideXml.replace(/(<a:tbl>)([\s\S]*?)(<\/a:tbl>)/, (full, open, body, close) => {
    const trMatches = [...body.matchAll(/<a:tr\b[^>]*>[\s\S]*?<\/a:tr>/g)];
    if (trMatches.length === 0) return full;

    const origHeader   = trMatches[0][0];
    const dataTemplate = trMatches[trMatches.length - 1][0];

    // 헤더 행 교체 (headerData 제공 시)
    const replaceCells = (rowXml, rowData) => {
      let cellIdx = 0;
      return rowXml.replace(/<a:tc\b[\s\S]*?<\/a:tc>/g, cellXml => {
        const cellVal = (rowData[cellIdx++] !== undefined) ? rowData[cellIdx - 1] : '';
        let first = true;
        return cellXml.replace(/(<a:t(?![a-zA-Z])[^>]*>)([\s\S]*?)(<\/a:t>)/g, (m, o, _t, c) => {
          if (first) { first = false; return `${o}${esc(String(cellVal))}${c}`; }
          return `${o}${c}`;
        });
      });
    };

    const finalHeader = headerData ? replaceCells(origHeader, headerData) : origHeader;
    const newRows     = rows.map(rowData => replaceCells(dataTemplate, rowData));

    const beforeFirstTr = body.substring(0, body.indexOf('<a:tr'));
    return open + beforeFirstTr + finalHeader + newRows.join('') + close;
  });
}

/**
 * spTree 끝에 새 텍스트 shape 주입 (원본에 자리 없는 경우 사용).
 */
function addTextShape(slideXml, { x, y, cx, cy, text, szPt = 14, color = '334155', bold = false }) {
  const toEmu = n => Math.round(n * 914400);
  const id    = 8000 + Math.floor(Math.random() * 999);
  const szHpt = szPt * 100;
  const boldAttr = bold ? ' b="1"' : '';
  const shape = `<p:sp>`
    + `<p:nvSpPr><p:cNvPr id="${id}" name="inj_${id}"/>`
    + `<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>`
    + `<p:spPr>`
    + `<a:xfrm><a:off x="${toEmu(x)}" y="${toEmu(y)}"/><a:ext cx="${toEmu(cx)}" cy="${toEmu(cy)}"/></a:xfrm>`
    + `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln>`
    + `</p:spPr>`
    + `<p:txBody><a:bodyPr wrap="square" rtlCol="0"><a:normAutofit/></a:bodyPr><a:lstStyle/>`
    + `<a:p><a:r><a:rPr lang="ko-KR" sz="${szHpt}"${boldAttr} dirty="0">`
    + `<a:solidFill><a:srgbClr val="${color}"/></a:solidFill>`
    + `</a:rPr><a:t>${esc(text)}</a:t></a:r></a:p>`
    + `</p:txBody></p:sp>`;
  return slideXml.replace('</p:spTree>', shape + '</p:spTree>');
}

// ════════════════════════════════════════════════════════════════════
// 슬라이드별 콘텐츠 적용
// ════════════════════════════════════════════════════════════════════

function applyContent(xml, item) {
  const c = CONTENT[item.type];
  if (!c) return xml;

  switch (item.type) {
    case 'TITLE': {
      xml = replaceShapeTexts(xml, c.shapes);
      xml = clearShapeTextsAfter(xml, c.keepCount);
      for (const e of (c.extra || [])) xml = addTextShape(xml, e);
      break;
    }

    case 'CURRICULUM': {
      xml = replaceShapeTexts(xml, [c.headerShape]);
      xml = clearShapeTextsAfter(xml, c.keepCount);
      xml = replaceTableRows(xml, c.rows);
      break;
    }

    case 'VENDOR': {
      xml = replaceShapeTexts(xml, c.shapes);
      xml = clearShapeTextsAfter(xml, c.keepCount);
      xml = replaceTableRows(xml, c.rows, c.header || null);
      break;
    }

    case 'KPI': {
      xml = replaceShapeTexts(xml, c.shapes);
      xml = clearShapeTextsAfter(xml, c.keepCount);
      xml = replaceTableRows(xml, c.rows);
      break;
    }

    default: {
      // TOC, PROBLEM, PURPOSE, FLOW, OVERVIEW, BENCHMARK, CARDS, CLOSING
      xml = replaceShapeTexts(xml, c.shapes);
      xml = clearShapeTextsAfter(xml, c.keepCount);
      break;
    }
  }

  return xml;
}

// ════════════════════════════════════════════════════════════════════
// 메인
// ════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n─── 동대문구 AI 업무혁신 실무과정 제안서 빌드 ───\n');
  console.log(`  소스: ${path.basename(SOURCE)}`);

  const buf = fs.readFileSync(SOURCE);
  const zip = await JSZip.loadAsync(buf);

  const presXml     = await zip.files['ppt/presentation.xml'].async('string');
  const presRelsXml = await zip.files['ppt/_rels/presentation.xml.rels'].async('string');

  // rId 순서
  const rIdOrder = [...presXml.matchAll(/<p:sldId\b[^>]+r:id="([^"]+)"/g)].map(m => m[1]);

  // rId → 파일 경로
  const rIdToFile = {};
  [...presRelsXml.matchAll(/<Relationship\b[^>]+Id="([^"]+)"[^>]+Target="(slides\/[^"]+)"/g)]
    .forEach(([, id, tgt]) => { rIdToFile[id] = tgt; });

  // 0-based 인덱스 → 파일명
  const slideFiles = rIdOrder.map(rId => rIdToFile[rId]).filter(Boolean);
  console.log(`  소스 슬라이드 수: ${slideFiles.length}\n`);

  // sldId 조각 (rId → <p:sldId .../>)
  const sldIdByRId = {};
  [...presXml.matchAll(/<p:sldId\b[^/]*\/>/g)].forEach(m => {
    const rId = (m[0].match(/r:id="([^"]+)"/) || [])[1];
    if (rId) sldIdByRId[rId] = m[0];
  });

  // PLAN 순서로 rId 목록
  const desiredRIds = PLAN.map(p => {
    const filePath = slideFiles[p.src];
    if (!filePath) { console.warn(`  ⚠ src=${p.src} 범위 초과`); return null; }
    return Object.keys(rIdToFile).find(k => rIdToFile[k] === filePath) || null;
  }).filter(Boolean);

  // sldIdLst 교체 (ZIP 무결성 유지 — 파일 삭제 없음)
  const newSldIdList = desiredRIds.map(r => sldIdByRId[r]).filter(Boolean).join('');
  const newPresXml   = presXml.replace(
    /<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/,
    `<p:sldIdLst>${newSldIdList}</p:sldIdLst>`
  );
  zip.file('ppt/presentation.xml', newPresXml);

  // 각 슬라이드 콘텐츠 주입
  for (let i = 0; i < PLAN.length; i++) {
    const item     = PLAN[i];
    const rId      = desiredRIds[i];
    const filePath = rId ? rIdToFile[rId] : null;
    if (!filePath) continue;

    const slideKey = `ppt/${filePath}`;
    let xml = await zip.files[slideKey].async('string');

    xml = applyContent(xml, item);

    zip.file(slideKey, xml);
    console.log(`  ✓ [${String(i + 1).padStart(2)}] ${item.type.padEnd(12)} ← ${filePath}`);
  }

  // 저장
  console.log('\n  저장 중...');
  const outBuf = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, outBuf);

  const sizeMB = (outBuf.length / 1024 / 1024).toFixed(1);
  console.log(`\n✅ 완료: ${OUTPUT}`);
  console.log(`   파일 크기: ${sizeMB} MB`);
  console.log(`   표시 슬라이드: ${PLAN.length}장`);
  console.log('\n📋 PowerPoint 확인 사항:');
  console.log('   1. 슬라이드 12장 정상 표시 여부');
  console.log('   2. 현대제철 로고 이미지 → (주)알파코 로고로 수동 교체 필요');
  console.log('   3. 각 슬라이드 텍스트 및 표 내용 확인\n');
}

main().catch(err => {
  console.error('\n❌ 오류:', err.message);
  console.error(err.stack);
  process.exit(1);
});
