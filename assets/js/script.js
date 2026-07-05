
// =========================================================
// Adinda Kristiyani — Portfolio
// script.js — Smooth scroll, active navbar link, theme toggle, mobile menu
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');

  function openMobileMenu() {
    if (!mobileNav) return;
    mobileNav.classList.add('mobile-nav--open');
    menuBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('mobile-nav--open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('mobile-nav--open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  });
  mobileNavClose?.addEventListener('click', closeMobileMenu);
  mobileNavBackdrop?.addEventListener('click', closeMobileMenu);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  /* ---------- Active link state on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  const setActiveLink = () => {
    let currentId = '';
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('navbar__link--active', link.getAttribute('href') === `#${currentId}`);
    });
    mobileLinks.forEach(link => {
      link.classList.toggle('mobile-nav__link--active', link.getAttribute('href') === `#${currentId}`);
    });
  };

  window.addEventListener('scroll', setActiveLink);
  setActiveLink();

  /* ---------- Theme toggle (light / dark) ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeToggleIcon');
  const themeLabel = document.getElementById('themeToggleLabel');

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    try { localStorage.setItem('ak-portfolio-theme', theme); } catch (err) { /* ignore */ }
  };

  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('ak-portfolio-theme') || 'light'; } catch (err) { /* ignore */ }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  /* ---------- Typing badge ---------- */
  const typedEl = document.getElementById('typedText');
  const roles = ['Web Development Enthusiast', 'Software Engineering Student', 'Frontend Learner'];

  if (typedEl) {
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = false;
    typedEl.textContent = roles[0];

    const tick = () => {
      const word = roles[roleIndex];

      if (deleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      typedEl.textContent = word.slice(0, charIndex);

      if (!deleting && charIndex === word.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, 400);
        return;
      }

      setTimeout(tick, deleting ? 35 : 70);
    };

    setTimeout(tick, 2200);
  }

});