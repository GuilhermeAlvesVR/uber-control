@echo off
echo Iniciando Controle Uber...
echo.
echo 1. Backend (Django)
cd backend
start cmd /k "python manage.py runserver"
cd ..
echo.
echo 2. Frontend (Vite + React)
cd frontend
start cmd /k "npm run dev"
cd ..
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.echo.
