# ============================================================
# make-admin.ps1 — Buat akun Admin baru untuk LaporIn ITK
# Cara pakai: .\make-admin.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LaporIn ITK - Buat Akun Admin Baru  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Input dari user
$Nama     = Read-Host "Nama lengkap"
$Email    = Read-Host "Email"
$Password = Read-Host "Password"

if (-not $Nama -or -not $Email -or -not $Password) {
    Write-Host "[!] Nama, email, dan password tidak boleh kosong." -ForegroundColor Red
    exit 1
}

# Cek container backend berjalan
$running = docker ps --filter "name=backend" --format "{{.Names}}" 2>$null
if ($running -ne "backend") {
    Write-Host "[!] Container 'backend' tidak berjalan." -ForegroundColor Red
    Write-Host "    Jalankan dulu: .\docker-run.ps1 start" -ForegroundColor Yellow
    exit 1
}

# Copy helper script ke container dan jalankan
$helperPath = Join-Path $PSScriptRoot "_make_admin_helper.py"
Write-Host ""
Write-Host "[*] Membuat akun admin..." -ForegroundColor Yellow

docker cp $helperPath backend:/tmp/_make_admin_helper.py 2>$null
docker exec backend python /tmp/_make_admin_helper.py $Nama $Email $Password

Write-Host ""
