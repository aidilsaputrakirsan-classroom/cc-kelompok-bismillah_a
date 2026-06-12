# API Contract — LaporIn ITK Microservices

## Base URLs

| Environment       | Gateway URL                                            |
| ----------------- | ------------------------------------------------------ |
| Local Development | http://localhost                                       |
| Production        | https://cc-kelompok-bismillaha.akhzafachrozy.my.id/ |

---

## Authentication

Semua endpoint yang membutuhkan autentikasi menggunakan JWT token pada header:

`Authorization: Bearer <access_token>`

Token diperoleh melalui endpoint `POST /auth/login`.

Token memiliki masa berlaku sesuai konfigurasi `TOKEN_EXPIRE_MINUTES`.

---

## Error Response Format

Seluruh response error menggunakan format yang konsisten:

```json
{
    "detail": "Error message description"
}
```

| Status Code | Meaning                             |
| ----------- | ----------------------------------- |
| 200         | Success                             |
| 201         | Created                             |
| 204         | No Content                          |
| 400         | Bad Request / Validation Error      |
| 401         | Unauthorized / Invalid Token        |
| 403         | Forbidden / Insufficient Permission |
| 404         | Resource Not Found                  |
| 422         | Validation Error (Pydantic)         |
| 429         | Too Many Requests (Rate Limited)    |
| 500         | Internal Server Error               |
| 503         | Service Unavailable                 |

---

# Auth Service Endpoints

## POST /auth/register

* Authentication: Not Required
* Body:

```json
{
    "name": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
}
```

* Response 201:

```json
{
    "id": 1,
    "name": "string",
    "email": "string"
}
```

---

## POST /auth/login

* Authentication: Not Required

* Body:

```json
{
    "email": "string",
    "password": "string"
}
```

* Response 200:

```json
{
    "access_token": "string",
    "token_type": "bearer"
}
```

---

## GET /auth/me

* Authentication: Required

* Response 200:

```json
{
    "id": 1,
    "name": "string",
    "email": "string",
    "phone": "string",
    "is_admin": false
}
```

---

## GET /auth/verify

* Internal endpoint untuk komunikasi antar-service.

* Authentication: Required

* Response 200:

```json
{
    "user_id": 1,
    "email": "string",
    "name": "string",
    "role": "user"
}
```

---

## GET /auth/metrics

* Authentication: Not Required

* Response 200:

```json
{
    "total_requests": 100,
    "total_errors": 5,
    "error_rate": 5.0,
    "average_latency_ms": 25
}
```

---

# Report Service Endpoints

## GET /reports/health

* Health check Report Service.

* Response 200:

```json
{
    "status": "healthy",
    "database": "connected"
}
```

---

## GET /reports

* Authentication: Required

* Query Parameters:

  * `status` : Filter berdasarkan status laporan
  * `category` : Filter berdasarkan kategori
  * `page` : Nomor halaman
  * `limit` : Jumlah data per halaman

* Response 200:

```json
{
    "data": [
        {
            "id": 1,
            "title": "Lampu ruang kelas mati",
            "status": "diproses"
        }
    ]
}
```

---

## POST /reports

* Authentication: Required

* Body:

```json
{
    "category_id": 1,
    "title": "string",
    "description": "string",
    "incident_date": "YYYY-MM-DD",
    "is_anonymous": false,
    "latitude": -1.234,
    "longitude": 116.123
}
```

* Response 201:

```json
{
    "message": "Laporan berhasil dibuat"
}
```

---

## GET /reports/{report_id}

* Authentication: Required

* Response 200:

```json
{
    "id": 1,
    "title": "string",
    "description": "string",
    "status": "baru"
}
```

---

## POST /reports/{report_id}/comments

* Authentication: Required

* Body:

```json
{
    "content": "Komentar laporan"
}
```

* Response 201:

```json
{
    "message": "Komentar berhasil ditambahkan"
}
```

---

# Admin Endpoints

## PUT /admin/reports/{report_id}

* Authentication: Required (Admin)

* Body:

```json
{
    "status": "diproses",
    "priority": "high"
}
```

* Response 200:

```json
{
    "message": "Status laporan berhasil diperbarui"
}
```

---

## GET /admin/stats

* Authentication: Required (Admin)

* Response 200:

```json
{
    "total_reports": 100,
    "new_reports": 20,
    "resolved_reports": 70
}
```

---

# Supporting Data Endpoints

## GET /categories

* Authentication: Required

* Response:

```json
[
    {
        "id": 1,
        "name": "Kerusakan Fasilitas"
    }
]
```

---

## GET /units

* Authentication: Required

* Response:

```json
[
    {
        "id": 1,
        "name": "Unit Sarana dan Prasarana"
    }
]
```

---

## GET /notifications

* Authentication: Required

* Menampilkan daftar notifikasi milik pengguna.

---

## GET /feedback

* Authentication: Required

* Menampilkan data feedback laporan.
