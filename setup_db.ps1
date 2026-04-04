# setup_db.ps1 - Initialize PostgreSQL database for HiredUp
# Run from the project root: .\setup_db.ps1
# Requires: PostgreSQL installed and `psql` available in PATH

Write-Host "`n🗄  HiredUp - Database Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$PG_USER = "postgres"
$DB_NAME = "skillfirst_hire"
$SQL_FILE = Join-Path $PSScriptRoot "Database\init.sql"

# Check if psql is available
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ psql not found in PATH. Make sure PostgreSQL is installed and its bin folder is in PATH." -ForegroundColor Red
    Write-Host "   Typical path: C:\Program Files\PostgreSQL\16\bin" -ForegroundColor Yellow
    exit 1
}

# Create DB if it doesn't exist
Write-Host "1. Creating database '$DB_NAME'..." -ForegroundColor White
$exists = psql -U $PG_USER -lqt 2>$null | Select-String -Pattern "\b$DB_NAME\b"
if (-not $exists) {
    psql -U $PG_USER -c "CREATE DATABASE $DB_NAME;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database created." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Could not create database (may already exist or permission denied)." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  Database already exists. Skipping creation." -ForegroundColor DarkGray
}

# Run init.sql
Write-Host "2. Running schema migration..." -ForegroundColor White
psql -U $PG_USER -d $DB_NAME -f $SQL_FILE 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Schema initialized successfully." -ForegroundColor Green
} else {
    Write-Host "   ❌ Schema init failed. Check psql output above." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Database ready! You can now run .\master_run.ps1" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "   Test accounts (demo mode only):" -ForegroundColor DarkGray
Write-Host "   Candidate: demo@example.com / demo123" -ForegroundColor DarkGray
Write-Host "   Recruiter: recruiter@example.com / demo123`n" -ForegroundColor DarkGray
