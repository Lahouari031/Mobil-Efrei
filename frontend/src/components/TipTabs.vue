
<!-- Tips of a destination, grouped by category -->
<template>
  <section>

    <!-- Navigation between categories -->
    <div class="tabs" role="tablist">
      <button
        v-for="cat in availableCategories"
        :key="cat.key"
        type="button"
        role="tab"
        :aria-selected="cat.key === active"
        :class="{ 'is-active': cat.key === active }"
        @click="active = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- No tips available -->
    <p
      v-if="!tips.length && active !== 'school-resources'"
      class="muted"
    >
      No tips yet.
    </p>

    <!-- Tips corresponding to the selected category -->
    <ul class="tips">
      <li
        v-for="tip in activeTips"
        :key="tip.id"
        class="tip"
      >
        <h3>{{ tip.title }}</h3>

        <p class="muted">
          {{ tip.content }}
        </p>

        <p v-if="tip.address" class="address">
          📍 {{ tip.address }}
        </p>

        <a
          v-if="tip.link"
          :href="tip.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </li>
    </ul>

    <!-- Protected PowerPoint in EFREI resources -->
    <EfreiProtectedDocument
      v-if="active === 'school-resources'"
    />

    <!-- Map displayed only in Best places -->
    <div
      v-if="active === 'places' && mappedTips.length"
      class="places-map"
    >
      <h3>Map of the addresses</h3>

      <TipMap :tips="mappedTips" />
    </div>

  </section>
</template>

<script>
import { CATEGORIES } from '../constants';
import TipMap from './TipMap.vue';
import EfreiProtectedDocument from './EfreiProtectedDocument.vue';

export default {
  name: 'TipTabs',

  components: {
    TipMap,
    EfreiProtectedDocument
  },

  props: {
    tips: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      active: null
    };
  },

  computed: {

    // Display categories that have tips.
    // EFREI resources is always visible.
    availableCategories() {
      return CATEGORIES.filter((category) =>
        category.key === 'school-resources' ||
        this.tips.some(
          (tip) => tip.category === category.key
        )
      );
    },

    // Places with GPS coordinates
    mappedTips() {
      return this.tips.filter(
        (tip) =>
          tip.category === 'places' &&
          tip.latitude != null &&
          tip.longitude != null
      );
    },

    // Tips for the currently selected category
    activeTips() {
      return this.tips.filter(
        (tip) => tip.category === this.active
      );
    }

  },

  watch: {

    // Select the first available category
    availableCategories: {
      immediate: true,

      handler(categories) {
        const exists = categories.some(
          (category) => category.key === this.active
        );

        if (!exists) {
          this.active = categories[0]?.key ?? null;
        }
      }
    }

  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.5rem;
}

.tabs button {
  background: none;
  border: 0;
  padding: 0 0 0.8rem;
  margin-bottom: -1px;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
}

.tabs button:hover {
  color: var(--text);
}

.tabs button.is-active {
  color: var(--text);
  border-bottom-color: var(--yellow);
}

.tips {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tip {
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--line);
}

.tip:last-child {
  border-bottom: 0;
}

.tip h3 {
  margin-bottom: 0.3rem;
}

.tip p {
  margin: 0 0 0.3rem;
}

.tip .address {
  font-size: 0.85rem;
}

.places-map {
  margin-top: 1.5rem;
}

.places-map h3 {
  margin-bottom: 0.8rem;
}
</style>
