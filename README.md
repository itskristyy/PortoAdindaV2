# ✦ Adinda Kristiyani — Portfolio ✦

> Personal portfolio website yang menampilkan profil, skill, project, pencapaian, dan aktivitas GitHub secara *real-time*.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌗ Preview

🔗 **Live Demo:** [https://adindaporto.vercel.app/] 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌗ Tentang

Website ini dibangun sebagai portofolio pribadi dengan gaya minimalis dan elegan, lengkap dengan mode terang/gelap, animasi *scroll-reveal*, dan efek jejak kursor interaktif. Statistik GitHub — jumlah repository, followers, following, grafik kontribusi, hingga repository terbaru — diambil langsung dari GitHub API tanpa perlu update manual.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌗ Fitur

**◆ Navigasi**
- Navbar responsif dengan highlight otomatis sesuai section yang sedang dilihat (*scrollspy*)
- Menu hamburger untuk tampilan mobile

**◆ Tampilan**
- Mode terang / gelap, tersimpan otomatis lewat `localStorage`
- Efek jejak kursor (*cursor trail*) di seluruh halaman
- Animasi *scroll-reveal* saat elemen masuk ke viewport

**◆ Section**
- `Home` — perkenalan singkat
- `About` — profil & informasi diri
- `Skills` — kemampuan teknis dengan progress bar
- `Projects` — daftar project yang pernah dikerjakan
- `Achievement` — sertifikat & pencapaian
- `GitHub Stats` — data langsung dari GitHub:
  - Jumlah repository, followers, following
  - Grafik kontribusi 6 bulan terakhir
  - Daftar repository terbaru
- `Contact` — informasi kontak & tautan sosial

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌗ Teknologi

| Kategori        | Detail                                                                                   |
|------------------|-------------------------------------------------------------------------------------------|
| Markup & Style   | HTML5, CSS3 *(custom properties, CSS Grid & Flexbox)*                                     |
| Logic            | JavaScript *(vanilla, tanpa framework)*                                                   |
| Data GitHub      | GitHub REST API, github-contributions-api.jogruber.de                                     |
| Ikon & Font      | Boxicons, Material Symbols                                                                |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌗ Struktur Folder

```
PortoAdindaV2/
├─ assets/
│  ├─ css/
│  │  ├─ style.css                   ← styling utama
│  │  └─ responsive_style.css        ← breakpoint responsive
│  ├─ images/                        ← foto profil, thumbnail project, favicon
│  └─ js/
│     ├─ script.js                   ← navbar, smooth scroll, theme toggle
│     ├─ animation.js                ← animasi scroll-reveal
│     ├─ aurora.js                   ← efek jejak kursor
│     ├─ github-stats.js             ← jumlah repo / followers / following
│     ├─ github-contributions.js     ← grafik kontribusi
│     ├─ github-monthly-commits.js   ← agregasi commit bulanan
│     └─ github-recent-repos.js      ← daftar repository terbaru
├─ docs/                             ← dokumentasi tambahan
├─ index.html                        ← halaman utama
└─ README.md
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌗ Cara Menjalankan

1. Clone repository ini
   ```bash
   git clone https://github.com/itskristyy/PortoAdindaV2.git
   ```
2. Masuk ke folder project
   ```bash
   cd PortoAdindaV2
   ```
3. Buka `index.html` langsung di browser, atau jalankan lewat ekstensi **Live Server** di VS Code untuk pengalaman terbaik.

> Catatan: data GitHub Stats memakai API publik tanpa token, jadi tetap terikat rate limit GitHub (60 request/jam per IP). Data sudah otomatis di-cache lewat `localStorage` selama 1 jam untuk meminimalisir hal ini.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌗ Kontak

**Adinda Kristiyani**

✦ GitHub — [@itskristyy](https://github.com/itskristyy)
✦ Instagram — [@kristyyvy](https://www.instagram.com/kristyyvy)
✦ LinkedIn — [Adinda Kristiyani](https://www.linkedin.com/in/adindakristyani)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<p align="center"><i>dibuat dengan dedikasi dan secangkir kopi ✦</i></p>
