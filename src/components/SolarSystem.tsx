"use client";

import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────
   SolarSystem — the site ball becomes the Sun.
   Planets sit at their REAL heliocentric positions, computed from
   JPL approximate Keplerian elements (J2000 epoch + centennial
   rates, valid 1800–2050). The ecliptic is viewed from a slight
   top-left vantage. On load the planets emerge from behind the Sun
   and travel along their orbits to "now", drawing their path as
   they go; afterwards the path decays to a short comet-like tail.
───────────────────────────────────────────────────────────────── */

const DEG = Math.PI / 180;
export const TILT = 0.55;                     // base sin of viewing elevation above the ecliptic
export const ROLL = -9 * DEG;                 // base roll — slight top-LEFT vantage
const N = 180;                         // samples used to find the behind-the-sun point

const ARRIVE_MS = 1700;
const STAGGER_MS = 160;
const TAIL_FADE_MS = 3200;             // trail decay after arrival
const TAIL_RAD = 0.55;                 // residual tail length (radians of eccentric anomaly)
const TRAIL_ALPHA = 0.34;

/* [a, ȧ, e, ė, I, İ, L, L̇, ϖ, ϖ̇, Ω, Ω̇] — AU / degrees, rates per century.
   Colors: real-planet hues, desaturated to sit on the greige/ink palette. */
const PLANETS = [
  { name: "Mercury", pr: 2.4, col: "#8a8175", sym: "☿", dia: "4,879 km across — a million Škoda Octavias, bumper to bumper", fact: "One Mercury day lasts two Mercury years — a design review that outlives two full release cycles.", k: [0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.2503235, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081] },
  { name: "Venus",   pr: 3.6, col: "#c0a35e", sym: "♀", dia: "12,104 km across — 23,500 Charles Bridges end to end", fact: "Ignored every convention and spins backwards — the Sun rises in the west. Bold redesigns sometimes work; its surface also melts lead.", k: [0.72333566, 0.0000039, 0.00677672, -0.00004107, 3.39467605, -0.0007889, 181.9790995, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418] },
  { name: "Earth",   pr: 3.8, col: "#5c7d8a", sym: "♁", dia: "12,742 km across — 200,000 Petřín Towers stacked up", fact: "The only planet known to contain design portfolios. You are here.", k: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0] },
  { name: "Mars",    pr: 3.0, col: "#a85c3f", sym: "♂", dia: "6,779 km across — 64,500 football pitches in a row", fact: "Olympus Mons is three Everests tall, yet so wide you couldn't tell you're standing on it. Scale means nothing without context.", k: [1.52371034, 0.00001847, 0.0933941, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343] },
  { name: "Jupiter", pr: 8.5, col: "#a5804f", sym: "♃", dia: "139,820 km across — 424,000 Eiffel Towers end to end", fact: "The Great Red Spot is a storm wider than Earth, open for 300+ years — the solar system's oldest unresolved ticket.", k: [5.202887, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106] },
  { name: "Saturn",  pr: 7.2, col: "#b4a276", sym: "♄", dia: "116,460 km across — 23 million giraffes, neck to hoof", fact: "Less dense than water — it would float in a big enough bathtub. Visual weight and actual weight are two different things; ask any UI designer.", k: [9.53667594, -0.0012506, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794] },
  { name: "Uranus",  pr: 5.4, col: "#7fa39c", sym: "♅", dia: "50,724 km across — 2 million blue whales nose to tail", fact: "Axis tipped 98° — the only planet that permanently rotated into landscape mode.", k: [19.18916464, -0.00196176, 0.04725744, -0.00004397, 0.77263783, -0.00242939, 313.23810451, 428.48202785, 170.9542763, 0.40805281, 74.01692503, 0.04240589] },
  { name: "Neptune", pr: 5.2, col: "#5c6d94", sym: "♆", dia: "49,244 km across — 1,167 marathons, side by side", fact: "Predicted by math from Uranus's wobble before any telescope saw it. Good research finds the problem before anyone sees it.", k: [30.06992276, 0.00026291, 0.00859048, 0.00005105, 1.77004347, 0.00035372, -55.12002969, 218.45945325, 44.96476227, -0.32241464, 131.78422574, -0.00508664] },
];

function tipHTML(i: number) {
  const p = PLANETS[i];
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="font-size:20px;line-height:1;color:${p.col};flex-shrink:0;">${p.sym}</span>
      <span style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink);">${p.name}</span>
    </div>
    <div style="font-size:12px;line-height:1.5;color:var(--ink-muted);margin-bottom:5px;">
      <span data-au style="color:var(--ink);font-weight:600;"></span> from the Sun right now
    </div>
    ${i === 2 ? "" : `<div style="font-size:12px;line-height:1.5;color:var(--ink-muted);margin-bottom:5px;">
      <span data-de style="color:var(--ink);font-weight:600;"></span> from Earth
    </div>`}
    <div style="font-size:12px;line-height:1.5;color:var(--ink-muted);margin-bottom:5px;">
      <span data-coord style="color:var(--ink);font-weight:600;"></span> ecliptic
    </div>
    <div style="font-size:12px;line-height:1.5;color:var(--ink-muted);">${p.dia}</div>
    <div style="font-size:12px;line-height:1.55;color:var(--ink);border-top:1px solid var(--grid-line);padding-top:8px;margin-top:9px;">${p.fact}</div>`;
}

type El = { a: number; e: number; I: number; O: number; w: number; M: number };

function elements(k: number[], T: number): El {
  const wb = k[8] + k[9] * T;
  const O = (k[10] + k[11] * T) * DEG;
  let M = (k[6] + k[7] * T - wb) % 360;
  if (M > 180) M -= 360;
  if (M < -180) M += 360;
  return { a: k[0] + k[1] * T, e: k[2] + k[3] * T, I: (k[4] + k[5] * T) * DEG, O, w: wb * DEG - O, M: M * DEG };
}

function kepler(M: number, e: number) {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 6; i++) E += (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
  return E;
}

/* Heliocentric ecliptic coords (AU) at eccentric anomaly E */
function orbitPoint(el: El, E: number) {
  const xp = el.a * (Math.cos(E) - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const cw = Math.cos(el.w), sw = Math.sin(el.w);
  const cO = Math.cos(el.O), sO = Math.sin(el.O);
  const cI = Math.cos(el.I), sI = Math.sin(el.I);
  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: sw * sI * xp + cw * sI * yp,
  };
}

/* Ecliptic AU → screen px relative to the Sun (k = px per AU for this orbit).
   tilt/roll vary per frame — the mouse steers the camera. */
function project(v: { x: number; y: number; z: number }, k: number, tilt: number, roll: number) {
  const zk = Math.sqrt(1 - tilt * tilt);
  const sx = v.x * k;
  const sy = -(v.y * k * tilt + v.z * k * zk);
  return {
    x: sx * Math.cos(roll) - sy * Math.sin(roll),
    y: sx * Math.sin(roll) + sy * Math.cos(roll),
    depth: v.y, // AU; > 0 = far side of the Sun
  };
}

function parseColor(s: string): [number, number, number] {
  s = s.trim();
  if (s.startsWith("#")) {
    const h = s.length === 4 ? s.slice(1).split("").map((c) => c + c).join("") : s.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const m = s.match(/[\d.]+/g);
  return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mix = (c: number, t: number, f: number) => Math.round(c + (t - c) * f);

export default function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipPlanet = useRef(-1);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -1e4, y: -1e4 };
    const view = { tilt: TILT, roll: ROLL };
    const comet = { dx: 1, dy: 0 };
    /* Released comet — free-flying in plane space, sun gravity, open trajectory */
    const free = { active: false, x: 0, y: 0, vx: 0, vy: 0 };
    let cometRebirth = -1; // -1: cursor comet live; Infinity: in flight; else: fade-in start time

    /* Supernova state */
    const nova = { active: false, start: 0 };

    /* UFO flyby — a grey bengal kitten pays an occasional visit.
       Flies in the ecliptic plane: bent arrival, planet scan, escape orbit. */
    const ufo = {
      active: false, start: 0, next: 0, mode: 0, target: 0,
      ex: 0, ey: 0, cx: 0, cy: 0, x: 0, y: 0, vx: 0, vy: 0, psx: 0,
      wasIn: false, passes: 0,
    };

    const bodyFont = getComputedStyle(document.body).fontFamily;
    let sunHoverT = -1; // when the pointer started resting on the sun
    const novaHit: boolean[] = new Array(PLANETS.length).fill(false);
    const pushD: number[] = new Array(PLANETS.length).fill(0); // radial displacement px
    const pushV: number[] = new Array(PLANETS.length).fill(0);
    const sunClicks: number[] = [];

    /* Drift pauses (eases out) while a planet is inspected */
    let driftT = 0, lastNow = 0, driftSpeed = 1, hovering = false;

    /* Mobile: tap → card, same-planet tap → Wikipedia, card tap → close */
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let mobileCard = -1;
    let touchHintDone = false; // one-time "how to play" caption on touch

    /* Cached hero-title dodge zone */
    let titleEl: Element | null = null;
    let zoneC: { l: number; t: number; r: number; b: number } | null = null;
    let zoneT = -1e9;
    const cur = { sunX: 0, sunY: 0 };

    /* screen offset from sun → ecliptic-plane coords, at the CURRENT view */
    const planeOf = (sx: number, sy: number): [number, number] => {
      const cr = Math.cos(view.roll);
      const sr = Math.sin(view.roll);
      return [sx * cr + sy * sr, -(-sx * sr + sy * cr) / view.tilt];
    };
    const hits: { x: number; y: number; r: number; name: string }[] = [];
    let cursorSet = false;
    const sunRGB: [number, number, number] = parseColor(
      getComputedStyle(document.documentElement).getPropertyValue("--ball") || "#c5d100"
    );
    const planetRGB = PLANETS.map((p) => parseColor(p.col));

    /* Geometry — recomputed on resize */
    type Geom = {
      w: number; h: number; minDim: number; sunR: number; uiScale: number; dpr: number;
      orbits: { kPx: number; startE: number }[];
    };
    let geom: Geom;

    /* Theme colors are read from CSS at most 4×/s — getComputedStyle every
       frame forces style recalc and is a major cost on large screens */
    const themeCache = {
      t: -1e9,
      ball: [197, 209, 0] as [number, number, number],
      ink: [36, 36, 36] as [number, number, number],
      dark: false,
    };

    /* Pre-rendered sun sprite — gradient + mottling + grain are repainted
       only when the color or size changes, not every frame */
    let sunSprite: HTMLCanvasElement | null = null;
    let sunKey = "";

    /* Pre-rendered planet sprites (gradient + grain), rebuilt on theme/resize */
    const planetSprites: (HTMLCanvasElement | null)[] = new Array(PLANETS.length).fill(null);
    let spritesDark: boolean | null = null;

    /* Adaptive frame rate: 30fps when the scene is quiet, 60fps during
       arrival, comet flight, nova, or active pointer movement */
    let frameNo = 0;
    let lastMove = 0;

    const buildGeometry = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const minDim = Math.min(w, h);
      const sqA = PLANETS.map((p) => Math.sqrt(p.k[0]));
      const [s0, s7] = [sqA[0], sqA[7]];
      const Rmin = minDim * 0.185;
      const Rmax = minDim * 0.47;
      const T = (Date.now() / 86400000 + 2440587.5 - 2451545.0) / 36525;

      const orbits = PLANETS.map((p, i) => {
        const el = elements(p.k, T);
        const kPx = (Rmin + (Rmax - Rmin) * ((sqA[i] - s0) / (s7 - s0))) / el.a;

        // Arrival start: the orbit point tucked directly behind the Sun
        let startE = 0;
        let best = Infinity;
        for (let j = 0; j < N; j++) {
          const pt = project(orbitPoint(el, (j / N) * 2 * Math.PI), kPx, TILT, ROLL);
          if (pt.depth > 0 && Math.abs(pt.x) < best) {
            best = Math.abs(pt.x);
            startE = (j / N) * 2 * Math.PI;
          }
        }
        return { kPx, startE };
      });

      /* Cap the backing store — full devicePixelRatio on a 4K display means
         tens of megapixels repainted per frame. ~5.5MP is visually enough. */
      const dpr = clamp(Math.min(window.devicePixelRatio || 1, Math.sqrt(5.5e6 / (w * h))), 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sunSprite = null; // sun size may have changed
      planetSprites.fill(null);

      geom = { w, h, minDim, sunR: minDim * 0.13, uiScale: clamp(minDim / 900, 0.7, 1.35), dpr, orbits };
    };

    buildGeometry();
    const ro = new ResizeObserver(buildGeometry);
    ro.observe(container);

    /* gBCR on every pointermove forces layout — cache it briefly */
    let rectC: DOMRect | null = null;
    let rectT = -1e9;
    const onMove = (e: PointerEvent) => {
      const tN = performance.now();
      if (!rectC || tN - rectT > 150) {
        rectC = canvas.getBoundingClientRect();
        rectT = tN;
      }
      mouse.x = e.clientX - rectC.left;
      mouse.y = e.clientY - rectC.top;
      lastMove = tN;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    /* Click on a hovered planet → its Wikipedia page. The canvas is
       pointer-events:none, so hit-test manually and never hijack clicks
       that land on real interactive elements. */
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("a, button, [role='button']")) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (cx >= 0 && cy >= 0 && geom && cx <= geom.w && cy <= geom.h) touchHintDone = true;
      /* Mobile: a tap on the open card closes it */
      if (isTouch && mobileCard >= 0 && tipRef.current) {
        const tr = tipRef.current.getBoundingClientRect();
        if (e.clientX >= tr.left && e.clientX <= tr.right && e.clientY >= tr.top && e.clientY <= tr.bottom) {
          mobileCard = -1;
          return;
        }
      }

      for (let k = 0; k < hits.length; k++) {
        const t = hits[k];
        if (Math.hypot(cx - t.x, cy - t.y) < Math.max(14, t.r + 8)) {
          if (isTouch && mobileCard !== k) {
            mobileCard = k; // first tap: show the card
            return;
          }
          const slug = t.name === "Mercury" ? "Mercury_(planet)" : t.name;
          window.open(`https://en.wikipedia.org/wiki/${slug}`, "_blank", "noopener");
          if (isTouch) mobileCard = -1;
          return;
        }
      }
      if (isTouch) mobileCard = -1; // tap elsewhere dismisses the card

      /* Clicking the SUN: never releases a comet — three quick clicks go nova */
      if (geom && Math.hypot(cx - cur.sunX, cy - cur.sunY) < geom.sunR) {
        const nowC = performance.now();
        sunClicks.push(nowC);
        while (sunClicks.length && nowC - sunClicks[0] > 1400) sunClicks.shift();
        if (sunClicks.length >= 3 && !nova.active) {
          nova.active = true;
          nova.start = nowC;
          novaHit.fill(false);
          sunClicks.length = 0;
        }
        sunHoverT = nowC; // they got the message — stop nagging while they click
        return;
      }

      /* Empty space → release the cursor comet on an open (hyperbolic) orbit */
      if (!free.active && geom && cx >= 0 && cx <= geom.w && cy >= 0 && cy <= geom.h) {
        const [px, py] = planeOf(cx - cur.sunX, cy - cur.sunY);
        const r = Math.hypot(px, py) || 1;
        const rx = px / r, ry = py / r;
        const GM = geom.minDim * 9;
        const v = Math.sqrt((2 * GM) / r) * 1.03; // just above escape speed
        /* Aim INWARD: pick the tangential component so the hyperbolic orbit's
           perihelion grazes just outside the sun — the comet dives toward the
           star, whips around it, and escapes on the open branch. */
        const E = (v * v) / 2 - GM / r;
        const q = Math.min(r * 0.8, geom.minDim * 0.16); // perihelion, just off the sun disc
        const vPeri = Math.sqrt(2 * (E + GM / q));
        const vt = Math.min((q * vPeri) / r, v);          // tangential (planet-wise)
        const vr = -Math.sqrt(Math.max(v * v - vt * vt, 0)); // radial, sunward
        free.x = px; free.y = py;
        free.vx = rx * vr + -ry * vt;
        free.vy = ry * vr + rx * vt;
        free.active = true;
        cometRebirth = Infinity;
      }
    };
    window.addEventListener("click", onClick);

    /* Noise tile — mid-gray grain, blended soft-light over the sun */
    const noiseTile = document.createElement("canvas");
    noiseTile.width = noiseTile.height = 128;
    const nctx = noiseTile.getContext("2d");
    if (nctx) {
      const img = nctx.createImageData(128, 128);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 96;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
    }
    const noisePattern = ctx.createPattern(noiseTile, "repeat");

    /* Random drift start: fresh spot + direction on every load */
    const driftPhase = Math.random() * Math.PI * 2;
    const wobblePhase = Math.random() * Math.PI * 2;
    const driftDir = Math.random() < 0.5 ? -1 : 1;

    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      /* Quiet scene → paint at 30fps; anything kinetic → full rate */
      frameNo++;
      const fast =
        free.active ||
        ufo.active ||
        (nova.start !== 0 && now - nova.start < 8000) ||
        now - t0 < STAGGER_MS * 7 + ARRIVE_MS + TAIL_FADE_MS ||
        now - lastMove < 250;
      if (!fast && (frameNo & 1) === 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const { w, h, minDim, sunR, uiScale, orbits } = geom;
      const T = (Date.now() / 86400000 + 2440587.5 - 2451545.0) / 36525;

      /* Drift clock — freezes smoothly while a planet is hovered */
      const frameDt = lastNow ? Math.min(now - lastNow, 100) : 16;
      lastNow = now;
      driftSpeed += ((hovering ? 0 : 1) - driftSpeed) * 0.06;
      if (!reduceMotion) driftT += frameDt * driftSpeed;

      /* Sun — slow elliptical wander AROUND the centered name, never over it */
      const ang = driftDir * driftT * 0.000022 + driftPhase;
      const sunX = w * 0.5 + Math.cos(ang) * (w * 0.22 + minDim * 0.03 * Math.sin(driftT * 0.000013 + wobblePhase));
      const sunY = h * 0.44 + Math.sin(ang) * h * 0.12;
      cur.sunX = sunX;
      cur.sunY = sunY;

      /* Parallax camera — the mouse steers the vantage point.
         Up = more top-down, sideways = a few degrees of roll. */
      const inBounds = mouse.x > -9000;
      const nx = inBounds ? clamp((mouse.x / w - 0.5) * 2, -1, 1) : 0;
      const ny = inBounds ? clamp((mouse.y / h - 0.5) * 2, -1, 1) : 0;
      const tiltT = reduceMotion ? TILT : clamp(TILT - ny * 0.2, 0.3, 0.85);
      const rollT = reduceMotion ? ROLL : ROLL + nx * 6 * DEG;
      view.tilt += (tiltT - view.tilt) * 0.045;
      view.roll += (rollT - view.roll) * 0.045;

      /* Theme colors — sun color eased so theme switches glide */
      if (now - themeCache.t > 250) {
        const styles = getComputedStyle(document.documentElement);
        themeCache.ball = parseColor(styles.getPropertyValue("--ball") || "#c5d100");
        themeCache.ink = parseColor(styles.getPropertyValue("--ink") || "#242424");
        themeCache.dark = document.documentElement.classList.contains("dark");
        themeCache.t = now;
      }
      const dark = themeCache.dark;
      const target = themeCache.ball;
      for (let c = 0; c < 3; c++) sunRGB[c] += (target[c] - sunRGB[c]) * 0.08;
      const [ir, ig, ib] = themeCache.ink;
      const ink = (a: number) => `rgba(${ir},${ig},${ib},${a})`;
      const prgb = (i: number): [number, number, number] => {
        const f = dark ? 0.25 : 0;
        const [r, g, b] = planetRGB[i];
        return [mix(r, 255, f), mix(g, 255, f), mix(b, 255, f)];
      };
      const pc = (i: number, a: number) => {
        const [r, g, b] = prgb(i);
        return `rgba(${r},${g},${b},${a})`;
      };

      /* Earth's current position — reference for Earth-distance readout */
      const earthEl = elements(PLANETS[2].k, T);
      const earthV = orbitPoint(earthEl, kepler(earthEl.M, earthEl.e));

      /* Supernova shockwave radius (screen px from the sun) */
      let ringR = -1;
      if (nova.active) {
        const p = clamp((now - nova.start) / 1600, 0, 1);
        ringR = sunR + (Math.hypot(w, h) * 0.75 - sunR) * (1 - Math.pow(1 - p, 3));
        if (p >= 1) nova.active = false; // ring done; the springs keep wobbling
      }

      /* Planet states + comet trails */
      type Seg = { x1: number; y1: number; x2: number; y2: number; far: boolean; alpha: number };
      const bodies = PLANETS.map((p, i) => {
        const el = elements(p.k, T);
        const { kPx, startE } = orbits[i];
        const elapsed = now - t0 - i * STAGGER_MS;
        const arriveP = reduceMotion ? 1 : clamp(elapsed / ARRIVE_MS, 0, 1);
        const Enow = kepler(el.M, el.e);
        const delta = (((Enow - startE) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        let Edraw = Enow;
        let tailLen: number;
        if (arriveP < 1) {
          const travelled = delta * easeOutCubic(arriveP);
          Edraw = startE + travelled;
          tailLen = travelled;
        } else {
          const shrinkP = reduceMotion ? 1 : clamp((elapsed - ARRIVE_MS) / TAIL_FADE_MS, 0, 1);
          tailLen = delta + (Math.min(TAIL_RAD, delta) - delta) * easeOutCubic(shrinkP);
        }

        const v = orbitPoint(el, Edraw);
        const pos = project(v, kPx, view.tilt, view.roll);
        const depthNorm = clamp(pos.depth / el.a, -1, 1);
        const rNow = orbitPoint(el, Enow);
        const fadeIn = Math.min(1, arriveP * 2.5);

        /* Supernova push — impulse when the shockwave passes, damped spring home */
        pushV[i] -= pushD[i] * 0.014;
        pushV[i] *= 0.94;
        pushD[i] += pushV[i];
        const dScr = Math.hypot(pos.x, pos.y) || 1;
        if (nova.active && !novaHit[i] && ringR >= dScr) {
          novaHit[i] = true;
          pushV[i] += 22 + Math.random() * 10;
        }
        const pushX = (pos.x / dScr) * pushD[i];
        const pushY = (pos.y / dScr) * pushD[i];
        /* Trails detach while a planet is blown off its orbit — dim them */
        const trailDim = clamp(1 - Math.abs(pushD[i]) / 10, 0.1, 1);

        // Trail: from (Edraw − tailLen) to Edraw, alpha ramping toward the planet
        const segs: Seg[] = [];
        const nSeg = Math.max(6, Math.ceil((tailLen / (2 * Math.PI)) * 70));
        let prev = project(orbitPoint(el, Edraw - tailLen), kPx, view.tilt, view.roll);
        for (let j = 1; j <= nSeg; j++) {
          const cur = project(orbitPoint(el, Edraw - tailLen * (1 - j / nSeg)), kPx, view.tilt, view.roll);
          segs.push({
            x1: sunX + prev.x, y1: sunY + prev.y,
            x2: sunX + cur.x, y2: sunY + cur.y,
            far: (prev.depth + cur.depth) / 2 > 0,
            alpha: TRAIL_ALPHA * Math.pow(j / nSeg, 1.4) * fadeIn * trailDim,
          });
          prev = cur;
        }

        return {
          p, i, segs,
          plx: v.x * kPx, // plane-space coords, for visiting spacecraft
          ply: v.y * kPx,
          x: sunX + pos.x + pushX,
          y: sunY + pos.y + pushY,
          far: pos.depth > 0,
          r: p.pr * uiScale * (1 - 0.14 * depthNorm) * fadeIn,
          alpha: (0.9 - 0.2 * depthNorm) * fadeIn,
          au: Math.sqrt(rNow.x ** 2 + rNow.y ** 2 + rNow.z ** 2),
          auEarth: Math.hypot(rNow.x - earthV.x, rNow.y - earthV.y, rNow.z - earthV.z),
          lon: ((Math.atan2(rNow.y, rNow.x) / DEG) + 360) % 360,
          lat: Math.atan2(rNow.z, Math.hypot(rNow.x, rNow.y)) / DEG,
        };
      });

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      const strokeSegs = (b: (typeof bodies)[number], farPhase: boolean) => {
        for (const s of b.segs) {
          if (s.far !== farPhase || s.alpha < 0.006) continue;
          ctx.strokeStyle = pc(b.i, s.alpha);
          ctx.beginPath();
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
          ctx.stroke();
        }
      };

      /* Planet sprites — gradient + grain baked once per theme/layout */
      if (spritesDark !== dark) {
        planetSprites.fill(null);
        spritesDark = dark;
      }
      const buildPlanetSprite = (i: number) => {
        const baseR = PLANETS[i].pr * uiScale * 1.2; // covers depth-scale range
        const sdpr = geom.dpr;
        const cvs = document.createElement("canvas");
        cvs.width = cvs.height = Math.max(2, Math.ceil(baseR * 2 * sdpr));
        const sctx = cvs.getContext("2d");
        if (!sctx) return cvs;
        sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0);
        const [r, g, bl] = prgb(i);
        const grad = sctx.createRadialGradient(
          baseR - baseR * 0.35, baseR - baseR * 0.4, baseR * 0.1,
          baseR, baseR, baseR * 1.05
        );
        grad.addColorStop(0, `rgb(${mix(r, 255, 0.4)},${mix(g, 255, 0.4)},${mix(bl, 255, 0.4)})`);
        grad.addColorStop(0.55, `rgb(${r},${g},${bl})`);
        grad.addColorStop(1, `rgb(${mix(r, 0, 0.32)},${mix(g, 0, 0.32)},${mix(bl, 0, 0.32)})`);
        sctx.beginPath();
        sctx.arc(baseR, baseR, baseR, 0, 2 * Math.PI);
        sctx.clip();
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, baseR * 2, baseR * 2);
        if (baseR > 4) {
          const spat = sctx.createPattern(noiseTile, "repeat");
          if (spat) {
            sctx.globalCompositeOperation = "soft-light";
            sctx.globalAlpha = 0.45;
            sctx.fillStyle = spat;
            sctx.fillRect(0, 0, baseR * 2, baseR * 2);
          }
        }
        return cvs;
      };

      const drawBody = (b: (typeof bodies)[number]) => {
        if (b.r <= 0) return;
        if (!planetSprites[b.i]) planetSprites[b.i] = buildPlanetSprite(b.i);
        const half = b.r * 1.2;
        ctx.globalAlpha = clamp(b.alpha, 0, 1);
        ctx.drawImage(planetSprites[b.i] as HTMLCanvasElement, b.x - half, b.y - half, half * 2, half * 2);
        ctx.globalAlpha = 1;
        if (b.p.name === "Saturn") {
          ctx.strokeStyle = pc(b.i, b.alpha * 0.7);
          ctx.beginPath();
          ctx.ellipse(b.x, b.y, b.r * 2.1, b.r * 0.62, view.roll, 0, 2 * Math.PI);
          ctx.stroke();
        }
      };

      /* Far side → Sun → near side */
      bodies.forEach((b) => strokeSegs(b, true));
      bodies.filter((b) => b.far).forEach(drawBody);

      /* Sun — lit from the top-left vantage: highlight offset, darkened limb,
         soft-light mottling (scaled noise) + fine grain. Whites out on nova. */
      let [sr, sg, sb] = sunRGB.map(Math.round);
      const flash = nova.start ? clamp(1 - (now - nova.start) / 700, 0, 1) : 0;
      if (flash > 0) {
        sr = mix(sr, 255, flash * 0.85);
        sg = mix(sg, 255, flash * 0.85);
        sb = mix(sb, 255, flash * 0.85);
      }
      const key = `${sr},${sg},${sb},${sunR}`;
      if (!sunSprite || key !== sunKey) {
        sunKey = key;
        const sdpr = geom.dpr;
        const size = Math.ceil((sunR + 2) * 2 * sdpr);
        sunSprite = sunSprite && sunSprite.width === size ? sunSprite : document.createElement("canvas");
        sunSprite.width = sunSprite.height = size;
        const sctx = sunSprite.getContext("2d");
        if (sctx) {
          const c0 = sunR + 2;
          sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0);
          sctx.clearRect(0, 0, c0 * 2, c0 * 2);
          sctx.beginPath();
          sctx.arc(c0, c0, sunR, 0, 2 * Math.PI);
          sctx.clip();
          const grad = sctx.createRadialGradient(
            c0 - sunR * 0.35, c0 - sunR * 0.38, sunR * 0.08,
            c0, c0, sunR * 1.06
          );
          grad.addColorStop(0, `rgb(${mix(sr, 255, 0.36)},${mix(sg, 255, 0.36)},${mix(sb, 255, 0.36)})`);
          grad.addColorStop(0.55, `rgb(${sr},${sg},${sb})`);
          grad.addColorStop(1, `rgb(${mix(sr, 0, 0.3)},${mix(sg, 0, 0.3)},${mix(sb, 0, 0.3)})`);
          sctx.fillStyle = grad;
          sctx.fillRect(0, 0, c0 * 2, c0 * 2);
          const spat = sctx.createPattern(noiseTile, "repeat");
          if (spat) {
            sctx.globalCompositeOperation = "soft-light";
            sctx.globalAlpha = 0.3;
            sctx.translate(c0, c0);
            sctx.scale(6, 6);
            sctx.fillStyle = spat;
            sctx.fillRect(-sunR / 6, -sunR / 6, (sunR * 2) / 6, (sunR * 2) / 6);
            sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0);
            sctx.globalAlpha = 0.5;
            sctx.fillRect(0, 0, c0 * 2, c0 * 2);
          }
        }
      }
      ctx.drawImage(sunSprite, sunX - sunR - 2, sunY - sunR - 2, (sunR + 2) * 2, (sunR + 2) * 2);

      bodies.forEach((b) => strokeSegs(b, false));
      bodies.filter((b) => !b.far).forEach(drawBody);

      /* Supernova shockwave ring */
      if (nova.start && now - nova.start < 1600) {
        const p = (now - nova.start) / 1600;
        const rr = sunR + (Math.hypot(w, h) * 0.75 - sunR) * (1 - Math.pow(1 - p, 3));
        ctx.strokeStyle = `rgba(${sr},${sg},${sb},${(1 - p) * 0.6})`;
        ctx.lineWidth = 2 + 14 * (1 - p);
        ctx.beginPath();
        ctx.arc(sunX, sunY, rr, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      /* Publish hit targets for the click handler */
      hits.length = 0;
      for (const b of bodies) hits.push({ x: b.x, y: b.y, r: b.r, name: b.p.name });

      /* Hover — L-shaped corner markers (top-right, bottom-left) + glass card.
         On touch devices the card is tap-driven instead of hover-driven. */
      let hover: (typeof bodies)[number] | null = null;
      if (isTouch) {
        hover = mobileCard >= 0 ? bodies[mobileCard] : null;
      } else {
        let bestD = Infinity;
        for (const b of bodies) {
          const d = Math.hypot(mouse.x - b.x, mouse.y - b.y);
          if (d < Math.max(14, b.r + 8) && d < bestD) { bestD = d; hover = b; }
        }
      }
      hovering = !!hover; // pauses the drift next frame

      /* The sun is clickable too (three clicks…) — show the same cursor */
      const overSun = !isTouch && Math.hypot(mouse.x - sunX, mouse.y - sunY) < sunR;
      if (overSun) {
        if (sunHoverT < 0) sunHoverT = now;
      } else {
        sunHoverT = -1;
      }
      const wantPointer = !!hover || overSun;
      if (wantPointer !== cursorSet) {
        cursorSet = wantPointer;
        document.body.style.cursor = cursorSet ? "pointer" : "";
      }
      const tip = tipRef.current;
      if (hover) {
        const m = hover.r + 7;
        const arm = Math.max(5, hover.r * 0.9);
        ctx.strokeStyle = ink(0.55);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hover.x + m - arm, hover.y - m);
        ctx.lineTo(hover.x + m, hover.y - m);
        ctx.lineTo(hover.x + m, hover.y - m + arm);
        ctx.moveTo(hover.x - m + arm, hover.y + m);
        ctx.lineTo(hover.x - m, hover.y + m);
        ctx.lineTo(hover.x - m, hover.y + m - arm);
        ctx.stroke();
        ctx.lineWidth = 1;

        if (tip) {
          if (tipPlanet.current !== hover.i) {
            tipPlanet.current = hover.i;
            tip.innerHTML = tipHTML(hover.i);
          }
          const auEl = tip.querySelector("[data-au]") as HTMLElement | null;
          if (auEl) auEl.textContent = `${hover.au.toFixed(2)} AU`;
          const deEl = tip.querySelector("[data-de]") as HTMLElement | null;
          if (deEl) {
            const lm = hover.auEarth * 8.317;
            deEl.textContent = `${lm < 10 ? lm.toFixed(1) : lm.toFixed(0)} light-minutes`;
          }
          const coordEl = tip.querySelector("[data-coord]") as HTMLElement | null;
          if (coordEl)
            coordEl.textContent = `λ ${hover.lon.toFixed(1)}° · β ${hover.lat >= 0 ? "+" : "−"}${Math.abs(hover.lat).toFixed(1)}°`;
          tip.style.background = dark ? "rgba(36,36,36,0.55)" : "rgba(255,255,255,0.55)";
          tip.style.borderColor = dark ? "rgba(225,223,216,0.14)" : "rgba(36,36,36,0.1)";

          /* Position: prefer above-right of the planet, flip and clamp to
             stay inside the viewport */
          const cw = tip.offsetWidth;
          const chh = tip.offsetHeight;
          const off = hover.r + 18;
          let lx = hover.x + off;
          if (lx + cw > w - 12) lx = hover.x - off - cw;
          lx = clamp(lx, 12, w - cw - 12);
          let ly = hover.y - off - chh;
          if (ly < 12) ly = hover.y + off;
          ly = clamp(ly, 12, h - chh - 12);

          /* Never cover the name/subtitle — dodge vertically out of that band.
             The zone is measured at most twice a second. */
          if (!titleEl) titleEl = document.querySelector(".hero-title");
          if (titleEl) {
            if (!zoneC || now - zoneT > 500) {
              const cRect = canvas.getBoundingClientRect();
              const tR = titleEl.getBoundingClientRect();
              const sR = titleEl.nextElementSibling?.getBoundingClientRect();
              zoneC = {
                l: tR.left - cRect.left - 8,
                t: tR.top - cRect.top - 8,
                r: (sR ? Math.max(tR.right, sR.right) : tR.right) - cRect.left + 8,
                b: (sR ? Math.max(tR.bottom, sR.bottom) : tR.bottom) - cRect.top + 8,
              };
              zoneT = now;
            }
            const zone = zoneC;
            if (lx < zone.r && lx + cw > zone.l && ly < zone.b && ly + chh > zone.t) {
              const aboveY = zone.t - chh - 10;
              const belowY = zone.b + 10;
              if (hover.y < (zone.t + zone.b) / 2 && aboveY >= 12) ly = aboveY;
              else if (belowY + chh <= h - 12) ly = belowY;
              else if (aboveY >= 12) ly = aboveY;
            }
          }

          tip.style.transform = `translate(${lx}px, ${ly}px)`;
          tip.style.opacity = "1";
        }
      } else if (tip) {
        tip.style.opacity = "0";
      }

      /* Comets — both live IN the ecliptic plane: tails point away from the
         Sun in plane space and are projected through the same tilt/roll as
         the orbits, so they foreshorten exactly like the rest of the system. */
      const crv = Math.cos(view.roll);
      const srv = Math.sin(view.roll);
      const toScreen = (vx: number, vy: number): [number, number] => [
        vx * crv + vy * view.tilt * srv,
        vx * srv - vy * view.tilt * crv,
      ];
      /* Heat: 0 far from the sun → 1 skimming it (plane-space distance) */
      const heatOf = (r: number) => clamp((minDim * 0.5 - r) / (minDim * 0.32), 0, 1);

      /* On the far side of the plane the comet passes BEHIND the sun —
         clip its drawing to everything except the sun disc */
      const withSunOcclusion = (farSide: boolean, draw: () => void) => {
        if (!farSide) { draw(); return; }
        ctx.save();
        const p = new Path2D();
        p.rect(0, 0, w, h);
        p.arc(sunX, sunY, sunR, 0, 2 * Math.PI);
        ctx.clip(p, "evenodd");
        draw();
        ctx.restore();
      };

      /* (cx, cy) screen pos; (ux, uy) plane-space away-from-sun unit vector */
      const drawComet = (cxs: number, cys: number, ux: number, uy: number, L: number, nucR: number, fade = 1, heat = 0) => {
        /* Color glides from ink → ember → near white-hot as heat rises */
        const hs = heat * heat;
        const t1 = Math.min(hs * 1.6, 1);
        const t2 = Math.max(hs * 1.6 - 1, 0);
        const rC = mix(mix(ir, 224, t1), 255, t2);
        const gC = mix(mix(ig, 116, t1), 205, t2);
        const bC = mix(mix(ib, 48, t1), 140, t2);
        const col = (a: number) => `rgba(${rC},${gC},${bC},${a})`;
        /* Sizzle — slow pulse + per-frame shimmer, only when hot */
        const flick = 1 + heat * (0.22 * Math.sin(now * 0.045) + 0.18 * (Math.random() - 0.5));
        const drawTail = (angOff: number, len: number, alpha: number, width: number) => {
          const ca = Math.cos(angOff), sa = Math.sin(angOff);
          const [ex, ey] = toScreen((ux * ca - uy * sa) * len, (ux * sa + uy * ca) * len);
          const el2 = Math.hypot(ex, ey) || 1;
          const px2 = -ey / el2;
          const py2 = ex / el2;
          const g = ctx.createLinearGradient(cxs, cys, cxs + ex, cys + ey);
          g.addColorStop(0, col(alpha));
          g.addColorStop(1, col(0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(cxs + px2 * width, cys + py2 * width);
          ctx.lineTo(cxs + ex, cys + ey);
          ctx.lineTo(cxs - px2 * width, cys - py2 * width);
          ctx.closePath();
          ctx.fill();
        };
        drawTail(0, L * fade * flick, 0.38 * fade * (1 + 0.5 * heat), 2.2 + heat * 1.4);          // ion tail
        drawTail(0.24, L * 0.6 * fade * flick, 0.22 * fade * (1 + 0.5 * heat), 3.2 + heat * 1.8); // dust tail
        /* Heat glow halo around the nucleus */
        if (heat > 0.02) {
          const gr = nucR * (2.5 + 7 * heat) * flick;
          const halo = ctx.createRadialGradient(cxs, cys, 0, cxs, cys, gr);
          halo.addColorStop(0, col(0.35 * heat * fade));
          halo.addColorStop(1, col(0));
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(cxs, cys, gr, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.fillStyle = col(0.8 * fade);
        ctx.beginPath();
        ctx.arc(cxs, cys, nucR * (0.5 + 0.5 * fade) * (1 + 0.4 * heat), 0, 2 * Math.PI);
        ctx.fill();
      };

      /* Released comet — sun gravity, just above escape speed: open conic */
      if (free.active) {
        const GM = minDim * 9;
        for (let s = 0; s < 2; s++) {
          const r3 = Math.pow(Math.hypot(free.x, free.y), 3) || 1;
          free.vx -= ((GM * free.x) / r3) * 0.5;
          free.vy -= ((GM * free.y) / r3) * 0.5;
          free.x += free.vx * 0.5;
          free.y += free.vy * 0.5;
        }
        const rp = Math.hypot(free.x, free.y) || 1;
        const [fx, fy] = toScreen(free.x, free.y);
        const sxp = sunX + fx;
        const syp = sunY + fy;
        if (sxp < -250 || sxp > w + 250 || syp < -250 || syp > h + 250) {
          free.active = false;
          cometRebirth = now + 1200; // pause, then slowly grow a new one
        } else {
          /* Tail grows and the nucleus heats up as it swings near the sun */
          withSunOcclusion(free.y > 0, () =>
            drawComet(sxp, syp, free.x / rp, free.y / rp, clamp(24000 / rp, 40, 130) * uiScale, 2.8, 1, heatOf(rp))
          );
        }
      }

      /* Cursor comet — hidden while a planet is inspected or one is in flight;
         after a release it slowly regrows at the cursor */
      const fade =
        cometRebirth < 0 ? 1 : clamp((now - cometRebirth) / 2200, 0, 1);
      if (!isTouch && inBounds && !hover && !free.active && fade > 0.01 && mouse.y >= 0 && mouse.y <= h) {
        const [planeX, planeY] = planeOf(mouse.x - sunX, mouse.y - sunY);
        const dl = Math.hypot(planeX, planeY) || 1;
        comet.dx += (planeX / dl - comet.dx) * 0.08;
        comet.dy += (planeY / dl - comet.dy) * 0.08;
        const cl = Math.hypot(comet.dx, comet.dy) || 1;
        withSunOcclusion(planeY > 0, () =>
          drawComet(mouse.x, mouse.y, comet.dx / cl, comet.dy / cl, 60 * uiScale, 2.4, easeOutCubic(fade), heatOf(dl))
        );

        /* Idle hint — park the cursor and the comet tells you what it wants */
        const idleFor = now - lastMove;
        if (idleFor > 2500 && fade >= 1 && Math.hypot(mouse.x - sunX, mouse.y - sunY) > sunR + 12) {
          const a = clamp((idleFor - 2500) / 450, 0, 1) * 0.5;
          ctx.font = `700 10px ${bodyFont}`;
          try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.14em"; } catch { /* older browsers */ }
          ctx.fillStyle = ink(a);
          ctx.fillText("CLICK TO RELEASE", mouse.x + 16, mouse.y + 28);
        }
      }

      /* Touch devices get no hover — spell out the interactions once,
         after the arrival animation settles, until the first tap */
      if (isTouch && !touchHintDone) {
        const tH = now - t0 - 3200;
        if (tH > 0) {
          const a =
            Math.min(tH / 500, 1) * 0.5 * clamp(1 - (tH - 9000) / 800, 0, 1);
          if (a <= 0.005 && tH > 9000) {
            touchHintDone = true;
          } else if (a > 0.005) {
            ctx.font = `700 10px ${bodyFont}`;
            try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.14em"; } catch { /* older browsers */ }
            ctx.fillStyle = ink(a);
            ctx.textAlign = "center";
            ctx.fillText("TAP A PLANET · TAP SPACE TO LAUNCH A COMET", w / 2, h - 96);
            ctx.textAlign = "left";
          }
        }
      }

      /* Rest on the sun long enough and it starts hissing suggestions */
      if (overSun && sunHoverT > 0 && now - sunHoverT > 3000) {
        const a = clamp((now - sunHoverT - 3000) / 450, 0, 1) * 0.55;
        ctx.font = `700 10px ${bodyFont}`;
        try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.14em"; } catch { /* older browsers */ }
        ctx.fillStyle = ink(a);
        ctx.fillText("TRY CLICKSSS", mouse.x + 16, mouse.y + 28);
      }

      /* UFO flyby — the kitten respects orbital mechanics: it arrives through
         the ecliptic on a sun-bent path, parks over a random planet to scan
         it, then leaves on a proper escape trajectory. */
      const drawUfo = (x: number, y: number, tilt: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
            ctx.scale(uiScale, uiScale);
            /* Glass dome */
            ctx.beginPath();
            ctx.arc(0, -5, 12, Math.PI, 0);
            ctx.closePath();
            ctx.fillStyle = dark ? "rgba(225,223,216,0.12)" : "rgba(255,255,255,0.4)";
            ctx.fill();
            /* Kitten — grey bengal */
            const fur = dark ? "#a8a29a" : "#8f8a82";
            const marks = dark ? "#6e6a64" : "#5c5852";
            ctx.fillStyle = fur;
            ctx.beginPath();
            ctx.moveTo(-6, -12); ctx.lineTo(-4.5, -18); ctx.lineTo(-1.5, -13.5);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, -12); ctx.lineTo(4.5, -18); ctx.lineTo(1.5, -13.5);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, -9, 6, 0, 2 * Math.PI);
            ctx.fill();
            /* Bengal forehead stripes + cheek rosettes */
            ctx.strokeStyle = marks;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(-2, -14); ctx.lineTo(-1.6, -11.4);
            ctx.moveTo(0, -14.6); ctx.lineTo(0, -11.8);
            ctx.moveTo(2, -14); ctx.lineTo(1.6, -11.4);
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = marks;
            ctx.beginPath(); ctx.arc(-3.6, -7.6, 0.55, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(3.6, -7.6, 0.55, 0, 2 * Math.PI); ctx.fill();
            /* Eyes (bengal green) + nose */
            ctx.fillStyle = "#7d9a5a";
            ctx.beginPath(); ctx.arc(-2.2, -9.2, 0.9, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(2.2, -9.2, 0.9, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = marks;
            ctx.beginPath(); ctx.arc(0, -7.4, 0.5, 0, 2 * Math.PI); ctx.fill();
            /* Dome rim over the kitten */
            ctx.strokeStyle = ink(0.3);
            ctx.beginPath();
            ctx.arc(0, -5, 12, Math.PI, 0);
            ctx.stroke();
            /* Saucer */
            ctx.fillStyle = ink(0.85);
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 6.5, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = ink(0.55);
            ctx.beginPath();
            ctx.ellipse(0, 3, 14, 3.6, 0, 0, 2 * Math.PI);
            ctx.fill();
        /* Running lights — blink in the sun's color */
        for (let li = -1; li <= 1; li++) {
          const la = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(now * 0.008 + li * 2.1));
          ctx.fillStyle = `rgba(${Math.round(sunRGB[0])},${Math.round(sunRGB[1])},${Math.round(sunRGB[2])},${la})`;
          ctx.beginPath();
          ctx.arc(li * 11, li === 0 ? 3.4 : 2, 1.4, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
      };

      /* The kitten stays home on very large displays (> ~2K viewport) —
         the flyby isn't worth the extra frame cost there */
      const ufoAllowed = w * h <= 2560 * 1440;
      if (!ufoAllowed && ufo.active) {
        ufo.active = false;
        ufo.mode = 0;
        ufo.next = now + 60000;
      }
      if (!reduceMotion && ufoAllowed) {
        if (ufo.next === 0) ufo.next = now + 15000 + Math.random() * 30000;
        if (!ufo.active && now > ufo.next) {
          /* One continuous near-parabolic orbit: enter along the target
             planet's bearing (so the inbound leg sweeps past it), whip
             around the sun at low perihelion, and — as parabolic orbits
             do — exit back out the same side it came from. */
          ufo.active = true;
          ufo.start = now;
          ufo.mode = 0;
          ufo.target = Math.floor(Math.random() * PLANETS.length);
          const tgt0 = bodies[ufo.target];
          /* Conic aiming: solve the parabola's true anomaly at the entry
             radius and at the planet's radius, then rotate the entry bearing
             so the inbound leg crosses the planet's exact polar angle. */
          const rP = Math.hypot(tgt0.plx, tgt0.ply) || 1;
          const thP = Math.atan2(tgt0.ply, tgt0.plx);
          const R = Math.hypot(w, h) * 0.85;
          const GM2 = minDim * 9;
          const q = Math.min(minDim * 0.17, rP * 0.75); // perihelion, off the sun disc
          const nuE = -Math.acos(clamp((2 * q) / R - 1, -1, 1));
          const nuP = -Math.acos(clamp((2 * q) / rP - 1, -1, 1));
          const side = Math.random() < 0.5 ? -1 : 1;
          const phiE = thP - side * (nuP - nuE);
          ufo.x = Math.cos(phiE) * R;
          ufo.y = Math.sin(phiE) * R;
          const v = Math.sqrt((2 * GM2) / R) * 1.005; // a hair above parabolic
          const E2 = (v * v) / 2 - GM2 / R;
          const vPeri = Math.sqrt(2 * (E2 + GM2 / q));
          const vt = Math.min((q * vPeri) / R, v);
          const vr = -Math.sqrt(Math.max(v * v - vt * vt, 0));
          const rx2 = ufo.x / R, ry2 = ufo.y / R;
          ufo.vx = rx2 * vr - ry2 * vt * side;
          ufo.vy = ry2 * vr + rx2 * vt * side;
          ufo.psx = 0;
          ufo.wasIn = false;
          ufo.passes = 0;
        }
        if (ufo.active) {
          const el = now - ufo.start;
          const tgt = bodies[ufo.target];
          const GM2 = minDim * 9;
          for (let s = 0; s < 2; s++) {
            const r3 = Math.pow(Math.hypot(ufo.x, ufo.y), 3) || 1;
            ufo.vx -= ((GM2 * ufo.x) / r3) * 0.5;
            ufo.vy -= ((GM2 * ufo.y) / r3) * 0.5;
            ufo.x += ufo.vx * 0.5;
            ufo.y += ufo.vy * 0.5;
          }
          const ply2 = ufo.y;
          const [uox, uoy] = toScreen(ufo.x, ufo.y);
          const usx = sunX + uox;
          const usy = sunY + uoy;

          /* Scan happens on the move, whenever the target is in range */
          const scanning = Math.hypot(ufo.x - tgt.plx, ufo.y - tgt.ply) < 240 * uiScale;

          /* Mission plan: first close approach → capture burn into a bound
             ellipse (one lap around the sun); the lap returns it to the
             planet for a second scan pass; then an escape burn home. */
          if (scanning && !ufo.wasIn) {
            ufo.passes++;
            if (ufo.mode <= 1) {
              ufo.mode = 2; // capture: pure tangential, just under circular speed
              const r = Math.hypot(ufo.x, ufo.y) || 1;
              const sgn = Math.sign(ufo.x * ufo.vy - ufo.y * ufo.vx) || 1;
              const vCap = 0.85 * Math.sqrt(GM2 / r);
              ufo.vx = (-ufo.y / r) * vCap * sgn;
              ufo.vy = (ufo.x / r) * vCap * sgn;
            }
          }
          const escapeBurn = () => {
            ufo.mode = 3;
            const r = Math.hypot(ufo.x, ufo.y) || 1;
            const sp = Math.hypot(ufo.vx, ufo.vy) || 1;
            const vE = Math.sqrt((2 * GM2) / r) * 1.12;
            ufo.vx = (ufo.vx / sp) * vE;
            ufo.vy = (ufo.vy / sp) * vE;
          };
          if (!scanning && ufo.wasIn && ufo.mode === 2 && ufo.passes >= 2) escapeBurn();
          /* Safety: missed approach or an overlong visit — head home */
          if (ufo.mode !== 3 && ((ufo.mode <= 1 && el > 25000) || el > 60000)) escapeBurn();
          ufo.wasIn = scanning;

          const onScreen = usx > -120 && usx < w + 120 && usy > -120 && usy < h + 120;
          if (ufo.mode === 0 && onScreen) ufo.mode = 1; // has entered the frame
          if (((ufo.mode === 1 || ufo.mode === 3) && !onScreen) || el > 70000) {
            ufo.active = false;
            ufo.mode = 0;
            ufo.next = now + 60000 + Math.random() * 120000;
          } else {
            /* Scan beam + expanding rings on the target — mid-flight */
            if (scanning) {
              const dxB = tgt.x - usx;
              const dyB = tgt.y - usy;
              const dlB = Math.hypot(dxB, dyB) || 1;
              const pxB = -dyB / dlB;
              const pyB = dxB / dlB;
              const bw = tgt.r + 7;
              const pulse = 0.12 + 0.07 * Math.sin(now * 0.02);
              const g = ctx.createLinearGradient(usx, usy, tgt.x, tgt.y);
              g.addColorStop(0, pc(ufo.target, pulse * 1.6));
              g.addColorStop(1, pc(ufo.target, 0.03));
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.moveTo(usx + pxB * 2.5, usy + pyB * 2.5);
              ctx.lineTo(tgt.x + pxB * bw, tgt.y + pyB * bw);
              ctx.lineTo(tgt.x - pxB * bw, tgt.y - pyB * bw);
              ctx.lineTo(usx - pxB * 2.5, usy - pyB * 2.5);
              ctx.closePath();
              ctx.fill();
              const rp2 = (el % 700) / 700;
              ctx.strokeStyle = pc(ufo.target, (1 - rp2) * 0.35);
              ctx.beginPath();
              ctx.arc(tgt.x, tgt.y, tgt.r + 3 + rp2 * tgt.r * 1.6, 0, 2 * Math.PI);
              ctx.stroke();
            }
            const rot = clamp((usx - (ufo.psx || usx)) * 0.02, -0.14, 0.14);
            ufo.psx = usx;
            /* Behind the sun on the far side of the plane, like everything else */
            withSunOcclusion(ply2 > 0, () => drawUfo(usx, usy, rot));
          }
        }
      }

      if (running) raf = requestAnimationFrame(tick);
    };

    /* Pause the whole loop when the hero is scrolled away or tab hidden */
    let running = true;
    const io = new IntersectionObserver(([entry]) => {
      const vis = entry.isIntersecting;
      if (vis && !running) {
        running = true;
        lastNow = 0; // avoid a giant frame delta on resume
        raf = requestAnimationFrame(tick);
      } else if (!vis && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(container);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      if (cursorSet) document.body.style.cursor = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
      {/* Glass hover card — positioned per-frame, always kept in the viewport */}
      <div
        ref={tipRef}
        className="font-futura"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 248,
          padding: "14px 16px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(36,36,36,0.1)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 8px 32px rgba(36,36,36,0.12)",
          opacity: 0,
          transition: "opacity 220ms ease",
          pointerEvents: "none",
          willChange: "transform",
          zIndex: 11,
        }}
      />
    </div>
  );
}
