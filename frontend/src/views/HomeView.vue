<!-- Destinations page (signed-in users): search, sort and grid of destinations -->
<template>
  <div class="container">
    <header class="head">
      <h1>Destinations</h1>
      <div class="tools">
        <input v-model="search" class="input" type="search" placeholder="Search" aria-label="Search a destination" />
        <select v-model="sortBy" class="input" aria-label="Sort">
          <option value="country">By country</option>
          <option value="budget-asc">Budget ↑</option>
          <option value="budget-desc">Budget ↓</option>
        </select>
      </div>
    </header>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="error" class="alert">{{ error }}</p>
    <p v-else-if="!filtered.length" class="muted">No destination matches “{{ search }}”.</p>

    <div class="grid">
      <DestinationCard v-for="d in filtered" :key="d.id" v-reveal :destination="d" />
    </div>
  </div>
</template>

<script>
import DestinationCard from '../components/DestinationCard.vue';
import { api } from '../api/client';

export default {
  name: 'HomeView',
  components: { DestinationCard },
  data() {
    return { destinations: [], search: '', sortBy: 'country', loading: true, error: '' };
  },
  computed: {
    // Filtered + sorted list, recomputed when search / sortBy change
    filtered() {
      const q = this.search.trim().toLowerCase();
      const list = this.destinations.filter((d) => `${d.country} ${d.city}`.toLowerCase().includes(q));
      if (this.sortBy === 'budget-asc') return [...list].sort((a, b) => (a.monthlyBudget ?? 0) - (b.monthlyBudget ?? 0));
      if (this.sortBy === 'budget-desc') return [...list].sort((a, b) => (b.monthlyBudget ?? 0) - (a.monthlyBudget ?? 0));
      return list;
    },
  },
  async created() {
    try {
      this.destinations = await api.get('/destinations');
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 3rem; }
.head h1 { margin: 0; }
.tools { display: flex; gap: 0.6rem; }
.tools .input { width: auto; padding: 0.6rem 0.9rem; }
.grid { display: grid; gap: 2.5rem 2rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
</style>
