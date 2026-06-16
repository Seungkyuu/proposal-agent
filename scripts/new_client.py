"""
new_client.py
─────────────────────────────────────────────────────────────────────
새 고객사 제안서 폴더를 생성합니다.
기존 고객사 폴더 목록도 출력합니다.

사용법:
    python scripts/new_client.py
    python scripts/new_client.py "고객사명" "교육 주제"
"""

import sys
import json
import os
from datetime import date
from pathlib import Path

BASE_DIR    = Path(__file__).parent.parent
CLIENTS_DIR = BASE_DIR / "output" / "clients"
CLIENTS_DIR.mkdir(parents=True, exist_ok=True)

PHASE_TEMPLATES = {
    "00_requirements.md": """\
# Phase 0 - 요구사항 정의서

> 고객사: {client_name}
> 주제: {topic}
> 작성일: {today}

---

## 블록 1. 교육 목적 및 기대 성과

- 교육 목적:
- 기대 성과:

## 블록 2. 수강생 프로파일

- 직군/직급:
- 인원:
- 디지털 역량 수준:

## 블록 3. 교육 환경 및 제약

- 교육 방식 (대면/원격/혼합):
- 일정/차시:
- 망분리 여부:

## 블록 4. 커리큘럼 방향

- 핵심 주제:
- 실습 도구:
- 최종 산출물:

## 블록 5. 납품 범위 및 평가

- 납품 범위:
- 평가 방식:
""",

    "01_strategy.md": """\
# Phase 1 - 기획안

> 고객사: {client_name}
> 작성일: {today}

---

## 제안 핵심 메시지 (Top Message)



## 고객사 현황 분석 (As-Is / To-Be)



## 커리큘럼 방향 및 차시 구성



## 알파코 강점 (USP 3대 포인트)


""",

    "02_structure.md": """\
# Phase 2 - 슬라이드 구조

> 고객사: {client_name}
> 작성일: {today}

---

## 슬라이드 목록

| # | layout_type | 제목/주제 | 소스 장표 추천 |
|---|-------------|---------|-------------|
| 01 | TITLE_SLIDE | | (알파코)AIDP_KB국민은행 S01 |
| 02 | TABLE_OF_CONTENTS | | 신한금융그룹_AX혁신리더 S02 |
| 03 | PROBLEM_VS_SOLUTION | | 신한금융그룹_AX혁신리더 S04 |
| 04 | VENDOR_PROFILE | | 신한금융그룹_AX혁신리더 S20 |
| 05 | FLOW_CHART | | KB_메타인지해커톤 S10 |
| 06 | N_COLUMN_CARDS | | 신한금융그룹_AX혁신리더 S07 |
| 07 | CURRICULUM_TABLE | | 신한은행_퓨처아카데미 S03 |
| 08 | EVALUATION_METRIC | | 신한금융그룹_AX혁신리더 S68 |
| 09 | CLOSING_SLIDE | | S-Oil_독서통신 S28 |

> **소스 장표 추천**: 기존 알파코 제안서에서 레이아웃별 최적 슬라이드 참조.
> `layout_type` 은 templates/layout_positions.json 허용값과 동일해야 함.

---

## 텍스트박스 스캐폴드 PPTX 생성

```bash
pip install python-pptx
python renderer/pptx_builder.py output/clients/{client_name}_<날짜>/proposal.json output/result.pptx
```

---

## 승인 여부: [ ] 미승인 / [ ] 승인
""",

    "03_content.md": """\
# Phase 3 - 슬라이드별 콘텐츠

> 고객사: {client_name}
> 작성일: {today}

---

<!-- 아래 형식으로 슬라이드별 콘텐츠가 채워집니다 -->

""",
}


def list_clients():
    clients = sorted([
        d for d in CLIENTS_DIR.iterdir()
        if d.is_dir() and not d.name.startswith("_")
    ], key=lambda x: x.stat().st_mtime, reverse=True)

    if not clients:
        print("  (등록된 고객사 없음)")
        return

    print(f"\n{'고객사':<30} {'주제':<30} {'Phase':<8} {'최종수정'}")
    print("-" * 80)
    for c in clients:
        meta_path = c / "metadata.json"
        if meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            name    = meta.get("client_name", c.name)[:28]
            topic   = meta.get("topic", "")[:28]
            phase   = f"Phase {meta.get('current_phase', '?')}"
            updated = meta.get("updated_at", "")
            print(f"  {name:<30} {topic:<30} {phase:<8} {updated}")
        else:
            print(f"  {c.name}")
    print()


def create_client(client_name: str, topic: str):
    today     = str(date.today()).replace("-", "")[:8]
    folder_name = f"{client_name}_{today}"
    folder_path = CLIENTS_DIR / folder_name

    if folder_path.exists():
        print(f"[이미 존재] {folder_path}")
        return folder_path

    folder_path.mkdir(parents=True)

    # metadata.json
    meta = {
        "client_name": client_name,
        "topic": topic,
        "contact": "",
        "created_at": str(date.today()),
        "updated_at": str(date.today()),
        "current_phase": 0,
        "phase_status": {"0": "in_progress", "1": "", "2": "", "3": ""},
        "notes": "",
    }
    (folder_path / "metadata.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Phase 템플릿 파일 생성
    ctx = {"client_name": client_name, "topic": topic, "today": str(date.today())}
    for fname, tmpl in PHASE_TEMPLATES.items():
        (folder_path / fname).write_text(tmpl.format(**ctx), encoding="utf-8")

    print(f"\n[생성 완료] {folder_path}")
    print(f"  고객사: {client_name}")
    print(f"  주제:   {topic}")
    print(f"\n[다음 단계]")
    print(f"  Claude Code에서 아래처럼 시작하세요:")
    print(f"  '고객사: {client_name}, 교육 주제: {topic}'")

    # _index.md 업데이트
    _update_index()

    return folder_path


def _update_index():
    clients = sorted([
        d for d in CLIENTS_DIR.iterdir()
        if d.is_dir() and not d.name.startswith("_")
    ], key=lambda x: x.stat().st_mtime, reverse=True)

    rows = []
    for c in clients:
        meta_path = c / "metadata.json"
        if meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            name    = meta.get("client_name", c.name)
            topic   = meta.get("topic", "")
            phase   = meta.get("current_phase", "?")
            updated = meta.get("updated_at", "")
            rows.append(f"| {name} | {topic} | Phase {phase} | {updated} | [->](./{c.name}/) |")

    index_content = f"""\
# 알파코 제안서 고객사 현황

> 업데이트: {date.today()}

| 고객사 | 주제 | Phase | 최종수정 | 폴더 |
|--------|------|-------|---------|------|
{chr(10).join(rows)}

---

## 새 고객사 시작하기

```bash
python scripts/new_client.py "고객사명" "교육 주제"
```

또는 Claude Code에서:
```
고객사: [이름], 교육 주제: [주제]
```

## 기존 작업 이어받기

Claude Code에서:
```
[고객사명] 제안서 이어서 해줘
```
"""
    (CLIENTS_DIR / "_index.md").write_text(index_content, encoding="utf-8")


if __name__ == "__main__":
    print("\n=== 알파코 고객사 관리 ===")

    if len(sys.argv) == 3:
        create_client(sys.argv[1], sys.argv[2])
    elif len(sys.argv) == 1:
        print("\n[전체 고객사 현황]")
        list_clients()
        print("새 고객사 생성:")
        print("  python scripts/new_client.py \"고객사명\" \"교육 주제\"")
    else:
        print("사용법: python scripts/new_client.py [고객사명] [교육주제]")
