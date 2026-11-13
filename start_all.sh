#!/usr/bin/env bash
echo "==================================================================="
echo " ApexCare Health - Clinic Appointment Management System"
echo "==================================================================="
echo ""
echo "Migrating & Seeding database..."
python manage.py migrate
python seed_data.py

echo "Launching Django Backend on port 8000..."
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

echo "Launching Frontend on port 3000..."
python run_frontend.py 3000 &
FRONTEND_PID=$!

echo ""
echo "ApexCare is live!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://127.0.0.1:8000/api"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
