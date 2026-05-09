.PHONY: up down build logs ps clean restart lint test pr-check logs-backend shell-backend shell-db

# Start semua services
up:
	docker compose up -d

# Start dengan rebuild
build:
	docker compose up --build -d

# Stop & remove containers
down:
	docker compose down

# Stop, remove, DAN hapus volumes (⚠️ data hilang!)
clean:
	docker compose down -v
	docker system prune -f

# Restart semua
restart:
	docker compose restart

# Lihat logs (semua services)
logs:
	docker compose logs -f

# Lihat logs backend saja
logs-backend:
	docker compose logs -f backend

# Lihat status
ps:
	docker compose ps

# Masuk ke backend shell
shell-backend:
	docker compose exec backend bash

# Masuk ke database
shell-db:
	docker compose exec db psql -U postgres -d cloudapp

# Jalankan linter pada service frontend
lint:
	@echo "Menjalankan linter..."
	docker compose exec frontend npm run lint

# Jalankan testing
test:
	@echo "Menjalankan test suite..."
	docker compose exec backend pytest

# Validasi Pull Request: Build ulang image, jalankan linter, lalu jalankan test
pr-check: build lint test
	@echo "✅ PR Check selesai: Build, Lint, dan Test berhasil tanpa eror."
