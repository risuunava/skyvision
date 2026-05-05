# 🌦️ SkyVision – Weather Prediction & Monitoring System

SkyVision adalah sistem berbasis web terintegrasi untuk **monitoring dan prediksi cuaca** yang memanfaatkan data meteorologi serta analisis berbasis machine learning. Sistem ini dirancang untuk memberikan informasi cuaca yang akurat, real-time, dan mudah diakses sebagai *Early Warning System*.

---

## 🚀 Fitur Utama

* 🌍 Manajemen data kota (cities)
* 🌦️ Penyimpanan dan monitoring data cuaca (weather data) secara real-time
* 🤖 Prediksi cuaca 24 jam ke depan menggunakan model Machine Learning (LSTM & Prophet)
* 🔔 Notifikasi peringatan dini (early warning) berbasis kondisi cuaca
* ⚠️ Pengaturan ambang batas risiko (risk thresholds) kustom
* 📊 Dashboard monitoring interaktif dan dinamis

---

## 🛠️ Tech Stack

**Backend (REST API):**
* Laravel 12
* PostgreSQL (Supabase)

**Frontend (Dashboard):**
* Next.js 16 (React)
* Tailwind CSS & Shadcn UI

**Machine Learning Service:**
* Python (FastAPI)
* TensorFlow / Keras (LSTM Model)
* Prophet (Time Series Forecasting)

---

## ⚙️ Instalasi & Menjalankan Aplikasi

Sistem ini memiliki arsitektur *microservices* dan terdiri dari 3 layanan utama yang harus dijalankan: Backend, Frontend, dan ML Service.

### 1. Clone Repository
```bash
git clone https://github.com/username/skyvision.git
cd skyvision
```

### 2. Setup Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
Konfigurasi koneksi database (Supabase) di file `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=your-supabase-host
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=your-username
DB_PASSWORD=your-password
```
Jalankan migrasi database dan server backend:
```bash
php artisan migrate
php artisan serve
```
*(Buka tab terminal baru untuk langkah selanjutnya)*

### 3. Setup Machine Learning Service (Python FastAPI)
```bash
cd ../ml-service
python -m venv venv

# Aktivasi virtual environment (Windows):
venv\Scripts\activate
# Aktivasi virtual environment (Mac/Linux):
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```
*(Buka tab terminal baru untuk langkah selanjutnya)*

### 4. Setup Frontend (Next.js)
```bash
cd ../frontend
npm install
npm run dev
```

Aplikasi Dashboard SkyVision sekarang dapat diakses melalui browser di `http://localhost:3000`.

---

## 📁 Struktur Database (Ringkas)

* `cities` → Data lokasi/kota yang dimonitor
* `weather_data` → Riwayat data cuaca aktual 
* `predictions` → Hasil prediksi cuaca dari model Machine Learning
* `subscriptions` → Langganan notifikasi pengguna
* `risk_thresholds` → Konfigurasi ambang batas penentuan risiko cuaca (extreme/high)
* `notifications` → Riwayat notifikasi sistem peringatan dini

---

## ⚠️ Sumber Data

Saat ini, aplikasi SkyVision mengambil data cuaca secara real-time menggunakan **Open-Meteo API** untuk menjamin stabilitas *endpoint* publik, meskipun arsitekturnya (seperti pada kelas `BMKGService`) sudah didesain agar kompatibel dengan data Badan Meteorologi, Klimatologi, dan Geofisika (BMKG).

➡️ **Atribusi / Attribution Wajib:**
* **Open-Meteo API** sebagai sumber penyedia data cuaca aktual dan historis.
* Apabila di kemudian hari menggunakan kembali API publik BMKG, maka wajib mencantumkan **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)** pada dashboard / aplikasi sebagai sumber data resmi.

---

## 📌 Catatan Pengembangan

* Pastikan **Scheduler** Laravel (`php artisan schedule:work`) berjalan di background agar tugas pengambilan data cuaca rutin dan eksekusi otomatis model ML (cron job) dapat berjalan sesuai interval yang ditentukan (1 jam / 6 jam).
* Gunakan perintah `php artisan migrate:fresh` dengan sangat hati-hati (hanya saat proses *development*), karena akan menghapus seluruh data pada tabel.
* Gunakan standar penulisan *commit* (Conventional Commits) jika ingin berkontribusi.

---

## 🤝 Kontribusi

*Pull request* sangat dipersilakan. Untuk perubahan skala besar atau penambahan fitur yang signifikan, silakan buka *Issues* dan diskusikan terlebih dahulu dengan *author*.

---

## 📄 Lisensi

Project ini dibuat dan digunakan untuk keperluan:

* Skripsi / Tugas Akhir
* Pembelajaran dan Riset Akademik
* Pengembangan purwarupa Sistem Informasi & *Early Warning System* Cuaca

---

## 👨‍💻 Author

**Muhammad Lazuardi Al-Farisi**  
Informatika – Universitas Sebelas April

---
