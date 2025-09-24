@echo off
echo Building and deploying ASD Detection Application...
echo.

echo Building Frontend for Production...
cd /d C:\Users\Lenovo\Asd-local-\frontend
call npm run build

echo.
echo Starting Production Backend Server...
cd /d C:\Users\Lenovo\Asd-local-\backend
start "Production Backend" cmd /k ".\venv\Scripts\Activate.ps1 && python server.py"

echo.
echo Starting Production Frontend Server...
cd /d C:\Users\Lenovo\Asd-local-\frontend
start "Production Frontend" cmd /k "npx serve -s build -l 3000"

echo.
echo Production servers are starting...
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo.
echo The application is now running in production mode!
pause
