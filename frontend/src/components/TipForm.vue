<!--
  Form to create / edit a tip (admin area).
  The parent passes the tip to edit (or null to create one) and receives the "submit" event.
-->
<template>
  <form class="tip-form" novalidate @submit.prevent="onSubmit">
    <h2>{{ tip ? 'Edit tip' : 'New tip' }}</h2>

    <div class="row">
      <div class="form-field">
        <label for="tip-dest">Destination</label>
        <select id="tip-dest" v-model.number="form.destinationId" class="input" required>
          <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.city }}</option>
        </select>
      </div>
      <div class="form-field">
        <label for="tip-cat">Category</label>
        <select id="tip-cat" v-model="form.category" class="input" required>
          <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label }}</option>
        </select>
      </div>
    </div>

    <div class="form-field">
      <label for="tip-title">Title</label>
      <input id="tip-title" v-model="form.title" class="input" :class="{ 'is-invalid': showErrors && errors.title }" maxlength="120" required />
      <p v-if="showErrors && errors.title" class="error-msg">{{ errors.title }}</p>
    </div>

    <div class="form-field">
      <label for="tip-content">Content</label>
      <textarea id="tip-content" v-model="form.content" class="input" :class="{ 'is-invalid': showErrors && errors.content }" rows="4" required></textarea>
      <p v-if="showErrors && errors.content" class="error-msg">{{ errors.content }}</p>
    </div>

    <div class="form-field">
      <label for="tip-link">Link (optional)</label>
      <input id="tip-link" v-model="form.link" type="url" class="input" :class="{ 'is-invalid': showErrors && errors.link }" placeholder="https://…" />
      <p v-if="showErrors && errors.link" class="error-msg">{{ errors.link }}</p>
    </div>

    <!-- Optional location: the tip then appears in the "Map" tab -->
    <div class="form-field">
      <label for="tip-address">Address (optional, for the map)</label>
      <div class="geo">
        <input id="tip-address" v-model="form.address" class="input" maxlength="255" placeholder="Street, city" />
        <button type="button" class="btn btn-ghost" :disabled="!form.address.trim() || locating" @click="locate">
          {{ locating ? '…' : 'Locate' }}
        </button>
      </div>
      <p v-if="geoMessage" class="muted small">{{ geoMessage }}</p>
    </div>

    <div class="row">
      <div class="form-field">
        <label for="tip-lat">Latitude</label>
        <input id="tip-lat" v-model="form.latitude" class="input" :class="{ 'is-invalid': showErrors && errors.coords }" inputmode="decimal" placeholder="-33.9249" />
      </div>
      <div class="form-field">
        <label for="tip-lng">Longitude</label>
        <input id="tip-lng" v-model="form.longitude" class="input" :class="{ 'is-invalid': showErrors && errors.coords }" inputmode="decimal" placeholder="18.4241" />
      </div>
    </div>
    <p v-if="showErrors && errors.coords" class="error-msg">{{ errors.coords }}</p>

    <div class="actions">
      <button class="btn">{{ tip ? 'Save' : 'Add' }}</button>
      <button v-if="tip" type="button" class="link-btn" @click="$emit('cancel')">Cancel</button>
    </div>
  </form>
</template>

<script>
import { CATEGORIES } from '../constants';

const empty = (destinationId) => ({ destinationId, category: 'budget', title: '', content: '', link: '', address: '', latitude: '', longitude: '' });

export default {
  name: 'TipForm',
  props: {
    tip: { type: Object, default: null },
    destinations: { type: Array, required: true },
  },
  emits: ['submit', 'cancel'],
  data() {
    return { categories: CATEGORIES, form: empty(this.destinations[0]?.id), showErrors: false, locating: false, geoMessage: '' };
  },
  computed: {
    // Client-side validation, recomputed on every keystroke
    errors() {
      const e = {};
      if (this.form.title.trim().length < 2) e.title = 'Title is too short.';
      if (this.form.content.trim().length < 5) e.content = 'Content is too short (5 characters min).';
      if (this.form.link && !/^https?:\/\//.test(this.form.link)) e.link = 'The link must start with http(s)://';
      const lat = String(this.form.latitude ?? '').trim();
      const lng = String(this.form.longitude ?? '').trim();
      if (!!lat !== !!lng) e.coords = 'Give both latitude and longitude (or neither).';
      else if (lat && !(Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180)) e.coords = 'Invalid coordinates.';
      return e;
    },
  },
  watch: {
    // Clicking "Edit" in the table fills the form
    tip: {
      immediate: true,
      handler(t) {
        this.form = t
          ? {
              destinationId: t.destinationId, category: t.category, title: t.title, content: t.content, link: t.link || '',
              address: t.address || '', latitude: t.latitude ?? '', longitude: t.longitude ?? '',
            }
          : empty(this.destinations[0]?.id);
        this.showErrors = false;
        this.geoMessage = '';
      },
    },
  },
  methods: {
    // Geocoding with the OpenStreetMap Nominatim API: address -> latitude / longitude
    async locate() {
      this.locating = true;
      this.geoMessage = '';
      try {
        const city = this.destinations.find((d) => d.id === this.form.destinationId)?.city ?? '';
        const query = this.form.address.toLowerCase().includes(city.toLowerCase()) ? this.form.address : `${this.form.address}, ${city}`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error();
        const [place] = await res.json();
        if (!place) {
          this.geoMessage = 'Address not found: type the coordinates by hand (right-click in Google Maps to copy them).';
          return;
        }
        this.form.latitude = Number(place.lat).toFixed(6);
        this.form.longitude = Number(place.lon).toFixed(6);
        this.geoMessage = `Found: ${place.display_name}`;
      } catch {
        this.geoMessage = 'The geocoding service is unavailable, type the coordinates by hand.';
      } finally {
        this.locating = false;
      }
    },
    onSubmit() {
      this.showErrors = true;
      if (Object.keys(this.errors).length) return;
      this.$emit('submit', { ...this.form });
      if (!this.tip) {
        this.form = empty(this.form.destinationId);
        this.showErrors = false;
      }
    },
  },
};
</script>

<style scoped>
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.actions { display: flex; align-items: center; gap: 1rem; }
.geo { display: flex; gap: 0.5rem; }
.geo .btn { white-space: nowrap; }
.small { font-size: 0.8rem; margin: 0.4rem 0 0; }
@media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
</style>
