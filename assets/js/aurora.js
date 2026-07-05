// aurora.js — cursor tail effect (small dots chasing the pointer, green fading to pink)

document.addEventListener('DOMContentLoaded', () => {

  const wrap = document.getElementById('cursorAurora');
  if (!wrap) return;

  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!hasFinePointer) {
    wrap.remove();
    return;
  }

  const DOT_COUNT = 16;
  const HEAD_COLOR = [95, 217, 164];  // aurora green
  const TAIL_COLOR = [242, 143, 192]; // aurora pink

  const mix = (a, b, t) => Math.round(a + (b - a) * t);

  const dots = [];

  for (let i = 0; i < DOT_COUNT; i++) {
    const t = i / (DOT_COUNT - 1);
    const size = 13 - t * 10;
    const r = mix(HEAD_COLOR[0], TAIL_COLOR[0], t);
    const g = mix(HEAD_COLOR[1], TAIL_COLOR[1], t);
    const b = mix(HEAD_COLOR[2], TAIL_COLOR[2], t);
    const color = `rgb(${r}, ${g}, ${b})`;

    const el = document.createElement('span');
    el.className = 'cursor-trail-dot';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.background = color;
    el.style.boxShadow = `0 0 ${8 - t * 5}px ${color}`;
    el.style.opacity = `${1 - t * 0.8}`;
    wrap.appendChild(el);

    dots.push({
      el,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      ease: 0.45 - t * 0.22,
    });
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    wrap.classList.add('cursor-aurora--visible');
  });
  document.addEventListener('mouseleave', () => wrap.classList.remove('cursor-aurora--visible'));
  window.addEventListener('blur', () => wrap.classList.remove('cursor-aurora--visible'));

  const render = () => {
    let targetX = mouseX;
    let targetY = mouseY;

    dots.forEach((dot) => {
      dot.x += (targetX - dot.x) * dot.ease;
      dot.y += (targetY - dot.y) * dot.ease;
      dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
      targetX = dot.x;
      targetY = dot.y;
    });

    requestAnimationFrame(render);
  };

  render();

});