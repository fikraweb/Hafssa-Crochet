// Scroll motion is explicitly requested. One passive listener, one RAF per scroll,
// only intersecting scenes; no timers, forced scrolling or animation dependency.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
const active = new Set();
let scheduled = 0;
function paint() {
  scheduled = 0;
  if (document.hidden || reduced.matches || root.classList.contains('motion-paused')) return;
  const height = innerHeight;
  const distance = document.documentElement.scrollHeight - height;
  const measurements = [...active].map(node => {
    const rect = node.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
    return {node, progress};
  });
  const reading = distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0;
  root.style.setProperty("--reading-progress", String(reading));
  root.style.setProperty("--reading-turn", `${(reading * 360).toFixed(1)}deg`);
  for (const {node, progress} of measurements) {
    node.style.setProperty('--scene-progress', progress.toFixed(4));
    node.style.setProperty('--scene-shift', `${((progress - .5) * 44).toFixed(2)}px`);
    node.style.setProperty('--scene-turn', `${((progress - .5) * 12).toFixed(2)}deg`);
  }
}
function requestPaint() { if (!scheduled) scheduled = requestAnimationFrame(paint); }
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) entry.isIntersecting ? active.add(entry.target) : active.delete(entry.target);
    requestPaint();
  }, {rootMargin: '100px 0px'});
  scenes.forEach(node => observer.observe(node));
  addEventListener('scroll', requestPaint, {passive:true});
  addEventListener('resize', requestPaint, {passive:true});
  document.addEventListener('visibilitychange', requestPaint);
  reduced.addEventListener('change', requestPaint);
  new MutationObserver(requestPaint).observe(root, {attributes:true, attributeFilter:['class']});
}
