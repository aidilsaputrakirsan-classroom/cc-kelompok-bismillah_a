.PHONY: up down build logs ps clean restart lint test pr-check logs-auth logs-report logs-gateway shell-auth shell-report shell-auth-db shell-report-db seed-admin

COMPOSE = docker compose

# ─────────────────────────────────────────────
# Core targets
# ─────────────────────────────────────────────

# Start semua services (tanpa rebuild)
up:
	$(COMPOSE) up -d

# Start dengan rebuild image
build:
	$(COMPOSE) up --build -d

# Stop & remove containers (data tetap ada)
down:
	$(COMPOSE) down

# Restart semua services
restart:
	$(COMPOSE) restart

# Lihat logs semua services (follow mode)
logs:
	$(COMPOSE) logs -f

# ─────────────────────────────────────────────
# Per-service logs
# ─────────────────────────────────────────────

# Logs auth-service saja
logs-auth:
	$(COMPOSE) logs -f auth-service

# Logs report-service saja
logs-report:
	$(COMPOSE) logs -f report-service

# Logs gateway saja
logs-gateway:
	$(COMPOSE) logs -f gateway

# ─────────────────────────────────────────────
# Shell access
# ─────────────────────────────────────────────

# Masuk ke shell auth-service
shell-auth:
	$(COMPOSE) exec auth-service bash

# Masuk ke shell report-service
shell-report:
	$(COMPOSE) exec report-service bash

# Masuk ke database auth-db
shell-auth-db:
	$(COMPOSE) exec auth-db psql -U postgres -d auth_db

# Masuk ke database report-db
shell-report-db:
	$(COMPOSE) exec report-db psql -U postgres -d report_db

# ─────────────────────────────────────────────
# Status & Maintenance
# ─────────────────────────────────────────────

# Lihat status semua containers
ps:
	$(COMPOSE) ps

# Stop, hapus containers DAN volumes (⚠️ data hilang!)
clean:
	$(COMPOSE) down -v
	docker system prune -f

# ─────────────────────────────────────────────
# Quality checks
# ─────────────────────────────────────────────

# Jalankan linter pada service frontend
lint:
	@echo "Menjalankan linter..."
	$(COMPOSE) exec frontend npm run lint

# Jalankan testing backend
test:
	@echo "Menjalankan test suite..."
	$(COMPOSE) exec auth-service pytest

# Validasi PR: build, lint, test
pr-check: build lint test
	@echo "✅ PR Check selesai: Build, Lint, dan Test berhasil tanpa eror."

# ─────────────────────────────────────────────
# Seed
# ─────────────────────────────────────────────

# Seed admin & user ke auth_db (jalankan setelah build pertama / clean)
seed-admin:
	@echo "🌱 Menyalin script seed ke container auth-service..."
	docker cp services/auth-service/seed_admin.py laporin-auth-service:/app/seed_admin.py
	@echo "🌱 Menjalankan seeder admin..."
	docker exec laporin-auth-service python seed_admin.py

# Build ulang dan langsung seed admin
build-seed: build seed-admin

# Seed laporan demo ke report_db (jalankan setelah seed-admin)
seed-reports:
	@echo "📋 Menyalin script seed laporan ke container..."
	docker cp services/report-service/seed_reports.py laporin-report-service:/app/seed_reports.py
	@echo "📋 Menjalankan seeder laporan..."
	docker exec laporin-report-service python seed_reports.py

# Seed semua: admin + laporan (urut)
seed-all: seed-admin seed-reports
	@echo "✅ Seed selesai: admin dan laporan berhasil dibuat."

# Build ulang lalu seed semua
build-seed-all: build seed-all

