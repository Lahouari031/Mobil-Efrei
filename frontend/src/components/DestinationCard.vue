<!-- A destination on the destinations page. Receives the destination as a prop. -->
<template>
  <router-link :to="`/destinations/${destination.slug}`" class="dest">
    <div class="dest__img" :style="{ backgroundImage: `url(${destination.imageUrl})` }"></div>
    <div class="dest__row">
      <h3>{{ destination.city }}</h3>
      <span class="muted">{{ destination.flag }}</span>
    </div>
    <p class="muted dest__meta">
      {{ destination.country }}<template v-if="destination.monthlyBudget"> · ≈ €{{ destination.monthlyBudget }}/month</template>
    </p>
  </router-link>
</template>

<script>
export default {
  name: 'DestinationCard',
  props: {
    destination: { type: Object, required: true },
  },
};
</script>

<style scoped>
.dest { display: block; text-decoration: none; color: inherit; }
.dest__img {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius);
  background-color: rgba(255, 255, 255, 0.05);
  background-size: cover;
  background-position: center;
  margin-bottom: 1rem;
  transition: opacity 0.3s;
}
.dest:hover .dest__img { opacity: 0.85; }
.dest:hover h3 { color: var(--yellow); }
.dest__row { display: flex; justify-content: space-between; align-items: baseline; }
.dest__row h3 { margin: 0; font-size: 1.2rem; transition: color 0.2s; }
.dest__meta { font-size: 0.88rem; margin: 0.2rem 0 0; }
</style>
