# =============================================================
# logs.ps1 - Log helper script untuk debugging LaporIn ITK
# Disesuaikan untuk Windows PowerShell (Modul 14)
#
# Usage:
#   .\scripts\logs.ps1 all                     - lihat semua log (live)
#   .\scripts\logs.ps1 errors                  - filter hanya ERROR logs
#   .\scripts\logs.ps1 warnings                - filter WARNING + ERROR logs
#   .\scripts\logs.ps1 trace <correlation-id>  - trace satu request chain
#   .\scripts\logs.ps1 metrics                 - fetch metrics kedua services
#   .\scripts\logs.ps1 export                  - export log ke file
#   .\scripts\logs.ps1 status                  - cek health semua services
# =============================================================

param(
    [Parameter(Position = 0)]
    [string]$Command = "help",

    [Parameter(Position = 1)]
    [string]$Arg1 = ""
)

switch ($Command) {

    "all" {
        Write-Host "[ALL] Menampilkan semua log (auth-service + report-service) secara live..." -ForegroundColor Cyan
        Write-Host "      Tekan Ctrl+C untuk berhenti.`n" -ForegroundColor Gray
        docker compose logs -f auth-service report-service
    }

    "errors" {
        Write-Host "[ERRORS] Menampilkan hanya ERROR logs dari semua services...`n" -ForegroundColor Red
        docker compose logs auth-service report-service 2>&1 | Select-String '"level":"ERROR"'
    }

    "warnings" {
        Write-Host "[WARNINGS] Menampilkan WARNING + ERROR logs dari semua services...`n" -ForegroundColor Yellow
        docker compose logs auth-service report-service 2>&1 | Select-String '"level":"(WARNING|ERROR)"'
    }

    "trace" {
        if ($Arg1 -eq "") {
            Write-Host "[!] Usage: .\scripts\logs.ps1 trace <correlation-id>" -ForegroundColor Yellow
            Write-Host "    Contoh: .\scripts\logs.ps1 trace a1b2c3d4" -ForegroundColor Gray
            exit 1
        }
        Write-Host "[TRACE] Tracing correlation ID: $Arg1`n" -ForegroundColor Magenta
        docker compose logs auth-service report-service 2>&1 | Select-String $Arg1
    }

    "metrics" {
        Write-Host "[METRICS] Mengambil metrics dari semua services...`n" -ForegroundColor Cyan

        Write-Host "=== Auth Service ===" -ForegroundColor Blue
        try {
            $authMetrics = Invoke-RestMethod -Uri "http://localhost/auth/metrics" -ErrorAction Stop
            $authMetrics | ConvertTo-Json -Depth 5
        } catch {
            Write-Host "[ERROR] Tidak bisa mengambil metrics auth-service: $_" -ForegroundColor Red
        }

        Write-Host "`n=== Report Service ===" -ForegroundColor Blue
        try {
            $reportMetrics = Invoke-RestMethod -Uri "http://localhost/reports/metrics" -ErrorAction Stop
            $reportMetrics | ConvertTo-Json -Depth 5
        } catch {
            Write-Host "[ERROR] Tidak bisa mengambil metrics report-service: $_" -ForegroundColor Red
        }
    }

    "export" {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $outFile = "logs\all-services-$timestamp.log"

        # Pastikan folder logs ada
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" | Out-Null
        }

        Write-Host "[EXPORT] Mengexport log ke: $outFile`n" -ForegroundColor Cyan
        docker compose logs --no-color auth-service report-service 2>&1 | Out-File -FilePath $outFile -Encoding utf8
        Write-Host "[OK] Log berhasil disimpan di: $outFile" -ForegroundColor Green
    }

    "status" {
        Write-Host "[STATUS] Mengecek health status semua services...`n" -ForegroundColor Cyan

        $services = @(
            @{ Name = "Gateway";        Url = "http://localhost/health" },
            @{ Name = "Auth Service";   Url = "http://localhost/auth/health" },
            @{ Name = "Report Service"; Url = "http://localhost/reports/health" }
        )

        foreach ($svc in $services) {
            try {
                $res = Invoke-RestMethod -Uri $svc.Url -ErrorAction Stop
                $color = switch ($res.status) {
                    "healthy"    { "Green" }
                    "degraded"   { "Yellow" }
                    "unhealthy"  { "Red" }
                    default      { "Gray" }
                }
                Write-Host ("  [{0}] {1}" -f $res.status.ToUpper().PadRight(10), $svc.Name) -ForegroundColor $color
            } catch {
                Write-Host "  [UNREACHABLE] $($svc.Name)" -ForegroundColor DarkGray
            }
        }
        Write-Host ""
    }

    default {
        Write-Host ""
        Write-Host "LaporIn ITK - Log Helper (Modul 14)" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\scripts\logs.ps1 <command> [args]" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Yellow
        Write-Host "  all                    Tampilkan semua log secara live (Ctrl+C untuk stop)"
        Write-Host "  errors                 Filter hanya baris dengan level ERROR"
        Write-Host "  warnings               Filter baris WARNING dan ERROR"
        Write-Host "  trace <id>             Cari semua log dengan correlation ID tertentu"
        Write-Host "  metrics                Fetch dan tampilkan metrics semua services"
        Write-Host "  export                 Export semua log ke file di folder logs\"
        Write-Host "  status                 Cek health status semua services"
        Write-Host ""
        Write-Host "Contoh:" -ForegroundColor Gray
        Write-Host "  .\scripts\logs.ps1 trace a1b2c3d4"
        Write-Host "  .\scripts\logs.ps1 metrics"
        Write-Host "  .\scripts\logs.ps1 errors"
        Write-Host ""
    }
}
