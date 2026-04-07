# Mengambil argumen pertama, default ke 'start'
$Action = $args[0]
if (-not $Action) { $Action = 'start' }

switch ($Action) {
    'start' {
        Write-Host "[-] Cleaning up existing containers..."
        docker rm -f laporin backend frontend 2>$null

        Write-Host "[*] Starting all containers..."
        
        # Inisiasi network, output error diarahkan ke $null (ekuivalen 2>/dev/null)
        docker network create laporin_net 2>$null
        
        Write-Host "[*] Starting database..."
        docker run -d `
          --name laporin `
          --network laporin_net `
          -e POSTGRES_USER=postgres `
          -e POSTGRES_PASSWORD=password `
          -e POSTGRES_DB=laporin_itk `
          -p 5433:5432 `
          -v pgdata:/var/lib/postgresql/data `
          postgres:16-alpine
        
        Write-Host "[*] Waiting for database..."
        Start-Sleep -Seconds 5
        
        Write-Host "[*] Starting backend..."
        # Pastikan path .env disesuaikan secara relatif dari lokasi eksekusi
        docker run -d `
          --name backend `
          --network laporin_net `
          --env-file ../backend/.env.docker `
          -p 8000:8000 `
          laporin_itk-backend:v1
        
        Write-Host "[*] Starting frontend..."
        docker run -d `
          --name frontend `
          --network laporin_net `
          -p 3000:80 `
          laporin_itk-frontend:v1
        
        Write-Host "`n[+] All containers started!"
        Write-Host "   Frontend: http://localhost:3000"
        Write-Host "   Backend:  http://localhost:8000"
        Write-Host "   Database: localhost:5433"
    }
    'stop' {
        Write-Host "[-] Stopping all containers..."
        docker stop frontend backend laporin 2>$null
        docker rm frontend backend laporin 2>$null
        Write-Host "[+] All containers stopped and removed."
    }
    'status' {
        Write-Host "[i] Container Status:"
        # Backtick (`t) digunakan sebagai karakter escape untuk tabulasi di PowerShell
        docker ps --format "table {{.Names}}`t{{.Image}}`t{{.Status}}`t{{.Ports}}"
    }
    'logs' {
        # Mengambil argumen kedua, default ke 'backend'
        $Container = $args[1]
        if (-not $Container) { $Container = 'backend' }
        Write-Host "[i] Logs for ${Container}:"
        docker logs -f $Container
    }
    Default {
        Write-Host "Usage: .\docker-run.ps1 [start|stop|status|logs [container]]"
    }
}
