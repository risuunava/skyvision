# 🌦️ SkyVision – Weather Prediction & Monitoring System

SkyVision adalah sistem berbasis web untuk **monitoring dan prediksi cuaca** yang memanfaatkan data meteorologi serta analisis berbasis machine learning. Sistem ini dirancang untuk memberikan informasi cuaca yang akurat, real-time, dan mudah diakses.

---

## 🚀 Fitur Utama

* 🌍 Manajemen data kota (cities)
* 🌦️ Penyimpanan dan monitoring data cuaca (weather data)
* 🤖 Prediksi cuaca berbasis machine learning
* 🔔 Notifikasi berbasis kondisi cuaca tertentu
* ⚠️ Pengaturan ambang risiko (risk thresholds)
* 📊 API backend untuk integrasi frontend (Next.js / lainnya)

---

## 🛠️ Tech Stack

**Backend:**

* Laravel 12
* PostgreSQL (Supabase)

**Frontend (opsional):**

* Next.js

**Machine Learning Service**

* Python (Flask / FastAPI)

---

## ⚙️ Instalasi

### 1. Clone repository

```bash
git clone https://github.com/username/skyvision.git
cd skyvision/backend
```

### 2. Install dependency

```bash
composer install
```

### 3. Setup environment

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Konfigurasi database (Supabase)

Sesuaikan `.env`:

```
DB_CONNECTION=pgsql
DB_HOST=your-supabase-host
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

### 5. Migrasi database

```bash
php artisan migrate
```

### 6. Jalankan server

```bash
php artisan serve
```

---

## 📁 Struktur Database (Ringkas)

* `cities` → data kota
* `weather_data` → data cuaca
* `predictions` → hasil prediksi ML
* `subscriptions` → langganan notifikasi user
* `risk_thresholds` → ambang batas risiko
* `notifications` → notifikasi sistem

---

## 🔗 API Endpoint (Contoh)

| Method | Endpoint     | Deskripsi        |
| ------ | ------------ | ---------------- |
| GET    | /api/weather | Ambil data cuaca |
| POST   | /api/predict | Prediksi cuaca   |
| GET    | /api/cities  | List kota        |

---

## ⚠️ Perhatian (WAJIB)

Aplikasi ini menggunakan data dari:

**Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)**

➡️ **Wajib mencantumkan BMKG sebagai sumber data** pada:

* Tampilan aplikasi (UI)
* Dashboard
* Halaman informasi / footer

Contoh atribusi:

```
Sumber data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
```

---

## 📌 Catatan Pengembangan

* Pastikan urutan migration benar (relasi foreign key)
* Gunakan `php artisan migrate:fresh` saat development
* Gunakan standar commit (Conventional Commits)

---

## 🤝 Kontribusi

Pull request dipersilakan. Untuk perubahan besar, silakan diskusikan terlebih dahulu.

---

## 📄 Lisensi

Project ini digunakan untuk keperluan:

* Skripsi
* Pembelajaran
* Pengembangan sistem informasi cuaca

---

## 👨‍💻 Author

Muhammad Lazuardi Al-Farisi
Informatika – Universitas Sebelas April

---
