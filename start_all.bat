@echo off
echo ===================================================================
echo  ApexCare Health - Clinic Appointment Management System
echo ===================================================================
echo.
echo Starting Django Backend Server on port 8000...
start cmd /k "python manage.py migrate && python seed_data.py && python manage.py runserver 127.0.0.1:8000"

timeout /t 2 /nobreak > nul

echo Starting Frontend on port 3000...
start cmd /k "python run_frontend.py 3000"

echo.
echo Both services launched! 
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:8000/api
echo.
pause
