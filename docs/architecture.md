# Microservices Architecture Documentation

## 1. Architecture Diagram

```mermaid
flowchart TD
    USER["User / Browser"] --> GW["API Gateway / Nginx :80"]

    GW --> FE["Frontend :3000"]
    GW --> AUTH["Auth Service :8001"]
    GW --> REPORT["Report Service :8002"]

    AUTH --> AUTHDB[("auth-db :5434")]
    REPORT --> REPORTDB[("report-db :5433")]

    REPORT -. Verify Token .-> AUTH
```

---

## 2. Services & Ports

| Service | Port | Description |
|----------|------|-------------|
| gateway | 80 | API Gateway / Reverse Proxy |
| frontend | 3000 | Frontend LAPORin ITK |
| auth-service | 8001 | Authentication Service |
| report-service | 8002 | Report Management Service |
| auth-db | 5434 | Database pengguna |
| report-db | 5433 | Database laporan |

---

## 3. API Contract

Base URL:

```text
http://localhost
```

### 3.1 Auth Service

#### POST /auth/register

Digunakan untuk registrasi pengguna baru.

**Request**

```json
{
  "name": "Andi Pratama",
  "email": "andi@student.itk.ac.id",
  "password": "Cloud@123",
  "phone": "081234567890"
}
```

**Response**

```json
{
  "id": 1,
  "name": "Andi Pratama",
  "email": "andi@student.itk.ac.id"
}
```

---

#### POST /auth/login

Digunakan untuk login dan mendapatkan JWT Token.

**Request**

```json
{
  "email": "andi@student.itk.ac.id",
  "password": "Cloud@123"
}
```

**Response**

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

---

#### GET /auth/verify

Digunakan untuk memvalidasi JWT Token.

**Header**

```text
Authorization: Bearer TOKEN
```

**Response**

```json
{
  "user_id": 1,
  "email": "andi@student.itk.ac.id",
  "name": "Andi Pratama"
}
```

---

### 3.2 Report Service

#### POST /reports

Digunakan untuk membuat laporan kehilangan.

**Header**

```text
Authorization: Bearer TOKEN
```

**Request**

```json
{
  "category": "Kehilangan",
  "title": "Laptop Tertinggal di Perpustakaan",
  "description": "Laptop ASUS warna hitam tertinggal di ruang baca lantai 2 perpustakaan.",
  "location": "Perpustakaan ITK",
  "incident_date": "2026-05-18",
  "is_anonymous": false
}
```

**Response**

```json
{
  "id": 1,
  "user_id": 1,
  "category": "Kehilangan",
  "title": "Laptop Tertinggal di Perpustakaan",
  "status": "menunggu"
}
```

---

#### GET /reports

Digunakan untuk menampilkan daftar laporan pengguna.

**Header**

```text
Authorization: Bearer TOKEN
```

**Response**

```json
[
  {
    "id": 1,
    "title": "Laptop Tertinggal di Perpustakaan",
    "category": "Kehilangan",
    "status": "menunggu"
  }
]
```

---

#### GET /reports/{id}

Digunakan untuk menampilkan detail laporan berdasarkan ID.

**Header**

```text
Authorization: Bearer TOKEN
```

**Response**

```json
{
  "id": 1,
  "user_id": 1,
  "category": "Kehilangan",
  "title": "Laptop Tertinggal di Perpustakaan",
  "description": "Laptop ASUS warna hitam tertinggal di ruang baca lantai 2 perpustakaan.",
  "location": "Perpustakaan ITK",
  "incident_date": "2026-05-18",
  "status": "menunggu",
  "is_anonymous": false,
  "created_at": "2026-05-18T09:15:00Z"
}
```

---

#### PUT /reports/{id}

Digunakan untuk memperbarui laporan.

**Request**

```json
{
  "title": "Laptop Hilang di Perpustakaan",
  "description": "Laptop belum ditemukan hingga saat ini."
}
```

**Response**

```json
{
  "message": "Laporan berhasil diperbarui"
}
```

---

#### DELETE /reports/{id}

Digunakan untuk menghapus laporan.

**Response**

```json
{
  "message": "Laporan berhasil dihapus"
}
```

---

## 4. Running Locally

Menjalankan seluruh service:

```bash
docker compose up --build -d
```

Melihat container yang berjalan:

```bash
docker compose ps
```

Melihat log seluruh service:

```bash
docker compose logs -f
```

Menghentikan seluruh service:

```bash
docker compose down
```

---

## 5. Testing Antar Service

### 1. Register User

```bash
curl -X POST http://localhost/auth/register \
-H "Content-Type: application/json" \
-d '{
"name":"Andi Pratama",
"email":"andi@student.itk.ac.id",
"password":"Cloud@123",
"phone":"081234567890"
}'
```

### 2. Login User

```bash
curl -X POST http://localhost/auth/login \
-H "Content-Type: application/json" \
-d '{
"email":"andi@student.itk.ac.id",
"password":"Cloud@123"
}'
```

**Response**

```json
{
  "access_token": "TOKEN"
}
```

### 3. Membuat Laporan

```bash
curl -X POST http://localhost/reports \
-H "Authorization: Bearer TOKEN" \
-H "Content-Type: application/json" \
-d '{
"category":"Kehilangan",
"title":"Laptop Tertinggal di Perpustakaan",
"description":"Laptop ASUS warna hitam tertinggal di ruang baca lantai 2 perpustakaan.",
"location":"Perpustakaan ITK",
"incident_date":"2026-05-18",
"is_anonymous":false
}'
```

### 4. Menampilkan Daftar Laporan

```bash
curl http://localhost/reports \
-H "Authorization: Bearer TOKEN"
```

### 5. Menampilkan Detail Laporan

```bash
curl http://localhost/reports/1 \
-H "Authorization: Bearer TOKEN"
```

### 6. Verifikasi Komunikasi Antar Service

Alur pengujian:

1. User login melalui Auth Service.
2. Auth Service menghasilkan JWT Token.
3. JWT Token dikirim ke Report Service.
4. Report Service meminta validasi token ke Auth Service.
5. Auth Service mengembalikan data pengguna.
6. Report Service memproses laporan.
7. Data laporan disimpan ke report-db.

---

## 6. Debugging

Melihat log Auth Service:

```bash
docker compose logs auth-service
```

Melihat log Report Service:

```bash
docker compose logs report-service
```

Melihat log Gateway:

```bash
docker compose logs gateway
```

Melihat seluruh container:

```bash
docker compose ps
```

---

## 7. Hasil Testing

Testing berhasil dilakukan dengan hasil:

- Registrasi pengguna berhasil.
- Login berhasil.
- JWT Token berhasil dibuat.
- JWT berhasil diverifikasi oleh Auth Service.
- Laporan kehilangan berhasil dibuat.
- Daftar laporan berhasil ditampilkan.
- Detail laporan berhasil ditampilkan.
- Laporan berhasil diperbarui.
- Laporan berhasil dihapus.
- API Gateway berhasil meneruskan request ke service yang sesuai.
- Semua container berjalan normal.

Contoh status container:

```text
NAME                STATUS
auth-db             healthy
report-db           healthy
auth-service        running
report-service      running
frontend            running
gateway             running
```

---

## 8. Mekanisme Ketahanan Sistem (Resilience)

Bagian ini menjelaskan mekanisme ketahanan (_resilience_) yang diimplementasikan untuk memastikan sistem tetap beroperasi secara terbatas bahkan ketika Auth Service mengalami kegagalan. Mekanisme ini mencakup **Retry dengan Exponential Backoff**, **Circuit Breaker**, dan **Graceful Degradation**.

---

### 8.1 Komponen Resilience

| Komponen | Implementasi | Lokasi |
|----------|-------------|--------|
| **Retry Logic** | 3× percobaan, exponential backoff (0.5s → 1.0s → 2.0s) | `services/report-service/auth_client.py` |
| **Circuit Breaker** | 3 state: CLOSED → OPEN → HALF_OPEN | `services/report-service/circuit_breaker.py` |
| **Graceful Degradation** | Endpoint stats & public tanpa auth | `services/report-service/main.py` |
| **Health Check** | Status agregat termasuk CB state & DB | `GET /reports/health` |

---

### 8.2 State Machine Circuit Breaker

Circuit Breaker memiliki tiga state yang bertransisi berdasarkan jumlah kegagalan dan waktu cooldown:

```mermaid
stateDiagram-v2
    direction LR

    [*] --> CLOSED : Inisialisasi

    CLOSED --> CLOSED : Request berhasil\n(record_success)
    CLOSED --> OPEN : 5× kegagalan berturut\n(failure_threshold tercapai)

    OPEN --> OPEN : Request ditolak langsung\n(fail fast, < 10ms)
    OPEN --> HALF_OPEN : Cooldown 30 detik selesai

    HALF_OPEN --> CLOSED : 1 request test berhasil\n(recovery)
    HALF_OPEN --> OPEN : 1 request test gagal\n(kembali OPEN)
```

---

### 8.3 Alur Saat Auth Service Down — Sequence Diagram

Diagram berikut menggambarkan alur lengkap dari sudut pandang klien ketika Auth Service mati, bagaimana Report Service mendeteksi kegagalan, membuka circuit breaker, dan beralih ke Degraded Mode untuk melayani endpoint yang tidak membutuhkan autentikasi.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Client / Frontend
    participant GW as API Gateway (Nginx :80)
    participant RS as Report Service (:8002)
    participant CB as Circuit Breaker
    participant AS as Auth Service (:8001)

    Note over AS: ❌ Auth Service DOWN (crash / stop)

    rect rgb(255, 235, 235)
        Note over Client,AS: Phase 1 — Deteksi Kegagalan (CB: CLOSED)

        Client->>GW: GET /reports (Authorization: Bearer TOKEN)
        GW->>RS: Proxy request
        RS->>CB: can_execute() ?
        CB-->>RS: ✅ true (state: CLOSED)
        RS->>AS: GET /verify (attempt 1/3)
        AS--xRS: ❌ ConnectError / Timeout
        Note over RS: Retry wait: 0.5s
        RS->>AS: GET /verify (attempt 2/3)
        AS--xRS: ❌ ConnectError / Timeout
        Note over RS: Retry wait: 1.0s
        RS->>AS: GET /verify (attempt 3/3)
        AS--xRS: ❌ ConnectError / Timeout
        RS->>CB: record_failure() — failure_count: 1
        RS-->>GW: HTTP 503 "Auth Service tidak tersedia"
        GW-->>Client: HTTP 503
    end

    Note over CB: [Setelah 5× kegagalan berturut] failure_count ≥ 5

    rect rgb(255, 220, 180)
        Note over Client,AS: Phase 2 — Circuit Breaker OPEN (Fail Fast)

        CB->>CB: state: CLOSED → OPEN
        Note over CB: Mencatat last_failure_time

        Client->>GW: GET /reports (request baru)
        GW->>RS: Proxy request
        RS->>CB: can_execute() ?
        CB-->>RS: ❌ false (state: OPEN, cooldown belum habis)
        RS-->>GW: HTTP 503 "Circuit breaker OPEN" (< 10ms)
        GW-->>Client: HTTP 503 (fail fast)
    end

    rect rgb(220, 255, 220)
        Note over Client,AS: Phase 3 — Degraded Mode Aktif

        Client->>GW: GET /reports/stats (tanpa / dengan token)
        GW->>RS: Proxy request
        RS->>CB: get_status() → state: OPEN
        Note over RS: Degraded Mode diaktifkan
        RS->>RS: crud.get_global_stats() (langsung ke DB)
        RS-->>GW: HTTP 200 {degraded: true, data: ...}
        GW-->>Client: HTTP 200 (statistik global)

        Client->>GW: GET /reports/public
        GW->>RS: Proxy request (no auth required)
        RS->>RS: crud.get_public_reports() (langsung ke DB)
        RS-->>GW: HTTP 200 (laporan publik)
        GW-->>Client: HTTP 200 ✅
    end

    rect rgb(200, 230, 255)
        Note over Client,AS: Phase 4 — Recovery (Auth Service UP kembali)

        Note over AS: ✅ Auth Service START kembali
        Note over CB: [30 detik cooldown berlalu]
        CB->>CB: state: OPEN → HALF_OPEN

        Client->>GW: GET /reports/stats (dengan token)
        GW->>RS: Proxy request
        RS->>CB: can_execute() ?
        CB-->>RS: ✅ true (state: HALF_OPEN, izinkan 1 request test)
        RS->>AS: GET /verify (request test recovery)
        AS-->>RS: HTTP 200 ✅ {user_id, email, ...}
        RS->>CB: record_success()
        CB->>CB: state: HALF_OPEN → CLOSED
        RS-->>GW: HTTP 200 {degraded: false, stats: ...}
        GW-->>Client: HTTP 200 (sistem kembali normal) ✅
    end
```

---

### 8.4 Endpoint dalam Degraded Mode

Ketika Circuit Breaker dalam keadaan **OPEN**, endpoint Report Service berperilaku sebagai berikut:

```mermaid
flowchart TD
    REQ[/"Client Request"/]
    CB{"Circuit Breaker\nState?"}

    REQ --> CB

    CB -->|"CLOSED\n(Normal)"| AUTH_VERIFY["Verifikasi token\nke Auth Service"]
    AUTH_VERIFY --> FULL["✅ Full Response\n(data user spesifik)"]

    CB -->|"OPEN\n(Auth DOWN)"| CHECK_ENDPOINT{"Endpoint\nType?"}

    CHECK_ENDPOINT -->|"GET /reports/stats\n(opsional auth)"| DEGRADED["⚠️ Degraded Mode\nGlobal stats semua laporan\ndegraded: true"]

    CHECK_ENDPOINT -->|"GET /reports/public\n(no auth)"| PUBLIC["✅ Public Mode\nLaporan publik\ntanpa perubahan"]

    CHECK_ENDPOINT -->|"Endpoint lain\n(requires auth)"| REJECT["❌ HTTP 503\nCircuit Breaker OPEN\nFail Fast"]

    style FULL fill:#d4edda,stroke:#28a745,color:#000
    style DEGRADED fill:#fff3cd,stroke:#ffc107,color:#000
    style PUBLIC fill:#d4edda,stroke:#28a745,color:#000
    style REJECT fill:#f8d7da,stroke:#dc3545,color:#000
```

---

### 8.5 Konfigurasi Resilience

Parameter resilience dapat dikonfigurasi melalui environment variable atau langsung di source code:

```python
# services/report-service/auth_client.py

MAX_RETRIES = 3          # Jumlah percobaan maksimal
BASE_DELAY = 0.5         # Delay awal exponential backoff (detik)
TIMEOUT_SECONDS = 5.0    # Timeout per request ke Auth Service

# services/report-service/circuit_breaker.py (instance di auth_client.py)
auth_circuit = CircuitBreaker(
    name="auth-service",
    failure_threshold=5,    # Kegagalan berturut sebelum OPEN
    cooldown_seconds=30,    # Waktu tunggu sebelum HALF_OPEN
)
```

**Total waktu tunggu maksimal (worst case) sebelum HTTP 503 dikembalikan ke klien:**

```
(TIMEOUT_SECONDS × MAX_RETRIES) + (BASE_DELAY × (2^0 + 2^1))
= (5.0 × 3) + (0.5 + 1.0 + 2.0)
= 15.0 + 3.5
= 18.5 detik
```

Setelah circuit breaker OPEN, seluruh request yang memerlukan auth dijawab dalam **< 10ms** (fail fast).

---

## 9. Conclusion

Arsitektur microservices pada aplikasi LAPORin ITK berhasil diimplementasikan dengan memisahkan Authentication Service dan Report Service ke dalam layanan yang independen. API Gateway berfungsi sebagai pintu masuk utama aplikasi, sedangkan setiap service memiliki database masing-masing sehingga komunikasi antar layanan menjadi lebih terstruktur.

Sistem dilengkapi dengan mekanisme ketahanan (_resilience_) yang komprehensif: **retry logic dengan exponential backoff**, **circuit breaker tiga-state**, dan **graceful degradation** pada endpoint kritis. Mekanisme ini memastikan sistem tetap dapat melayani pengguna secara terbatas (Degraded Mode) bahkan saat Auth Service mengalami kegagalan, serta pulih secara otomatis tanpa intervensi manual setelah Auth Service kembali beroperasi.

Pengujian menunjukkan bahwa proses registrasi, login, verifikasi token, pembuatan laporan, pengelolaan laporan, komunikasi antar service, dan skenario failure recovery berjalan dengan baik sesuai rancangan.

