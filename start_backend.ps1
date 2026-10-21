# Start CodeClash Backend
Write-Host "Starting CodeClash Backend..." -ForegroundColor Cyan
Set-Location $PSScriptRoot\backend

if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt --quiet

Write-Host "Backend running at http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs at http://localhost:8000/docs" -ForegroundColor Green
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
