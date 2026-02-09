@echo off
echo Starting Invoice Generator Development Environment...
echo.

echo [1/3] Starting MongoDB and Redis...
docker-compose up -d
echo.

echo [2/3] Waiting for databases to be ready (5 seconds)...
timeout /t 5 /nobreak > nul
echo.

echo [3/3] Starting backend server...
cd backend
npm run dev
