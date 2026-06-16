"""
알파코 제안서 렌더러 — Streamlit 로컬 앱
실행: streamlit run chatbot/app.py
"""

import os
import re
import json
import subprocess
import datetime
from pathlib import Path

import streamlit as st

BASE_DIR    = Path(__file__).parent.parent
OUTPUT_DIR  = BASE_DIR / "output"
MASTER_PPTX = BASE_DIR / "templates" / "master" / "alpaco_master.pptx"
INDEX_PATH  = BASE_DIR / "templates" / "master" / "slide_index.json"
SLOT_DIR    = BASE_DIR / "templates" / "master" / "slot_specs"
OUTPUT_DIR.mkdir(exist_ok=True)

ALLOWED_LAYOUT_TYPES = {
    "TITLE_SLIDE", "TABLE_OF_CONTENTS", "SECTION_DIVIDER", "COMPANY_INTRO",
    "VENDOR_PROFILE", "PROBLEM_VS_SOLUTION", "FLOW_CHART", "N_COLUMN_CARDS",
    "CURRICULUM_TABLE", "SCHEDULE", "EVALUATION_METRIC", "PRICING", "CLOSING_SLIDE",
}

# ── 유틸 ──────────────────────────────────────────────────────────

def system_status() -> dict:
    return {
        "master_pptx": MASTER_PPTX.exists(),
        "slide_index": INDEX_PATH.exists(),
        "slot_specs":  len(list(SLOT_DIR.glob("*.json"))) if SLOT_DIR.exists() else 0,
    }

def validate_json(data: dict) -> list[str]:
    errors = []
    if "metadata" not in data:
        errors.append("metadata 필드 없음")
    if "design_system" not in data:
        errors.append("design_system 필드 없음")
    slides = data.get("slides")
    if not isinstance(slides, list) or len(slides) == 0:
        errors.append("slides 배열 없음 또는 비어 있음")
    else:
        for i, s in enumerate(slides):
            lt = s.get("layout_type", "")
            if lt not in ALLOWED_LAYOUT_TYPES:
                errors.append(f"슬라이드 {i+1}: 알 수 없는 layout_type '{lt}'")
            if not s.get("top_message"):
                errors.append(f"슬라이드 {i+1}: top_message 없음")
    return errors

def run_renderer(json_path: Path, pptx_path: Path) -> tuple[bool, str]:
    renderer = BASE_DIR / "renderer" / "pptx_builder.py"
    try:
        result = subprocess.run(
            ["python", str(renderer), str(json_path), str(pptx_path)],
            capture_output=True, text=True, timeout=120, encoding="utf-8",
            errors="replace",
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, "❌ 렌더러 실행 시간 초과 (120초)"
    except Exception as e:
        return False, f"❌ 실행 실패: {e}"

def list_output_files() -> list[Path]:
    return sorted(OUTPUT_DIR.glob("*.json"), key=lambda f: f.stat().st_mtime, reverse=True)[:20]

# ── 페이지 설정 ───────────────────────────────────────────────────
st.set_page_config(
    page_title="알파코 제안서 렌더러",
    page_icon="📊",
    layout="wide",
)

# ── 사이드바 ──────────────────────────────────────────────────────
with st.sidebar:
    st.title("📊 알파코 제안서 렌더러")
    st.caption("claude.ai → JSON → PPTX 변환 도구")
    st.divider()

    # 시스템 상태
    st.subheader("🔧 시스템 상태")
    status = system_status()

    if status["master_pptx"]:
        st.success("✅ 마스터 덱")
    else:
        st.error("❌ 마스터 덱 없음")
        st.caption("`python scripts/compile_master.py` 실행 필요")

    if status["slide_index"]:
        st.success("✅ slide_index.json")
    else:
        st.warning("⚠️ slide_index.json 없음")

    n = status["slot_specs"]
    if n >= 13:
        st.success(f"✅ Slot Spec {n}/13")
    elif n > 0:
        st.warning(f"⚠️ Slot Spec {n}/13 — 폴백 모드")
    else:
        st.info("ℹ️ Slot Spec 미생성 — 폴백 모드")

    st.divider()

    # 사용법
    st.subheader("📖 사용 방법")
    with st.expander("claude.ai 프로젝트 설정"):
        st.markdown("""
**1단계: 프로젝트 생성**
[claude.ai](https://claude.ai) → Projects → 새 프로젝트

**2단계: Skill 파일 업로드**
`skills/` 폴더의 `.md` 파일 15개를 Project Knowledge에 전부 업로드

**3단계: 대화 시작**
```
고객사: [고객사명]
교육 주제: [주제]
```

**4단계: JSON 복사**
Phase 3 완료 후 JSON 코드블록 전체 복사

**5단계: 이 앱에서 PPTX 생성**
JSON 붙여넣기 → PPTX 생성 → 다운로드
        """)

    with st.expander("Skill 파일 목록 (15개)"):
        for f in sorted((BASE_DIR / "skills").glob("*.md")):
            st.caption(f"📄 {f.name}")

    st.divider()

    # 히스토리
    st.subheader("📁 생성 히스토리")
    prev = list_output_files()
    if prev:
        for jf in prev:
            pf = jf.with_suffix(".pptx")
            c1, c2 = st.columns([3, 1])
            c1.caption(jf.stem[:28])
            if pf.exists():
                with open(pf, "rb") as fh:
                    c2.download_button(
                        "⬇",
                        data=fh.read(),
                        file_name=pf.name,
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        key=f"hist_{pf.name}",
                    )
            else:
                c2.caption("—")
    else:
        st.caption("생성된 파일 없음")


# ── 메인 ──────────────────────────────────────────────────────────
st.header("제안서 JSON → PPTX 변환")

if not status["master_pptx"]:
    st.warning(
        "**마스터 덱이 준비되지 않았습니다.** "
        "아래 명령어를 먼저 실행하세요:\n\n"
        "```bash\nnode scripts/analyze_sources.js\npython scripts/compile_master.py\n```"
    )

# 입력 탭
tab_paste, tab_file = st.tabs(["✏️ JSON 붙여넣기", "📂 파일 업로드"])

json_text = ""

with tab_paste:
    raw = st.text_area(
        "claude.ai의 최종 JSON 코드블록을 여기에 붙여넣으세요",
        height=320,
        placeholder='```json\n{\n  "metadata": {...},\n  ...\n}\n```\n또는 JSON만 붙여넣어도 됩니다.',
    )
    if raw.strip():
        m = re.search(r"```json\s*([\s\S]*?)```", raw)
        json_text = m.group(1).strip() if m else raw.strip()

with tab_file:
    uploaded = st.file_uploader("JSON 파일", type=["json"])
    if uploaded:
        json_text = uploaded.read().decode("utf-8")

# 검증 및 미리보기
parsed = None
if json_text:
    try:
        parsed = json.loads(json_text)
        errors = validate_json(parsed)

        meta   = parsed.get("metadata", {})
        slides = parsed.get("slides", [])
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("고객사", meta.get("client_name", "—"))
        c2.metric("제목", meta.get("proposal_title", "—")[:12] + "…" if len(meta.get("proposal_title","")) > 12 else meta.get("proposal_title","—"))
        c3.metric("슬라이드", f"{len(slides)}장")
        c4.metric("피치 스타일", meta.get("pitch_style", "—"))

        if errors:
            st.error("**검증 실패:**\n" + "\n".join(f"- {e}" for e in errors))
            parsed = None
        else:
            st.success(f"✅ JSON 검증 통과 — {len(slides)}장 슬라이드 준비됨")

    except json.JSONDecodeError as e:
        st.error(f"JSON 파싱 오류: {e}")
        parsed = None

# 생성 버튼
st.divider()
col_name, col_btn = st.columns([3, 1])
custom_name = col_name.text_input(
    "출력 파일명 (선택, 비워두면 자동 생성)",
    placeholder="예: 동대문구_AX부트캠프",
)
generate = col_btn.button(
    "🎨 PPTX 생성",
    disabled=(parsed is None or not status["master_pptx"]),
    use_container_width=True,
    type="primary",
)

if generate and parsed:
    client  = parsed.get("metadata", {}).get("client_name", "proposal")
    base    = re.sub(r"[^\w가-힣]", "_", custom_name.strip() or client)
    ts      = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    jpath   = OUTPUT_DIR / f"{base}_{ts}.json"
    ppath   = OUTPUT_DIR / f"{base}_{ts}.pptx"

    jpath.write_text(json.dumps(parsed, ensure_ascii=False, indent=2), encoding="utf-8")

    with st.spinner("PPTX 생성 중..."):
        ok, log = run_renderer(jpath, ppath)

    with st.expander("렌더러 로그", expanded=not ok):
        st.code(log, language=None)

    if ok and ppath.exists():
        st.success(f"✅ **{ppath.name}** 생성 완료!")
        with open(ppath, "rb") as fh:
            st.download_button(
                label="⬇️ PPTX 다운로드",
                data=fh.read(),
                file_name=ppath.name,
                mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                use_container_width=True,
                type="primary",
            )
    else:
        st.error("❌ 생성 실패. 렌더러 로그를 확인하세요.")
