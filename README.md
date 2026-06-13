# SMA NEGERI 1 - Aplikasi Sekolah (Prototipe)

Proyek ini adalah prototipe aplikasi website sekolah sederhana: backend Express + SQLite dan frontend statis (Tailwind + vanilla JS). Aplikasi sudah menyertakan otentikasi dasar (JWT), API untuk pengumuman dan data siswa, serta perlindungan dasar (helmet, rate-limit, input validation).

Quickstart lokal:

1. Install dependency:

```bash
cd /workspaces/aplikasi
npm install
```

2. Jalankan server (mode development):

```bash
npm run dev
```

3. Buka browser ke: http://localhost:3000

Admin default:
- Username: `admin`
- Password: `admin123`

Catatan keamanan dan langkah selanjutnya:
- Ganti `JWT_SECRET` di `.env` untuk produksi.
- Tambahkan HTTPS (reverse proxy) dan CSRF jika perlu.
- Kembangkan fitur (jadwal, nilai, absensi, profil guru) sesuai kebutuhan sekolah.

Folder utama:
- `server/` - backend
- `public/` - frontend statis

Jika Anda mau, saya bisa:
- Menambahkan modul administrasi lebih lengkap (guru, kelas, jadwal).
- Membuat frontend React/Vite untuk UX lebih modern.
- Menambahkan migrasi dan testing otomatis.
