# BUKU PANDUAN PENGGUNA (MANUAL BOOK) APLIKASI P2H MP — PT BATARA DHARMA PERSADA SITE MUARA PAHU

```text
  ____ ___  _____  _   _     __  __ ____  
 |  _ \_ _|| ____|| | | |   |  \/  |  _ \ 
 | |_) | | |  _|  | |_| |   | |\/| | |_) |
 |  __/| | | |___ |  _  |   | |  | |  __/ 
 |_|  |___||_____||_| |_|___|_|  |_|_|    
                       |_____|            
 PLANT MAINTENANCE & OPERATIONS SYSTEM
 Versi Dokumen: 2.0 (Agustus 2026)
```

---

## DAFTAR ISI

1. [BAB 1: PENDAHULUAN & GAMBARAN UMUM](#bab-1-pendahuluan--gambaran-umum)
   - [1.1 Latar Belakang & Tujuan](#11-latar-belakang--tujuan)
   - [1.2 Hirarki Hak Akses (Role)](#12-hirarki-hak-akses-role)
   - [1.3 Departemen & Klasifikasi Posisi](#13-departemen--klasifikasi-posisi)
2. [BAB 2: AKSES APLIKASI & TAMPILAN MOBILE](#bab-2-akses-aplikasi--tampilan-mobile)
   - [2.1 Akses via Web Browser](#21-akses-via-web-browser)
   - [2.2 Pemasangan ke Layar Utama iOS (Add to Home Screen - P2H MP)](#22-pemasangan-ke-layar-utama-ios-add-to-home-screen---p2h-mp)
   - [2.3 Pemasangan ke Layar Utama Android (PWA)](#23-pemasangan-ke-layar-utama-android-pwa)
   - [2.4 Login ke Portal Akun](#24-login-ke-portal-akun)
3. [BAB 3: PANDUAN OPERATOR — PENGISIAN FORM P2H](#bab-3-panduan-operator--pengisian-form-p2h)
   - [3.1 Membuka Form Pemeriksaan P2H](#31-membuka-form-pemeriksaan-p2h)
   - [3.2 Pemilihan Shift & Kategori Kendaraan](#32-pemilihan-shift--kategori-kendaraan)
   - [3.3 Pemilihan Unit & Validasi Odometer (KM / HM)](#33-pemilihan-unit--validasi-odometer-km--hm)
   - [3.4 Pengisian Checklist Komponen Kelaikan](#34-pengisian-checklist-komponen-kelaikan)
   - [3.5 Pelaporan Kerusakan (Defect) & Catatan Tambahan](#35-pelaporan-kerusakan-defect--catatan-tambahan)
   - [3.6 Konfirmasi & Pengiriman Form (Auto-Approved)](#36-konfirmasi--pengiriman-form-auto-approved)
4. [BAB 4: PANDUAN KELOLA MASTER UNIT FLEET](#bab-4-panduan-kelola-master-unit-fleet)
   - [4.1 Melihat & Memfilter Data Unit](#41-melihat--memfilter-data-unit)
   - [4.2 Menambah Single Unit Baru](#42-menambah-single-unit-baru)
   - [4.3 Mengedit & Menghapus Data Unit](#43-mengedit--menghapus-data-unit)
   - [4.4 Fitur Impor Massal Unit (Bulk Upload CSV)](#44-fitur-impor-massal-unit-bulk-upload-csv)
   - [4.5 Export Data Unit ke File Excel (.XLSX)](#45-export-data-unit-ke-file-excel-xlsx)
5. [BAB 5: PANDUAN MONITORING & RIWAYAT P2H](#bab-5-panduan-monitoring--riwayat-p2h)
   - [5.1 Monitoring Realtime Kelaikan Unit](#51-monitoring-realtime-kelaikan-unit)
   - [5.2 Filter Kategori, Status Kelaikan, Shift, & Rentang Tanggal](#52-filter-kategori-status-kelaikan-shift--rentang-tanggal)
   - [5.3 Export Riwayat P2H ke Excel Berlogo Resmi (.XLSX)](#53-export-riwayat-p2h-ke-excel-berlogo-resmi-xlsx)
   - [5.4 Download & Cetak Dokumen PDF P2H (Standar A4)](#54-download--cetak-dokumen-pdf-p2h-standar-a4)
6. [BAB 6: PANDUAN DEFECT & BREAKDOWN TRACKING](#bab-6-panduan-defect--breakdown-tracking)
   - [6.1 Monitoring Temuan Kerusakan Unit](#61-monitoring-temuan-kerusakan-unit)
   - [6.2 Mengubah Status Perbaikan (Open, In Progress, Resolved)](#62-mengubah-status-perbaikan-open-in-progress-resolved)
7. [BAB 7: PANDUAN MANAJEMEN PENGGUNA](#bab-7-panduan-manajemen-pengguna)
   - [7.1 Mendaftarkan Pengguna Baru](#71-mendaftarkan-pengguna-baru)
   - [7.2 Mengedit Pengguna & Reset Password Default](#72-mengedit-pengguna--reset-password-default)
   - [7.3 Impor Massal Data Pengguna (Bulk Upload CSV)](#73-impor-massal-data-pengguna-bulk-upload-csv)
   - [7.4 Upload & Hapus Foto Profil Avatar (Cloudinary Integration)](#74-upload--hapus-foto-profil-avatar-cloudinary-integration)
8. [BAB 8: PENGATURAN AKUN & SISTEM](#bab-8-pengaturan-akun--sistem)
   - [8.1 Pengaturan Profil Pribadi & Foto Avatar](#81-pengaturan-profil-pribadi--foto-avatar)
   - [8.2 Penggantian Kata Sandi Akun Pribadi](#82-penggantian-kata-sandi-akun-pribadi)
   - [8.3 Parameter Operasional P2H & Diagnostik Sistem](#83-parameter-operasional-p2h--diagnostik-sistem)
9. [BAB 9: PANDUAN FORMAT BULK IMPORT (.CSV)](#bab-9-panduan-format-bulk-import-csv)
   - [9.1 Format CSV Impor Pengguna (Users)](#91-format-csv-impor-pengguna-users)
   - [9.2 Format CSV Impor Master Unit (Units)](#92-format-csv-impor-master-unit-units)
10. [BAB 10: TROUBLESHOOTING & FREQUENTLY ASKED QUESTIONS (FAQ)](#bab-10-troubleshooting--frequently-asked-questions-faq)

---

## BAB 1: PENDAHULUAN & GAMBARAN UMUM

### 1.1 Latar Belakang & Tujuan

Aplikasi **P2H MP** adalah sistem digitalisasi Pelaksanaan Pemeriksaan Harian (P2H) kendaraan support dan alat berat tambang pada lingkungan kerja **PT Batara Dharma Persada (Site Muara Pahu)**.

Tujuan utama sistem ini meliputi:

1. **Memastikan Keselamatan Operasional (K3/HSE)**: Memastikan setiap kendaraan dan alat berat yang beroperasi dalam kondisi layak jalan (*Ready for Operation*).
2. **Efisiensi Plant Maintenance**: Mengidentifikasi kerusakan (*defect*) secara dini sebelum terjadi breakdown parah.
3. **Paperless & Akurasi Data**: Menghilangkan formulir kertas fisik dengan sistem pencatatan digital berbasis Cloud Database yang dilengkapi log histori odometer (KM) dan hour meter (HM).

### 1.2 Hirarki Hak Akses (Role)

Sistem memiliki 3 tingkatan hak akses:

| Role | Deskripsi Hak Akses |
| :--- | :--- |
| **SUPERADMIN** | Hak akses tertinggi: Mengelola seluruh master data, reset password semua user, konfigurasi sistem, dan manajemen akun admin. |
| **ADMIN** | Hak akses operasional (Plant / Operations): Menambah/mengedit armada unit, memverifikasi laporan P2H, mengelola perbaikan defect, dan mengelola user level USER. |
| **USER** | Hak akses operator / driver lapangan: Melakukan pengisian checklist formulir P2H dan melihat profil akun pribadi. |

### 1.3 Departemen & Klasifikasi Posisi

- **Departemen Terdaftar:**
  - `OPERATIONS` (Produksi & Operasional Tambang)
  - `PLANT` (Plant Maintenance & Workshop)
  - `LOGISTIC` (Logistik & Supply Chain)
  - `HSE` (Health, Safety, & Environment / K3)
  - `HRGA` (Human Resource & General Affair)
  - `PRODUCTION_AND_ENGINEERING` (Engineering & Perencanaan Tambang)

- **Posisi / Jabatan Terdaftar:**
  - `OPERATOR` (Operator Alat Berat)
  - `DRIVER` (Pengemudi Sarana / Kendaraan Support)
  - `MECHANIC` (Mekanik / Fitter Workshop)
  - `ELECTRICIAN` (Teknisi Listrik Alat Berat)
  - `TYREMAN` (Spesialis Tyre / Ban Armada)
  - `ADMIN` (Staff Administrasi Operasional)
  - `SITE_SUPERVISOR` (Pengawas Lapangan / Supervisor)
  - `SITE_SUPERINTENDENT` (Superintendent Operasional)
  - `SITE_MANAGER` (Project Manager / Site Manager)

---

## BAB 2: AKSES APLIKASI & TAMPILAN MOBILE

### 2.1 Akses via Web Browser

Aplikasi dapat diakses melalui browser modern (Google Chrome, Safari, Microsoft Edge, Mozilla Firefox) melalui alamat URL berikut:

- **Halaman Depan / Landing Page**: `http://localhost:3000` (atau URL domain production)
- **Formulir Cepat P2H Lapangan**: `http://localhost:3000/p2h`
- **Login Dashboard Manajemen**: `http://localhost:3000/login`

### 2.2 Pemasangan ke Layar Utama iOS (Add to Home Screen - P2H MP)

Untuk kemudahan akses operator pengguna iPhone / iPad di lapangan:

1. Buka browser **Safari** pada perangkat iPhone/iPad Anda.
2. Kunjungi alamat URL aplikasi P2H.
3. Ketuk tombol **Share** (ikon persegi dengan tanda panah ke atas di bagian bawah layar Safari).
4. Gulir ke bawah dan pilih menu **"Add to Home Screen"** (*Tambah ke Layar Utama*).
5. Nama aplikasi akan otomatis terisi **`P2H MP`** lengkap dengan logo resmi PT Batara Dharma Persada.
6. Ketuk **Add** di pojok kanan atas.
7. Ikon **P2H MP** akan muncul di layar utama iPhone Anda dan dapat dibuka dalam mode *Full Screen* (tanpa address bar).

### 2.3 Pemasangan ke Layar Utama Android (PWA)

1. Buka browser **Google Chrome** di ponsel Android Anda.
2. Buka alamat URL aplikasi P2H.
3. Ketuk ikon titik tiga (menu) di kanan atas browser Chrome.
4. Pilih **"Install app"** atau **"Tambahkan ke Layar Utama"**.
5. Konfirmasi instalasi, ikon **P2H MP** akan langsung terpasang di menu aplikasi HP Anda.

### 2.4 Login ke Portal Akun

1. Buka halaman `/login`.
2. Masukkan **NRP (Nomor Registrasi Pokok)** Anda (contoh: `8021001`).
3. Masukkan **Kata Sandi / Password** Anda.
4. Klik tombol **"Masuk ke Portal"**.
5. Jika role Anda **ADMIN** atau **SUPERADMIN**, Anda akan diarahkan ke Dashboard Manajemen (`/dashboard`). Jika role Anda **USER**, Anda dapat langsung melakukan pengisian form P2H.

---

## BAB 3: PANDUAN OPERATOR — PENGISIAN FORM P2H

Formulir P2H wajib diisi oleh **Driver atau Operator** sebelum mulai mengoperasikan kendaraan/unit pada setiap awal shift kerja.

```text
[ Buka /p2h ] -> [ Pilih Shift & Kategori ] -> [ Pilih Unit No ] 
              -> [ Input Odometer KM/HM ] -> [ Ceklis Komponen ] 
              -> [ Lapor Defect (jika ada) ] -> [ Submit (Auto-Approved) ]
```

### 3.1 Membuka Form Pemeriksaan P2H

1. Buka aplikasi dan klik menu **"Mulai P2H"** atau akses URL `/p2h`.
2. Halaman akan menampilkan instruksi ringkas serta pilihan kategori kendaraan support dan alat berat.

### 3.2 Pemilihan Shift & Kategori Kendaraan

1. **Pilih Shift Kerja**:
   - `SHIFT_1` (Shift Siang: 06:00 - 18:00)
   - `SHIFT_2` (Shift Malam: 18:00 - 06:00)
2. **Pilih Kategori Unit**:
   - Light Vehicle (LV)
   - Dump Truck (DT)
   - Telehandler (TH)
   - Storing Truck (ST)
   - Fuel Truck (FT)
   - Genset (GS)
   - Compressor (CP)
   - Excavator (EX)
   - Dozer (DZ)
   - Compactor (CMP)
   - Crane Truck (CT)
   - Mobile Crane (MC)
   - Ambulance (AMB)

### 3.3 Pemilihan Unit & Validasi Odometer (KM / HM)

1. **Pilih Nomor Lambung Unit** dari daftar dropdown. Sistem akan memuat data merk (*brand*) dan model unit secara otomatis.
2. **Input Odometer / Hour Meter Terkini**:
   - Untuk Kendaraan Support (LV, Truck, Ambulance): Isi kolom **Kilometer (KM)**.
   - Untuk Alat Berat (Excavator, Dozer, Genset, Crane): Isi kolom **Hour Meter (HM)**.
   > **Catatan Validasi Kritis**: Sistem dilengkapi proteksi anti-rollback. Nilai KM/HM yang diinput **tidak boleh lebih rendah** dari nilai KM/HM terakhir yang tercatat di database unit.

### 3.4 Pengisian Checklist Komponen Kelaikan

Periksa kondisi fisik unit di lapangan dan berikan status checklist pada masing-masing item:

- **Baik / Normal (Centang Hijau)**: Komponen berfungsi sempurna dan aman.
- **Rusak / Abnormal (Silang Merah)**: Komponen mengalami kerusakan, aus, bocor, atau tidak berfungsi.

Komponen yang diperiksa meliputi:

- **Sistem Tenaga & Mesin**: Level oli mesin, air radiator, kebocoran fluida, kondisi belt/fan.
- **Sistem Kemudi & Pengereman**: Minyak rem, fungsi rem kaki, rem tangan (*parking brake*), power steering.
- **Kelistrikan & Penerangan**: Lampu utama (*high/low*), lampu rotary/strobe, lampu mundur & alarm mundur, klakson, wiper.
- **Sistem Safety & K3**: Safety belt, Alat Pemadam Api Ringan (APAR), Kotak P3K, Segitiga Pengaman, Jack & Kunci Roda.
- **Kondisi Roda / Track**: Tekanan angin ban, keausan tapak ban, baut roda (*wheel nut*), atau ketegangan track alat berat.

### 3.5 Pelaporan Kerusakan (Defect) & Catatan Tambahan

Jika terdapat salah satu item checklist yang rusak atau tidak layak:

1. Kolom catatan kerusakan akan muncul otomatis.
2. Tuliskan deskripsi kerusakan secara rinci (misal: *"Lampu rotary mati, klakson berbunyi pelan, APAR pin pengunci lepas"*).
3. Tentukan status kelaikan akhir unit:
   - **LAYAK (SIAP OPERASI)**: Kerusakan bersifat minor dan tidak membahayakan keselamatan.
   - **TIDAK LAYAK (BREAKDOWN / STOP OPERASI)**: Kerusakan pada komponen kritis (rem, kemudi, oli bocor deras, ban sobek) yang membahayakan nyawa.

### 3.6 Konfirmasi & Pengiriman Form (Auto-Approved)

1. Pastikan nama pengemudi/operator dan NRP telah sesuai.
2. Klik tombol **"Kirim Formulir P2H"**.
3. Sistem akan menyimpan hasil inspeksi ke database pusat secara realtime dan memberi tanda cap verifikasi **APPROVED** resmi Site Muara Pahu.

---

## BAB 4: PANDUAN KELOLA MASTER UNIT FLEET

Menu ini digunakan oleh tim Plant Maintenance dan Admin Operasional untuk mengelola seluruh data aset armada unit.

### 4.1 Melihat & Memfilter Data Unit

1. Buka menu **Kelola Unit Fleet** (`/dashboard/units`).
2. Terdapat ringkasan statistik KPI di bagian atas:
   - **Total Unit Terdaftar**
   - **Unit Ready / Active**
   - **Unit Breakdown / Inactive**
3. Anda dapat memfilter tabel berdasarkan:
   - Pencarian kata kunci (*No. Lambung, Merk, Model, Pemilik*).
   - Filter Kategori Unit.
   - Filter Status (*Active* atau *Inactive*).

### 4.2 Menambah Single Unit Baru

1. Klik tombol **"+ Tambah Unit Baru"**.
2. Isi kolom form:
   - **Nomor Lambung** (Wajib, unik, contoh: `LV-01`, `EX-201`).
   - **Kategori Unit** (Pilih dari 12 kategori standar).
   - **Merk / Brand** (Contoh: `Toyota`, `Komatsu`, `Caterpillar`, `Hino`).
   - **Deskripsi / Tipe** (Contoh: `Hilux Double Cabin 4x4 2.4G`).
   - **Nama Pemilik** (Default: `PT Batara Dharma Persada`).
   - **KM Awal** dan **HM Awal**.
   - **Status Unit** (`ACTIVE` atau `INACTIVE`).
3. Klik **"Simpan Unit"**.

### 4.3 Mengedit & Menghapus Data Unit

- **Edit**: Klik ikon pensil kuning pada baris tabel unit ➔ Ubah informasi ➔ Klik **"Perbarui Data"**.
- **Hapus**: Klik ikon tong sampah merah pada baris tabel unit ➔ Konfirmasi dialog penghapusan.

### 4.4 Fitur Impor Massal Unit (Bulk Upload CSV)

Fitur ini memungkinkan Admin mendaftarkan puluhan hingga ratusan unit sekaligus hanya dalam hitungan detik.

```text
[ Klik Impor Bulk Unit ] 
       │
       ▼
[ STEP 1: Unduh Template / Unggah File CSV / Salin Teks ]
       │
       ▼
[ STEP 2: Pratinjau & Validasi Data Otomatis ]
       │
       ▼
[ STEP 3: Laporan Hasil Eksekusi (Total, Sukses, Gagal) ]
```

1. Klik tombol **"Impor Bulk Unit"** di pojok kanan atas.
2. **Step 1 (Input)**:
   - Klik **"Unduh File Template (.csv)"** untuk mengunduh format standar Microsoft Excel.
   - Isi file template tersebut dengan data armada Anda.
   - Unggah file CSV via kotak Drag & Drop **atau** pilih tab *Salin / Tempel Teks CSV*.
   - Klik **"Validasi & Lanjut ke Pratinjau Data"**.
3. **Step 2 (Pratinjau)**:
   - Sistem memeriksa kelengkapan data, duplikasi nomor lambung, dan menampilkan tabel pratinjau.
   - Jika terdapat baris yang tidak valid, rincian pesan kesalahan akan ditampilkan.
   - Klik **"Mulai Impor"**.
4. **Step 3 (Laporan Hasil)**:
   - Menampilkan ringkasan metrik keberhasilan eksekusi.
   - Klik **"Selesai & Tutup"** untuk memperbarui data unit di dashboard.

### 4.5 Export Data Unit ke File Excel (.XLSX)

1. Klik tombol **"Download Excel"** pada halaman master unit.
2. Sistem otomatis mengenerate file Excel berformat `.xlsx` profesional dengan fitur:
   - Banner Header Perusahaan: **PT BATARA DHARMA PERSADA (SITE MUARA PAHU)**.
   - Logo resmi perusahaan tersemat di sudut kiri atas.
   - Kotak ringkasan metrik (*Total Armada, Active, Inactive*).
   - Baris tabel belang-belang (*zebra striping*) dan *auto-fit column width*.
   - Badge warna status dan *freeze pane header*.

---

## BAB 5: PANDUAN MONITORING & RIWAYAT P2H

Halaman ini berfungsi sebagai pusat kendali (*control tower*) pemantauan laporan keselamatan armada seluruh site.

### 5.1 Monitoring Realtime Kelaikan Unit

Setiap kali operator menyelesaikan formulir P2H di lapangan, laporan akan masuk seketika ke tabel riwayat dengan badge status kelaikan:

- **SIAP OPERASI (Hijau)**: Unit dalam kondisi prima dan diizinkan bekerja.
- **TIDAK LAYAK (Merah)**: Unit mengalami kerusakan fatal dan unit harus distop untuk perbaikan workshop.

### 5.2 Filter Kategori, Status Kelaikan, Shift, & Rentang Tanggal

Tersedia bilah filter komprehensif di bagian atas tabel:

1. **Filter Tanggal (Date Range)**:
   - Masukkan input **Dari Tanggal** s/d **Sampai Tanggal**.
   - Atau gunakan tombol *Quick Preset*: **"Hari Ini"**, **"7 Hari Terakhir"**, **"Bulan Ini"**, atau **"Semua Tanggal"**.
2. **Filter Kategori Unit**: Menampilkan laporan khusus LV, Heavy Equipment, Truck, dsb.
3. **Filter Shift Kerja**: Memisahkan pemeriksaan Shift Siang vs Shift Malam.
4. **Filter Status Kelaikan**: Memfilter hanya unit yang Siap Operasi atau Tidak Layak.
5. **Pencarian Bebas**: Mencari berdasarkan No Lambung, Nama Driver, atau NRP.

### 5.3 Export Riwayat P2H ke Excel Berlogo Resmi (.XLSX)

1. Terapkan filter tanggal atau kategori sesuai kebutuhan laporan bulanan/mingguan Anda.
2. Klik tombol **"Download Excel"**.
3. File Excel `.xlsx` yang diunduh mencakup seluruh detail pemeriksaan, odometer KM/HM, rincian defect, serta nama driver dan waktu inspeksi lengkap dengan kop surat **Site Muara Pahu** dan logo resmi.

### 5.4 Download & Cetak Dokumen PDF P2H (Standar A4)

Setiap lembar formulir P2H dapat dicetak sebagai bukti audit K3 dan arsip fisik:

1. Klik ikon dokumen / PDF pada kolom **Aksi** di baris laporan P2H yang ingin dicetak.
2. Jendela cetak dokumen standar A4 akan terbuka menampilkan format formulir inspeksi resmi lengkap dengan:
   - Kop PT Batara Dharma Persada (Site Muara Pahu).
   - Tabel checklist seluruh komponen unit.
   - Catatan kerusakan & tindakan perbaikan.
   - Kolom tanda tangan digital / verifikasi bertanda cap **APPROVED**.
3. Pilih printer tujuan atau simpan sebagai file PDF (*Save as PDF*).

---

## BAB 6: PANDUAN DEFECT & BREAKDOWN TRACKING

Menu ini mengumpulkan seluruh rekaman kerusakan unit yang dilaporkan oleh operator untuk ditindaklanjuti oleh mekanik Plant.

### 6.1 Monitoring Temuan Kerusakan Unit

- Menampilkan daftar nomor lambung unit yang mengalami masalah.
- Menampilkan rincian komponen yang rusak serta catatan keluhan dari driver.
- Tingkat urgensi kerusakan (*Severity Level*):
  - **Minor**: Lampu mati, wiper aus, bodi lecet (Unit masih dapat beroperasi).
  - **Major**: AC mati, klakson mati, oli rem merembes sedikit.
  - **Critical**: Rem blong, kemudi macet, mesin overheating, ban sobek (Unit wajib STOP operasi).

### 6.2 Mengubah Status Perbaikan (Open, In Progress, Resolved)

Admin Plant Maintenance dapat memperbarui status penanganan defect:

1. `OPEN`: Laporan baru masuk dan menunggu alokasi mekanik.
2. `IN_PROGRESS`: Unit sedang dalam pengerjaan perbaikan di Workshop / Pit Stop.
3. `RESOLVED`: Kerusakan telah selesai diperbaiki, lolos uji coba, dan unit kembali berstatus *Ready for Operation*.

---

## BAB 7: PANDUAN MANAJEMEN PENGGUNA

Halaman ini digunakan oleh Admin & Superadmin untuk mengelola data karyawan dan akun pengguna.

### 7.1 Mendaftarkan Pengguna Baru

1. Klik tombol **"+ Tambah Pengguna Baru"**.
2. Isi formulir:
   - **Nama Depan & Belakang** (Wajib).
   - **NRP** (Nomor Registrasi Pokok unik karyawan, wajib angka).
   - **Kata Sandi** (Opsional, default otomatis: `Batara@123`).
   - **Departemen & Posisi Kerja**.
   - **Hak Akses (Role)**: `USER`, `ADMIN`, atau `SUPERADMIN`.
   - **No. Handphone / WhatsApp** dan **Alamat Email**.
3. Klik **"Daftarkan Pengguna"**.

### 7.2 Mengedit Pengguna & Reset Password Default

- **Edit Pengguna**: Klik ikon edit biru ➔ Ubah data diri, departemen, atau role ➔ Klik Simpan.
- **Reset Password**: Klik ikon kunci kuning ➔ Klik tombol **"Reset Password ke Default"**. Kata sandi akun user tersebut akan seketika direset kembali menjadi **`Batara@123`**.

### 7.3 Impor Massal Data Pengguna (Bulk Upload CSV)

1. Klik tombol **"Impor Bulk User"**.
2. Unduh template CSV ➔ Isi data personel ➔ Unggah file CSV atau Salin teks CSV.
3. Sistem akan memvalidasi data dan menampilkan pratinjau tabel pengguna.
4. Klik **"Mulai Impor"** untuk menyimpan seluruh akun karyawan sekaligus.

### 7.4 Upload & Hapus Foto Profil Avatar (Cloudinary Integration)

Sistem P2H terintegrasi langsung dengan Cloudinary CDN untuk penyimpanan foto profil:

1. Klik tombol edit pada pengguna yang ingin diganti fotonya.
2. Pada kartu **Foto Profil Avatar (Cloudinary)**, klik tombol **"Unggah Foto Baru"** atau ketuk ikon kamera.
3. Pilih foto dari komputer/HP Anda (format JPG, PNG, WEBP, maks 5MB).
4. Sistem otomatis mengunggah foto ke folder Cloudinary `p2h-app/user-avatar` dengan pemotongan otomatis (*auto-crop 400x400*) berfokus pada wajah.
5. Foto lama pada Cloudinary akan otomatis dihapus untuk menghemat ruang penyimpanan.

---

## BAB 8: PENGATURAN AKUN & SISTEM

### 8.1 Pengaturan Profil Pribadi & Foto Avatar

1. Buka menu **Pengaturan Sistem** (`/dashboard/settings`).
2. Pada Tab **Profil Akun & Keamanan**:
   - Arahkan kursor ke foto profil avatar Anda di kartu sebelah kiri ➔ Klik **"Ganti Foto"** untuk mengunggah foto baru.
   - Atau klik ikon tong sampah untuk menghapus foto avatar dan kembali menggunakan inisial nama.
   - Perbarui nama depan, nama belakang, nomor handphone, dan email pada form sebelah kanan ➔ Klik **"Simpan Profil"**.
   - Foto avatar pada Sidebar akan seketika terupdate realtime tanpa perlu refresh halaman.

### 8.2 Penggantian Kata Sandi Akun Pribadi

1. Masuk ke Tab **Profil Akun & Keamanan** ➔ Gulir ke bagian **Ganti Kata Sandi Akun**.
2. Masukkan **Kata Sandi Baru** (minimal 6 karakter).
3. Masukkan **Konfirmasi Kata Sandi Baru**.
4. Klik **"Perbarui Kata Sandi"**.

### 8.3 Parameter Operasional P2H & Diagnostik Sistem

- **Tab Parameter Operasional**: Mengatur jam pergantian shift kerja, batas toleransi odometer, dan kebijakan pelaporan K3.
- **Tab Info Perusahaan**: Mengatur nama entitas perusahaan (*PT Batara Dharma Persada*), Site Operasional (*Site Muara Pahu*), serta nomor kontak darurat HSE.
- **Tab Diagnostik Server**: Memeriksa status koneksi database PostgreSQL, server backend API, dan metrik total data transaksi.

---

## BAB 9: PANDUAN FORMAT BULK IMPORT (.CSV)

Pemisah kolom (*delimiter*) yang didukung: Titik Koma (`;`) atau Koma (`,`).

### 9.1 Format CSV Impor Pengguna (Users)

- **Header Wajib**:

```csv
firstName,lastName,nrp,password,department,position,role,phoneNumber,email
```

- **Contoh Data CSV**:

```csv
firstName,lastName,nrp,password,department,position,role,phoneNumber,email
Ahmad,Subagyo,8021001,Batara@123,OPERATIONS,OPERATOR,USER,081234567890,ahmad.subagyo@batara.co.id
Bambang,Kurniawan,8021002,Batara@123,OPERATIONS,DRIVER,USER,081298765432,bambang.kurniawan@batara.co.id
Dedi,Pratama,8021003,Batara@123,PLANT,MECHANIC,USER,081377889900,dedi.pratama@batara.co.id
Eko,Sulistyo,8021004,Batara@123,OPERATIONS,SITE_SUPERVISOR,ADMIN,081155667788,eko.sulistyo@batara.co.id
```

### 9.2 Format CSV Impor Master Unit (Units)

- **Header Wajib**:

```csv
unitNo;category;brand;description;ownerName;km;hourMeter;status
```

- **Contoh Data CSV**:

```csv
unitNo;category;brand;description;ownerName;km;hourMeter;status
LV-01;LIGHT_VECHICLE;Toyota;Hilux Double Cabin 4x4;PT Batara Dharma Persada;0;;ACTIVE
TH-01;TELEHENDLER;JCB;JCB 535-95 Telehandler;PT Batara Dharma Persada;0;0;ACTIVE
ST-01;STORING_TRUCK;Hino;Dutro 130 HD Workshop;PT Batara Dharma Persada;0;;ACTIVE
FT-01;FUEL_TRUCK;Hino;Ranger FM 260 JD (16.000L);PT Batara Dharma Persada;0;0;ACTIVE
GS-01;GENSET;Denyo;DCA-80ESK (80 kVA);PT Batara Dharma Persada;0;0;ACTIVE
CP-01;COMPRESSOR;Airman;PDS185S Diesel Compressor;PT Batara Dharma Persada;0;0;ACTIVE
EX-01;EXCAVATOR;Komatsu;PC200-8M0 Excavator;PT Batara Dharma Persada;0;0;ACTIVE
DZ-01;DOZER;Caterpillar;D6R Bulldozer;PT Batara Dharma Persada;0;0;ACTIVE
DT-01;DUMP_TRUCK;Hino;FM 260 JD Dump Truck;PT Batara Dharma Persada;0;0;ACTIVE
```

---

## BAB 10: TROUBLESHOOTING & FREQUENTLY ASKED QUESTIONS (FAQ)

### Q1: Mengapa saat pengisian form P2H muncul pesan error "Nilai KM / HM tidak boleh lebih rendah dari data sebelumnya"?

- **Penyebab**: Angka KM/HM yang Anda masukkan lebih kecil dari odometer riwayat P2H terakhir pada unit tersebut.
- **Solusi**: Periksa kembali fisik odometer pada speedometer / monitor dashboard unit Anda. Pastikan tidak ada salah ketik angka (misal kurang angka nol). Jika terdapat pergantian speedometer fisik (*gauge replacement*), hubungi Admin Plant untuk memperbarui nilai master KM/HM unit.

### Q2: Mengapa tombol "Buat Form P2H Baru" tidak ada di dashboard Admin?

- **Penjelasan**: Berdasarkan SOP K3 Site Muara Pahu, pengisian lembar pemeriksaan P2H **wajib dilakukan langsung oleh Driver / Operator** pemegang unit di lapangan melalui portal P2H (`/p2h`), bukan dibuat manual oleh Admin di kantor.

### Q3: Bagaimana cara operator yang lupa password untuk login?

- **Solusi**: Hubungi Admin atau Superadmin. Admin dapat membuka menu **Manajemen Pengguna** ➔ Cari nama/NRP operator ➔ Klik ikon kunci kuning ➔ Klik **"Reset Password ke Default"**. Operator dapat langsung login kembali menggunakan kata sandi bawaan **`Batara@123`**.

### Q4: Apakah formulir P2H dapat dicetak jika tidak ada koneksi printer fisik di lapangan?

- **Solusi**: Ya. Klik tombol ikon Dokumen pada baris riwayat P2H ➔ Pada dialog cetak browser, pilih tujuan printer **"Save as PDF"** ➔ Simpan file formulir P2H berformat `.pdf` ke HP/komputer Anda untuk dikirim via WhatsApp atau email.

### Q5: Bagaimana cara memasang logo dan judul aplikasi "P2H MP" di HP iPhone?

- **Solusi**: Buka website di **Safari iOS** ➔ Tekan tombol **Share** ➔ Pilih **"Add to Home Screen"** ➔ Judul aplikasi otomatis **`P2H MP`** dan ikon menampilkan logo resmi transparan Site Muara Pahu.

---

```text
========================================================================
            PT BATARA DHARMA PERSADA - SITE MUARA PAHU
     Departemen Plant Maintenance, Operasional, & Keselamatan Kerja (K3)
========================================================================
```
