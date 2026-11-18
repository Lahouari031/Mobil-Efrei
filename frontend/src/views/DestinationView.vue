<!-- Destination page: practical guide and student publications -->
<template>
  <div class="container narrow">
    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="error" class="alert">{{ error }}</p>

    <template v-else-if="destination">
      <router-link :to="{ name: 'explore' }" class="back">← Back to the globe</router-link>

      <header class="head">
        <p class="muted">{{ destination.flag }} {{ destination.country }}</p>
        <h1>{{ destination.city }}</h1>
        <p v-if="destination.university" class="muted">{{ destination.university }}</p>
      </header>

      <div v-if="destination.imageUrl" class="cover" :style="{ backgroundImage: `url(${destination.imageUrl})` }"></div>

      <p class="summary">{{ destination.summary }}</p>

      <section class="block" aria-labelledby="practical-guide-heading">
        <h2 id="practical-guide-heading">Practical guide</h2>
        <dl class="facts">
          <div><dt>Budget</dt><dd>{{ destination.monthlyBudget ? `≈ €${destination.monthlyBudget}/month` : '—' }}</dd></div>
          <div><dt>Language</dt><dd>{{ destination.language || '—' }}</dd></div>
          <div><dt>Currency</dt><dd>{{ destination.currency || '—' }}</dd></div>
        </dl>

        <TipTabs :tips="destination.tips" />
      </section>

      <CommentSection :destination-id="destination.id" class="block" />
    </template>
  </div>
</template>

<script>
import TipTabs from '../components/TipTabs.vue';
import CommentSection from '../components/CommentSection.vue';
import { api } from '../api/client';

export default {
  name: 'DestinationView',
  components: { TipTabs, CommentSection },
  props: { slug: { type: String, required: true } },
  data() {
    return { destination: null, loading: true, error: '' };
  },
  watch: {
    // Reloads if we go directly from one destination to another
    slug: { immediate: true, handler: 'load' },
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = '';
      try {
        this.destination = await api.get(`/destinations/${this.slug}`);
        document.title = `${this.destination.city} · Mobil'Efrei`;
      } catch (e) {
        this.error = e.status === 404 ? "This destination doesn't exist (yet!)." : e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.narrow { max-width: 760px; }
.back { font-size: 0.88rem; text-decoration: none; color: var(--muted); }
.back:hover { color: var(--text); }
.head { margin: 2rem 0 2rem; }
.head h1 { margin: 0.2rem 0 0.4rem; }
.head p { margin: 0; }
.cover { aspect-ratio: 16 / 7; border-radius: var(--radius); background: rgba(255, 255, 255, 0.05) center/cover; margin-bottom: 2rem; }
.facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 0 0 2rem; padding: 1.2rem 0; border-block: 1px solid var(--line); }
.facts dt { font-size: 0.78rem; color: var(--muted); }
.facts dd { margin: 0.2rem 0 0; font-weight: 500; }
.summary { font-size: 1.1rem; }
.block { margin-top: 2.5rem; }
@media (max-width: 600px) { .facts { grid-template-columns: 1fr; } }
</style>
