// Scroll updates touch only the participating graphics, never an inherited
// CSS variable on <html>. One passive listener and at most one pending frame.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const readingThread = document.querySelector('.fil-reading-thread');
const star = document.querySelector('.fil-theatre .little-star svg');
const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
const active = new Set();
const targets = new Map(scenes.map(scene => [scene, {
  characters: [...scene.querySelectorAll('.fil-character')],
  photo: scene.querySelector('.atelier-poster-scene > img'),
  steps: [...scene.querySelectorAll('.ordering-steps li > span')],
  icons: [...scene.querySelectorAll('.detail-icon')],
  flower: scene.querySelector('.contact-flower'),
  paths: [...scene.querySelectorAll('.fil-thread path,.order-thread path')],
}]));
let scheduled = 0;
let resting = false;
function reset() {
  if (resting) return;
  for (const group of targets.values()) {
    for (const node of [...group.characters, ...group.steps, ...group.icons, group.photo, group.flower].filter(Boolean)) node.style.removeProperty('transform');
    for (const path of group.paths) path.style.strokeDashoffset = '0';
  }
  star?.style.removeProperty('transform');
  resting = true;
}
function paint() {
  scheduled = 0;
  if (document.hidden) return;
  if (reduced.matches || root.classList.contains('motion-paused')) { reset(); return; }
  resting = false;
  const height = innerHeight;
  const distance = root.scrollHeight - height;
  const reading = distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0;
  const measurements = [...active].map(scene => {
    const rect = scene.getBoundingClientRect();
    return { group: targets.get(scene), progress: Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height))) };
  });
  if (readingThread) readingThread.style.transform = `scaleX(${reading.toFixed(4)})`;
  if (star) star.style.transform = `rotate(${(reading * 360).toFixed(1)}deg)`;
  for (const {group, progress} of measurements) {
    const shift = (progress - .5) * 44;
    const turn = (progress - .5) * 12;
    group.characters.forEach((node, index) => {
      const translations = [-.45, .5, -.3, .7];
      const rotations = [-1, 1, -.7, .8];
      node.style.transform = `translateY(${(shift * translations[index % 4]).toFixed(2)}px) rotate(${(turn * rotations[index % 4]).toFixed(2)}deg)`;
    });
    if (group.photo) group.photo.style.transform = `translateY(${shift.toFixed(2)}px) scale(1.08)`;
    for (const step of group.steps) step.style.transform = `rotate(${turn.toFixed(2)}deg)`;
    for (const icon of group.icons) icon.style.transform = `rotate(${(turn * 5).toFixed(2)}deg) translateY(${shift.toFixed(2)}px)`;
    if (group.flower) group.flower.style.transform = `rotate(${(turn * 7).toFixed(2)}deg)`;
    for (const path of group.paths) path.style.strokeDashoffset = String(Math.max(0, .8 - progress));
  }
}
function requestPaint() { if (!scheduled) scheduled = requestAnimationFrame(paint); }
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) entry.isIntersecting ? active.add(entry.target) : active.delete(entry.target);
    requestPaint();
  }, {rootMargin: '100px 0px'});
  scenes.forEach(scene => observer.observe(scene));
  addEventListener('scroll', requestPaint, {passive:true});
  addEventListener('resize', requestPaint, {passive:true});
  document.addEventListener('visibilitychange', requestPaint);
  reduced.addEventListener('change', requestPaint);
  new MutationObserver(requestPaint).observe(root, {attributes:true, attributeFilter:['class']});
}
