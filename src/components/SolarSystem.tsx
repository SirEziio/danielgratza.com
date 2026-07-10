"use client";

import { useEffect, useRef, useState } from "react";

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
  { name: "Pluto",   pr: 2.2, col: "#a08d7c", sym: "♇", dia: "2,377 km across — 1,483 Sněžkas stacked on top of each other", fact: "Demoted in 2006; still a planet in this house. New Horizons flew by in 2015 — it's the little diamond out there.", k: [39.48211675, -0.00031596, 0.2488273, 0.0000517, 17.14001206, 0.00004818, 238.92903833, 145.20780515, 224.06891629, -0.04062942, 110.30393684, -0.01183482] },
];

/* Real astronomical calendar — drives the ephemeris event line and showers */
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const SKY_EVENTS: [number, number, string][] = [
  [1, 3, "QUADRANTIDS PEAK"],
  [3, 20, "MARCH EQUINOX"],
  [4, 22, "LYRIDS PEAK"],
  [5, 6, "ETA AQUARIIDS PEAK"],
  [6, 21, "JUNE SOLSTICE"],
  [8, 12, "PERSEIDS PEAK"],
  [9, 22, "SEPTEMBER EQUINOX"],
  [10, 21, "ORIONIDS PEAK"],
  [12, 14, "GEMINIDS PEAK"],
  [12, 21, "DECEMBER SOLSTICE"],
];

function tipHTML(i: number, touch: boolean) {
  const p = PLANETS[i];
  const closeBtn = touch
    ? `<button data-close aria-label="Close" style="position:absolute;top:6px;right:6px;background:none;border:none;font-size:18px;line-height:1;color:var(--ink-muted);padding:8px;cursor:pointer;">×</button>`
    : "";
  const cta = touch
    ? `<a data-cta href="https://eyes.nasa.gov/apps/solar-system/#/${p.name.toLowerCase()}" target="_blank" rel="noopener"
        style="display:block;margin-top:12px;padding:10px 12px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink);border:1px solid var(--ink-faint);border-radius:8px;text-decoration:none;">
        Fly there in 3D ↗</a>`
    : "";
  return `${closeBtn}
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
    <div style="font-size:12px;line-height:1.55;color:var(--ink);border-top:1px solid var(--grid-line);padding-top:8px;margin-top:9px;">${p.fact}</div>
    ${cta}`;
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
  const infoWrapRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const [touchUI, setTouchUI] = useState(false);

  useEffect(() => {
    setTouchUI(window.matchMedia("(pointer: coarse)").matches);
  }, []);

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
    const free = { active: false, x: 0, y: 0, vx: 0, vy: 0, novaKicked: false };
    let cometRebirth = -1; // -1: cursor comet live; Infinity: in flight; else: fade-in start time

    /* Supernova state */
    const nova = { active: false, start: 0 };

    /* UFO flyby — a grey bengal kitten pays an occasional visit.
       Flies in the ecliptic plane: bent arrival, planet scan, escape orbit. */
    const ufo = {
      active: false, start: 0, next: 0, mode: 0, target: 0,
      ex: 0, ey: 0, cx: 0, cy: 0, x: 0, y: 0, vx: 0, vy: 0, psx: 0, psy: 0,
      wasIn: false, passes: 0, touched: false,
    };

    /* Shipwreck — saucer fragments + the kitten floating free (plane coords) */
    const wreck = {
      active: false, t: 0, ox: 0, oy: 0, kx: 0, ky: 0, kvx: 0, kvy: 0,
      parts: [] as { x: number; y: number; vx: number; vy: number; rot: number; vr: number; a0: number }[],
    };

    const bodyFont = getComputedStyle(document.body).fontFamily;

    /* Ephemeris state (feeds the info card, once per second) */
    let clockSec = -1;
    let clockStr = "";
    let eventLine = "";
    let showerActive = false;

    /* Meteors — occasional sporadics, frequent during real shower windows */
    const meteors: { x: number; y: number; vx: number; vy: number; born: number; life: number }[] = [];
    let nextMeteor = 0;

    /* Deep-space markers: screen positions + hover state for click-through */
    const probes = {
      nh: { x: 0, y: 0, on: false, hov: false },
      hal: { x: 0, y: 0, on: false, hov: false },
    };
    /* Supernova knocks the probes around too — damped spring per marker */
    const probePush = {
      nh: { d: 0, v: 0, hit: false },
      hal: { d: 0, v: 0, hit: false },
    };
    /* Trajectory reveal on hover, eased like planet orbits */
    const probeGlow = { nh: 0, hal: 0 };

    /* Asteroid belt — baked dot-field sprite */
    let beltSprite: HTMLCanvasElement | null = null;
    let beltDark: boolean | null = null;
    let beltDim = 0;
    let beltROut = 0;
    const novaHit: boolean[] = new Array(PLANETS.length).fill(false);
    const pushD: number[] = new Array(PLANETS.length).fill(0); // radial displacement px
    const pushV: number[] = new Array(PLANETS.length).fill(0);
    const sunClicks: number[] = [];

    /* Drift pauses (eases out) while a planet is inspected */
    let driftT = 0, lastNow = 0, driftSpeed = 1, hovering = false;

    /* Mobile: tap → card, same-planet tap → Wikipedia, card tap → close */
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let mobileCard = -1;
    let sunHintDone = false;   // one-time cryptic nudge toward the supernova
    let sunHintStart = -1;     // reveal timer — earned via Grand Tour or kitten
    const sunClickFx = { t: -1e9, n: 0 }; // escalating click feedback state
    const visited = new Set<number>();    // planets whose cards were opened

    /* Hovered planet gets its full orbit drawn — eased in and out */
    const orbitGlow: number[] = new Array(PLANETS.length).fill(0);
    let hoverIdx = -1;

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
      const targetEl = e.target as Element | null;
      /* A tap anywhere outside the info widget closes its card */
      if (infoWrapRef.current && targetEl && !infoWrapRef.current.contains(targetEl)) {
        infoWrapRef.current.classList.remove("open");
      }
      /* Taps inside the open card (touch): the CTA link navigates natively;
         anything else — including the × — closes the card */
      if (isTouch && tipRef.current && targetEl && tipRef.current.contains(targetEl)) {
        if (!targetEl.closest("[data-cta]")) mobileCard = -1;
        return;
      }
      if (targetEl?.closest?.("a, button, [role='button']")) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (let k = 0; k < hits.length; k++) {
        const t = hits[k];
        if (Math.hypot(cx - t.x, cy - t.y) < Math.max(14, t.r + 8)) {
          if (isTouch) {
            /* Touch: tap toggles the card — the CTA inside is the only link */
            mobileCard = mobileCard === k ? -1 : k;
            return;
          }
          window.open(`https://eyes.nasa.gov/apps/solar-system/#/${t.name.toLowerCase()}`, "_blank", "noopener");
          return;
        }
      }
      if (isTouch && mobileCard >= 0) {
        mobileCard = -1; // tap elsewhere just dismisses — no accidental comet
        return;
      }

      /* Deep-space markers open their mission pages */
      if (probes.nh.on && Math.hypot(cx - probes.nh.x, cy - probes.nh.y) < 16) {
        window.open("https://eyes.nasa.gov/apps/solar-system/#/sc_new_horizons", "_blank", "noopener");
        return;
      }
      if (probes.hal.on && Math.hypot(cx - probes.hal.x, cy - probes.hal.y) < 16) {
        window.open("https://science.nasa.gov/solar-system/comets/1p-halley/", "_blank", "noopener");
        return;
      }

      /* Clicking the SUN: never releases a comet — three quick clicks go nova */
      if (geom && Math.hypot(cx - cur.sunX, cy - cur.sunY) < geom.sunR) {
        const nowC = performance.now();
        sunClicks.push(nowC);
        while (sunClicks.length && nowC - sunClicks[0] > 1400) sunClicks.shift();
        sunClickFx.t = nowC;
        sunClickFx.n = sunClicks.length;
        if (sunClicks.length >= 3 && !nova.active) {
          nova.active = true;
          nova.start = nowC;
          novaHit.fill(false);
          probePush.nh.hit = false;
          probePush.hal.hit = false;
          sunClicks.length = 0;
        }
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
        free.novaKicked = false;
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
        wreck.active ||
        (nova.start !== 0 && now - nova.start < 8000) ||
        now - t0 < STAGGER_MS * (PLANETS.length - 1) + ARRIVE_MS + TAIL_FADE_MS ||
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
      let sunX = w * 0.5 + Math.cos(ang) * (w * 0.22 + minDim * 0.03 * Math.sin(driftT * 0.000013 + wobblePhase));
      let sunY = h * 0.44 + Math.sin(ang) * h * 0.12;

      /* Escalating click feedback — the wordless breadcrumb. One click:
         a faint tremor. Two: the whole system shudders and the star dims.
         Anyone who notices a pattern will try the third. */
      const fxAge = now - sunClickFx.t;
      const fxDur = sunClickFx.n >= 2 ? 550 : 380;
      let sunDim = 0;
      if (sunClickFx.n > 0 && sunClickFx.n < 3 && fxAge < fxDur) {
        const k = (1 - fxAge / fxDur) * (sunClickFx.n >= 2 ? 1 : 0.35);
        sunX += Math.sin(now * 0.09) * 4 * k;
        sunY += Math.cos(now * 0.11) * 4 * k;
        sunDim = k * (sunClickFx.n >= 2 ? 0.3 : 0.12);
      }
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

        /* Full-orbit highlight while hovered */
        orbitGlow[i] += ((i === hoverIdx ? 1 : 0) - orbitGlow[i]) * 0.12;
        let orbit: { far: { x: number; y: number }[][]; near: { x: number; y: number }[][]; glow: number } | null = null;
        if (orbitGlow[i] > 0.01) {
          const far: { x: number; y: number }[][] = [];
          const near: { x: number; y: number }[][] = [];
          let run: { x: number; y: number }[] = [];
          let runFar: boolean | null = null;
          const NO = 110;
          for (let j = 0; j <= NO; j++) {
            const pt = project(orbitPoint(el, (j / NO) * 2 * Math.PI), kPx, view.tilt, view.roll);
            const isFar = pt.depth > 0;
            if (runFar === null) runFar = isFar;
            if (isFar !== runFar) {
              run.push(pt);
              (runFar ? far : near).push(run);
              run = [pt];
              runFar = isFar;
            } else {
              run.push(pt);
            }
          }
          if (run.length > 1 && runFar !== null) (runFar ? far : near).push(run);
          orbit = { far, near, glow: orbitGlow[i] };
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
          p, i, segs, orbit,
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

      /* Trail strokes batched by quantized alpha — the alpha ramp is
         monotonic along the tail, so buckets are contiguous and ~6 strokes
         replace up to 70 per planet */
      const strokeSegs = (b: (typeof bodies)[number], farPhase: boolean) => {
        let bucket = -1;
        let open = false;
        let lx = NaN;
        let ly = NaN;
        for (const s of b.segs) {
          if (s.far !== farPhase || s.alpha < 0.006) continue;
          const q = Math.ceil(s.alpha * 16) / 16;
          if (q !== bucket) {
            if (open) ctx.stroke();
            bucket = q;
            ctx.strokeStyle = pc(b.i, q);
            ctx.beginPath();
            open = true;
            ctx.moveTo(s.x1, s.y1);
          } else if (s.x1 !== lx || s.y1 !== ly) {
            ctx.moveTo(s.x1, s.y1); // occlusion gap — don't bridge it
          }
          ctx.lineTo(s.x2, s.y2);
          lx = s.x2;
          ly = s.y2;
        }
        if (open) ctx.stroke();
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
        /* Grand Tour marker — a faint ring on every planet already met */
        if (visited.has(b.i)) {
          ctx.strokeStyle = pc(b.i, 0.3 * clamp(b.alpha, 0, 1));
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r + 3.5, 0, 2 * Math.PI);
          ctx.stroke();
        }
        if (b.p.name === "Saturn") {
          ctx.strokeStyle = pc(b.i, b.alpha * 0.7);
          ctx.beginPath();
          ctx.ellipse(b.x, b.y, b.r * 2.1, b.r * 0.62, view.roll, 0, 2 * Math.PI);
          ctx.stroke();
        }
      };

      /* Asteroid belt — baked once, one drawImage per frame.
         Drawn beneath everything so planets/trails pass over it. */
      if (beltDark !== dark || beltDim !== minDim || !beltSprite) {
        beltDark = dark;
        beltDim = minDim;
        const [br, bg, bb] = themeCache.ink;
        const sq0 = Math.sqrt(PLANETS[0].k[0]);
        const sq7 = Math.sqrt(PLANETS[7].k[0]);
        const Rof = (a: number) =>
          minDim * 0.185 + (minDim * 0.47 - minDim * 0.185) * ((Math.sqrt(a) - sq0) / (sq7 - sq0));
        beltROut = Rof(3.4) + 3;
        const bs = document.createElement("canvas");
        const bdpr = geom.dpr;
        bs.width = bs.height = Math.ceil(beltROut * 2 * bdpr);
        const bctx = bs.getContext("2d");
        if (bctx) {
          bctx.setTransform(bdpr, 0, 0, bdpr, 0, 0);
          let seed = 12345;
          const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
          for (let i = 0; i < 320; i++) {
            const rr = Rof(2.1 + rnd() * 1.25);
            const aa = rnd() * 2 * Math.PI;
            bctx.fillStyle = `rgba(${br},${bg},${bb},${0.12 + rnd() * 0.25})`;
            const sz = 0.5 + rnd() * 0.7;
            bctx.fillRect(beltROut + Math.cos(aa) * rr, beltROut + Math.sin(aa) * rr, sz, sz);
          }
        }
        beltSprite = bs;
      }
      {
        const jdB = T * 36525 + 2451545;
        const beltSpin = (((jdB - 2451545) / (4.6 * 365.25)) * 2 * Math.PI) % (2 * Math.PI);
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(view.roll);
        ctx.scale(1, -view.tilt);
        ctx.rotate(beltSpin);
        if (beltSprite) ctx.drawImage(beltSprite, -beltROut, -beltROut, beltROut * 2, beltROut * 2);
        ctx.restore();
      }

      /* Hovered planet's full orbit — hairline in its own color */
      const strokeOrbit = (b: (typeof bodies)[number], farPhase: boolean) => {
        if (!b.orbit) return;
        ctx.strokeStyle = pc(b.i, 0.22 * b.orbit.glow);
        ctx.beginPath();
        for (const run of farPhase ? b.orbit.far : b.orbit.near) {
          ctx.moveTo(sunX + run[0].x, sunY + run[0].y);
          for (let j = 1; j < run.length; j++) ctx.lineTo(sunX + run[j].x, sunY + run[j].y);
        }
        ctx.stroke();
      };

      /* Far side → Sun → near side */
      bodies.forEach((b) => strokeOrbit(b, true));
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
      if (sunDim > 0) ctx.globalAlpha = 1 - sunDim * (0.7 + 0.3 * Math.sin(now * 0.06));
      ctx.drawImage(sunSprite, sunX - sunR - 2, sunY - sunR - 2, (sunR + 2) * 2, (sunR + 2) * 2);
      ctx.globalAlpha = 1;

      bodies.forEach((b) => strokeOrbit(b, false));
      bodies.forEach((b) => strokeSegs(b, false));
      bodies.filter((b) => !b.far).forEach(drawBody);

      /* New Horizons — the real probe, on its real escape trajectory.
         Direction is essentially fixed (toward Sagittarius); distance grows
         ~2.95 AU/year. Linear extrapolation is accurate for decades. */
      {
        const jdNow = Date.now() / 86400000 + 2440587.5;
        const rAU = 61.0 + (jdNow - 2461041.5) * (2.95 / 365.25); // 61 AU on 2026-01-01
        const lonP = 293.2 * DEG;
        const latP = 1.2 * DEG;
        const vP = {
          x: Math.cos(latP) * Math.cos(lonP) * rAU,
          y: Math.cos(latP) * Math.sin(lonP) * rAU,
          z: Math.sin(latP) * rAU,
        };
        const s0 = Math.sqrt(PLANETS[0].k[0]);
        const s7 = Math.sqrt(PLANETS[7].k[0]);
        const Rpx = minDim * 0.185 + (minDim * 0.47 - minDim * 0.185) * ((Math.sqrt(rAU) - s0) / (s7 - s0));
        const posP = project(vP, Rpx / rAU, view.tilt, view.roll);
        let px3 = sunX + posP.x;
        let py3 = sunY + posP.y;
        /* Shockwave push + spring home */
        {
          const pp = probePush.nh;
          pp.v -= pp.d * 0.014;
          pp.v *= 0.94;
          pp.d += pp.v;
          const dSun = Math.hypot(px3 - sunX, py3 - sunY) || 1;
          if (nova.active && !pp.hit && ringR >= dSun) {
            pp.hit = true;
            pp.v += 22 + Math.random() * 10;
          }
          px3 += ((px3 - sunX) / dSun) * pp.d;
          py3 += ((py3 - sunY) / dSun) * pp.d;
        }
        const pFade = clamp((now - t0 - (STAGGER_MS * PLANETS.length + 600)) / 1500, 0, 1);
        probes.nh.on = false;
        if (pFade > 0.01 && px3 > -40 && px3 < w + 40 && py3 > -20 && py3 < h + 20) {
          probes.nh.on = true;
          probes.nh.x = px3;
          probes.nh.y = py3;
          probes.nh.hov = !isTouch && Math.hypot(mouse.x - px3, mouse.y - py3) < 16;
          /* Trajectory — the long straight road out, dashed */
          probeGlow.nh += ((probes.nh.hov ? 1 : 0) - probeGlow.nh) * 0.12;
          if (probeGlow.nh > 0.01) {
            ctx.strokeStyle = ink(0.3 * probeGlow.nh);
            ctx.setLineDash([5, 6]);
            ctx.beginPath();
            let first = true;
            for (let rr = 30; rr <= 110; rr += 8) {
              const kk =
                (minDim * 0.185 + (minDim * 0.47 - minDim * 0.185) * ((Math.sqrt(rr) - s0) / (s7 - s0))) / rr;
              const pt = project({ x: vP.x / rAU * rr, y: vP.y / rAU * rr, z: vP.z / rAU * rr }, kk, view.tilt, view.roll);
              if (first) {
                ctx.moveTo(sunX + pt.x, sunY + pt.y);
                first = false;
              } else {
                ctx.lineTo(sunX + pt.x, sunY + pt.y);
              }
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }
          const a = 0.8 * pFade;
          const rv = Math.hypot(posP.x, posP.y) || 1;
          const uxp = posP.x / rv;
          const uyp = posP.y / rv;
          /* Tiny wake pointing back toward the sun it left behind */
          ctx.strokeStyle = ink(a * 0.4);
          ctx.beginPath();
          ctx.moveTo(px3 - uxp * 5, py3 - uyp * 5);
          ctx.lineTo(px3 - uxp * 13, py3 - uyp * 13);
          ctx.stroke();
          /* The probe — a small diamond */
          ctx.save();
          ctx.translate(px3, py3);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = ink(a);
          ctx.fillRect(-1.7, -1.7, 3.4, 3.4);
          ctx.restore();
          /* Name always; the numbers only when inspected */
          ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = ink(probes.nh.hov ? a * 0.8 : a * 0.5);
          ctx.fillText("NEW HORIZONS", px3, py3 + 16);
          if (probes.nh.hov) {
            ctx.fillStyle = ink(0.6);
            ctx.fillText(
              `${rAU.toFixed(2)} AU · ${((rAU * 8.317) / 60).toFixed(1)} LIGHT-HOURS FROM THE SUN`,
              px3,
              py3 + 28
            );
          }
          ctx.textAlign = "left";
        }
      }

      /* 1P/Halley — past its 2023 aphelion, now genuinely falling back
         toward us for the 2061 perihelion. High-e Kepler solved live. */
      {
        const jdNow = Date.now() / 86400000 + 2440587.5;
        const eH = 0.96714;
        const Mh = ((((jdNow - 2446467.4) / 27510) * 2 * Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        let Eh = Math.PI;
        for (let i = 0; i < 14; i++) Eh += (Mh - (Eh - eH * Math.sin(Eh))) / (1 - eH * Math.cos(Eh));
        const elH: El = { a: 17.834, e: eH, I: 162.262 * DEG, O: 58.42 * DEG, w: 111.332 * DEG, M: 0 };
        const vH = orbitPoint(elH, Eh);
        const rH = Math.hypot(vH.x, vH.y, vH.z) || 1;
        const sq0 = Math.sqrt(PLANETS[0].k[0]);
        const sq7 = Math.sqrt(PLANETS[7].k[0]);
        const RH = minDim * 0.185 + (minDim * 0.47 - minDim * 0.185) * ((Math.sqrt(rH) - sq0) / (sq7 - sq0));
        const posH = project(vH, RH / rH, view.tilt, view.roll);
        let hx3 = sunX + posH.x;
        let hy3 = sunY + posH.y;
        /* Shockwave push + spring home */
        {
          const pp = probePush.hal;
          pp.v -= pp.d * 0.014;
          pp.v *= 0.94;
          pp.d += pp.v;
          const dSun = Math.hypot(hx3 - sunX, hy3 - sunY) || 1;
          if (nova.active && !pp.hit && ringR >= dSun) {
            pp.hit = true;
            pp.v += 22 + Math.random() * 10;
          }
          hx3 += ((hx3 - sunX) / dSun) * pp.d;
          hy3 += ((hy3 - sunY) / dSun) * pp.d;
        }
        const hFade = clamp((now - t0 - (STAGGER_MS * PLANETS.length + 1200)) / 1500, 0, 1);
        probes.hal.on = false;
        if (hFade > 0.01 && hx3 > -40 && hx3 < w + 40 && hy3 > -20 && hy3 < h + 20) {
          probes.hal.on = true;
          probes.hal.x = hx3;
          probes.hal.y = hy3;
          probes.hal.hov = !isTouch && Math.hypot(mouse.x - hx3, mouse.y - hy3) < 16;
          /* Trajectory — the whole 75-year ellipse, radially compressed
             like everything else on this map, dashed */
          probeGlow.hal += ((probes.hal.hov ? 1 : 0) - probeGlow.hal) * 0.12;
          if (probeGlow.hal > 0.01) {
            ctx.strokeStyle = ink(0.3 * probeGlow.hal);
            ctx.setLineDash([5, 6]);
            ctx.beginPath();
            const NO2 = 130;
            for (let j = 0; j <= NO2; j++) {
              const vO = orbitPoint(elH, (j / NO2) * 2 * Math.PI);
              const rO = Math.hypot(vO.x, vO.y, vO.z) || 1;
              const kO =
                (minDim * 0.185 + (minDim * 0.47 - minDim * 0.185) * ((Math.sqrt(rO) - sq0) / (sq7 - sq0))) / rO;
              const pt = project(vO, kO, view.tilt, view.roll);
              if (j === 0) ctx.moveTo(sunX + pt.x, sunY + pt.y);
              else ctx.lineTo(sunX + pt.x, sunY + pt.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }
          const a = 0.7 * hFade;
          const rv2 = Math.hypot(posH.x, posH.y) || 1;
          /* Micro-tail away from the sun, as ever */
          ctx.strokeStyle = ink(a * 0.45);
          ctx.beginPath();
          ctx.moveTo(hx3 + (posH.x / rv2) * 3, hy3 + (posH.y / rv2) * 3);
          ctx.lineTo(hx3 + (posH.x / rv2) * 9, hy3 + (posH.y / rv2) * 9);
          ctx.stroke();
          ctx.fillStyle = ink(a);
          ctx.beginPath();
          ctx.arc(hx3, hy3, 1.6, 0, 2 * Math.PI);
          ctx.fill();
          /* Name always; the story only when inspected */
          ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = ink(probes.hal.hov ? a * 0.8 : a * 0.5);
          ctx.fillText("1P/HALLEY", hx3, hy3 + 14);
          if (probes.hal.hov) {
            ctx.fillStyle = ink(0.6);
            ctx.fillText(`${rH.toFixed(2)} AU · FALLING SUNWARD SINCE DEC 2023`, hx3, hy3 + 26);
            ctx.fillText("INBOUND · PERIHELION 2061", hx3, hy3 + 38);
          }
          ctx.textAlign = "left";
        }
      }

      /* Meteors — sporadic normally, busy during real shower windows */
      if (!reduceMotion) {
        if (nextMeteor === 0) nextMeteor = now + 20000 + Math.random() * 30000;
        if (now > nextMeteor && meteors.length < 4) {
          const ang = 0.55 + Math.random() * 0.5; // down-and-right-ish
          const sp = 11 + Math.random() * 7;
          meteors.push({
            x: Math.random() * w * 0.9,
            y: Math.random() * h * 0.45,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
            born: now,
            life: 380 + Math.random() * 220,
          });
          nextMeteor = now + (showerActive ? 2500 + Math.random() * 4500 : 90000 + Math.random() * 60000);
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          const age = now - m.born;
          if (age > m.life) {
            meteors.splice(i, 1);
            continue;
          }
          const step = frameDt / 16.7;
          m.x += m.vx * step;
          m.y += m.vy * step;
          const aM = Math.sin(Math.PI * (age / m.life)) * 0.55;
          ctx.strokeStyle = ink(aM);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 5, m.y - m.vy * 5);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }

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
      hovering = !!hover || probes.nh.hov || probes.hal.hov; // pauses the drift next frame
      hoverIdx = hover ? hover.i : -1; // orbit highlight next frame
      if (hover) visited.add(hover.i); // Grand Tour progress

      /* The sun is clickable too (three clicks…) — show the same cursor */
      const overSun = !isTouch && Math.hypot(mouse.x - sunX, mouse.y - sunY) < sunR;
      const wantPointer = !!hover || overSun || probes.nh.hov || probes.hal.hov;
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
            tip.innerHTML = tipHTML(hover.i, isTouch);
          }
          tip.style.pointerEvents = isTouch ? "auto" : "none";
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
        tip.style.pointerEvents = "none"; // an invisible card must not eat taps
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
         clip its drawing to everything except the sun disc. The clip is
         expensive on Safari/Firefox, so it's applied only when the drawn
         object can actually overlap the disc. */
      const withSunOcclusion = (farSide: boolean, x: number, y: number, reach: number, draw: () => void) => {
        if (!farSide || Math.hypot(x - sunX, y - sunY) > sunR + reach) {
          draw();
          return;
        }
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
        /* A passing supernova shockwave blasts the comet outward */
        if (nova.active && !free.novaKicked && ringR >= Math.hypot(fx, fy)) {
          free.novaKicked = true;
          free.vx += (free.x / rp) * 16;
          free.vy += (free.y / rp) * 16;
        }
        if (sxp < -250 || sxp > w + 250 || syp < -250 || syp > h + 250) {
          free.active = false;
          cometRebirth = now + 1200; // pause, then slowly grow a new one
        } else {
          /* Tail grows and the nucleus heats up as it swings near the sun */
          withSunOcclusion(free.y > 0, sxp, syp, clamp(24000 / rp, 40, 130) * uiScale + 40, () =>
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
        withSunOcclusion(planeY > 0, mouse.x, mouse.y, 60 * uiScale + 40, () =>
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
          try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px"; } catch { /* older browsers */ }
        }
      }

      /* The secret hint — earned, never given. Two ways to unlock the rim
         crawl: the Grand Tour (open all eight planet cards in one visit),
         or catch the kitten — it whispers. Skipped if found unaided. */
      if (!sunHintDone) {
        if (nova.start !== 0) {
          sunHintDone = true;
        } else {
          if (sunHintStart < 0 && visited.size >= PLANETS.length) {
            sunHintStart = now; // the system rewards those who met everyone
          }
          const tS = sunHintStart < 0 ? -1 : now - sunHintStart;
          if (tS > 8000) {
            sunHintDone = true;
          } else if (tS > 0) {
            const a =
              Math.min(tS / 900, 1) * 0.28 * clamp(1 - (tS - 7000) / 1000, 0, 1);
            if (a > 0.005) {
              const text = isTouch ? "THREE TAPS TO OBLIVION" : "THREE CLICKS TO OBLIVION";
              const R2 = sunR + 11;
              const drift = Math.PI / 2 + tS * 0.00006; // slow crawl along the rim
              ctx.font = `700 9px ${bodyFont}`;
              ctx.fillStyle = ink(a);
              ctx.textAlign = "center";
              const gap = 1.6;
              const widths: number[] = [];
              let total = -gap;
              for (const ch of text) {
                const cw2 = ctx.measureText(ch).width;
                widths.push(cw2);
                total += cw2 + gap;
              }
              let dist = 0;
              for (let ci = 0; ci < text.length; ci++) {
                const aC = drift + (total / 2 - dist - widths[ci] / 2) / R2;
                ctx.save();
                ctx.translate(sunX + Math.cos(aC) * R2, sunY + Math.sin(aC) * R2);
                ctx.rotate(aC - Math.PI / 2);
                ctx.fillText(text[ci], 0, 0);
                ctx.restore();
                dist += widths[ci] + gap;
              }
              ctx.textAlign = "left";
            }
          }
        }
      }

      /* Ephemeris data — feeds the info card + shower detection, 1 Hz */
      {
        const sec = Math.floor(Date.now() / 1000);
        if (sec !== clockSec) {
          clockSec = sec;
          clockStr = new Date().toISOString().slice(0, 16).replace("T", " ");
          /* Next real sky event — and live shower detection */
          let best: { t: number; label: string } | null = null;
          let active: string | null = null;
          const yNow = new Date().getUTCFullYear();
          for (const [m, d, label] of SKY_EVENTS) {
            for (const yy of [yNow, yNow + 1]) {
              const t2 = Date.UTC(yy, m - 1, d);
              const dd = (t2 - Date.now()) / 86400000;
              if (label.includes("PEAK") && Math.abs(dd) <= 3) active = label;
              if (dd >= -0.5 && (!best || t2 < best.t)) best = { t: t2, label: `${label} · ${MONTHS[m - 1]} ${d}` };
            }
          }
          showerActive = !!active;
          eventLine = active
            ? `NOW // ${active.replace(" PEAK", "")} ACTIVE`
            : `NEXT // ${best ? best.label : "—"}`;
          const card = infoCardRef.current;
          if (card) {
            const jd = Date.now() / 86400000 + 2440587.5;
            const l2 = card.querySelector("[data-l2]");
            if (l2) l2.textContent = `JD ${jd.toFixed(5)} // ${clockStr} UTC`;
            const l4 = card.querySelector("[data-l4]");
            if (l4) l4.textContent = eventLine;
          }
        }
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

      /* The kitten flies on all displays again — after capping the raster
         size, its vector cost is negligible even at 4K */
      if (!reduceMotion) {
        if (ufo.next === 0) ufo.next = now + 45000 + Math.random() * 45000;
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
          ufo.touched = false;
        }
        if (ufo.active) {
          const tgt = bodies[ufo.target];
          const GM2 = minDim * 9;
          /* Cursor vs kitten: a LOADED comet destroys the ship; an empty
             hand (mid-reload) catches it — held in place, reload paused,
             until the cursor lets go. */
          const cometFade2 = cometRebirth < 0 ? 1 : clamp((now - cometRebirth) / 2200, 0, 1);
          const nearCursor =
            !isTouch && ufo.psx !== 0 &&
            Math.hypot(mouse.x - ufo.psx, mouse.y - ufo.psy) < 36 * uiScale;

          /* Boom — saucer shatters, kitten floats out. Optionally the blast
             pushes everything radially away (supernova case). */
          const blowUpShip = (outward: boolean) => {
            wreck.active = true;
            wreck.t = now;
            wreck.ox = ufo.x;
            wreck.oy = ufo.y;
            wreck.kx = ufo.x;
            wreck.ky = ufo.y;
            const rr0 = Math.hypot(ufo.x, ufo.y) || 1;
            const rux = ufo.x / rr0, ruy = ufo.y / rr0;
            wreck.kvx = outward ? rux * 1.1 : (Math.random() - 0.5) * 0.5;
            wreck.kvy = outward ? ruy * 1.1 : 0.45;
            wreck.parts = Array.from({ length: 3 }, (_, j) => ({
              x: ufo.x, y: ufo.y,
              vx: (Math.random() - 0.5) * 1.6 + (outward ? rux * 1.4 : 0),
              vy: (Math.random() - 0.5) * 1.6 + (outward ? ruy * 1.4 : 0),
              rot: Math.random() * Math.PI,
              vr: (Math.random() - 0.5) * 0.06,
              a0: j * 2.1,
            }));
            ufo.active = false;
            ufo.mode = 0;
            ufo.next = now + 90000 + Math.random() * 120000; // kitten needs a new ship
          };

          if (nearCursor && cometFade2 >= 1) {
            blowUpShip(false);
            cometRebirth = now + 1200; // the comet was spent on the deed
          } else if (
            nova.active && ufo.psx !== 0 &&
            ringR >= Math.hypot(ufo.psx - sunX, ufo.psy - sunY)
          ) {
            /* The shockwave caught the flyby — no ship survives a supernova */
            blowUpShip(true);
          } else if (
            free.active &&
            Math.hypot(free.x - ufo.x, free.y - ufo.y) < 26 * uiScale
          ) {
            /* Direct comet strike — the rock wins, and keeps flying */
            blowUpShip(false);
          } else {
          const held = nearCursor; // only reachable when the comet isn't loaded
          const el = now - ufo.start;
          if (held) {
            ufo.start += frameDt; // mission clock freezes in your grip
            if (Number.isFinite(cometRebirth) && cometRebirth > 0) cometRebirth += frameDt; // reload pauses
            if (!sunHintDone && sunHintStart < 0) sunHintStart = now; // the kitten whispers the secret
            ufo.touched = true; // …but a held scanner is an interfered-with scanner
          } else {
            for (let s = 0; s < 2; s++) {
              const r3 = Math.pow(Math.hypot(ufo.x, ufo.y), 3) || 1;
              ufo.vx -= ((GM2 * ufo.x) / r3) * 0.5;
              ufo.vy -= ((GM2 * ufo.y) / r3) * 0.5;
              ufo.x += ufo.vx * 0.5;
              ufo.y += ufo.vy * 0.5;
            }
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
          if (!scanning && ufo.wasIn && ufo.mode === 2 && ufo.passes >= 2) {
            /* The scanner scanned — a mission completed untouched broadcasts
               its findings to whoever watched the whole thing */
            if (!ufo.touched && !sunHintDone && sunHintStart < 0 && nova.start === 0) sunHintStart = now;
            escapeBurn();
          }
          /* Safety: missed approach or an overlong visit — head home */
          if (ufo.mode !== 3 && ((ufo.mode <= 1 && el > 25000) || el > 60000)) escapeBurn();
          ufo.wasIn = scanning;

          const onScreen = usx > -120 && usx < w + 120 && usy > -120 && usy < h + 120;
          if (ufo.mode === 0 && onScreen) ufo.mode = 1; // has entered the frame
          if (((ufo.mode === 1 || ufo.mode === 3) && !onScreen) || el > 70000) {
            ufo.active = false;
            ufo.mode = 0;
            ufo.next = now + 120000 + Math.random() * 90000;
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
            let rot = clamp((usx - (ufo.psx || usx)) * 0.02, -0.14, 0.14);
            if (held) rot += Math.sin(now * 0.02) * 0.1; // caught — it wriggles
            ufo.psx = usx;
            ufo.psy = usy;
            /* Behind the sun on the far side of the plane, like everything else */
            withSunOcclusion(ply2 > 0, usx, usy, 40 * uiScale, () => drawUfo(usx, usy, rot));
          }
          }
        }
      }

      /* Shipwreck aftermath — tumbling hull shards, kitten adrift */
      if (wreck.active) {
        const age = now - wreck.t;
        if (age > 5200) {
          wreck.active = false;
        } else {
          /* Blast ring, briefly */
          if (age < 400) {
            const fp = age / 400;
            const [bx2, by2] = toScreen(wreck.ox, wreck.oy);
            ctx.strokeStyle = ink((1 - fp) * 0.5);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sunX + bx2, sunY + by2, (8 + fp * 34) * uiScale, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
          /* Hull shards */
          const pa = clamp(1 - age / 2600, 0, 1);
          for (const part of wreck.parts) {
            part.x += part.vx;
            part.y += part.vy;
            part.rot += part.vr;
            if (pa > 0.01) {
              const [sx2, sy2] = toScreen(part.x, part.y);
              ctx.strokeStyle = ink(0.8 * pa);
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.ellipse(sunX + sx2, sunY + sy2, 20 * uiScale, 6 * uiScale, part.rot, part.a0, part.a0 + 1.4);
              ctx.stroke();
              ctx.lineWidth = 1;
            }
          }
          /* The kitten — unharmed, unhurried, slowly spinning into the void */
          wreck.kx += wreck.kvx;
          wreck.ky += wreck.kvy;
          const ka = clamp(1 - Math.max(0, age - 2200) / 3000, 0, 1);
          if (ka > 0.01) {
            const [kx2, ky2] = toScreen(wreck.kx, wreck.ky);
            const kr = age * 0.0005 + Math.sin(age * 0.002) * 0.3;
            ctx.save();
            ctx.translate(sunX + kx2, sunY + ky2);
            ctx.rotate(kr);
            ctx.scale(uiScale, uiScale);
            ctx.globalAlpha = ka;
            const fur = dark ? "#a8a29a" : "#8f8a82";
            const marks = dark ? "#6e6a64" : "#5c5852";
            ctx.fillStyle = fur;
            ctx.beginPath();
            ctx.moveTo(-6, -3); ctx.lineTo(-4.5, -9); ctx.lineTo(-1.5, -4.5);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, -3); ctx.lineTo(4.5, -9); ctx.lineTo(1.5, -4.5);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = marks;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(-2, -5); ctx.lineTo(-1.6, -2.4);
            ctx.moveTo(0, -5.6); ctx.lineTo(0, -2.8);
            ctx.moveTo(2, -5); ctx.lineTo(1.6, -2.4);
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = marks;
            ctx.beginPath(); ctx.arc(-3.6, 1.4, 0.55, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(3.6, 1.4, 0.55, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = "#7d9a5a";
            ctx.beginPath(); ctx.arc(-2.2, -0.2, 0.9, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(2.2, -0.2, 0.9, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = marks;
            ctx.beginPath(); ctx.arc(0, 1.6, 0.5, 0, 2 * Math.PI); ctx.fill();
            ctx.restore();
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
      {/* Ephemeris info — quiet icon, glassy card on hover/tap */}
      <div
        ref={infoWrapRef}
        className="ephem-info"
        style={{ position: "absolute", right: 20, bottom: 20, zIndex: 11, pointerEvents: "auto" }}
      >
        <div ref={infoCardRef} className="ephem-card">
          <div>EPHEMERIS // JPL APPROXIMATE ELEMENTS 1800–2050</div>
          <div data-l2 />
          <div>PLANETARY POSITIONS: REAL-TIME</div>
          <div data-l4 />
          {touchUI && (
            <div style={{ borderTop: "1px solid var(--grid-line)", marginTop: 8, paddingTop: 8 }}>
              <div>TAP A PLANET // FACTS &amp; MORE</div>
              <div>TAP EMPTY SPACE // LAUNCH A COMET</div>
            </div>
          )}
        </div>
        <button
          aria-label="About the data"
          onClick={(e) => {
            e.stopPropagation();
            infoWrapRef.current?.classList.toggle("open");
          }}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "1px solid var(--ink-faint)",
            background: "none",
            color: "var(--ink-muted)",
            font: "italic 700 12px Georgia, serif",
            cursor: "pointer",
            display: "block",
          }}
        >
          i
        </button>
      </div>
    </div>
  );
}
