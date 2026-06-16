const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── 색상 팔레트 ────────────────────────────────────────────────────────────
const COLOR = {
  NAVY:     '1A3A5C',  // IBK 딥 네이비
  ACCENT:   '2E6DB4',  // IBK 블루 (강조)
  LIGHT:    'D5E8F0',  // 연한 하늘
  WHITE:    'FFFFFF',
  BLACK:    '1A1A2E',
  GRAY:     '6B7280',
  TBD:      'B85042',  // 미확정 항목 강조
  BORDER:   'AECDE0',
};

// ─── 공통 셀 테두리 ──────────────────────────────────────────────────────────
const borders = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: COLOR.BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR.BORDER },
  left:   { style: BorderStyle.SINGLE, size: 1, color: COLOR.BORDER },
  right:  { style: BorderStyle.SINGLE, size: 1, color: COLOR.BORDER },
};

// ─── 헬퍼: 스타일링된 헤더 셀 ──────────────────────────────────────────────
function headerCell(text, w) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: COLOR.NAVY, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: COLOR.WHITE, size: 20, font: 'Malgun Gothic' })]
    })]
  });
}

// ─── 헬퍼: 일반 셀 ──────────────────────────────────────────────────────────
function dataCell(text, w, opts = {}) {
  const { center = false, bold = false, shade = null, isTbd = false, size = 20 } = opts;
  const color = isTbd ? COLOR.TBD : COLOR.BLACK;
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, bold, color, size, font: 'Malgun Gothic' })]
    })]
  });
}

// ─── 헬퍼: 섹션 제목 단락 ───────────────────────────────────────────────────
function sectionHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, font: 'Malgun Gothic' })]
  });
}

// ─── 헬퍼: 일반 본문 단락 ───────────────────────────────────────────────────
function bodyPara(text, opts = {}) {
  const { bold = false, color = COLOR.BLACK, indent = 0, size = 20, spacing = 120 } = opts;
  return new Paragraph({
    indent: indent ? { left: indent } : undefined,
    spacing: { after: spacing },
    children: [new TextRun({ text, bold, color, size, font: 'Malgun Gothic' })]
  });
}

// ─── 헬퍼: 불릿 단락 ────────────────────────────────────────────────────────
function bulletPara(text, opts = {}) {
  const { color = COLOR.BLACK, size = 20 } = opts;
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, color, size, font: 'Malgun Gothic' })]
  });
}

// ─── 헬퍼: 서브 불릿 단락 ───────────────────────────────────────────────────
function subBulletPara(text, opts = {}) {
  const { color = COLOR.GRAY, size = 18 } = opts;
  return new Paragraph({
    numbering: { reference: 'sub-bullets', level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, color, size, font: 'Malgun Gothic' })]
  });
}

// ─── 빈 줄 ───────────────────────────────────────────────────────────────────
function spacer(size = 80) {
  return new Paragraph({ spacing: { after: size }, children: [new TextRun('')] });
}

// ════════════════════════════════════════════════════════════════════════════════
// 1. 표지 슬라이드 콘텐츠
// ════════════════════════════════════════════════════════════════════════════════
function buildCoverPage() {
  return [
    spacer(400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: 'IBK기업은행 AX 집합교육', bold: true, size: 52, color: COLOR.NAVY, font: 'Malgun Gothic' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: '교육기획안 (초안)', bold: true, size: 44, color: COLOR.ACCENT, font: 'Malgun Gothic' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [new TextRun({ text: '본부부서 관리자 AI 업무 활용 역량 강화 과정', size: 28, color: COLOR.GRAY, font: 'Malgun Gothic' })]
    }),
    // 구분선
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.ACCENT } },
      spacing: { after: 320 },
      children: [new TextRun('')]
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: '제안사: (주)알파코', size: 22, color: COLOR.GRAY, font: 'Malgun Gothic' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: '작성일: 2026년 6월', size: 22, color: COLOR.GRAY, font: 'Malgun Gothic' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: '상태: 초안 (미확정 항목 ★ 표시 포함)', size: 22, color: COLOR.TBD, font: 'Malgun Gothic', bold: true })]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 2. 목차
// ════════════════════════════════════════════════════════════════════════════════
function buildTOC() {
  const items = [
    '1. 사업 개요',
    '2. 운영 구조 — 16회차 / 48세션 / 480명',
    '3. 커리큘럼 설계 — 팀장과정 · 부장과정',
    '4. 강사 구성 및 교육 인프라',
    '5. 사내 LLM 연계 전략 (내부 참조)',
    '6. 기대 효과 및 KPI',
    '7. 견적 기준',
    '8. 미확정 사항 (TBD)',
    '9. 추가 고려 사항',
  ];
  return [
    sectionHeading('목 차'),
    ...items.map(t => bodyPara(t, { size: 22, spacing: 140 })),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 3. Section 1 — 사업 개요
// ════════════════════════════════════════════════════════════════════════════════
function buildSection1() {
  const rows = [
    ['교육 목적', '본부부서 관리자(부장/팀장)의 AI 업무 활용 역량 강화'],
    ['교육 대상', '본부부서 관리자 — 부장급 / 팀장급'],
    ['총 교육 인원', '480명 (팀장 360명 + 부장 120명)'],
    ['1인당 교육 시간', '총 12시간 (4시간 × 3세션)'],
    ['회차당 인원', '30명'],
    ['강사 구성', '주강사 1명 + 보조강사 1명 (★ 보조강사 투입 기준 협의 필요)'],
    ['교육 장소', 'IBK 내부 강의장 (★ 세부 장소 미확정)'],
    ['운영 기간', '2025년 8월 ~ 11월 (총 4개월)'],
    ['주요 도구', '사내 LLM + 보조 상용 LLM (★ 사내 LLM 연계 여부 협의 중)'],
  ];

  const W = [3200, 6400];

  return [
    sectionHeading('1. 사업 개요'),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        new TableRow({ children: [headerCell('항목', W[0]), headerCell('내용', W[1])] }),
        ...rows.map(([k, v]) => new TableRow({
          children: [
            dataCell(k, W[0], { bold: true, shade: COLOR.LIGHT }),
            dataCell(v, W[1], { isTbd: v.includes('★') })
          ]
        }))
      ]
    }),
    spacer(200),
    bodyPara('※ ★ 표시 항목은 IBK 내부 협의 후 확정 필요', { color: COLOR.TBD, size: 18 }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 4. Section 2 — 운영 구조
// ════════════════════════════════════════════════════════════════════════════════
function buildSection2() {
  const W1 = [2400, 2200, 2200, 1400, 1400];
  const scheduleRows = [
    ['팀장과정', '8월', '1회차 (T-1~T-3)', '30명', '4H×3'],
    ['팀장과정', '9월', '2회차 (T-1~T-3)', '30명', '4H×3'],
    ['팀장과정', '10월', '3회차 (T-1~T-3)', '30명', '4H×3'],
    ['팀장과정', '11월', '4회차 (T-1~T-3)', '30명', '4H×3'],
    ['부장과정', '8월', '1회차 (D-1~D-3)', '30명', '4H×3'],
    ['부장과정', '10월', '2회차 (D-1~D-3)', '30명', '4H×3'],
  ];

  const W2 = [2400, 7200];

  return [
    sectionHeading('2. 운영 구조'),
    sectionHeading('2-1. 전체 일정 개요', HeadingLevel.HEADING_2),
    bodyPara('• 팀장과정: 월 1회차 × 4개월(8~11월) × 30명 = 120명 × 3세션 = 360명 수료'),
    bodyPara('• 부장과정: 격월 1회차 × 2개월(8, 10월) × 30명 = 60명 × 3세션 = 120명 수료'),
    bodyPara('• 합계: 16회차(총 48세션) / 480명'),
    spacer(100),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W1,
      rows: [
        new TableRow({ children: [
          headerCell('과정 구분', W1[0]),
          headerCell('운영 월', W1[1]),
          headerCell('회차 번호', W1[2]),
          headerCell('인원', W1[3]),
          headerCell('시간', W1[4])
        ]}),
        ...scheduleRows.map((r, i) => new TableRow({
          children: r.map((v, ci) => dataCell(v, W1[ci], { center: ci >= 3, shade: r[0].includes('부장') ? 'EDF4FB' : null }))
        }))
      ]
    }),
    spacer(200),
    sectionHeading('2-2. 1회차 구조 (30명 × 12H)', HeadingLevel.HEADING_2),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W2,
      rows: [
        new TableRow({ children: [headerCell('구성', W2[0]), headerCell('내용', W2[1])] }),
        new TableRow({ children: [
          dataCell('세션 구성', W2[0], { bold: true, shade: COLOR.LIGHT }),
          dataCell('3세션 (각 4H) — 세션 간 1~4주 간격으로 분산 운영 가능', W2[1])
        ]}),
        new TableRow({ children: [
          dataCell('1인당 총 이수', W2[0], { bold: true, shade: COLOR.LIGHT }),
          dataCell('12H (세션 1: 4H + 세션 2: 4H + 세션 3: 4H)', W2[1])
        ]}),
        new TableRow({ children: [
          dataCell('세션 독립성', W2[0], { bold: true, shade: COLOR.LIGHT }),
          dataCell('각 세션은 독립 수강 가능 (느슨한 연계 구조)\n세션 시작 시 15분 Recap으로 연속성 보완', W2[1])
        ]}),
        new TableRow({ children: [
          dataCell('30명 편성 이유', W2[0], { bold: true, shade: COLOR.LIGHT }),
          dataCell('소규모 실습 집중 + 강사 1:1 피드백 최적화', W2[1])
        ]}),
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 5. Section 3 — 커리큘럼 설계
// ════════════════════════════════════════════════════════════════════════════════
function buildSection3() {
  const W = [1400, 2600, 1600, 3600];  // 차시 / 모듈 / 형태 / 핵심 내용

  // 팀장 과정 (T-1, T-2, T-3)
  const teamLeaderSessions = {
    'T-1 (4H) — AI 리터러시 & 프롬프트 기초': [
      ['Recap (15분)', '전 세션 연계', '강의', '기초 개념 환기 (1회차는 과정 개요 소개)'],
      ['1모듈 (1H)', 'AI 개념 & 트렌드', '강의', 'LLM 원리, 생성형 AI 개요, AI 환각 이해'],
      ['2모듈 (1H)', 'AI 업무 적용 사례', '강의+토론', '국내외 금융권 AI 도입 사례 / IBK AX 방향성'],
      ['3모듈 (1.5H)', '프롬프트 기초 실습', '실습', 'Role·Context·Format 구조 / 개인 프롬프트 5종'],
      ['4모듈 (30분)', '세션 정리 & 숙제', '발표', '내 업무 AI 적용 아이디어 1개 도출 과제'],
    ],
    'T-2 (4H) — 프롬프트 심화 & 사내 LLM 탐색': [
      ['Recap (15분)', '전 세션 연계', '강의', 'T-1 핵심 개념 + 프롬프트 수정 피드백 공유'],
      ['1모듈 (1H)', '사내 LLM vs 상용 LLM', '강의', '사내 LLM 특징·보안·활용 범위 비교 (★ 내용 협의 필요)'],
      ['2모듈 (1.5H)', '업무 시나리오 실습', '실습', '여신/수신/지원부서 별 프롬프트 실전 적용'],
      ['3모듈 (45분)', '반복 개선 사이클', '실습', '동일 업무 프롬프트 3회 반복 수정 → 품질 비교'],
      ['4모듈 (30분)', '결과물 공유 & 피드백', '발표', '팀원 간 프롬프트 교차 피드백'],
    ],
    'T-3 (4H) — 팀 프로젝트 & 현업 전환': [
      ['Recap (15분)', '전 세션 연계', '강의', 'T-2 핵심 + AI 도구 활용 원칙 요약'],
      ['1모듈 (30분)', '프로젝트 킥오프', '실습', '팀 구성 (3~4인) / 업무 시나리오 선택'],
      ['2모듈 (1.5H)', '팀 실습 과제', '실습', '선택 시나리오 기반 AI 결과물 생성 + 개선'],
      ['3모듈 (1H)', '팀 발표 & 루브릭 평가', '발표', '5분 발표 → 루브릭 채점 (프롬프트·완성도·적용가능성)'],
      ['4모듈 (30분)', '과정 총정리 & 현업 연결', '강의', '현업 복귀 후 AI 활용 로드맵 제시'],
    ],
  };

  // 부장 과정 (D-1, D-2, D-3)
  const directorSessions = {
    'D-1 (4H) — AI 전략 이해 & 의사결정 맥락': [
      ['Recap (15분)', '전 세션 연계', '강의', '기초 개념 환기 (1회차는 과정 개요 소개)'],
      ['1모듈 (1H)', 'AI 트렌드 & 경영 영향', '강의', '글로벌 금융 AI 전략 트렌드 / IBK AX 방향성 해석'],
      ['2모듈 (1H)', 'AI 리스크 & 책임 경영', '강의', 'AI 환각·편향·규제 이슈 → 관리자 판단 프레임'],
      ['3모듈 (1.5H)', '프롬프트 체험 실습', '실습', '부서 업무 맥락 프롬프트 직접 작성 (관리자 수준)'],
      ['4모듈 (30분)', '토론', '토론', '부서 내 AI 도입 장벽 & 해결 방향'],
    ],
    'D-2 (4H) — 부서 AI 전환 기획': [
      ['Recap (15분)', '전 세션 연계', '강의', 'D-1 핵심 + 금융권 AI 최신 사례 업데이트'],
      ['1모듈 (1H)', '사내 LLM 활용 전략', '강의', '사내 LLM 연계 가능 업무 영역 식별 (★ 협의 필요)'],
      ['2모듈 (1.5H)', '부서 AI 적용 시나리오', '실습', '현재 반복 업무 AI 전환 방안 기획 (개인 산출물)'],
      ['3모듈 (45분)', '실습 결과 발표', '발표', '개인 시나리오 3분 공유 + 강사 코멘트'],
      ['4모듈 (30분)', 'AI 도입 장벽 Workshop', '토론', '조직 내 AI 확산 저항 요인 + 대응 전략'],
    ],
    'D-3 (4H) — 실행 계획 수립 & 팀 리딩': [
      ['Recap (15분)', '전 세션 연계', '강의', 'D-2 핵심 + 부서 시나리오 피드백 요약'],
      ['1모듈 (1H)', 'AI 조직 문화 리딩', '강의', '팀장/팀원 AI 역량 격차 관리 / 심리적 안전감 조성'],
      ['2모듈 (1H)', '90일 AI 전환 실행 계획', '실습', '부서 단위 AI 도입 90일 Action Plan 작성'],
      ['3모듈 (1H)', '실행 계획 발표 & 피어 리뷰', '발표', '5분 발표 → 동료 부장 교차 피드백'],
      ['4모듈 (30분)', '과정 총정리 & 다음 액션', '강의', '경영진 보고 포인트 정리 + 수료'],
    ],
  };

  function buildSessionTable(sessions) {
    const blocks = [];
    for (const [sessionName, modules] of Object.entries(sessions)) {
      blocks.push(sectionHeading(sessionName, HeadingLevel.HEADING_3));
      blocks.push(new Table({
        width: { size: 9600, type: WidthType.DXA },
        columnWidths: W,
        rows: [
          new TableRow({ children: [
            headerCell('차시/시간', W[0]),
            headerCell('모듈명', W[1]),
            headerCell('형태', W[2]),
            headerCell('핵심 내용', W[3])
          ]}),
          ...modules.map(([t, m, f, c]) => new TableRow({
            children: [
              dataCell(t, W[0], { center: true, shade: t.includes('Recap') ? 'F0F4F8' : null }),
              dataCell(m, W[1], { bold: !t.includes('Recap') }),
              dataCell(f, W[2], { center: true }),
              dataCell(c, W[3], { isTbd: c.includes('★'), size: 18 })
            ]
          }))
        ]
      }));
      blocks.push(spacer(160));
    }
    return blocks;
  }

  return [
    sectionHeading('3. 커리큘럼 설계'),
    bodyPara('▶ 팀장과정과 부장과정은 대상(역할)이 다르지만 동일한 3세션 구조(총 12H)를 유지한다.', { bold: true }),
    bodyPara('▶ 팀장과정은 도구 숙달·실습 중심, 부장과정은 전략적 판단·의사결정 활용 중심으로 설계한다.', { bold: true }),
    spacer(100),

    sectionHeading('3-A. 팀장과정 커리큘럼 (T-1 ~ T-3)', HeadingLevel.HEADING_2),
    ...buildSessionTable(teamLeaderSessions),

    sectionHeading('3-B. 부장과정 커리큘럼 (D-1 ~ D-3)', HeadingLevel.HEADING_2),
    ...buildSessionTable(directorSessions),

    sectionHeading('3-C. 팀장 vs 부장 비교', HeadingLevel.HEADING_2),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: [3200, 3200, 3200],
      rows: [
        new TableRow({ children: [headerCell('구분', 3200), headerCell('팀장과정', 3200), headerCell('부장과정', 3200)] }),
        ...[
          ['초점', '도구 숙달 + 실습 완주', '전략 이해 + 의사결정 지원'],
          ['LLM 실습', '직접 프롬프트 작성 (多)', '체험 수준 + 업무 기획 (中)'],
          ['최종 산출물', '팀 프로젝트 결과물', '90일 실행계획서'],
          ['의사결정 콘텐츠', '낮음', '높음 (AI 리스크, 조직 관리)'],
          ['사내 LLM 비중', '실습 포함 (★협의)', '전략적 활용 논의 위주'],
        ].map(r => new TableRow({ children: r.map((v, i) => dataCell(v, 3200, { bold: i === 0, shade: i === 0 ? COLOR.LIGHT : null })) }))
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 6. Section 4 — 강사 구성 및 교육 인프라
// ════════════════════════════════════════════════════════════════════════════════
function buildSection4() {
  const W = [3200, 2600, 3800];
  const rows = [
    ['PC / 노트북', '1인 1석', '개인 AI 실습 필수 — 공용 PC 가능 여부 확인 필요'],
    ['인터넷 연결', '전원 보장', '외부망 사용 가능 여부 사전 확인 필수 (상용 LLM 접속)'],
    ['사내 LLM 접속', '★ 협의 필요', '사내 망 환경에서 LLM API 접속 허용 여부 확인'],
    ['강의 프로젝터', '고해상도 권장', 'AI 결과물 시연 화면 공유 용도'],
    ['강의실 규모', '30명 수용', '원형/반원형 배치 → 팀 실습에 적합'],
    ['녹화/촬영', '★ 협의 필요', '강의 콘텐츠 자산화 여부 (저작권·초상권 협의)'],
    ['보조강사 투입', '★ 협의 필요', '세션당 주강사 1+보조강사 1 구성 vs 주강사 단독 결정'],
  ];

  return [
    sectionHeading('4. 강사 구성 및 교육 인프라'),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        new TableRow({ children: [headerCell('항목', W[0]), headerCell('기준', W[1]), headerCell('비고 / 미확정 사항', W[2])] }),
        ...rows.map(r => new TableRow({
          children: [
            dataCell(r[0], W[0], { bold: true, shade: COLOR.LIGHT }),
            dataCell(r[1], W[1], { center: true, isTbd: r[1].includes('★') }),
            dataCell(r[2], W[2], { isTbd: r[2].includes('★'), size: 18 })
          ]
        }))
      ]
    }),
    spacer(200),
    bodyPara('※ ★ 표시 항목은 IBK 담당자 확인 또는 LLM팀 협의 후 확정', { color: COLOR.TBD, size: 18 }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 7. Section 5 — 사내 LLM 연계 전략 (내부 참조)
// ════════════════════════════════════════════════════════════════════════════════
function buildSection5() {
  const W = [3200, 3200, 3200];
  return [
    sectionHeading('5. 사내 LLM 연계 전략'),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: '⚠️  이 섹션은 알파코 내부 전략용입니다. 고객사 제출 기획안에서는 중립 표현으로 교체하여 사용하십시오.', bold: true, color: COLOR.TBD, size: 20, font: 'Malgun Gothic' })]
    }),
    spacer(80),

    sectionHeading('5-1. 상용 LLM vs 사내 LLM 비교', HeadingLevel.HEADING_2),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        new TableRow({ children: [headerCell('항목', W[0]), headerCell('상용 LLM (ChatGPT 등)', W[1]), headerCell('사내 LLM (IBK 내부)', W[2])] }),
        ...[
          ['접근성', '외부망 필요 / 어디서나 가능', '내부망 전용 / 보안 우수'],
          ['데이터 보안', '입력 데이터 외부 전송 위험', '행내 데이터 직접 활용 가능'],
          ['커스터마이징', '제한적 (API 조정)', '금융 도메인 파인튜닝 가능'],
          ['실습 활용도', '즉시 실습 가능 (교육 용이)', '★ 교육 내 접속 환경 구성 필요'],
          ['강의 포지션', '프롬프트 원리 학습 도구', '현업 실전 도구 → 교육 후 지속 활용'],
        ].map(r => new TableRow({ children: r.map((v, i) => dataCell(v, W[i], { bold: i === 0, shade: i === 0 ? COLOR.LIGHT : null, isTbd: v.includes('★') })) }))
      ]
    }),
    spacer(160),

    sectionHeading('5-2. 알파코의 차별화 포인트', HeadingLevel.HEADING_2),
    bodyPara('알파코는 IBK LLM 개발팀과 사전 미팅을 통해 다음을 제공할 수 있다:', { bold: true }),
    bulletPara('사내 LLM 연동 실습 시나리오 설계 (미팅 확정 전제)'),
    bulletPara('커리큘럼 내 "사내 LLM 체험" 모듈 삽입 (D-2, T-2 세션)'),
    bulletPara('실습 환경 구성 지원 (API 키 발급 프로세스 가이드 포함)'),
    spacer(100),

    sectionHeading('5-3. RFP 표현 전략 (제안서 작성 시 참고)', HeadingLevel.HEADING_2),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: [4800, 4800],
      rows: [
        new TableRow({ children: [headerCell('내부 표현 (금지)', 4800), headerCell('RFP·제안서 중립 표현 (권장)', 4800)] }),
        ...[
          ['"사내 LLM API 직접 연동"', '"행내 디지털 환경에 최적화된 실습 구성"'],
          ['"IBK LLM 파인튜닝 커스터마이징"', '"금융 도메인 특화 실습 시나리오 제공"'],
          ['"GPT 사용 불가 시 알파코 대체 LLM 제공"', '"내·외부망 환경 모두 지원 가능한 유연한 도구 설계"'],
        ].map(r => new TableRow({ children: r.map((v, w) => dataCell(v, 4800, { color: w === 0 ? COLOR.TBD : COLOR.ACCENT })) }))
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 8. Section 6 — 기대 효과 및 KPI
// ════════════════════════════════════════════════════════════════════════════════
function buildSection6() {
  const W = [1800, 2800, 2200, 2800];
  const kpiRows = [
    ['K1', '교육 만족도', '4.5/5.0 이상', '과정 종료 직후 5점 척도 설문'],
    ['K2', '산출물 완성률', '100%', '전 수강생 최종 산출물 제출 완료'],
    ['K3', '현업 활용 선언률', '80% 이상', '수료 후 1주 내 AI 활용 의향 자기보고'],
    ['K4', '실제 활용률 추적', '★ 협의 필요', '4주 후 활용 빈도 체크리스트 (선택 항목)'],
  ];

  return [
    sectionHeading('6. 기대 효과 및 KPI'),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        new TableRow({ children: [headerCell('KPI', W[0]), headerCell('지표', W[1]), headerCell('목표값', W[2]), headerCell('측정 방법', W[3])] }),
        ...kpiRows.map(r => new TableRow({
          children: [
            dataCell(r[0], W[0], { center: true, bold: true, shade: COLOR.NAVY }),
            dataCell(r[1], W[1], { bold: true }),
            dataCell(r[2], W[2], { center: true, isTbd: r[2].includes('★') }),
            dataCell(r[3], W[3], { isTbd: r[3].includes('★'), size: 18 })
          ]
        }))
      ]
    }),
    spacer(200),
    // K1 셀 색 수정을 위해 첫번째 열 색 처리는 위에서 NAVY로 처리
    bodyPara('▶ KPI K4(실제 활용률)는 IBK와 협의 후 별도 실행 계획 수립', { color: COLOR.GRAY }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 9. Section 7 — 견적 기준
// ════════════════════════════════════════════════════════════════════════════════
function buildSection7() {
  const W = [3400, 6200];
  const rows = [
    ['강사비 산정 기준', '세션당 강사 단가 × 48세션 (주강사 기준)'],
    ['보조강사 투입 여부', '★ 협의 필요 — 투입 시 추가 단가 별도 산정'],
    ['교재 / 실습 자료', '1인당 제작 단가 × 480명 (디지털 교재 또는 인쇄물)'],
    ['사전 준비 비용', '커리큘럼 커스터마이징 + 시나리오 설계 + 시스템 세팅'],
    ['사내 LLM 연동 작업', '★ 협의 필요 — LLM팀 협업 범위에 따라 별도 견적'],
    ['기타 운영비', '장비·현장 운영·행정 지원 실비 (추정치 포함)'],
  ];

  return [
    sectionHeading('7. 견적 기준'),
    bodyPara('※ 최종 견적은 미확정 사항(Section 8) 확인 후 확정. 아래는 기준 항목 예시.', { color: COLOR.GRAY }),
    spacer(80),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        new TableRow({ children: [headerCell('항목', W[0]), headerCell('기준 내용', W[1])] }),
        ...rows.map(r => new TableRow({
          children: [
            dataCell(r[0], W[0], { bold: true, shade: COLOR.LIGHT }),
            dataCell(r[1], W[1], { isTbd: r[1].includes('★') })
          ]
        }))
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 10. Section 8 — 미확정 사항 (TBD)
// ════════════════════════════════════════════════════════════════════════════════
function buildSection8() {
  const items = [
    ['TBD-1', '사내 LLM 교육 활용 허용 여부', 'IBK LLM팀 협의 필요 (미팅 일정 조율 중)'],
    ['TBD-2', '상용 LLM(ChatGPT 등) 외부망 접속 허용 여부', 'IBK 보안팀 확인 필요 — 실습 도구 전략에 직접 영향'],
    ['TBD-3', '보조강사 투입 여부 및 기준', '세션당 30명 단독 운영 가능 여부 강사 역량에 따라 결정'],
    ['TBD-4', 'Excel 심화 실습 포함 여부 (부장과정)', 'Copilot 라이선스 제공 여부에 따라 모듈 추가 가능'],
    ['TBD-5', 'MS Copilot 라이선스 현황', '제공 시 D-2/T-2에 Copilot 실습 모듈 삽입 검토'],
    ['TBD-6', 'KPI K4 활용률 추적 운영 여부', 'IBK 인재개발팀 협의 — 별도 추적 체계 구축 필요'],
  ];

  const W = [1600, 3600, 4400];

  return [
    sectionHeading('8. 미확정 사항 (TBD)'),
    bodyPara('아래 항목은 IBK 내부 확인 또는 알파코-IBK 협의 후 확정되어야 최종 제안서를 작성할 수 있다.', { bold: true }),
    spacer(80),
    new Table({
      width: { size: 9600, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        new TableRow({ children: [headerCell('번호', W[0]), headerCell('항목', W[1]), headerCell('비고 / 필요 액션', W[2])] }),
        ...items.map(r => new TableRow({
          children: [
            dataCell(r[0], W[0], { center: true, bold: true, shade: 'FDECEA' }),
            dataCell(r[1], W[1], { bold: true, color: COLOR.TBD }),
            dataCell(r[2], W[2], { size: 18 })
          ]
        }))
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 11. Section 9 — 추가 고려 사항
// ════════════════════════════════════════════════════════════════════════════════
function buildSection9() {
  const items = [
    ['사전 설문 실시', '교육 시작 1~2주 전 수강 대상자 AI 활용 수준 / 기대 사항 조사 → 커리큘럼 미세 조정 및 강사 준비에 활용'],
    ['직군별 시나리오 업데이트', '여신·수신·리스크·IT 등 IBK 부서별 맞춤 실습 시나리오를 커리큘럼 확정 후 별도 제작'],
    ['수료 후 자율 학습 자료 제공', '강의 핵심 요약 + 프롬프트 체크리스트 + 추천 자료 링크를 수료 패키지로 제공 검토'],
    ['파일럿 1회차 선행 운영', '8월 첫 회차를 파일럿으로 운영 → 강의 평가 데이터 기반으로 이후 회차 커리큘럼 개선 적용'],
  ];

  return [
    sectionHeading('9. 추가 고려 사항'),
    ...items.map(([title, desc]) => [
      bodyPara(`▶ ${title}`, { bold: true, spacing: 80 }),
      bodyPara(`   ${desc}`, { color: COLOR.GRAY, indent: 360, spacing: 160 }),
    ]).flat(),
    spacer(200),
    bodyPara('─ 이하 여백 ─', { color: COLOR.GRAY, size: 18 })
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// 문서 조립 & 출력
// ════════════════════════════════════════════════════════════════════════════════
async function main() {
  const allChildren = [
    ...buildCoverPage(),
    ...buildTOC(),
    ...buildSection1(),
    ...buildSection2(),
    ...buildSection3(),
    ...buildSection4(),
    ...buildSection5(),
    ...buildSection6(),
    ...buildSection7(),
    ...buildSection8(),
    ...buildSection9(),
  ];

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 270 } } }
          }]
        },
        {
          reference: 'sub-bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '–',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 900, hanging: 270 } } }
          }]
        }
      ]
    },
    styles: {
      default: {
        document: { run: { font: 'Malgun Gothic', size: 20 } }
      },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1',
          basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 36, bold: true, color: COLOR.NAVY, font: 'Malgun Gothic' },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.ACCENT } } }
        },
        {
          id: 'Heading2', name: 'Heading 2',
          basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, color: COLOR.ACCENT, font: 'Malgun Gothic' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
        },
        {
          id: 'Heading3', name: 'Heading 3',
          basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, color: COLOR.NAVY, font: 'Malgun Gothic' },
          paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 }
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },  // A4
          margin: { top: 1440, right: 1134, bottom: 1440, left: 1134 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.ACCENT } },
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'IBK기업은행 AX 집합교육 교육기획안 (초안)', color: COLOR.NAVY, size: 16, font: 'Malgun Gothic' }),
              new TextRun({ text: '   |   (주)알파코 내부용', color: COLOR.GRAY, size: 16, font: 'Malgun Gothic' })
            ]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '- ', color: COLOR.GRAY, size: 16, font: 'Malgun Gothic' }),
              new TextRun({ children: [PageNumber.CURRENT], color: COLOR.GRAY, size: 16, font: 'Malgun Gothic' }),
              new TextRun({ text: ' -', color: COLOR.GRAY, size: 16, font: 'Malgun Gothic' })
            ]
          })]
        })
      },
      children: allChildren
    }]
  });

  const outPath = path.join(__dirname, '..', 'output', 'IBK기업은행_AX교육기획안_초안.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log('✅ 생성 완료:', outPath);
}

main().catch(err => { console.error('❌ 오류:', err); process.exit(1); });
