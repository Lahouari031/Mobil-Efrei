<template>
  <div class="globe">
    <div ref="canvas" class="globe__canvas" aria-hidden="true"></div>
    <p v-if="unavailable" class="globe__notice muted">The 3D globe is unavailable on this device.</p>
    <div ref="marker" class="globe__marker">
      <slot name="marker" />
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { GLOBE_POINTS } from '../constants';

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

function inPolygon(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function latLonToVec3(lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const R = 2; 

export default {
  name: 'Globe3D',
  data() {
    return { unavailable: false };
  },
  mounted() {
    this.init();
  },
  unmounted() {
    // Free GPU memory and remove listeners when the component disappears
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();
    this.scene?.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose?.();
    });
  },
  methods: {
    init() {
      const el = this.$refs.canvas;
      const marker = this.$refs.marker;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---------- Renderer, scene, camera ----------
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        this.unavailable = true;
        return;
      }
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

      // ---------- Markers and flight arc ----------
      const dotGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const paris = latLonToVec3(GLOBE_POINTS.paris.lat, GLOBE_POINTS.paris.lon, R);
      const parisDot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      parisDot.position.copy(paris);
      globe.add(parisDot);

      const { lat, lon } = GLOBE_POINTS.capeTown;
      const capeTown = latLonToVec3(lat, lon, R);
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      dot.position.copy(capeTown);
      globe.add(dot);

      // Lift the middle of the flight arc above the surface.
      const mid = paris.clone().add(capeTown).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(R + paris.distanceTo(capeTown) * 0.4);
      const curve = new THREE.QuadraticBezierCurve3(paris, mid, capeTown);
      const arc = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
      globe.add(new THREE.Line(arc, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })));

      // Initial orientation: Europe and Africa face the camera
      const baseY = -Math.PI / 2 - THREE.MathUtils.degToRad(GLOBE_POINTS.paris.lon);
      const baseX = THREE.MathUtils.degToRad(GLOBE_POINTS.paris.lat);
      globe.rotation.set(baseX, baseY, 0);
      const screenPoint = new THREE.Vector3();
      

  
      this.onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
        if (reduceMotion) draw();
      };
      window.addEventListener('resize', this.onResize);

      // ---------- Animation loop ----------
      const draw = () => {
        renderer.render(scene, camera);
        // Project Cape Town onto the screen so its HTML link follows the globe.
        screenPoint.copy(capeTown).applyMatrix4(globe.matrixWorld).project(camera);
        marker.style.left = ((screenPoint.x + 1) * 50) + '%';
        marker.style.top = ((1 - screenPoint.y) * 50) + '%';
      };
      
      let drag = null;
      el.onpointerdown = (event) => {
        if (event.button !== 0 || drag) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
        el.setPointerCapture(event.pointerId);  
      };

      el.onpointermove = (event) => {
        if (drag?.id !== event.pointerId) return;
          const sensitivity = Math.PI / el.clientWidth;
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          globe.rotation.y += dx * sensitivity;
          globe.rotation.x = THREE.MathUtils.clamp(
          globe.rotation.x + dy * sensitivity,
          -Math.PI / 2,
          Math.PI / 2,
           );

          drag.x = event.clientX;
          drag.y = event.clientY;
          draw();
        };

        el.onlostpointercapture = (event) => {
          if (drag?.id === event.pointerId) drag = null;
          };

      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / 1000; // elapsed time in seconds

        const progress = Math.max(0, Math.min(1, (t - 0.5) / 1.5));
        arc.setDrawRange(0, Math.floor(progress * 101));

        draw();
        this.frame = requestAnimationFrame(tick);
      };
      if (reduceMotion) {
        draw();
      } else {
        tick();
      }

      this.renderer = renderer;
      this.scene = scene;
    },
  },
};
</script>

<style scoped>
.globe { position: relative; width: 100%; height: 100%; }
.globe__canvas { width: 100%; height: 100%; }
.globe__canvas :deep(canvas) { display: block; }
.globe__marker { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -22px); }
.globe__notice { position: absolute; top: 25%; width: 100%; padding-inline: 1rem; text-align: center; }
</style>
