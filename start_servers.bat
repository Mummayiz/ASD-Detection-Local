@echo off
echo Starting ASD Detection Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d C:\Users\Lenovo\Asd-local-\backend && .\venv\Scripts\Activate.ps1 && python server.py"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d C:\Users\Lenovo\Asd-local-\frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo.
echo The application will open in your browser automatically.
echo Keep both terminal windows open while using the application.
echo.
pause
