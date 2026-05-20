"""
pptx_builder.py  — 알파코 제안서 템플릿 클론 렌더러 (V2)
─────────────────────────────────────────────────────────────────────
마스터 덱(alpaco_master.pptx)에서 슬라이드를 복제하고,
Claude가 생성한 proposal_output.json의 content를 텍스트 박스에 주입하여
최종 PPTX 제안서를 생성한다.

사용법:
    pip install python-pptx
    python renderer/pptx_builder.py <proposal_json> <output_pptx>

예시:
    python renderer/pptx_builder.py output/proposal.json output/result.pptx

proposal_output.json 구조 (Skill 12 Data Contract):
    {
      "metadata": { "client_name": "...", "course_name": "...", ... },
      "design_system": { ... },
      "slides": [
        {
          "layout_type": "TITLE_SLIDE",
          "content": {
            "main_title": "...",
            "sub_title": "...",
            ...
          }
        },
        ...
      ]
    }
"""

import sys
import json
import os
import copy
from lxml import etree
from pptx import Presentation
from pptx.util import Pt
from pptx.dml.color import RGBColor

# ─── 경로 설정 ────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER_PPTX = os.path.join(BASE_DIR, 'templates', 'master', 'alpaco_master.pptx')
INDEX_PATH  = os.path.join(BASE_DIR, 'templates', 'master', 'slide_index.json')


# ════════════════════════════════════════════════════════════════════
# 1. 슬라이드 복제 유틸리티
# ════════════════════════════════════════════════════════════════════

def clone_slide(src_prs, src_idx_0based, dst_prs):
    """마스터 덱의 src_idx(0-based) 슬라이드를 dst_prs에 복제."""
    src_slide = src_prs.slides[src_idx_0based]

    # blank 레이아웃으로 신규 슬라이드 추가
    layout    = dst_prs.slide_layouts[6]
    new_slide = dst_prs.slides.add_slide(layout)

    # 기존 엘리먼트 제거
    sp_tree = new_slide.shapes._spTree
    for el in list(sp_tree):
        sp_tree.remove(el)

    # 원본 슬라이드 XML 복사
    for el in src_slide.shapes._spTree:
        sp_tree.append(copy.deepcopy(el))

    # 슬라이드 크기 동기화
    dst_prs.slide_width  = src_prs.slide_width
    dst_prs.slide_height = src_prs.slide_height

    return new_slide


# ════════════════════════════════════════════════════════════════════
# 2. 텍스트 교체 유틸리티
# ════════════════════════════════════════════════════════════════════

def _all_text_frames(slide):
    """슬라이드의 모든 텍스트프레임을 순서대로 반환."""
    frames = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            frames.append(shape.text_frame)
        if shape.shape_type == 19:  # GROUP_SHAPE
            for s in shape.shapes:
                if s.has_text_frame:
                    frames.append(s.text_frame)
    return frames


def set_text_frame(tf, text, font_size_pt=None, bold=None):
    """텍스트프레임의 첫 번째 단락 텍스트를 교체 (기존 서식 최대한 유지)."""
    if not text:
        return
    # 기존 run이 있으면 첫 run의 텍스트만 교체 (폰트/색상 보존)
    for para in tf.paragraphs:
        if para.runs:
            run = para.runs[0]
            run.text = str(text)
            # 나머지 run 제거
            for extra_run in para.runs[1:]:
                p_el  = para._p
                r_el  = extra_run._r
                p_el.remove(r_el)
            if font_size_pt:
                run.font.size = Pt(font_size_pt)
            if bold is not None:
                run.font.bold = bold
            # 나머지 단락 비우기
            for other_para in tf.paragraphs[1:]:
                for r in other_para.runs:
                    r.text = ''
            return
    # run이 없으면 단락 텍스트 직접 설정
    if tf.paragraphs:
        tf.paragraphs[0].text = str(text)


def replace_texts_by_order(slide, field_map):
    """
    field_map: { field_name: value, ... }
    슬라이드의 텍스트프레임을 순서대로 꺼내어 값을 순차 주입.
    field_map의 값이 None이면 건너뜀.
    """
    frames = _all_text_frames(slide)
    values = [v for v in field_map.values() if v is not None]

    for i, val in enumerate(values):
        if i >= len(frames):
            break
        set_text_frame(frames[i], val)


# ════════════════════════════════════════════════════════════════════
# 3. 테이블 채우기 유틸리티
# ════════════════════════════════════════════════════════════════════

def fill_table(slide, table_data):
    """
    슬라이드 내 첫 번째 테이블을 찾아 데이터를 채운다.
    table_data = {
        "headers": ["열1", "열2", ...],
        "rows": [ ["값", "값", ...], ... ],
        "section_rows": [ {"idx": 2, "label": "섹션명"} ]  ← 선택
    }
    행 수가 원본보다 많으면 마지막 행을 복제하여 확장.
    """
    from pptx.oxml.ns import qn

    tbl_shape = None
    for shape in slide.shapes:
        if shape.has_table:
            tbl_shape = shape
            break

    if not tbl_shape:
        print("    ⚠  테이블 없음 — 건너뜀")
        return

    tbl      = tbl_shape.table
    tbl_xml  = tbl._tbl
    headers  = table_data.get('headers', [])
    rows     = table_data.get('rows', [])
    sec_rows = {sr['idx']: sr['label'] for sr in table_data.get('section_rows', [])}

    # 헤더 행 채우기 (첫 번째 행)
    if headers and len(tbl.rows) > 0:
        for ci, hdr in enumerate(headers):
            if ci < len(tbl.rows[0].cells):
                tbl.rows[0].cells[ci].text_frame.paragraphs[0].runs[0].text = str(hdr) if tbl.rows[0].cells[ci].text_frame.paragraphs[0].runs else ''
                if not tbl.rows[0].cells[ci].text_frame.paragraphs[0].runs:
                    tbl.rows[0].cells[ci].text_frame.paragraphs[0].text = str(hdr)

    # 데이터 행: 원본 테이블에 행이 부족하면 마지막 행 XML 복제
    last_row_xml = tbl_xml.findall(qn('a:tr'))[-1]  # 현재 마지막 행

    needed_rows = len(rows) + (1 if headers else 0)  # 헤더 포함
    while len(tbl_xml.findall(qn('a:tr'))) < needed_rows:
        new_row = copy.deepcopy(last_row_xml)
        tbl_xml.append(new_row)

    # 데이터 채우기
    all_rows = tbl_xml.findall(qn('a:tr'))
    data_start = 1 if headers else 0  # 헤더가 있으면 1행부터 데이터

    for ri, row_data in enumerate(rows):
        row_el = all_rows[data_start + ri] if (data_start + ri) < len(all_rows) else None
        if row_el is None:
            break

        cells = row_el.findall('.//' + qn('a:tc'))
        for ci, cell_val in enumerate(row_data):
            if ci >= len(cells):
                break
            # 기존 텍스트 교체
            t_els = cells[ci].findall('.//' + qn('a:t'))
            if t_els:
                t_els[0].text = str(cell_val)
                for extra in t_els[1:]:
                    extra.text = ''
            else:
                # 텍스트 엘리먼트가 없으면 직접 생성
                r_el = etree.SubElement(cells[ci].find('.//' + qn('a:p')), qn('a:r'))
                t_el = etree.SubElement(r_el, qn('a:t'))
                t_el.text = str(cell_val)


# ════════════════════════════════════════════════════════════════════
# 4. 레이아웃별 콘텐츠 주입 라우터
# ════════════════════════════════════════════════════════════════════

def fill_slide(slide, layout_type, content, index_info):
    """레이아웃 타입에 따라 적절한 채우기 함수 호출."""
    strategy = index_info.get('content_hints', {}).get('strategy', 'text_replace_by_order')

    if layout_type == 'TITLE_SLIDE':
        replace_texts_by_order(slide, {
            'main_title': content.get('main_title', ''),
            'sub_title':  content.get('sub_title', ''),
            'date':       content.get('date', ''),
            'company':    content.get('company', ''),
        })

    elif layout_type == 'TABLE_OF_CONTENTS':
        toc = content.get('toc_items', [])
        frames = _all_text_frames(slide)
        for i, item in enumerate(toc):
            if i + 1 < len(frames):
                set_text_frame(frames[i + 1], item)

    elif layout_type == 'SECTION_DIVIDER':
        replace_texts_by_order(slide, {
            'section_title':    content.get('section_title', ''),
            'section_subtitle': content.get('section_subtitle', ''),
        })

    elif layout_type in ('VENDOR_PROFILE', 'CURRICULUM_TABLE', 'COMPARISON_BENCHMARK'):
        # top_message 먼저
        frames = _all_text_frames(slide)
        if frames and content.get('top_message'):
            set_text_frame(frames[0], content['top_message'])
        # 테이블 채우기
        if 'table_data' in content:
            fill_table(slide, content['table_data'])
        # COMPARISON_BENCHMARK는 좌우 bullet도 처리
        if layout_type == 'COMPARISON_BENCHMARK' and 'left_block' in content:
            lb = content['left_block']
            rb = content.get('right_block', {})
            # 텍스트프레임 2~5번에 좌우 블록 배치 (위치는 슬라이드별 실제 확인 후 조정)
            if len(frames) > 1 and lb.get('title'):
                set_text_frame(frames[1], lb['title'])
            if len(frames) > 2 and lb.get('bullets'):
                set_text_frame(frames[2], '\n'.join(lb['bullets']))
            if len(frames) > 3 and rb.get('title'):
                set_text_frame(frames[3], rb['title'])
            if len(frames) > 4 and rb.get('bullets'):
                set_text_frame(frames[4], '\n'.join(rb['bullets']))

    elif layout_type == 'PROBLEM_VS_SOLUTION':
        frames = _all_text_frames(slide)
        if frames and content.get('top_message'):
            set_text_frame(frames[0], content['top_message'])
        left_b  = content.get('left_bullets', [])
        right_b = content.get('right_bullets', [])
        # 실제 위치는 마스터 덱 확인 후 조정 — 현재는 순서 기반
        texts = []
        if content.get('left_title'):  texts.append(content['left_title'])
        if left_b:                     texts.append('\n'.join(left_b))
        if content.get('right_title'): texts.append(content['right_title'])
        if right_b:                    texts.append('\n'.join(right_b))
        for i, t in enumerate(texts):
            if i + 1 < len(frames):
                set_text_frame(frames[i + 1], t)

    elif layout_type in ('FLOW_CHART', 'N_COLUMN_CARDS', 'EVALUATION_METRIC'):
        frames = _all_text_frames(slide)
        if frames and content.get('top_message'):
            set_text_frame(frames[0], content['top_message'])
        items = content.get('steps', content.get('cards', []))
        fi = 1
        for item in items:
            if isinstance(item, dict):
                if fi < len(frames) and item.get('header'):
                    set_text_frame(frames[fi], item['header'], bold=True); fi += 1
                if fi < len(frames) and item.get('body'):
                    set_text_frame(frames[fi], item['body']); fi += 1
            elif isinstance(item, str):
                if fi < len(frames):
                    set_text_frame(frames[fi], item); fi += 1

    elif layout_type == 'CLOSING_SLIDE':
        replace_texts_by_order(slide, {
            'main_title':   content.get('main_title', ''),
            'contact_info': content.get('contact_info', ''),
        })

    else:
        # 기본: 순서대로 채우기
        replace_texts_by_order(slide, content)


# ════════════════════════════════════════════════════════════════════
# 5. 메인 빌드 함수
# ════════════════════════════════════════════════════════════════════

def build_proposal(proposal_json_path, output_path):
    print(f"\n─── 제안서 빌드 시작 ───")
    print(f"  입력: {proposal_json_path}")
    print(f"  출력: {output_path}\n")

    # JSON 로드
    with open(proposal_json_path, encoding='utf-8') as f:
        spec = json.load(f)

    # 마스터 덱 + 인덱스 로드
    if not os.path.exists(MASTER_PPTX):
        raise FileNotFoundError(
            f"마스터 덱이 없습니다: {MASTER_PPTX}\n"
            "먼저 python scripts/compile_master.py 를 실행하세요."
        )

    with open(INDEX_PATH, encoding='utf-8') as f:
        slide_index = json.load(f)

    master_prs = Presentation(MASTER_PPTX)
    output_prs = Presentation()
    output_prs.slide_width  = master_prs.slide_width
    output_prs.slide_height = master_prs.slide_height

    # 슬라이드 생성
    for slide_spec in spec.get('slides', []):
        layout_type = slide_spec.get('layout_type', '')
        content     = slide_spec.get('content', {})

        if layout_type not in slide_index['layouts']:
            print(f"  ⚠  알 수 없는 layout_type: {layout_type} — 건너뜀")
            continue

        idx_info   = slide_index['layouts'][layout_type]
        master_idx = idx_info['slide_idx'] - 1  # 0-based

        # 슬라이드 복제
        new_slide = clone_slide(master_prs, master_idx, output_prs)

        # 콘텐츠 주입
        fill_slide(new_slide, layout_type, content, idx_info)

        print(f"  ✓  [{layout_type:<25}] 슬라이드 {idx_info['slide_idx']}번 복제 → 내용 주입 완료")

    # 저장
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    output_prs.save(output_path)
    total = len(output_prs.slides)
    print(f"\n✅ 제안서 저장 완료: {output_path}  ({total}슬라이드)\n")


# ════════════════════════════════════════════════════════════════════
# 6. CLI 진입점
# ════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("사용법: python renderer/pptx_builder.py <proposal_json> <output_pptx>")
        print("예시:   python renderer/pptx_builder.py output/proposal.json output/result.pptx")
        sys.exit(1)

    proposal_path = sys.argv[1]
    output_path   = sys.argv[2]

    if not os.path.exists(proposal_path):
        print(f"오류: 입력 파일 없음 — {proposal_path}")
        sys.exit(1)

    build_proposal(proposal_path, output_path)
