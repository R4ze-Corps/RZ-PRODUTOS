@echo off
setlocal enabledelayedexpansion
set REPO_PATH=%~dp0
echo [1/3] Acessando repositorio...
cd /d "%REPO_PATH%"
git add -A
git commit -m "auto: sincronizacao automatica %date% %time%"
git push origin master
echo.
echo Finalizado! Pressione qualquer tecla para fechar.
pause >nul
