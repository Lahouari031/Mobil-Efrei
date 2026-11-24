<!--
  "Map" tab: the geolocated tips of a destination on an interactive map.
  External APIs: Leaflet (map library) + OpenStreetMap tile server (map images).
-->
<template>
  <div>
    <div ref="map" class="tip-map" role="region" aria-label="Map of the best places"></div>
    <p class="muted small">Click a pin to see the tip. Map data © OpenStreetMap contributors.</p>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { categoryLabel } from '../constants';

// Yellow round pin drawn in CSS (avoids the default marker images, which Vite does not bundle well)
const pin = L.divIcon({ className: 'tip-pin', iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10] });

// Escapes text before putting it in the popup HTML (protection against XSS)
const escape = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export default {
  name: 'TipMap',
  props: {
    tips: { type: Array, required: true }, // only tips with latitude / longitude
  },
  mounted() {
    this.map = L.map(this.$refs.map, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    this.layer = L.layerGroup().addTo(this.map);
    this.drawMarkers();
  },
  unmounted() {
    this.map?.remove();
  },
  watch: {
    tips() {
      this.drawMarkers();
    },
  },
  methods: {
    drawMarkers() {
      this.layer.clearLayers();
      const points = this.tips.map((tip) => {
        const latLng = [tip.latitude, tip.longitude];
        const directions = `https://www.openstreetmap.org/directions?to=${tip.latitude},${tip.longitude}`;
        L.marker(latLng, { icon: pin, title: tip.title })
          .bindPopup(
            `<strong>${escape(tip.title)}</strong><br><small>${escape(categoryLabel(tip.category))}</small>` +
              `<p>${escape(tip.content)}</p>` +
              (tip.address ? `<p><small>${escape(tip.address)}</small></p>` : '') +
              `<a href="${directions}" target="_blank" rel="noopener">Directions</a>`
          )
          .addTo(this.layer);
        return latLng;
      });
      // Zoom so that every pin is visible
      if (points.length) this.map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    },
  },
};
</script>

<style scoped>
.tip-map { height: 420px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); }
.small { font-size: 0.8rem; margin-top: 0.5rem; }
/* Leaflet creates the pins and popups outside of this component's scope: :deep() / :global() */
:global(.tip-pin) { background: var(--yellow); border: 3px solid var(--blue); border-radius: 50%; box-shadow: 0 0 0 2px var(--yellow); }
:global(.leaflet-popup-content) { color: #012d6a; }
:global(.leaflet-popup-content p) { margin: 0.4rem 0; }
:global(.leaflet-popup-content a) { color: #012d6a; }
</style>
