# PowerShell setup script for SmartLab HMI Controller
# Run this script from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartLab HMI Controller Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = npm --version 2>$null
Write-Host "  npm: $npmVersion" -ForegroundColor Green

# Check PostgreSQL
$pgVersion = psql --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: PostgreSQL CLI not found. Make sure PostgreSQL is installed and running." -ForegroundColor Yellow
} else {
    Write-Host "  PostgreSQL: $pgVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  Backend dependencies installed!" -ForegroundColor Green

Write-Host ""
Write-Host "Installing mobile dependencies..." -ForegroundColor Yellow
Set-Location -Path "../mobile"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install mobile dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  Mobile dependencies installed!" -ForegroundColor Green

Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Configure PostgreSQL database:"
Write-Host "     - Create database: CREATE DATABASE smartlab_hmi;"
Write-Host "     - Update backend/.env with your database credentials"
Write-Host ""
Write-Host "  2. Run database migrations:"
Write-Host "     cd backend && npm run migrate"
Write-Host ""
Write-Host "  3. Start the backend server:"
Write-Host "     cd backend && npm run dev"
Write-Host ""
Write-Host "  4. Start the mobile app:"
Write-Host "     cd mobile && npx react-native run-android"
Write-Host ""
Write-Host "  5. (Optional) Run device simulator:"
Write-Host "     cd backend && npm run simulator"
Write-Host ""
