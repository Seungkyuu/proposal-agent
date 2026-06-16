"""
export_system_prompt.py
모든 Skill 파일(skills/*.md)을 하나의 마스터 프롬프트 파일로 합칩니다.
claude.ai 프로젝트 Instructions에 붙여넣거나 파일로 업로드할 때 사용합니다.

사용법:
    python scripts/export_system_prompt.py
출력:
    output/alpaco_master_prompt.md
"""

from pathlib import Path

BASE_DIR   = Path(__file__).parent.parent
SKILLS_DIR = BASE_DIR / "skills"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)
OUT_FILE   = OUTPUT_DIR / "alpaco_master_prompt.md"

def main():
    skill_files = sorted(SKILLS_DIR.glob("*.md"))
    if not skill_files:
        print(f"[오류] skills/ 폴더에 .md 파일이 없습니다: {SKILLS_DIR}")
        return

    parts = [
        "# 알파코 제안서 에이전트 — 마스터 스킬 룰북\n",
        "아래는 제안서 생성 파이프라인을 제어하는 모든 스킬 규칙이다. 반드시 준수한다.\n",
    ]

    for f in skill_files:
        parts.append(f"\n---\n## [{f.stem}]\n")
        parts.append(f.read_text(encoding="utf-8"))

    parts.append("""
---
## 에이전트 행동 지침

1. 대화가 시작되면 **반드시 Skill 00(Phase 0)**부터 실행한다. 고객사명을 입력받으면 5개 블록 질문을 즉시 시작한다.
2. 각 GATE에서 사용자 승인 없이 다음 Phase로 절대 진행하지 않는다.
3. Phase 3 완료 시 최종 JSON을 코드블록(```json ... ```)으로 출력한다.
4. 모든 Integrity Pass Audit 결과를 사용자에게 보고한다.
5. COMPARISON_BENCHMARK layout_type은 절대 JSON slides에 포함하지 않는다 (내부 검증 전용).
""")

    content = "\n".join(parts)
    OUT_FILE.write_text(content, encoding="utf-8")

    size_kb = OUT_FILE.stat().st_size / 1024
    print(f"✅ 마스터 프롬프트 생성 완료")
    print(f"   파일: {OUT_FILE}")
    print(f"   크기: {size_kb:.1f} KB")
    print(f"   Skill 파일 수: {len(skill_files)}개")
    print()
    print("📋 claude.ai 프로젝트 설정 방법:")
    print("   1. claude.ai → Projects → 새 프로젝트 생성")
    print("   2. Project Instructions에 위 파일 내용 붙여넣기")
    print("      (또는 파일 업로드 기능으로 직접 업로드)")
    print("   3. 대화 시작: '고객사: [이름], 교육 주제: [주제]'")

if __name__ == "__main__":
    main()
