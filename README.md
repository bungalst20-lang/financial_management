# Fintack - Pengelola Keuangan Pribadi

Aplikasi pelacak keuangan pribadi yang indah dan responsif dengan desain UI **Neobrutalism** berkonsep kontras tinggi dan taktil (terinspirasi dari Saweria.co).

## Teknologi

- **Backend**: Node.js, Express, Express Session
- **Database**: MySQL
- **Frontend**: HTML5, JavaScript, CSS3 (Sistem desain Neobrutalist)
- **Grafik/Charts**: Chart.js

---

## Prasyarat

Pastikan Anda sudah menginstal perangkat lunak berikut:

- [Node.js](https://nodejs.org/) (v16 atau versi lebih baru)
- [MySQL Server](https://www.mysql.com/)

---

## Persiapan & Konfigurasi

### 1. Konfigurasi Database

1. Jalankan MySQL server lokal Anda.
2. Buat database baru bernama `finance_app`:
   ```sql
   CREATE DATABASE finance_app;
   ```
3. Impor skema database dari file `database/finance.sql` ke database yang baru dibuat untuk membuat tabel `users`, `categories`, dan `transactions`:
   ```bash
   mysql -u root -p finance_app < database/finance.sql
   ```

### 2. Konfigurasi Environment Variables (File .env)

Buat file bernama `.env` di direktori utama (root) proyek dan isi dengan konfigurasi berikut:

```env
PORT=3000
SESSION_SECRET=fintack_session_secret_key_123!
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=finance_app
```

_Sesuaikan nilai `DB_USER` dan `DB_PASSWORD` dengan kredensial MySQL server Anda._

---

## Instalasi & Menjalankan Aplikasi

### 1. Instal Dependensi

Jalankan perintah ini di direktori utama proyek:

```bash
npm install
```

### 2. Jalankan Aplikasi

#### Mode Pengembangan (Auto-restart ketika ada perubahan kode):

```bash
npm run dev
```

#### Mode Produksi:

```bash
npm start
```

Setelah aplikasi berjalan, buka browser Anda dan kunjungi:
[http://localhost:3000](http://localhost:3000) (Anda akan dialihkan otomatis ke `/pages/login.html`)

---

## Fitur Utama

- **Autentikasi Pengguna**: Fitur daftar akun (Sign-up), masuk (Login), reset password, dan ubah password dengan aman.
- **Isolasi Data**: Setiap transaksi aman dan hanya dapat dilihat oleh pengguna yang sedang login berdasarkan session.
- **Pengelola Kategori**: Tambah, edit, dan hapus kategori keuangan global.
- **Pencatatan Transaksi**: Fitur CRUD transaksi pendapatan (income) dan pengeluaran (expense), lengkap dengan kategori, deskripsi, tanggal, serta fitur pencarian & penyaringan (filter).
- **Dashboard Analisis**: KPI ringkasan keuangan (Total Saldo, Total Pendapatan, Total Pengeluaran) serta grafik visual dinamis menggunakan Chart.js (breakdown pengeluaran berdasarkan kategori & grafik trend arus kas).
- **Tema Desain Neobrutalism**: Desain yang tegas dengan bayangan tebal solid, garis tepi hitam yang kuat, dan animasi klik tombol yang responsif.