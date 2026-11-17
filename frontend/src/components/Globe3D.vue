<!--
  Minimal 3D globe (Three.js) shown on the landing page.
  - Continents drawn with small yellow dots (rough outlines + point-in-polygon test)
  - Thin flight arcs from Paris to each destination
  - Slow sway, follows the mouse slightly
-->
<template>
  <div ref="wrap" class="globe" aria-hidden="true"></div>
</template>

<script>
import * as THREE from 'three';
import { GLOBE_POINTS } from '../constants';

// Very rough continent outlines as [longitude, latitude] polygons (enough for a dotted style)
const CONTINENTS = [
  [[-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [27, -34], [18, -35], [12, -17], [9, -1], [8, 4], [-8, 4], [-17, 14]], // Africa
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [5, 58], [10, 63], [20, 70], [30, 70], [40, 67], [45, 55], [40, 47], [30, 45], [28, 41], [22, 37], [15, 38], [12, 44], [5, 43], [-2, 37]], // Europe
  [[-6, 50], [2, 51], [0, 53], [-3, 58], [-6, 57]], // Great Britain
  [[40, 67], [60, 70], [80, 73], [110, 77], [140, 72], [170, 68], [160, 60], [140, 52], [135, 43], [122, 40], [120, 30], [110, 20], [108, 12], [100, 13], [98, 8], [92, 22], [80, 15], [77, 8], [72, 20], [60, 25], [50, 28], [45, 13], [35, 30], [30, 45], [40, 47], [45, 55]], // Asia
  [[-165, 65], [-140, 70], [-110, 72], [-80, 73], [-60, 60], [-55, 50], [-66, 44], [-76, 35], [-81, 25], [-90, 30], [-97, 25], [-90, 18], [-84, 10], [-80, 8], [-105, 20], [-115, 30], [-125, 40], [-125, 50], [-140, 60], [-165, 60]], // North America
  [[-55, 60], [-45, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 76]], // Greenland
  [[-80, 8], [-60, 10], [-50, 0], [-35, -7], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-75, -50], [-73, -35], [-71, -18], [-81, -5]], // South America
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -28], [150, -37], [140, -38], [132, -32], [115, -35]], // Australia
  [[44, -25], [47, -25], [50, -15], [49, -12]], // Madagascar
];

// Classic ray-casting point-in-polygon test
function inPolygon(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Converts latitude/longitude into a 3D position on a sphere of radius r
function latLonToVec3(lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const R = 2; // globe radius

export default {
  name: 'Globe3D',
  mounted() {
    this.init();
  },
  unmounted() {
    // Free GPU memory and remove listeners when the component disappears
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.renderer?.dispose();
    this.scene?.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose?.();
    });
  },
  methods: {
    init() {
      const el = this.$refs.wrap;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---------- Renderer, scene, camera ----------
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 7);

      // Everything that rotates with the Earth goes in this group
      const globe = new THREE.Group();
      scene.add(globe);

      // Flat sphere, slightly darker than the page: hides the dots on the back side
      globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), new THREE.MeshBasicMaterial({ color: 0x00255a })));

      // ---------- Continents made of dots (Fibonacci sphere = evenly spread points) ----------
      const positions = [];
      const N = 40000;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const lat = THREE.MathUtils.radToDeg(Math.asin(y));
        const lon = ((THREE.MathUtils.radToDeg(golden * i) % 360) + 540) % 360 - 180;
        if (CONTINENTS.some((poly) => inPolygon(lon, lat, poly))) {
          const v = latLonToVec3(lat, lon, R * 1.003);
          positions.push(v.x, v.y, v.z);
        }
      }
      const dotsGeo = new THREE.BufferGeometry();
      dotsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      globe.add(new THREE.Points(dotsGeo, new THREE.PointsMaterial({ color: 0xf3b335, size: 0.02, transparent: true, opacity: 0.85 })));

      // ---------- Markers + flight arcs from Paris ----------
      const dotGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const paris = latLonToVec3(GLOBE_POINTS.paris.lat, GLOBE_POINTS.paris.lon, R);
      const parisDot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      parisDot.position.copy(paris);
      globe.add(parisDot);

      this.arcs = GLOBE_POINTS.destinations.map((d, i) => {
        const end = latLonToVec3(d.lat, d.lon, R);
        const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        dot.position.copy(end);
        globe.add(dot);

        // Curved arc: the middle point is lifted above the surface
        const mid = paris.clone().add(end).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(R + paris.distanceTo(end) * 0.4);
        const curve = new THREE.QuadraticBezierCurve3(paris, mid, end);
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
        geo.setDrawRange(0, 0); // drawn progressively in the animation loop
        globe.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })));
        return { geo, delay: i * 0.4 };
      });

      // Initial orientation: Europe and Africa face the camera
      const baseY = -Math.PI / 2 - THREE.MathUtils.degToRad(15);
      globe.rotation.set(0.42, baseY, 0);

      // ---------- Interactions (DOM events with callbacks) ----------
      const mouse = { x: 0, y: 0 };
      this.onMouseMove = (e) => {
        mouse.x = e.clientX / window.innerWidth - 0.5;
        mouse.y = e.clientY / window.innerHeight - 0.5;
      };
      this.onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
      };
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('resize', this.onResize);

      // ---------- Animation loop ----------
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / 1000; // elapsed time in seconds
        const sway = reduceMotion ? 0 : Math.sin(t * 0.2) * 0.3;
        globe.rotation.y += (baseY + sway + mouse.x * 0.3 - globe.rotation.y) * 0.04;
        globe.rotation.x += (0.42 + mouse.y * 0.15 - globe.rotation.x) * 0.04;

        this.arcs.forEach((a) => {
          const p = Math.max(0, Math.min(1, (t - 0.5 - a.delay) / 1.5));
          a.geo.setDrawRange(0, Math.floor(p * 101));
        });

        renderer.render(scene, camera);
        this.frame = requestAnimationFrame(tick);
      };
      tick();

      this.renderer = renderer;
      this.scene = scene;
    },
  },
};
</script>

<style scoped>
.globe { width: 100%; height: 100%; }
.globe :deep(canvas) { display: block; }
</style>
