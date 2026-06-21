# 🗄️ Setup Database Supabase

Panduan langkah demi langkah untuk menghubungkan aplikasi Cerdas Cermat dengan database Supabase.

---

## Langkah 1: Buat Akun & Project Supabase

1. Buka [supabase.com](https://supabase.com)
2. Klik **"Start your project"** atau **"Sign Up"**
3. Login dengan **GitHub** (paling mudah)
4. Klik **"New Project"**
5. Isi:
   - **Name**: `cerdas-cermat` (atau nama lain)
   - **Database Password**: buat password (simpan baik-baik!)
   - **Region**: pilih yang terdekat (Singapore)
6. Klik **"Create new project"**
7. Tunggu 1-2 menit sampai project siap

---

## Langkah 2: Buat Table `quiz_results`

1. Di dashboard Supabase, klik **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**
3. Copy-paste SQL berikut:

```sql
-- Buat table untuk menyimpan hasil kuis
CREATE TABLE quiz_results (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  avg_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Siapa saja bisa INSERT (untuk menyimpan hasil)
CREATE POLICY "Anyone can insert results" ON quiz_results
  FOR INSERT WITH CHECK (true);

-- Policy: Siapa saja bisa SELECT (untuk admin melihat)
CREATE POLICY "Anyone can view results" ON quiz_results
  FOR SELECT USING (true);

-- Policy: Siapa saja bisa DELETE (untuk admin menghapus)
CREATE POLICY "Anyone can delete results" ON quiz_results
  FOR DELETE USING (true);
```

4. Klik **"Run"** (atau tekan Ctrl+Enter)
5. Pastikan muncul pesan **"Success"**

---

## Langkah 3: Dapatkan API Keys

1. Klik **"Project Settings"** (ikon gear ⚙️) di sidebar kiri
2. Klik **"API"** di submenu
3. Catat 2 nilai ini:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (yang panjang)

---

## Langkah 4: Tambahkan ke Vercel

1. Buka [vercel.com](https://vercel.com) → pilih project Anda
2. Klik **"Settings"** → **"Environment Variables"**
3. Tambahkan 2 variabel:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` (URL dari langkah 3) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (Anon Key dari langkah 3) |

4. Klik **"Save"** untuk masing-masing
5. Klik **"Deployments"** → klik **⋮** → **"Redeploy"**

---

## Langkah 5: Ganti Password Admin (Opsional)

Buka file `src/App.tsx`, cari baris ini:

```typescript
const ADMIN_PASSWORD = 'admin123';
```

Ganti `admin123` dengan password pilihan Anda.

---

## ✅ Selesai!

Sekarang:
- Setiap pemain menyelesaikan kuis → hasil tersimpan ke Supabase
- Admin bisa login dan melihat semua hasil dari **Admin Panel**

---

## 🔧 Troubleshooting

### Error "Failed to fetch" atau data tidak muncul
- Pastikan URL dan API Key sudah benar
- Pastikan table `quiz_results` sudah dibuat
- Cek di Supabase → Table Editor → apakah ada data?

### Error "Permission denied"
- Pastikan RLS policies sudah dibuat (lihat Langkah 2)
- Atau disable RLS sementara: `ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;`

### Untuk testing lokal
Buat file `.env` di folder utama project:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 📊 Melihat Data Langsung di Supabase

Anda juga bisa melihat data langsung di dashboard Supabase:
1. Buka project Anda di supabase.com
2. Klik **"Table Editor"** di sidebar
3. Pilih table **quiz_results**
4. Semua hasil kuis akan terlihat di sana!
