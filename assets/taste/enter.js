// External equivalent of Taste's hero-entry bootstrap; preserves the site's strict CSP.
document.documentElement.classList.add('m-enter');
setTimeout(() => document.documentElement.classList.add('m-enter-done'), 700);
