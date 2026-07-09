"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen WebGL shader overlay — position:fixed, pointer-events:none, z:9999.
 * Composites transparently over ALL page content via normal alpha (no blend-mode).
 *   • Film grain     — sparse random pixels, 20 fps cadence
 *   • Chromatic aberration — RGB fringes at all four edges
 *   • Vignette       — subtle corner darkening
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_dpr;

// Sin-free multiplicative hash — no banding at large coordinates.
float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 uv = px / u_res;

  vec4 out_color = vec4(0.0);

  // ── Film noise (20 fps cadence) — fine silver-halide grain ─────────────
  float t     = floor(u_time * 20.0);
  vec2  grain = fract(floor(px / u_dpr) / 512.0) + fract(vec2(t * 0.013, t * 0.007));
  float g     = hash(grain);
  float g2    = hash(grain + 0.5);
  float g3    = hash(grain + 0.9);
  if (g > 0.52) {
    float v = (g - 0.52) / 0.48;
    // Slightly warm tint on some grains — mimics film emulsion color cast
    vec3 grainColor = g3 > 0.65
      ? vec3(1.00, 0.97, 0.88)   // warm highlight grain
      : vec3(g2 > 0.5 ? 1.0 : 0.12); // normal light/dark grain
    out_color = mix(out_color, vec4(grainColor, 1.0), v * 0.15);
  }

  // ── Film dust — dark persistent specks, like particles on the negative ──
  // 8 independent dust particles, each with its own slow lifetime
  for (int d = 0; d < 8; d++) {
    float fd       = float(d);
    float lifetime = 0.6 + hash(vec2(fd * 0.17, 0.0)) * 1.8; // 0.6–2.4s each
    float dTime    = floor(u_time / lifetime + fd * 4.13);
    vec2  dSeed    = fract(vec2(dTime * 0.019 + fd * 0.11, dTime * 0.023 + fd * 0.43));

    // Screen position and size
    float dX     = hash(dSeed);
    float dY     = hash(dSeed + 0.1);
    float radius = (0.8 + hash(dSeed + 0.2) * 2.2) * u_dpr; // 0.8–3px

    float dist = length(px - vec2(dX * u_res.x, dY * u_res.y));
    if (dist < radius) {
      float dustA   = pow(1.0 - dist / radius, 1.8); // soft round blob
      float opacity = 0.30 + hash(dSeed + 0.3) * 0.40;
      // Slightly warm dark (like real dust — never pure black)
      out_color = mix(out_color, vec4(0.06, 0.05, 0.04, 1.0), dustA * opacity);
    }
  }

  // ── Chromatic aberration — RGB fringe at all edges ──────────────────────
  float ca  = 0.30;
  float caR = pow(max(0.0,  ca - uv.x)                 / ca,        1.2);
  float caB = pow(max(0.0,  uv.x - (1.0 - ca))         / ca,        1.2);
  float caT = pow(max(0.0, (ca * 0.5) - uv.y)          / (ca*0.5),  1.4);
  float caBt= pow(max(0.0,  uv.y - (1.0 - ca * 0.5))   / (ca*0.5),  1.4);

  out_color.r = max(out_color.r,  caR          * 0.20);
  out_color.b = max(out_color.b, (caB + caBt)  * 0.20);
  out_color.g = max(out_color.g,  caT          * 0.09);
  out_color.a = max(out_color.a, max(caR * 0.20, max((caB + caBt) * 0.20, caT * 0.09)));

  // ── Vignette ────────────────────────────────────────────────────────────
  vec2  vc  = uv * 2.0 - 1.0;
  float vig = clamp(dot(vc, vc) * 0.062, 0.0, 0.18);
  out_color = mix(out_color, vec4(0.0, 0.0, 0.0, 1.0), vig);

  gl_FragColor = clamp(out_color, 0.0, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("ViewportEffects shader error:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export default function ViewportEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vert = compile(gl, gl.VERTEX_SHADER,   VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("ViewportEffects link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1, -1, 1,
      -1, 1,  1,-1,  1, 1,
    ]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uDpr  = gl.getUniformLocation(prog, "u_dpr");

    const resize = () => {
      canvas.width  = window.innerWidth  * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes,  canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uDpr,  devicePixelRatio);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buf);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
