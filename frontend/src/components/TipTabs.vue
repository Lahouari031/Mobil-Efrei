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
      <!-- Extra tabs: interactive map of the geolocated tips and TikTok videos -->
      <button
        v-for="tab in extraTabs"
        :key="tab.key"
        role="tab"
        :aria-selected="tab.key === active"
        :class="{ 'is-active': tab.key === active }"
        @click="active = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="!tips.length && active !== 'videos'" class="muted">No tips yet.</p>

    <TipMap v-if="active === 'map'" :tips="mappedTips" />
    <TikTokVideos v-else-if="active === 'videos'" :videos="videos" />

    <ul v-else class="tips">
      <li v-for="tip in activeTips" :key="tip.id" class="tip">
        <h3>{{ tip.title }}</h3>
        <p class="muted">{{ tip.content }}</p>
        <p v-if="tip.address" class="address">📍 {{ tip.address }}</p>
        <a v-if="tip.link" :href="tip.link" target="_blank" rel="noopener">Learn more</a>
      </li>
    </ul>
  </section>
</template>

<script>
import { CATEGORIES } from '../constants';
import TipMap from './TipMap.vue';
import TikTokVideos from './TikTokVideos.vue';

export default {
  name: 'TipTabs',
  components: { TipMap, TikTokVideos },
  props: {
    tips: { type: Array, default: () => [] },
    videos: { type: Array, default: () => [] },
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
    extraTabs() {
      const tabs = [];
      if (this.mappedTips.length) tabs.push({ key: 'map', label: 'Map' });
      tabs.push({ key: 'videos', label: 'Videos' });
      return tabs;
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
        const keys = [...list, ...this.extraTabs].map((t) => t.key);
        if (!keys.includes(this.active)) this.active = keys[0] ?? null;
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
</style>
