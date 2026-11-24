const root = document.documentElement;
const stage = document.getElementById("hero-stage");
const scene = document.getElementById("hero-scene");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let userPaused = false;
try {
  userPaused = localStorage.getItem("hafssa-motion-paused") === "true";
} catch {}
function updateMotion() {
  const paused = userPaused || reducedMotion.matches;
  root.classList.toggle("motion-paused", paused);
  if (paused) resetTilt();
  const toggle = document.getElementById("hero-motion-toggle");
  if (toggle) {
    toggle.disabled = reducedMotion.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", reducedMotion.matches ? "Animation désactivée selon vos préférences de mouvement" : paused ? "Activer l’animation" : "Mettre l’animation en pause");
  }
}
reducedMotion.addEventListener("change", updateMotion);
let frame = 0;
function resetTilt() {
  cancelAnimationFrame(frame);
  scene.style.setProperty("--tilt-x", "0deg");
  scene.style.setProperty("--tilt-y", "0deg");
  scene.style.setProperty("--camera-x", "0px");
  scene.style.setProperty("--camera-y", "0px");
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
    scene.style.setProperty("--tilt-x", `${-y * 1.8}deg`);
    scene.style.setProperty("--tilt-y", `${x * 2.4}deg`);
    scene.style.setProperty("--camera-x", `${x * 5}px`);
    scene.style.setProperty("--camera-y", `${y * 3}px`);
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
const menuDialog = document.getElementById("mobile-menu");
const mobileNavigation = window.matchMedia("(max-width: 1023px)");
function closeMenu() {
  if (menuDialog.open) menuDialog.close();
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Ouvrir le menu");
}
function placeMenu() {
  closeMenu();
  if (mobileNavigation.matches) menuDialog.append(menu);
  else document.querySelector(".header").insertBefore(menu, document.querySelector(".header-actions"));
}
mobileNavigation.addEventListener("change", placeMenu);
placeMenu();
menuButton.addEventListener("click", () => {
  if (menuDialog.open) return closeMenu();
  menuDialog.showModal();
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Fermer le menu");
});
document.getElementById("mobile-menu-close").addEventListener("click", closeMenu);
menuDialog.addEventListener("close", closeMenu);
menuDialog.addEventListener("cancel", closeMenu);
menuDialog.addEventListener("click", (event) => {
  if (event.target !== menuDialog) return;
  const rect = menuDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
});
menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
updateMotion();

// Keep the current section visible in the persistent navigation.
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of menu.querySelectorAll("a")) {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
  );
  for (const id of ["collection", "histoire", "contact"])
    sectionObserver.observe(document.getElementById(id));
}

// Shared magnetic movement and pointer-following glow for hero and header buttons.
for (const button of document.querySelectorAll("[data-magnetic]")) {
  let buttonFrame = 0;
  const reset = () => {
    cancelAnimationFrame(buttonFrame);
    button.style.setProperty("--mag-x", "0px");
    button.style.setProperty("--mag-y", "0px");
  };
  button.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || root.classList.contains("motion-paused"))
      return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    cancelAnimationFrame(buttonFrame);
    buttonFrame = requestAnimationFrame(() => {
      button.style.setProperty("--mag-x", `${(x - 0.5) * 7}px`);
      button.style.setProperty("--mag-y", `${(y - 0.5) * 5}px`);
      button.style.setProperty("--glow-x", `${x * 100}%`);
      button.style.setProperty("--glow-y", `${y * 100}%`);
    });
  });
  button.addEventListener("pointerleave", reset);
  button.addEventListener("blur", reset);
  reducedMotion.addEventListener("change", reset);
}

// Measured sticky offsets also follow wrapped category rows on small screens.
if ("ResizeObserver" in window) {
  const filtersBar = document.querySelector(".catalogue-tools");
  const offsets = new ResizeObserver(() =>
    root.style.setProperty(
      "--filters-height",
      `${filtersBar.getBoundingClientRect().height}px`,
    ),
  );
  offsets.observe(filtersBar);
}

// Cinematic movement is local, pausable and sleeps when the hero is off-screen.
const cinemaToggle = document.getElementById("hero-motion-toggle");
cinemaToggle?.addEventListener("click", () => {
  userPaused = !root.classList.contains("motion-paused");
  try { localStorage.setItem("hafssa-motion-paused", String(userPaused)); } catch {}
  updateMotion();
});
const cinemaHero = document.querySelector(".hero-cinematic");
let heroOnScreen = true;
function updateCinemaVisibility() {
  cinemaHero?.classList.toggle("scene-outside", document.hidden || !heroOnScreen);
}
if (cinemaHero && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    heroOnScreen = entry.isIntersecting;
    updateCinemaVisibility();
  }).observe(cinemaHero);
}
document.addEventListener("visibilitychange", updateCinemaVisibility);
updateMotion();
