const root = document.documentElement;
const stage = document.getElementById("hero-stage");
const scene = document.getElementById("hero-scene");
const motionButton = document.getElementById("motion-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let userPaused = false;
try {
  userPaused = localStorage.getItem("hafssa-motion-paused") === "true";
} catch {}
function updateMotion() {
  const paused = userPaused || reducedMotion.matches;
  root.classList.toggle("motion-paused", paused);
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.disabled = reducedMotion.matches;
  document.getElementById("motion-label").textContent = reducedMotion.matches
    ? "Mouvements réduits"
    : paused
      ? "Activer les animations"
      : "Mettre en pause";
  motionButton.setAttribute(
    "aria-label",
    reducedMotion.matches
      ? "Mouvements réduits selon vos préférences"
      : paused
        ? "Activer les animations"
        : "Mettre les animations en pause",
  );
  motionButton.querySelector(".motion-icon").textContent = "";
  if (paused) resetTilt();
}
motionButton.addEventListener("click", () => {
  userPaused = !userPaused;
  try {
    localStorage.setItem("hafssa-motion-paused", String(userPaused));
  } catch {}
  updateMotion();
});
reducedMotion.addEventListener("change", updateMotion);
// Actual CSS 3D geometry: intersecting rings form the two floating yarn spheres.
for (const ball of document.querySelectorAll("[data-yarn]")) {
  const fragment = document.createDocumentFragment();
  for (let angle = 0; angle < 180; angle += 10) {
    const ring = document.createElement("span");
    ring.className = "yarn-ring";
    ring.style.setProperty("--ring-angle", `${angle}deg`);
    fragment.append(ring);
  }
  ball.append(fragment);
}
let frame = 0;
function resetTilt() {
  cancelAnimationFrame(frame);
  scene.style.setProperty("--tilt-x", "0deg");
  scene.style.setProperty("--tilt-y", "0deg");
}
stage.addEventListener("pointermove", (event) => {
  if (!finePointer.matches || root.classList.contains("motion-paused")) return;
  const rect = stage.getBoundingClientRect();
  const x = Math.max(
    -1,
    Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
  );
  const y = Math.max(
    -1,
    Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
  );
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    scene.style.setProperty("--tilt-x", `${-y * 5}deg`);
    scene.style.setProperty("--tilt-y", `${x * 7}deg`);
  });
});
stage.addEventListener("pointerleave", resetTilt);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
    },
    { threshold: 0.08 },
  );
  root.classList.add("motion-ready");
  document
    .querySelectorAll(".reveal")
    .forEach((node) => observer.observe(node));
}
const menu = document.getElementById("main-nav");
const menuButton = document.getElementById("menu-toggle");
function closeMenu() {
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Ouvrir le menu");
}
menuButton.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Fermer le menu" : "Ouvrir le menu",
  );
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header")) closeMenu();
});
updateMotion();
