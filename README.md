# LabOps (Laboratory Operations) — Halaman Denah & Status PC Live

Implementasi antarmuka frontend untuk halaman utama **Denah & Status PC Live (`/dashboard` — Area Mahasiswa)** dari proyek **LabOps**. Aplikasi ini membantu mahasiswa memeriksa ketersediaan puluhan komputer laboratorium secara cepat, melakukan booking unit, serta melaporkan kerusakan perangkat secara sistematis.

## Fitur Utama
- **Navigasi Responsif (App Shell):** Sidebar kiri yang dapat di-*collapse* di Desktop, *drawer* di Tablet, dan *Bottom Navigation Bar* di Mobile.
- **Penghitung Status Real-Time:** Menampilkan jumlah total PC, Tersedia, Dipakai, dan Rusak yang diperbarui otomatis sesuai filter dan aksi pengguna.
- **Filter & Pencarian Live:** Menyaring 30 unit PC berdasarkan kode PC/software, ruang laboratorium, dan status ketersediaan.
- **Drawer Detail PC:** Panel geser (*slide-over* di Desktop, *bottom sheet* di Mobile) berisi spesifikasi perangkat, daftar software, dan tombol aksi cepat.
- **Form Booking & Lapor Kerusakan dengan Validasi:** Validasi input NIM, slot waktu, serta deskripsi kendala yang langsung memperbarui status PC pada denah.

## Struktur Proyek
```text
.
├── index.html   # Struktur HTML semantik untuk 5+ komponen utama
├── styles.css   # Styling responsif dengan CSS Custom Properties (8pt spacing & warna)
├── script.js    # Logika interaktif (filter, counter, drawer, modal, validasi form)
└── README.md    # Dokumentasi proyek
