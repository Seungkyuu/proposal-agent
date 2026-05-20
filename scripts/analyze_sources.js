/**
 * analyze_sources.js
 * 알파코 소스 PPTX 12개를 분석하여 slide_catalog.json 생성
 *
 * 실행: node scripts/analyze_sources.js
 * 출력: templates/slide_catalog.json
 */

const fs   = require('fs');
const path = require('path');

// JSZip 경로 (pptx skill 로컬 모듈)
const JSZIP_PATH = process.env.JSZIP_PATH ||
  'C:/Users/smvo0/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/8ae56fd2-dcb3-423f-a2d6-7d8876334e67/6927d13d-a53c-4a0c-85c0-bb09c91d321f/skills/pptx/node_modules/jszip';
const JSZip = require(JSZIP_PATH);

const SOURCE_DIR  = path.resolve(__dirname, '../templates/source_decks');
const OUTPUT_FILE = path.resolve(__dirname, '../templates/slide_catalog.json');

// ─────────────────────────────────────────────
// 1. 계획에서 확정된 1차 추천 매핑
// ─────────────────────────────────────────────
const RECOMMENDATIONS = {
  TITLE_SLIDE: {
    description: '표지 슬라이드 — 교육과정명·제안사·날짜',
    file_keyword: 'AIDP',
    slide_idx: 1,
  },
  TABLE_OF_CONTENTS: {
    description: '목차 슬라이드 — 제안서 구성 안내',
    file_keyword: '신한금융그룹',
    slide_idx: 2,
  },
  SECTION_DIVIDER: {
    description: '챕터 간지 — 섹션 전환 구분선',
    file_keyword: '메타인지',
    slide_idx: 3,
  },
  VENDOR_PROFILE: {
    description: '제안사 소개 + 수행 실적 테이블 (강사 정보 제외)',
    file_keyword: '신한금융그룹',
    slide_idx: 20,
  },
  PROBLEM_VS_SOLUTION: {
    description: 'As-Is / To-Be 좌우 비교 슬라이드',
    file_keyword: '신한금융그룹',
    slide_idx: 4,
  },
  FLOW_CHART: {
    description: '단계별 프로세스 흐름 카드 (STEP 1→2→3)',
    file_keyword: '메타인지',
    slide_idx: 10,
  },
  COMPARISON_BENCHMARK: {
    description: '글로벌 벤치마크 vs 본 제안 비교',
    file_keyword: '한화',
    slide_idx: 12,
  },
  CURRICULUM_TABLE: {
    description: '5열 커리큘럼 표 (차시/주제/내용/도구/산출물)',
    file_keyword: '퓨처아카데미',
    slide_idx: 3,
  },
  N_COLUMN_CARDS: {
    description: '2~3단 카드 나열 (특장점·강점·서비스 옵션)',
    file_keyword: '신한금융그룹',
    slide_idx: 7,
  },
  EVALUATION_METRIC: {
    description: 'KPI / 평가 지표 카드 (커크패트릭 등)',
    file_keyword: '신한금융그룹',
    slide_idx: 68,
  },
  CLOSING_SLIDE: {
    description: '마무리·감사·연락처 슬라이드',
    file_keyword: 'S-Oil',
    slide_idx: 28,
  },
};

// ─────────────────────────────────────────────
// 2. 유틸리티 함수
// ─────────────────────────────────────────────
function extractText(xml, maxLen = 150) {
  const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
  return matches
    .map(m => m.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLen);
}

function getFlags(xml) {
  const flags = [];
  if ((xml.match(/<a:tbl>/g) || []).length > 0)  flags.push('TABLE');
  if ((xml.match(/<p:pic>/g) || []).length > 0)   flags.push('IMG');
  const shapes = (xml.match(/<p:sp>/g) || []).length;
  if (shapes >= 4) flags.push('MULTI-SHAPE(' + shapes + ')');
  return flags.join(', ') || 'BASIC';
}

function slideKey(fname) {
  return path.basename(fname, '.pptx');
}

// ─────────────────────────────────────────────
// 3. 메인 분석
// ─────────────────────────────────────────────
async function analyzeAllFiles() {
  const pptxFiles = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.pptx'))
    .sort();

  console.log(`\n분석 대상: ${pptxFiles.length}개 파일\n`);

  // 파일별 슬라이드 데이터 수집
  const fileData = {}; // { filename: [ { idx, text, flags, xml } ] }

  for (const fname of pptxFiles) {
    const fpath = path.join(SOURCE_DIR, fname);
    const buf   = fs.readFileSync(fpath);
    const zip   = await JSZip.loadAsync(buf);

    const slideKeys = Object.keys(zip.files)
      .filter(n => n.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        return parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]);
      });

    const slides = [];
    for (let i = 0; i < slideKeys.length; i++) {
      const xml   = await zip.files[slideKeys[i]].async('string');
      const text  = extractText(xml);
      const flags = getFlags(xml);
      slides.push({ idx: i + 1, text, flags });
    }

    fileData[fname] = slides;
    console.log(`  ✓ ${fname.substring(0, 50).padEnd(50)} ${slides.length}슬라이드`);
  }

  // ─────────────────────────────────────────────
  // 4. 카탈로그 조립
  // ─────────────────────────────────────────────
  const catalog = {
    generated_at: new Date().toISOString().split('T')[0],
    source_dir: 'templates/source_decks',
    total_source_files: pptxFiles.length,
    total_source_slides: Object.values(fileData).reduce((s, arr) => s + arr.length, 0),
    note: '추천 슬라이드는 텍스트 분석 기반 1차 추천입니다. PowerPoint에서 시각 확인 후 alternatives 중 교체 가능합니다.',
    layouts: {},
  };

  for (const [layoutType, rec] of Object.entries(RECOMMENDATIONS)) {
    // 추천 파일 찾기 (keyword 매칭)
    const recFile = pptxFiles.find(f => f.includes(rec.file_keyword));
    if (!recFile) {
      console.warn(`  ⚠ ${layoutType}: 키워드 '${rec.file_keyword}'로 파일을 찾지 못했습니다`);
      continue;
    }

    const recSlides = fileData[recFile] || [];
    const recSlide  = recSlides.find(s => s.idx === rec.slide_idx);

    if (!recSlide) {
      console.warn(`  ⚠ ${layoutType}: ${recFile} 에서 슬라이드 ${rec.slide_idx}를 찾지 못했습니다 (총 ${recSlides.length}슬라이드)`);
      continue;
    }

    // 대안 슬라이드: 나머지 파일들의 첫 슬라이드 또는 비슷한 위치 슬라이드
    const alternatives = [];
    for (const fname of pptxFiles) {
      if (fname === recFile) continue;
      const slides = fileData[fname] || [];
      // 레이아웃 타입별 대안 위치 휴리스틱
      let altIdx = 1;
      if (layoutType === 'CLOSING_SLIDE') altIdx = slides.length;
      else if (layoutType === 'VENDOR_PROFILE') altIdx = Math.min(5, slides.length);
      else if (layoutType === 'CURRICULUM_TABLE') altIdx = Math.min(4, slides.length);
      else if (layoutType === 'EVALUATION_METRIC') altIdx = Math.max(1, Math.floor(slides.length * 0.7));

      const altSlide = slides.find(s => s.idx === altIdx);
      if (altSlide && alternatives.length < 3) {
        alternatives.push({
          file: fname,
          slide_idx: altSlide.idx,
          text_preview: altSlide.text,
          flags: altSlide.flags,
        });
      }
    }

    catalog.layouts[layoutType] = {
      description: rec.description,
      recommended: {
        file: recFile,
        slide_idx: recSlide.idx,
        text_preview: recSlide.text,
        flags: recSlide.flags,
      },
      alternatives,
    };

    console.log(`  → ${layoutType.padEnd(25)} ${recFile.substring(0, 35)} S${String(recSlide.idx).padStart(2, '0')} [${recSlide.flags}]`);
  }

  // ─────────────────────────────────────────────
  // 5. 전체 슬라이드 인덱스 (PowerPoint 검수용)
  // ─────────────────────────────────────────────
  catalog.full_slide_index = {};
  for (const [fname, slides] of Object.entries(fileData)) {
    catalog.full_slide_index[fname] = slides.map(s => ({
      slide_idx: s.idx,
      flags: s.flags,
      text_preview: s.text,
    }));
  }

  // ─────────────────────────────────────────────
  // 6. 저장
  // ─────────────────────────────────────────────
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n✅ slide_catalog.json 저장 완료: ${OUTPUT_FILE}`);
  console.log(`   레이아웃 타입: ${Object.keys(catalog.layouts).length}개`);
  console.log(`   총 소스 슬라이드: ${catalog.total_source_slides}개`);
  console.log('\n📋 다음 단계: PowerPoint에서 추천 슬라이드를 시각 확인 후 compile_master.py 실행\n');
}

analyzeAllFiles().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
