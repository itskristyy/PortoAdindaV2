// =========================================================
// animation.js
// Scroll-reveal animation (elemen muncul saat masuk viewport)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

  // skill bars fill in one after another once the block is visible
  const skillBars = document.querySelector('.skill-bars');
  if (skillBars) {
    const bars = skillBars.querySelectorAll('.skill-bar__fill');
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        bars.forEach((bar, i) => {
          setTimeout(() => {
            bar.style.width = `${bar.dataset.width}%`;
          }, i * 180);
        });
        barObserver.disconnect();
      });
    }, { threshold: 0.4 });
    barObserver.observe(skillBars);
  }

});