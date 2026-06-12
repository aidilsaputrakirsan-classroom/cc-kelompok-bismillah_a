# Release Notes — Milestone 3 (Final)

## Version: 3.0.0
**Release Date:** [Tanggal UAS]  
**Tag:** v3.0.0

## 🆕 Fitur Baru (dari Milestone 2)

### Microservices Architecture
- Monolith decomposed menjadi Auth Service + Item Service
- Database per service (auth_db, item_db)
- API Gateway (Nginx) sebagai entry point
- Inter-service communication via HTTP REST

### Reliability
- Retry logic dengan exponential backoff (3 retries)
- Circuit breaker pattern (5 failures → open, 30s cooldown)
- Graceful degradation saat Auth Service down

### Monitoring & Observability
- Structured JSON logging dengan correlation ID
- In-memory metrics (request count, error rate, latency percentiles)
- Health dashboard (/status) dengan auto-refresh
- Aggregated health check dengan dependency status

### Security Hardening
- Rate limiting di API Gateway (5 req/s auth, 20 req/s API)
- Input validation diperkuat (password strength, field limits)
- Secret audit — semua credentials di environment variables
- CORS dikonfigurasi per environment

## 📊 Statistik Proyek

| Metric | Nilai |
|--------|-------|
| Total Services | 6 (2 APIs, 2 DBs, frontend, gateway) |
| Total Endpoints | 12 |
| Unit Tests | [X] tests |
| Integration Tests | 8 tests |
| CI Pipeline Jobs | [X] jobs |
| Total Commits | [X] |
| Total PRs Merged | [X] |

## 🐛 Known Issues
- [List known issues jika ada]

## 👥 Kontribusi
| Nama | Commits | PRs | Areas |
|------|---------|-----|-------|
| Aditya Laksamana P Butar Butar | [48] | [20] | Backend, Auth Service |
| Firni Fauziah Ramadhini | [23] | [10] | Frontend, Dashboard |
| Muhammad Novri Aziztra | [27] | [12] | DevOps, Gateway, CI/CD |
| Salsabila Putri Zahrani | [31] | [13] | QA, Testing, Docs |