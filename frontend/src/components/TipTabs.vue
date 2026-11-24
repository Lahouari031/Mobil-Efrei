<!-- Tips of a destination, grouped by category with simple text tabs -->
<template>
  <section>
    <div class="tabs" role="tablist">
      <button
        v-for="cat in availableCategories"
        :key="cat.key"
        role="tab"
        :aria-selected="cat.key === active"
        :class="{ 'is-active': cat.key === active }"
        @click="active = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <p v-if="!tips.length" class="muted">No tips yet.</p>

    <ul class="tips">
      <li v-for="tip in activeTips" :key="tip.id" class="tip">
        <h3>{{ tip.title }}</h3>
        <p class="muted">{{ tip.content }}</p>
        <p v-if="tip.address" class="address">📍 {{ tip.address }}</p>
        <a v-if="tip.link" :href="tip.link" target="_blank" rel="noopener">Learn more</a>
      </li>
    </ul>

    <!-- Bottom of the "Best places" tab: map of every tip that has an address -->
    <div v-if="active === 'places' && mappedTips.length" class="places-map">
      <h3>Map of the addresses</h3>
      <TipMap :tips="mappedTips" />
    </div>
  </section>
</template>

<script>
import { CATEGORIES } from '../constants';
import TipMap from './TipMap.vue';

export default {
  name: 'TipTabs',
  components: { TipMap },
  props: {
    tips: { type: Array, default: () => [] },
  },
  data() {
    return { active: null };
  },
  computed: {
    // Only the categories that contain at least one tip are shown
    availableCategories() {
      return CATEGORIES.filter((c) => this.tips.some((t) => t.category === c.key));
    },
    // Tips with GPS coordinates are shown on the map
    mappedTips() {
      return this.tips.filter((t) => t.latitude != null && t.longitude != null);
    },
    activeTips() {
      return this.tips.filter((t) => t.category === this.active);
    },
  },
  watch: {
    // When the tips arrive, the first available tab is selected
    availableCategories: {
      immediate: true,
      handler(list) {
        if (!list.find((c) => c.key === this.active)) this.active = list[0]?.key ?? null;
      },
    },
  },
};
</script>

<style scoped>
.tabs { display: flex; flex-wrap: wrap; gap: 1.6rem; border-bottom: 1px solid var(--line); margin-bottom: 1.5rem; }
.tabs button {
  background: none; border: 0; padding: 0 0 0.8rem; margin-bottom: -1px;
  color: var(--muted); border-bottom: 2px solid transparent; cursor: pointer; font-size: 0.95rem;
}
.tabs button:hover { color: var(--text); }
.tabs button.is-active { color: var(--text); border-bottom-color: var(--yellow); }
.tips { list-style: none; padding: 0; margin: 0; }
.tip { padding: 1.2rem 0; border-bottom: 1px solid var(--line); }
.tip:last-child { border-bottom: 0; }
.tip h3 { margin-bottom: 0.3rem; }
.tip p { margin: 0 0 0.3rem; }
.tip .address { font-size: 0.85rem; }
.places-map { margin-top: 1.5rem; }
.places-map h3 { margin-bottom: 0.8rem; }
</style>
