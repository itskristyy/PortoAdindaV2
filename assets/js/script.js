
document.addEventListener('DOMContentLoaded', () => {

  // === MOBILE MENU ===
  // Ambil elemen HTML yang diperlukan
  const menuBtn = document.getElementById('mobileMenuBtn'); // tombol hamburger
  const mobileNav = document.getElementById('mobileNav'); // container menu
  const mobileNavClose = document.getElementById('mobileNavClose'); // tombol X tutup
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop'); // background gelap

  // Fungsi buat buka menu mobile
  function openMobileMenu() {
    if (!mobileNav) return; // cek elemen ada atau gak
    mobileNav.classList.add('mobile-nav--open'); // tambah class buat tampil
    menuBtn?.setAttribute('aria-expanded', 'true'); // accessibility: beri tahu screen reader
    document.body.style.overflow = 'hidden'; // lock scroll page
  }

  // Fungsi buat tutup menu mobile (kebalikan dari open)
  function closeMobileMenu() {
    if (!mobileNav) return; // cek elemen ada atau gak
    mobileNav.classList.remove('mobile-nav--open'); // hapus class (menu hilang)
    menuBtn?.setAttribute('aria-expanded', 'false'); // accessibility: menu sekarang tutup
    document.body.style.overflow = ''; // unlock scroll page
  }

  // Klik tombol hamburger = toggle menu (buka/tutup)
  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('mobile-nav--open'); // cek menu buka atau tutup
    isOpen ? closeMobileMenu() : openMobileMenu(); // toggle: buka jadi tutup, tutup jadi buka
  });
  
  // Klik tombol X = tutup menu
  mobileNavClose?.addEventListener('click', closeMobileMenu);
  
  // Klik area background gelap = tutup menu
  mobileNavBackdrop?.addEventListener('click', closeMobileMenu);
  
  // Tekan tombol Escape = tutup menu (good UX!)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // === SMOOTH SCROLL ===
  // Cari semua link yang href dimulai dengan # (anchor link)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href'); // ambil href (contoh: #about)
      if (targetId === '#') return; // skip kalau href cuma #

      const targetElement = document.querySelector(targetId); // cari element sesuai id
      if (targetElement) {
        e.preventDefault(); // cancel default (jangan langsung loncat)
        targetElement.scrollIntoView({ behavior: 'smooth' }); // scroll smooth ke element
        closeMobileMenu(); // tutup menu kalau lagi buka
      }
    });
  });

  // === ACTIVE NAVBAR LINK ===
  // Ambil semua section & link navbar
  const sections = document.querySelectorAll('main section[id]'); // semua section punya id
  const navLinks = document.querySelectorAll('.navbar__link'); // link di navbar desktop
  const mobileLinks = document.querySelectorAll('.mobile-nav__link'); // link di navbar mobile

  // Fungsi: highlight navbar link sesuai section yang lagi dilihat
  const setActiveLink = () => {
    let currentId = ''; // id section yang aktif
    const scrollPos = window.scrollY + window.innerHeight / 3; // scroll position + 1/3 tinggi layar

    // Loop setiap section, cari yang sedang terlihat
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) { // kalau scroll >= top section, ini yang aktif
        currentId = section.getAttribute('id'); // simpan id
      }
    });

    // Highlight link navbar desktop yang sesuai
    navLinks.forEach(link => {
      link.classList.toggle('navbar__link--active', link.getAttribute('href') === `#${currentId}`);
      // toggle class active kalau href == id section aktif
    });
    
    // Highlight link navbar mobile yang sesuai
    mobileLinks.forEach(link => {
      link.classList.toggle('mobile-nav__link--active', link.getAttribute('href') === `#${currentId}`);
      // toggle class active kalau href == id section aktif
    });
  };

  // Jalankan setiap scroll
  window.addEventListener('scroll', setActiveLink);
  // Jalankan 1x saat load buat initial state
  setActiveLink();

  // === THEME TOGGLE (LIGHT/DARK) ===
  // Ambil elemen yang diperlukan
  const root = document.documentElement; // <html> element
  const themeToggle = document.getElementById('themeToggle'); // tombol toggle
  const themeIcon = document.getElementById('themeToggleIcon'); // ikon mode
  const themeLabel = document.getElementById('themeToggleLabel'); // label text

  // Fungsi: terapkan tema (light atau dark)
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme); // set atribut data-theme (trigger CSS)
    // update accessibility
    if (themeToggle) themeToggle.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    // ubah ikon (light_mode atau dark_mode)
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
    // ubah label text (Dark atau Light)
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    // simpan tema ke local storage (biar tetap ingat pas user balik)
    try { localStorage.setItem('ak-portfolio-theme', theme); } catch (err) { /* ignore */ }
  };

  // Coba ambil tema yang disimpan sebelumnya
  let savedTheme = 'light'; // default = light
  try { savedTheme = localStorage.getItem('ak-portfolio-theme') || 'light'; } catch (err) { /* ignore */ }
  applyTheme(savedTheme); // terapkan tema yang tersimpan

  // Dengarkan klik tombol toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // toggle tema (dark jadi light, light jadi dark)
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next); // terapkan tema yang baru
    });
  }

}); // tutup DOMContentLoaded event listener