window.keys = window.keys || {};

document.addEventListener("keydown", (e) => {
  window.keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  window.keys[e.key.toLowerCase()] = false;
});