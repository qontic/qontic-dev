// 3D view of the interferometer. Same data as the 2D top view; only the drawing differs.
// Scene axes: X along the beam (z), Z across the beam (x, the grating direction), Y vertical.
// Each axis has its own scale (2 m, ±266 nm and ±0.3 mm cannot share one); labels say so.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const LEN = 20, WID = 8, HGT = 3.2; // scene extents along the beam, across it, and vertically

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

function textSprite(text, { size = 28, color = '#d6e9f2', weight = 600 } = {}) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  const w = Math.ceil(g.measureText(text).width) + 12, h = Math.ceil(size * 1.35);
  c.width = w; c.height = h;
  g.font = `${weight} ${size}px Inter, Arial, sans-serif`; g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(text, 6, h / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set((w / h) * 0.6, 0.6, 1);
  s.userData.text = text;
  return s;
}

export function mount3D(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.domElement.className = 'np-3d-canvas';
  renderer.domElement.setAttribute('aria-label', '3D view of the interferometer');
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // default view: from the front and above, at a distance that fits the whole apparatus
  const VIEW_DIR = new THREE.Vector3(-0.17, 0.42, 1).normalize(), TARGET = new THREE.Vector3(0.6, -0.6, 0);
  function fitCamera() {
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const dist = Math.max(15 / Math.tan(hfov / 2), 7.5 / Math.tan(vfov / 2));
    camera.position.copy(TARGET).addScaledVector(VIEW_DIR, dist);
    controls.target.copy(TARGET); controls.update();
  }
  let userMoved = false;
  controls.addEventListener('start', () => { userMoved = true; });

  // the |psi|^2 sheet on the horizontal mid-plane
  const carpetTex = new THREE.CanvasTexture(document.createElement('canvas'));
  const carpetMat = new THREE.MeshBasicMaterial({ map: carpetTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(LEN, WID), carpetMat);
  carpet.rotation.x = -Math.PI / 2;
  scene.add(carpet);

  // outline of the region drawn: along the beam × the transverse window × the beam height
  const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(LEN, 2 * HGT, WID)),
    new THREE.LineBasicMaterial({ color: 0x3b6378, transparent: true, opacity: 0.55 }));
  scene.add(box);

  const gratingGroup = new THREE.Group(); scene.add(gratingGroup);
  const packetGroup = new THREE.Group(); scene.add(packetGroup);
  const dotsGeom = new THREE.BufferGeometry();
  const dots = new THREE.Points(dotsGeom, new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, depthWrite: false }));
  scene.add(dots);
  const trailGeom = new THREE.BufferGeometry();
  const trails = new THREE.LineSegments(trailGeom, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55 }));
  scene.add(trails);
  const marksGeom = new THREE.BufferGeometry();
  const marks = new THREE.Points(marksGeom, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, depthWrite: false }));
  scene.add(marks);

  // fixed labels
  const labels = new THREE.Group(); scene.add(labels);
  const put = (sprite, x, y, z) => { sprite.position.set(x, y, z); labels.add(sprite); return sprite; };
  const lG = [put(textSprite('G1'), -LEN / 2, HGT + 0.45, 0), put(textSprite('G2'), 0, HGT + 0.45, 0), put(textSprite('G3'), LEN / 2, HGT + 0.45, 0)];
  put(textSprite('clusters from the source →', { size: 22, weight: 400 }), -LEN / 2 + 1.5, -HGT - 0.4, WID / 2 + 1.4);
  put(textSprite('→ to the counter', { size: 22, weight: 400 }), LEN / 2 + 2, 0, WID / 2 + 0.6);
  const lScale = [
    put(textSprite('along the beam: 1.97 m', { size: 20, weight: 400 }), 0, -HGT - 0.4, WID / 2 + 0.5),
    put(textSprite('across: ±266 nm (grating period 133 nm)', { size: 20, weight: 400 }), LEN / 2 + 0.6, -HGT - 0.4, 0),
    put(textSprite('height: ±0.3 mm', { size: 20, weight: 400 }), -LEN / 2 - 0.8, 0, -WID / 2 - 0.4),
  ];
  const lLaser = put(textSprite('each grating: 266 nm laser light reflected by a mirror (grey plates)', { size: 20, weight: 400 }), 0, HGT + 1.3, -WID / 2);
  void lScale; void lLaser;

  // mirrors behind each grating (on the far side), drawn as thin plates
  const mirrorMat = new THREE.MeshBasicMaterial({ color: 0x9fb4c2, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  for (const X of [-LEN / 2, 0, LEN / 2]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2 * HGT), mirrorMat);
    m.position.set(X, 0, -WID / 2 - 0.05);
    scene.add(m);
  }

  let gratingKey = '';
  const sheetGeom = new THREE.BoxGeometry(1, 1, 1);

  function resize() {
    const W = host.clientWidth, H = host.clientHeight;
    if (W < 10 || H < 10) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    if (!userMoved) fitCamera();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  return {
    canvas: renderer.domElement,
    setVisible(v) { renderer.domElement.style.display = v ? 'block' : 'none'; if (v) resize(); },
    resetCamera() { userMoved = false; fitCamera(); },
    // data: { z2, xc, win, d, gratings: [{ z, light, shift, label }], carpetCanvas, carpetChanged,
    //         packets: [{ z, sigma, glow }], dots: [{ z, x, y, c }], trails: [{ pts, y, c }],
    //         marks: [{ z, x, y, c, a }], palette: { laser, light } }
    render(data) {
      const { z2, xc, win, d } = data;
      const X = (z) => (z / z2) * LEN - LEN / 2;
      const Z = (x) => -((x - xc) / win) * (WID / 2);

      if (data.carpetChanged) {
        carpetTex.image = data.carpetCanvas; carpetTex.needsUpdate = true;
      }
      carpetMat.blending = data.palette.light ? THREE.NormalBlending : THREE.AdditiveBlending;
      carpetMat.opacity = data.palette.light ? 0.85 : 1;

      // gratings: one slab per bright fringe in the window, rebuilt when strength or offset changes
      const key = data.gratings.map((g) => `${g.light.toFixed(2)}:${g.shift.toExponential(3)}`).join('|') + data.palette.laser;
      if (key !== gratingKey) {
        gratingKey = key;
        for (const ch of [...gratingGroup.children]) { ch.material.dispose(); gratingGroup.remove(ch); }
        data.gratings.forEach((g) => {
          const mat = new THREE.MeshBasicMaterial({ color: data.palette.laser, transparent: true, opacity: 0.15 + 0.55 * g.light, depthWrite: false, blending: data.palette.light ? THREE.NormalBlending : THREE.AdditiveBlending });
          const width = ((d / 3) / win) * (WID / 2); // the bright part of each fringe
          for (let j = -4; j <= 4; j++) {
            const xa = j * d + g.shift; // antinodes (bright light) at x = j d + shift
            if (xa < xc - win - 1e-12 || xa > xc + win + 1e-12) continue;
            const s = new THREE.Mesh(sheetGeom, mat);
            s.scale.set(0.16, 2 * HGT, width);
            s.position.set(X(g.z), 0, Z(xa));
            gratingGroup.add(s);
          }
        });
        data.gratings.forEach((g, i) => {
          if (lG[i].userData.text === g.label) return;
          const ns = textSprite(g.label); ns.position.copy(lG[i].position);
          labels.remove(lG[i]); lG[i].material.map.dispose(); lG[i].material.dispose(); lG[i] = ns; labels.add(ns);
        });
      }

      // packets: glowing slabs moving along the beam
      while (packetGroup.children.length < data.packets.length) {
        packetGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1, 2 * HGT, WID), new THREE.MeshBasicMaterial({ color: 0x7cecff, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending })));
      }
      packetGroup.children.forEach((m, i) => {
        const p = data.packets[i];
        m.visible = !!p && p.z > -2 * p.sigma && p.z < z2 + 2 * p.sigma;
        if (!m.visible) return;
        m.scale.set(Math.max(0.05, (2 * p.sigma / z2) * LEN), 1, 1);
        m.position.set(X(Math.min(z2, Math.max(0, p.z))), 0, 0);
        m.material.opacity = data.palette.light ? 0.05 : 0.07;
      });

      const fill = (geom, items, posOf) => {
        const pos = new Float32Array(items.length * 3), col = new Float32Array(items.length * 3);
        items.forEach((it, i) => { const [a, b, c] = posOf(it); pos.set([a, b, c], 3 * i); const k = new THREE.Color(it.c); col.set([k.r * (it.a ?? 1), k.g * (it.a ?? 1), k.b * (it.a ?? 1)], 3 * i); });
        geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geom.computeBoundingSphere();
      };
      const inWin = (x) => x >= xc - win && x <= xc + win;
      fill(dotsGeom, data.dots.filter((p) => inWin(p.x)), (p) => [X(p.z), p.y, Z(p.x)]);
      fill(marksGeom, data.marks.filter((m) => inWin(m.x)), (m) => [X(m.z), m.y, Z(m.x)]);
      // trails as segments, clipped to the window
      const segs = [];
      for (const t of data.trails) {
        for (let i = 1; i < t.pts.length; i++) {
          const [z0, x0] = t.pts[i - 1], [z1, x1] = t.pts[i];
          if (!inWin(x0) || !inWin(x1)) continue;
          segs.push({ p: [X(z0), t.y, Z(x0)], c: t.c }, { p: [X(z1), t.y, Z(x1)], c: t.c });
        }
      }
      fill(trailGeom, segs, (s) => s.p);

      controls.update();
      renderer.render(scene, camera);
    },
  };
}
