"use client";

/**
 * The smoke — transition between the portfolio world and the journal.
 *
 * Cover (on click): a WebGL fragment shader renders volumetric smoke —
 * domain-warped fractal noise, the technique behind film-style CG smoke.
 * The smoke creeps in from all edges with ragged, licking tendrils (the
 * noise perturbs the advancing front), internal billow detail churns as
 * two drifting warp fields collide, and multiple shades of the target
 * color intertwine before converging on it exactly as coverage completes.
 * Navigation happens the moment the screen is opaque.
 *
 * Reveal (destination): the veil dissolves and the new page is there.
 *
 * Fallback: if WebGL is unavailable (vanishingly rare), the CSS vignette
 * and solid layers still perform a soft edge-in cover on their own.
 *
 * Safari-safe: portaled to document.body, no CSS variables in keyframes.
 * The page beneath is never animated. Respects prefers-reduced-motion.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";

/* Push happens the instant the cover completes, so the route swap cost
   is paid while the screen is already dark — not after. */
const COVER_MS = 1700;
const REVEAL_MS = 1000;
const FLAG = "journal-smoke";

const isJournal = (path: string) => path.startsWith("/journal");

const JOURNAL_BG = "#171210";

const themeBg = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark")
    ? "#242424"
    : "#e1dfd8";

/* Shade of a hex color: multiply + warm bias, clamped */
function shade(hex: string, mul: number, warm: number): string {
  const c = (i: number) =>
    Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * mul)));
  const r = Math.max(0, Math.min(255, c(1) + warm));
  const g = Math.max(0, Math.min(255, c(3) + Math.round(warm * 0.55)));
  const b = Math.max(0, Math.min(255, c(5) + Math.round(warm * 0.2)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const hexToVec3 = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

/* ── WebGL smoke shader (cover phase) ───────────────────────── */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;     // seconds
uniform float u_prog;  // 0..1 cover progress
uniform float u_mix;   // shade -> target color convergence
uniform vec3 u_tint;
uniform vec3 u_hi;
uniform vec3 u_lo;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = R * p * 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_t;

  // Two drifting warp fields; where their flows collide, the warped
  // lookup below shears and curls -- billow structure, not blobs.
  vec2 q = vec2(
    fbm(p * 2.6 + vec2(0.0, t * 0.30)),
    fbm(p * 2.6 + vec2(5.2, -t * 0.26))
  );
  float d = fbm(p * 2.6 + 3.4 * q + vec2(t * 0.14, -t * 0.11));

  // Sharper filament detail (ridged noise) woven into the density
  float fil = 1.0 - abs(2.0 * fbm(p * 5.0 + 2.0 * q - vec2(0.0, t * 0.2)) - 1.0);
  d = mix(d, d * (0.55 + 0.75 * fil), 0.5);

  // Advancing front: 0 at the borders, growing inward. The noise offsets
  // the local front, so tendrils lick ahead of the smoke body.
  vec2 b = min(uv, 1.0 - uv);
  float edge = min(b.x, b.y) * 2.0;
  float front = u_prog * 1.9;
  float local = edge + (d - 0.5) * 0.8;
  float cover = 1.0 - smoothstep(front - 0.55, front, local);

  float dens = cover * (0.42 + 0.9 * d);
  // guaranteed full fill well before the swap
  float fill = smoothstep(0.68, 0.93, u_prog);
  float alpha = clamp(dens + fill, 0.0, 1.0);
  // leading wisps stay translucent early on
  alpha *= 0.72 + 0.28 * smoothstep(0.0, 0.45, u_prog);

  // Shades intertwine along the billow detail, then settle on the target
  vec3 shadeCol = mix(u_lo, u_hi, clamp(d * 1.6 - 0.3, 0.0, 1.0));
  vec3 col = mix(shadeCol, u_tint, u_mix);

  gl_FragColor = vec4(col, alpha);
}
`;

function SmokeCanvas({ tint }: { tint: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    const gl =
      canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true }) ||
      (canvas.getContext("experimental-webgl", {
        premultipliedAlpha: false,
        alpha: true,
      }) as WebGLRenderingContext | null);
    if (!gl) return; // CSS vignette + solid still cover on their own

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("[smoke] shader:", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[smoke] link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");
    const uProg = gl.getUniformLocation(prog, "u_prog");
    const uMix = gl.getUniformLocation(prog, "u_mix");
    const uTint = gl.getUniformLocation(prog, "u_tint");
    const uHi = gl.getUniformLocation(prog, "u_hi");
    const uLo = gl.getUniformLocation(prog, "u_lo");

    gl.uniform2f(uRes, canvas.width, canvas.height);
    // Shades stay close to the destination's tone — variation, not contrast
    gl.uniform3fv(uTint, hexToVec3(tint));
    gl.uniform3fv(uHi, hexToVec3(shade(tint, 1.26, 8)));
    gl.uniform3fv(uLo, hexToVec3(shade(tint, 0.8, -3)));

    const smooth = (x: number) => {
      const c = Math.min(Math.max(x, 0), 1);
      return c * c * (3 - 2 * c);
    };

    const DUR = 1700;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const el = now - start;
      const progress = smooth(el / DUR);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, el / 1000);
      gl.uniform1f(uProg, progress);
      gl.uniform1f(uMix, smooth((el - 650) / 750)); // exact target by ~1.4s
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // stop as soon as we're opaque — free the CPU/GPU for the route swap
      if (el < DUR) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tint]);

  return <canvas ref={ref} className="jsmoke-canvas" />;
}

/* ── The hook ───────────────────────────────────────────────── */

export function useJournalSmoke() {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);

  // The handshake flag carries the smoke tint across the navigation.
  const [init] = useState(() => {
    if (typeof window === "undefined")
      return { phase: "idle" as const, tint: "#e1dfd8" };
    const v = sessionStorage.getItem(FLAG);
    return v
      ? { phase: "reveal" as const, tint: v.startsWith("#") ? v : themeBg() }
      : { phase: "idle" as const, tint: themeBg() };
  });
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">(init.phase);
  const [tint, setTint] = useState(init.tint);

  useLayoutEffect(() => {
    document.documentElement.classList.remove("smoke-active");
  }, [pathname]);

  useEffect(() => {
    if (phase !== "reveal") return;
    sessionStorage.removeItem(FLAG);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("idle");
      return;
    }
    const t = window.setTimeout(() => setPhase("idle"), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    const crossing =
      (isJournal(href) && !isJournal(pathname)) ||
      (isJournal(pathname) && !isJournal(href));
    if (!crossing) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    if (busy.current) return;
    busy.current = true;

    // Smoke takes the color of the destination's background
    const target = isJournal(href) ? JOURNAL_BG : themeBg();
    setTint(target);

    document.documentElement.classList.add("smoke-active");
    sessionStorage.setItem(FLAG, target);
    router.prefetch(href);
    setPhase("cover");
    window.setTimeout(() => router.push(href), COVER_MS);
  };

  const overlay =
    typeof document !== "undefined" && phase !== "idle"
      ? createPortal(
          <div className={`jsmoke jsmoke-${phase}`} aria-hidden>
            {phase === "cover" && (
              <div className="jsmoke-cloud">
                <div
                  className="jsmoke-vig"
                  style={{
                    background: `radial-gradient(circle closest-side, ${tint}00 30%, ${tint}80 44%, ${tint}e6 56%, ${tint} 68%)`,
                  }}
                />
                <SmokeCanvas tint={tint} />
                <div className="jsmoke-solid" style={{ background: tint }} />
              </div>
            )}

            {phase === "reveal" && (
              <div className="jsmoke-veil" style={{ background: tint }} />
            )}
          </div>,
          document.body
        )
      : null;

  return { overlay, handleNavClick };
}
