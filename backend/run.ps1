# FastAPI Backend Startup Script for Windows PowerShell

Write-Host "Starting Second Brain FastAPI Backend (PostgreSQL)..." -ForegroundColor Cyan

# Check if virtual environment exists
$venvPath = ".\.venv"
if (Test-Path $venvPath) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "$venvPath\Scripts\Activate.ps1"
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    & ".\.venv\Scripts\Activate.ps1"
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Load environment variables if .env exists
if (Test-Path ".env") {
    Write-Host "Loading .env file..." -ForegroundColor Yellow
    $envContent = Get-Content .env -Raw
    $envContent.Split("`n") | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$host = $env:HOST ?? "0.0.0.0"
$port = $env:PORT ?? "8000"
$reload = $env:RELOAD ?? "true"

Write-Host "Starting server on http://$host:$port" -ForegroundColor Green
Write-Host "API docs available at http://$host:$port/docs" -ForegroundColor Green

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
python -c "
import asyncio
from database import init_db
try:
    asyncio.run(init_db())
    print('Database connection OK')
except Exception as e:
    print(f'Database connection failed: {e}')
    exit(1)
"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Database connection failed. Check your DATABASE_URL in .env" -ForegroundColor Red
    exit 1
}

if ($reload -eq "true") {
    uvicorn main:app --host $host --port $port --reload
} else {
    uvicorn main:app --host $host --port $port
}