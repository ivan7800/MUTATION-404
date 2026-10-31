@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Necesitas instalar Node.js 20 o posterior desde https://nodejs.org/
 pause
 exit /b 1
)
node scripts\launch.mjs %*
if errorlevel 1 pause
