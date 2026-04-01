import React, { useEffect, useRef } from "react";

// --- 1. ASCII SHADING PALETTE ---
const SHADE_PALETTE = [" ", ".", ",", "-", "~", ":", ";", "=", "!", "*", "#", "$", "@", "█"];
const BACKGROUND_CHAR = " ";

function getShade(intensity: number): string {
  if (intensity <= 0) return SHADE_PALETTE[0]!;
  if (intensity >= 1) return SHADE_PALETTE[SHADE_PALETTE.length - 1]!;
  const idx = Math.floor(intensity * SHADE_PALETTE.length);
  return SHADE_PALETTE[idx]!;
}

// --- 2. VECTOR / MATRIX MATH LIBRARY ---
class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}
  add(v: Vec3): Vec3 { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v: Vec3): Vec3 { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
  mul(s: number): Vec3 { return new Vec3(this.x * s, this.y * s, this.z * s); }
  dot(v: Vec3): number { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  length(): number { return Math.sqrt(this.dot(this)); }
  normalize(): Vec3 {
    const len = this.length();
    if (len === 0) return new Vec3(0, 0, 0);
    return this.mul(1 / len);
  }
}

class Mat4 {
  m: Float32Array;
  constructor() {
    this.m = new Float32Array(16);
    this.identity();
  }
  identity(): Mat4 {
    this.m.fill(0);
    this.m[0] = 1; this.m[5] = 1; this.m[10] = 1; this.m[15] = 1;
    return this;
  }
  multiply(b: Mat4): Mat4 {
    const res = new Mat4();
    const a = this.m, bm = b.m;
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        res.m[r + c * 4] =
          a[r + 0 * 4]! * bm[0 + c * 4]! + a[r + 1 * 4]! * bm[1 + c * 4]! +
          a[r + 2 * 4]! * bm[2 + c * 4]! + a[r + 3 * 4]! * bm[3 + c * 4]!;
      }
    }
    return res;
  }
  multiplyVec(v: Vec3): Vec3 {
    const w = v.x * this.m[3]! + v.y * this.m[7]! + v.z * this.m[11]! + this.m[15]!;
    return new Vec3(
      (v.x * this.m[0]! + v.y * this.m[4]! + v.z * this.m[8]! + this.m[12]!) / w,
      (v.x * this.m[1]! + v.y * this.m[5]! + v.z * this.m[9]! + this.m[13]!) / w,
      (v.x * this.m[2]! + v.y * this.m[6]! + v.z * this.m[10]! + this.m[14]!) / w
    );
  }
  static rotationX(angle: number): Mat4 {
    const mat = new Mat4(), c = Math.cos(angle), s = Math.sin(angle);
    mat.m[5] = c; mat.m[9] = -s; mat.m[6] = s; mat.m[10] = c;
    return mat;
  }
  static rotationY(angle: number): Mat4 {
    const mat = new Mat4(), c = Math.cos(angle), s = Math.sin(angle);
    mat.m[0] = c; mat.m[8] = s; mat.m[2] = -s; mat.m[10] = c;
    return mat;
  }
  static rotationZ(angle: number): Mat4 {
    const mat = new Mat4(), c = Math.cos(angle), s = Math.sin(angle);
    mat.m[0] = c; mat.m[4] = -s; mat.m[1] = s; mat.m[5] = c;
    return mat;
  }
  static translation(x: number, y: number, z: number): Mat4 {
    const mat = new Mat4();
    mat.m[12] = x; mat.m[13] = y; mat.m[14] = z;
    return mat;
  }
  static perspective(fovTime: number, aspect: number, zNear: number, zFar: number): Mat4 {
    const mat = new Mat4();
    mat.m.fill(0);
    const fovRad = 1.0 / Math.tan((fovTime * 0.5) / 180.0 * Math.PI);
    mat.m[0] = aspect * fovRad;
    mat.m[5] = fovRad;
    mat.m[10] = zFar / (zFar - zNear);
    mat.m[11] = 1.0;
    mat.m[14] = (-zFar * zNear) / (zFar - zNear);
    return mat;
  }
}

// --- 3. 3D MESH DEFINITION & GENERATION ---
interface Triangle { v: [Vec3, Vec3, Vec3]; }
class Mesh {
  triangles: Triangle[] = [];
  addTri(v0: Vec3, v1: Vec3, v2: Vec3) { this.triangles.push({ v: [v0, v1, v2] }); }
}

function generateCrownMesh(): Mesh {
  const mesh = new Mesh();
  const numSpikes = 8;
  const segmentsPerSpike = 4;
  const numSegments = numSpikes * segmentsPerSpike;
  const baseRadius = 1.0, topRadiusBase = 1.1, heightBase = 0.5, spikeHeight = 1.5, thickness = 0.15;

  const getVertex = (r: number, id: number, h: number, isInner: boolean) => {
    const angle = (id / numSegments) * Math.PI * 2;
    const rad = isInner ? r - thickness : r;
    return new Vec3(rad * Math.cos(angle), h, rad * Math.sin(angle));
  };

  for (let i = 0; i < numSegments; i++) {
    const nextI = (i + 1) % numSegments;
    const phase0 = (i % segmentsPerSpike) / segmentsPerSpike, phase1 = (nextI % segmentsPerSpike) / segmentsPerSpike;
    const h0 = heightBase + (phase0 === 0.5 ? spikeHeight : phase0 === 0 || phase0 === 1 ? 0 : spikeHeight * 0.4);
    const h1 = heightBase + (phase1 === 0.5 ? spikeHeight : phase1 === 0 || phase1 === 1 ? 0 : spikeHeight * 0.4);
    const r0 = topRadiusBase + (phase0 === 0.5 ? 0.2 : 0), r1 = topRadiusBase + (phase1 === 0.5 ? 0.2 : 0);

    const b0Out = getVertex(baseRadius, i, -heightBase, false), b1Out = getVertex(baseRadius, nextI, -heightBase, false);
    const b0In  = getVertex(baseRadius, i, -heightBase, true), b1In  = getVertex(baseRadius, nextI, -heightBase, true);
    const t0Out = getVertex(r0, i, h0, false), t1Out = getVertex(r1, nextI, h1, false);
    const t0In  = getVertex(r0, i, h0, true), t1In  = getVertex(r1, nextI, h1, true);

    mesh.addTri(b0Out, t0Out, b1Out); mesh.addTri(t0Out, t1Out, b1Out);
    mesh.addTri(b1In, t1In, b0In);    mesh.addTri(t1In, t0In, b0In);
    mesh.addTri(b0Out, b1Out, b0In);  mesh.addTri(b1Out, b1In, b0In);
    mesh.addTri(t0Out, t0In, t1Out);  mesh.addTri(t1Out, t0In, t1In);
    
    if (phase0 === 0.5) {
      const gCenterOut = getVertex(r0 + 0.1, i, h0 + 0.2, false), gCenterIn  = getVertex(r0 - 0.1 - thickness, i, h0 + 0.2, true);
      const gTop       = getVertex(r0, i, h0 + 0.4, false),   gBottom    = getVertex(r0, i, h0, false);
      const gLeft      = getVertex(r0, i - 0.5, h0 + 0.2, false), gRight     = getVertex(r0, i + 0.5, h0 + 0.2, false);
      mesh.addTri(gTop, gRight, gCenterOut); mesh.addTri(gTop, gCenterOut, gLeft);
      mesh.addTri(gBottom, gCenterOut, gRight); mesh.addTri(gBottom, gLeft, gCenterOut);
      mesh.addTri(gTop, gCenterIn, gRight); mesh.addTri(gTop, gLeft, gCenterIn);
      mesh.addTri(gBottom, gRight, gCenterIn); mesh.addTri(gBottom, gCenterIn, gLeft);
    }
  }
  return mesh;
}

// --- 4. HIGH PERFORMANCE RASTERIZER ---
class Framebuffer {
  public width: number;
  public height: number;
  public chars: string[]; // Fast JS array of single len strings
  public zBuffer: Float32Array;

  constructor(w: number, h: number) {
    this.width = w; this.height = h;
    const len = w * h;
    this.chars = new Array(len).fill(BACKGROUND_CHAR);
    this.zBuffer = new Float32Array(len);
  }

  clear() {
    this.zBuffer.fill(10000.0);
    // Optimized block fill
    for (let i = 0; i < this.chars.length; i++) this.chars[i] = BACKGROUND_CHAR;
  }

  putPixel(x: number, y: number, z: number, char: string, forceZ = false) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = y * this.width + x;
    if (z <= this.zBuffer[idx]! || forceZ) {
      this.zBuffer[idx] = z;
      this.chars[idx] = char;
    }
  }

  drawTriangle(v0: Vec3, v1: Vec3, v2: Vec3, shade: number) {
    const screenX0 = Math.floor((v0.x + 1.0) * 0.5 * this.width);
    const screenY0 = Math.floor((v0.y + 1.0) * 0.5 * this.height);
    const screenX1 = Math.floor((v1.x + 1.0) * 0.5 * this.width);
    const screenY1 = Math.floor((v1.y + 1.0) * 0.5 * this.height);
    const screenX2 = Math.floor((v2.x + 1.0) * 0.5 * this.width);
    const screenY2 = Math.floor((v2.y + 1.0) * 0.5 * this.height);

    const minX = Math.max(0, Math.min(screenX0, screenX1, screenX2));
    const maxX = Math.min(this.width - 1, Math.max(screenX0, screenX1, screenX2));
    const minY = Math.max(0, Math.min(screenY0, screenY1, screenY2));
    const maxY = Math.min(this.height - 1, Math.max(screenY0, screenY1, screenY2));

    const area = (screenX2 - screenX0) * (screenY1 - screenY0) - (screenY2 - screenY0) * (screenX1 - screenX0);
    if (area === 0) return;

    const charStr = getShade(shade);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5, py = y + 0.5;
        let w0 = (screenX2 - screenX1) * (py - screenY1) - (screenY2 - screenY1) * (px - screenX1);
        let w1 = (screenX0 - screenX2) * (py - screenY2) - (screenY0 - screenY2) * (px - screenX2);
        let w2 = (screenX1 - screenX0) * (py - screenY0) - (screenY1 - screenY0) * (px - screenX0);

        if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) {
          w0 /= area; w1 /= area; w2 /= area;
          const z = w0 * v0.z + w1 * v1.z + w2 * v2.z;
          this.putPixel(x, y, z, charStr);
        }
      }
    }
  }

  toString(): string {
    // Ultra-fast array chunk joining
    let rows: string[] = [];
    for (let y = 0; y < this.height; y++) {
      rows.push(this.chars.slice(y * this.width, (y + 1) * this.width).join(""));
    }
    return rows.join("\n");
  }
}

// --- 5. PARTICLE SYSTEM ---
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; char: string; }
class ParticleSystem {
  particles: Particle[] = [];
  
  update(delta: number, cols: number, rows: number) {
    const targetCount = Math.floor((cols * rows) / 90);
    while (this.particles.length < targetCount) {
      this.particles.push({
        x: Math.random() * cols, y: Math.random() * rows,
        vx: (Math.random() - 0.5) * 3.0, vy: -0.2 - Math.random() * 1.5,
        life: 0, maxLife: 50 + Math.random() * 150,
        char: ["·", "+", "⋆", "`", "'"][Math.floor(Math.random() * 5)]!
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life += delta;
      p.x += (p.vx + Math.sin(p.life * 0.1) * 1.5) * delta * 0.1;
      p.y += p.vy * delta * 0.1;
      if (p.life >= p.maxLife || p.x < -2 || p.x > cols + 2 || p.y < -2) this.particles.splice(i, 1);
    }
  }

  draw(fb: Framebuffer) {
    for (const p of this.particles) fb.putPixel(Math.round(p.x), Math.round(p.y), 9000, p.char);
  }
}

// --- 6. UTILITIES ---
function measureChar(container: HTMLElement): { w: number; h: number } {
  const span = document.createElement("span");
  span.textContent = "█";
  span.style.fontFamily = container.style.fontFamily || "monospace";
  span.style.fontSize = container.style.fontSize || "12px";
  span.style.lineHeight = container.style.lineHeight || "1";
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  container.appendChild(span);
  const w = span.getBoundingClientRect().width || 7;
  const h = span.getBoundingClientRect().height || 14;
  container.removeChild(span);
  return { w, h };
}

// --- 7. REACT COMPONENT INTEGRATION ---
export function AsciiArtAnimation() {
  const preRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!preRef.current) return;
    const preEl: HTMLPreElement = preRef.current;
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loopActive = false; // We start false, let the logic boot it instantly
    let lastRenderAt = performance.now();
    let tick = 0;

    let cols = 0, rows = 0;
    let charSize = { w: 7, h: 11 };
    let fb: Framebuffer | null = null;
    let cachedMesh = generateCrownMesh();
    let particleSystem = new ParticleSystem();
    const lightDir = new Vec3(0.5, 0.5, -1.0).normalize();

    function rebuildEngineBuffer() {
      const w = Math.max(1, Math.floor(preEl.clientWidth / charSize.w));
      const h = Math.max(1, Math.floor(preEl.clientHeight / charSize.h));
      if (w === cols && h === rows && fb) return;
      cols = w; rows = h;
      fb = new Framebuffer(cols, rows);
    }

    const getProjectionMode = () => {
      const screenAspect = (cols / rows) * (charSize.w / charSize.h);
      return Mat4.perspective(80.0, screenAspect, 0.1, 100.0);
    };

    function startEngine() {
      if (!loopActive && !motionMedia.matches) {
        loopActive = true;
        lastRenderAt = performance.now();
        frameRef.current = requestAnimationFrame(engineTick);
      }
    }

    function stopEngine() {
      loopActive = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }

    function engineTick(time: number) {
      if (!loopActive) return;
      frameRef.current = requestAnimationFrame(engineTick);

      // Smooth 60fps delta calculation for liquid flow
      let delta = (time - lastRenderAt) / 16.6667; 
      if (delta > 3.0) delta = 1.0; // clamp jump from tab switches
      lastRenderAt = time;
      tick += delta;

      if (!fb) return;
      fb.clear();

      // Ensure liquid math feels smooth but slow enough to be cinematic
      const rt = tick * 0.015;

      const scaleBase = 1.0 + Math.sin(tick * 0.05) * 0.03;
      const matWorld = Mat4.translation(0.0, -0.4, 4.0)
        .multiply(Mat4.rotationX(Math.PI + Math.cos(tick*0.01)*0.1))
        .multiply(Mat4.rotationY(rt))
        .multiply(Mat4.rotationZ(Math.sin(tick*0.02)*0.15));
      const matProj = getProjectionMode();

      for (const tri of cachedMesh.triangles) {
        const v0 = matWorld.multiplyVec(tri.v[0]!.mul(scaleBase));
        const v1 = matWorld.multiplyVec(tri.v[1]!.mul(scaleBase));
        const v2 = matWorld.multiplyVec(tri.v[2]!.mul(scaleBase));

        const normal = v1.sub(v0).cross(v2.sub(v0)).normalize();
        
        // Culling
        if (normal.dot(v0.normalize()) < 0.0) {
          const luminance = Math.max(0, normal.dot(lightDir)) * 0.8 + 0.2;
          fb.drawTriangle(matProj.multiplyVec(v0), matProj.multiplyVec(v1), matProj.multiplyVec(v2), luminance);
        }
      }

      // Ambient liquid matrix array optimized
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          if (fb.zBuffer[idx] === 10000.0) {
            const fluid = Math.sin(x*0.06 + rt) * Math.cos(y*0.06 - rt) * 0.15;
            if (fluid > 0.05) fb.chars[idx] = getShade(fluid);
          }
        }
      }

      // Add "SIRIUSLY" marquee under crown
      const marquee = "     SIRIUSLY     ";
      const marqueeY = Math.floor(rows * 0.85); // Float near bottom
      const moveOffset = Math.floor(tick * 0.3) % marquee.length;
      
      for (let x = 0; x < cols; x++) {
        const tIndex = (x - Math.floor(cols/2) + moveOffset + 100 * marquee.length) % marquee.length;
        const char = marquee[tIndex]!;
        if (char !== " ") {
          // Flowing Sine wave Y offset for the text
          const waveY = marqueeY + Math.round(Math.sin(x * 0.2 + tick * 0.05) * 1.5);
          if (waveY >= 0 && waveY < rows) {
            fb.putPixel(x, waveY, 1.0, char, true); 
          }
        }
      }

      particleSystem.update(delta, cols, rows);
      particleSystem.draw(fb);

      preEl.textContent = fb.toString();
    }

    const runStateCheck = () => {
      // By skipping visibilityState check altogether and allowing requestAnimationFrame to pause natively in background,
      // it fixes the strict strict tab-switch requirement. RequestAnimationFrame handles background battery saving automatically.
      if (!motionMedia.matches) startEngine();
      else stopEngine();
    };

    const resizeObserver = new ResizeObserver(() => {
      charSize = measureChar(preEl);
      rebuildEngineBuffer();
      if (!loopActive) { lastRenderAt = performance.now(); engineTick(lastRenderAt); }
    });

    resizeObserver.observe(preEl);
    motionMedia.addEventListener("change", runStateCheck);
    
    // Boot instantly
    charSize = measureChar(preEl);
    rebuildEngineBuffer();
    runStateCheck();

    return () => {
      stopEngine();
      resizeObserver.disconnect();
      motionMedia.removeEventListener("change", runStateCheck);
    };
  }, []);

  return (
    <pre
      ref={preRef}
      className="w-full h-full m-0 p-0 overflow-hidden text-amber-500 font-bold select-none leading-[1] flex items-center justify-center bg-black"
      style={{ fontSize: "11px", fontFamily: "'Courier New', Courier, monospace" }}
      aria-hidden="true"
    />
  );
}
