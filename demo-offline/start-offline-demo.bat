@echo off
set PORT=4173

REM Start the local demo server in a new window
start "TuniCompliance Demo Server" powershell -ExecutionPolicy Bypass -File "%~dp0start-offline-demo.ps1" -Port %PORT%

REM Give it a moment, then open the browser
timeout /t 2 >nul
start "" "http://localhost:%PORT%/"

echo.
echo La demo est en cours sur http://localhost:%PORT%/
echo Pour arreter, fermez la fenetre "TuniCompliance Demo Server".
