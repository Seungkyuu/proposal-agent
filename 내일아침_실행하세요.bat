@echo off
chcp 65001 > nul
title 알파코 제안서 에이전트 — 마스터 덱 빌드
echo.
echo =====================================================
echo   알파코 제안서 에이전트 V2 — 템플릿 클론 시스템
echo =====================================================
echo.

cd /d "%~dp0"

echo [1/3] python-pptx 설치 확인 중...
pip install python-pptx --quiet
if %errorlevel% neq 0 (
    echo.
    echo ❌ pip 실행 실패. Python이 PATH에 없거나 pip가 없습니다.
    echo    Python 설치 경로를 확인해 주세요.
    pause
    exit /b 1
)
echo     ✅ python-pptx 준비 완료
echo.

echo [2/3] 알파코 마스터 덱 컴파일 중...
echo     소스 파일 13개에서 레이아웃별 최적 슬라이드 복제
python scripts\compile_master.py
if %errorlevel% neq 0 (
    echo.
    echo ❌ 마스터 덱 컴파일 실패.
    echo    오류 내용을 확인하고 Claude에게 알려주세요.
    pause
    exit /b 1
)
echo.

echo [3/3] 동대문구시설관리공단 제안서 생성 중...
python renderer\pptx_builder.py output\dongdaemun_proposal.json output\dongdaemun_AX_제안서_v2.pptx
if %errorlevel% neq 0 (
    echo.
    echo ❌ 제안서 생성 실패.
    echo    오류 내용을 확인하고 Claude에게 알려주세요.
    pause
    exit /b 1
)

echo.
echo =====================================================
echo   ✅ 완료! 아래 파일을 열어보세요
echo.
echo   📄 output\dongdaemun_AX_제안서_v2.pptx
echo   📄 templates\master\alpaco_master.pptx  (마스터 덱)
echo =====================================================
echo.
echo 잠시 후 파일 탐색기가 열립니다...
timeout /t 2 /nobreak > nul
explorer "%~dp0output"
pause
