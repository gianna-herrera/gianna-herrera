/* gsap viene del <script> de CDN (variable global), no se importa */

const TILES_X = 12;
const TILES_Y = 9;
const TILE_SIZE = 60;

const PREVIEW_WIDTH = TILES_X * TILE_SIZE;   // 720
const PREVIEW_HEIGHT = TILES_Y * TILE_SIZE;  // 540

const AUTOPLAY_MS = 4000;   // tiempo entre cambios automáticos

const TILE_FACES = [
  "face-front",
  "face-rear",
  "face-right",
  "face-left",
  "face-top",
  "face-bottom",
];

/* Todas las imágenes rotan en este orden. Si un archivo no existe,
   se genera automáticamente una imagen de prueba. */
const PROJECT_IMAGES = [
  "images/showcase/default.png",
  "images/showcase/2.png",
  "images/showcase/3.png",
  "images/showcase/4.png",
  "images/showcase/5.png",
  "images/showcase/6.png",
  "images/showcase/7.png",
];

const PLACEHOLDER_LABELS = [
  "DEFAULT", "IMAGE 2", "IMAGE 3", "IMAGE 4",
  "IMAGE 5", "IMAGE 6", "IMAGE 7",
];

const reduceMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function makePlaceholder(i) {
  const c = document.createElement("canvas");
  c.width = PREVIEW_WIDTH;
  c.height = PREVIEW_HEIGHT;
  const x = c.getContext("2d");
  const hue = 255 + i * 12;
  const g = x.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, `hsl(${hue},70%,${i === 0 ? 14 : 62}%)`);
  g.addColorStop(1, `hsl(${hue + 40},60%,${i === 0 ? 6 : 22}%)`);
  x.fillStyle = g;
  x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = "rgba(255,255,255,.18)";
  x.lineWidth = 2;
  for (let k = 1; k < 6; k++) {
    x.beginPath();
    x.arc(c.width * (0.2 + 0.12 * i), c.height / 2, k * 55, 0, 6.3);
    x.stroke();
  }
  x.fillStyle = "#fff";
  x.font = "600 54px monospace";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(PLACEHOLDER_LABELS[i], c.width / 2, c.height / 2);
  return c.toDataURL("image/png");
}

function resolveImage(path, i) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(path);
    img.onerror = () => resolve(makePlaceholder(i));
    img.src = path;
  });
}

const mosaicEl = document.querySelector(".mosaic");
const previewEl = document.querySelector(".project-preview");

/* ---------- Responsive: escalar el mosaico al ancho del contenedor ---------- */
function fit() {
  const s = mosaicEl.clientWidth / PREVIEW_WIDTH;
  previewEl.style.transform = `scale(${s})`;
  mosaicEl.style.perspective = `${800 * s}px`;
}
fit();
new ResizeObserver(fit).observe(mosaicEl);

/* ---------- Construcción de fichas ---------- */
const tiles = [];

for (let row = 0; row < TILES_Y; row++) {
  for (let col = 0; col < TILES_X; col++) {

    const tile = document.createElement("div");
    tile.className = "tile";

    const faces = {};

    TILE_FACES.forEach((side) => {
      const face = document.createElement("div");
      face.className = `tile-face ${side}`;
      tile.appendChild(face);
      faces[side] = face;
    });

    previewEl.appendChild(tile);

    tiles.push({ element: tile, faces, row, col });
  }
}

function setTileImage(tile, side, imagePath) {

  const face = tile.faces[side];

  const offsetX = -(tile.col * TILE_SIZE);
  const offsetY = -(tile.row * TILE_SIZE);

  face.style.backgroundImage = `url("${imagePath}")`;
  face.style.backgroundSize = `${PREVIEW_WIDTH}px ${PREVIEW_HEIGHT}px`;
  face.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
}

function applyDefault() {
  tiles.forEach((tile) => {
    setTileImage(tile, "face-front", PROJECT_IMAGES[0]);
    setTileImage(tile, "face-rear", PROJECT_IMAGES[0]);
    setTileImage(tile, "face-right", PROJECT_IMAGES[0]);
    setTileImage(tile, "face-left", PROJECT_IMAGES[0]);
  });
}

/* ---------- Efecto "respirar" ---------- */
function breathe(tileElement) {
  gsap.to(tileElement, {
    z: gsap.utils.random(-40, 40),
    duration: gsap.utils.random(0.8, 1.6),
    ease: "sine.inOut",
    onComplete: () => breathe(tileElement),
  });
}

if (!reduceMotion) {
  tiles.forEach((tile, index) => {
    gsap.delayedCall(index * 0.01, () => breathe(tile.element));
  });
}

/* ---------- Giro del mosaico ---------- */
let activeProject = 0;
let revealCount = 0;
let isRevealing = false;

function getHiddenFace() {
  return revealCount % 2 === 0 ? "face-rear" : "face-front";
}

function revealProject(projectIndex) {

  if (isRevealing || projectIndex === activeProject) return;

  isRevealing = true;

  const hiddenFace = getHiddenFace();

  tiles.forEach((tile) => {
    setTileImage(tile, hiddenFace, PROJECT_IMAGES[projectIndex]);
  });

  revealCount++;
  activeProject = projectIndex;

  gsap.to(".tile", {
    rotateY: revealCount * 180,
    duration: reduceMotion ? 0.01 : 0.8,
    ease: "power3.inOut",
    stagger: {
      each: 0.01,
      from: "center",
      grid: [TILES_Y, TILES_X],
    },
    onComplete: () => {
      isRevealing = false;
    },
  });
}

/* ---------- Cambio automático ---------- */
let timer = null;
let inView = true;

function next() {
  if (document.hidden || !inView || isRevealing) return;
  revealProject((activeProject + 1) % PROJECT_IMAGES.length);
}

function startAutoplay() {
  stopAutoplay();
  if (reduceMotion) return;
  timer = setInterval(next, AUTOPLAY_MS);
}

function stopAutoplay() {
  if (timer) clearInterval(timer);
  timer = null;
}

/* Pausar cuando el mosaico no está en pantalla */
new IntersectionObserver((entries) => {
  inView = entries[0].isIntersecting;
}).observe(mosaicEl);

/* Clic o toque: pasa a la siguiente imagen y reinicia el contador */
mosaicEl.addEventListener("click", () => {
  if (isRevealing) return;
  revealProject((activeProject + 1) % PROJECT_IMAGES.length);
  startAutoplay();
});

/* Comprobar qué imágenes existen, mostrar la primera e iniciar */
Promise.all(PROJECT_IMAGES.map(resolveImage)).then((resolved) => {
  resolved.forEach((src, i) => { PROJECT_IMAGES[i] = src; });
  applyDefault();
  startAutoplay();
});