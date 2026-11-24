<template>
  <section class="explore container">
    <h1>Explore the World</h1>
    <p class="muted">Select the pin on a country to open the student guide of it.</p>

    <div class="explore__globe">
      <Globe3D :points="points">
        <template #marker="{ point }">
          <router-link :to="`/destinations/${point.slug}`" class="cape-town-pin">
            <span class="cape-town-pin__dot" aria-hidden="true"></span>
            <span class="cape-town-pin__label">{{ point.city }}</span>
          </router-link>
        </template>
      </Globe3D>
    </div>
  </section>
</template>

<script>
import Globe3D from '../components/Globe3D.vue';
import { GLOBE_DESTINATIONS } from '../constants';

export default {
  name: 'ExploreView',
  components: { Globe3D },
  data() {
    return { points: GLOBE_DESTINATIONS };
  },
  mounted() {
    document.title = "Explore · Mobil'Efrei";
  },
};
</script>

<style scoped>
.explore { text-align: center; }
.explore__globe { width: min(100%, 540px); aspect-ratio: 1; margin-inline: auto; }

.cape-town-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
  padding: 14px 5px 5px;
  color: var(--blue);
  text-decoration: none;
}

.cape-town-pin__dot {
  width: 16px;
  height: 16px;
  border: 3px solid var(--blue);
  border-radius: 50%;
  background: var(--yellow);
  box-shadow: 0 0 0 2px var(--yellow);
}

.cape-town-pin__label {
  margin-top: 7px;
  padding: 0.25rem 0.7rem;
  border-radius: var(--radius);
  background: var(--yellow);
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.cape-town-pin:hover .cape-town-pin__label { color: var(--blue); background: var(--text); }
.cape-town-pin:focus-visible { outline: 2px solid var(--text); border-radius: var(--radius); }
</style>
