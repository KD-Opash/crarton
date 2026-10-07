const TAU = Math.PI * 2;

export function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const norm = (v: number[]) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

const cross = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

function lemniscate(t: number) {
  return [2.5 * Math.cos(t), 1.18 * Math.sin(2 * t), 0.7 * Math.sin(t)];
}

function frameAt(fn: (t: number) => number[], t: number) {
  const c = fn(t),
    a = fn(t - 1e-4),
    b = fn(t + 1e-4),
    tan = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const n = norm(cross(tan, [0, 0, 1]));
  const bn = norm(cross(tan, n));
  return { c, n, b: bn };
}

function bulbR(y: number) {
  if (y > 1.4) return 0;
  if (y >= -0.35) return Math.sqrt(Math.max(0, 1 - (y - 0.4) * (y - 0.4)));
  if (y >= -0.78) {
    const k = (y + 0.78) / 0.43;
    return 0.43 + 0.23 * k * k;
  }
  if (y >= -1.22) return 0.43 + 0.035 * Math.sin((y + 0.78) * 38);
  if (y >= -1.45) {
    const k = (y + 1.45) / 0.23;
    return 0.17 + 0.26 * Math.sqrt(k);
  }
  return 0;
}

export function buildShapes(N: number, seed: number) {
  const R = mulberry(seed),
    C = Math.round(N * 0.13);
  const swarm = new Float32Array(N * 3),
    sphere = new Float32Array(N * 3),
    bulb = new Float32Array(N * 3),
    loop = new Float32Array(N * 3),
    jit = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const k = i * 3,
      copper = i < C;
    
    // swarm
    {
      const u = R(), v = R(), w = R();
      const r = Math.cbrt(u) * 1.05,
        th = v * TAU,
        ph = Math.acos(2 * w - 1);
      swarm[k] = 2.7 * r * Math.sin(ph) * Math.cos(th);
      swarm[k + 1] = 1.55 * r * Math.sin(ph) * Math.sin(th);
      swarm[k + 2] = 1.3 * r * Math.cos(ph);
    }
    jit[k] = R() * TAU;
    jit[k + 1] = R() * TAU;
    jit[k + 2] = 0.4 + R() * 0.8;

    // sphere
    {
      const n = copper ? C : N - C,
        j = copper ? i : i - C;
      const y = 1 - (j + 0.5) / n * 2,
        r = Math.sqrt(1 - y * y),
        ph = j * 2.399963;
      const rad = copper ? 0.42 : 1.42;
      sphere[k] = rad * r * Math.cos(ph);
      sphere[k + 1] = rad * y;
      sphere[k + 2] = rad * r * Math.sin(ph);
    }

    // bulb
    if (copper) {
      const t = R();
      let x, y, z;
      if (t < 0.28) {
        const side = t < 0.14 ? -1 : 1, s = R();
        x = side * 0.3;
        y = -0.5 + s * 0.75;
        z = (R() - 0.5) * 0.06;
      } else {
        const s = R();
        x = -0.3 + 0.6 * s;
        y = 0.23 + 0.14 * Math.sin(s * Math.PI * 8);
        z = 0.05 * Math.cos(s * Math.PI * 8);
      }
      bulb[k] = x * 1.15;
      bulb[k + 1] = y * 1.15;
      bulb[k + 2] = z * 1.15;
    } else {
      let y = 0, r = 0;
      for (let tries = 0; tries < 40; tries++) {
        y = -1.45 + R() * 2.85;
        r = bulbR(y);
        if (R() * 1.0 < r) break;
      }
      const ph = R() * TAU;
      bulb[k] = r * Math.cos(ph) * 1.15;
      bulb[k + 1] = y * 1.15;
      bulb[k + 2] = r * Math.sin(ph) * 1.15;
    }

    // loop (infinity)
    {
      const t = R() * TAU, f = frameAt(lemniscate, t);
      const ph = copper ? -1.6 + (R() - 0.5) * 0.22 : R() * Math.PI * 2;
      const rad = 0.3 + 0.055 * Math.cos(t * 2 + 0.5) + (copper ? 0.012 : 0);
      loop[k] = f.c[0] + (f.n[0] * Math.cos(ph) + f.b[0] * Math.sin(ph)) * rad;
      loop[k + 1] = f.c[1] + (f.n[1] * Math.cos(ph) + f.b[1] * Math.sin(ph)) * rad;
      loop[k + 2] = f.c[2] + (f.n[2] * Math.cos(ph) + f.b[2] * Math.sin(ph)) * rad;
    }
  }
  return { shapes: [swarm, sphere, bulb, loop], jit, C };
}

export const WM = { w: 1600, h: 667, u: 1600 / 720 };

function textCanvas(font: string, ls: string, text: string, y: number, color: string) {
  const c = document.createElement("canvas");
  c.width = WM.w;
  c.height = WM.h;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return c;
  x.fillStyle = color;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = font;
  try {
    (x as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = ls;
  } catch { }
  x.fillText(text, WM.w / 2, y);
  return c;
}

export function buildWordmark(N: number, C: number, seed: number, out: Float32Array) {
  if (typeof document === "undefined") return { main: null, sub: null }; // SSR guard
  
  const R = mulberry(seed), u = WM.u;
  const main = textCanvas(`600 ${172 * u}px "Plus Jakarta Sans", system-ui, sans-serif`, `${-10 * u}px`, "craton", 128 * u, "#d6d8cc");
  const sub = textCanvas(`500 ${34 * u}px "JetBrains Mono", ui-monospace, monospace`, `${11 * u}px`, "TECHNOLOGIES", 258 * u, "#e2a874");
  
  const ink = (cv: HTMLCanvasElement) => {
    const ctx = cv.getContext("2d");
    if (!ctx) return [];
    const d = ctx.getImageData(0, 0, WM.w, WM.h).data, pts = [];
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] > 140) pts.push(i >> 2);
    }
    return pts;
  };
  
  const pm = ink(main), ps = ink(sub);
  const put = (k: number, px: number) => {
    const x = (px % WM.w) + R(), y = Math.floor(px / WM.w) + R();
    out[k] = ((x - WM.w / 2) / WM.w) * 5.4;
    out[k + 1] = -((y - WM.h / 2) / WM.w) * 5.4 + 0.1;
    out[k + 2] = (R() - 0.5) * 0.03;
  };
  
  for (let i = 0; i < N; i++) {
    const k = i * 3;
    const src = i < C ? ps : pm;
    if (src.length) put(k, src[Math.floor(R() * src.length)]);
  }
  
  return { main, sub };
}

export function createParticleSprite(rgb: string) {
  if (typeof document === "undefined") return null;
  const s = document.createElement("canvas");
  s.width = s.height = 48;
  const c = s.getContext("2d");
  if (!c) return null;
  const g = c.createRadialGradient(20, 18, 2, 24, 24, 24);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.45, `rgba(${rgb},0.85)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, 48, 48);
  return s;
}

export const ease = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
