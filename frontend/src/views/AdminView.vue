<!-- Admin area: tips table (Read) + form (Create / Update) + delete (Delete) -->
<template>
  <div class="container">
    <h1>Admin</h1>
    <p class="muted">Manage the tips shown on each destination.</p>

    <p v-if="message" class="alert" :class="{ 'alert-success': messageType === 'success' }">{{ message }}</p>

    <div class="admin">
      <TipForm v-if="destinations.length" :tip="editing" :destinations="destinations" @submit="save" @cancel="editing = null" />

      <section>
        <div class="toolbar">
          <select v-model.number="filterDest" class="input" aria-label="Filter by destination">
            <option :value="0">All destinations</option>
            <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.city }}</option>
          </select>
          <span class="muted">{{ filteredTips.length }} tips</span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Destination</th>
              <th>Category</th>
              <th>Title</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tip in filteredTips" :key="tip.id" :class="{ 'is-editing': editing && editing.id === tip.id }">
              <td>{{ tip.destination?.city }}</td>
              <td><span class="tag">{{ categoryLabel(tip.category) }}</span></td>
              <td>{{ tip.title }}</td>
              <td class="actions">
                <button class="link-btn" @click="edit(tip)">Edit</button>
                <button class="link-btn is-danger" @click="remove(tip)">Delete</button>
              </td>
            </tr>
            <tr v-if="!filteredTips.length">
              <td colspan="4" class="muted">No tips.</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script>
import TipForm from '../components/TipForm.vue';
import { api } from '../api/client';
import { categoryLabel } from '../constants';

export default {
  name: 'AdminView',
  components: { TipForm },
  data() {
    return { destinations: [], tips: [], editing: null, filterDest: 0, message: '', messageType: 'success' };
  },
  computed: {
    filteredTips() {
      return this.filterDest ? this.tips.filter((t) => t.destinationId === this.filterDest) : this.tips;
    },
  },
  async created() {
    // Both requests run in parallel (Promise.all)
    const [destinations, tips] = await Promise.all([api.get('/destinations'), api.get('/tips')]);
    this.destinations = destinations;
    this.tips = tips;
  },
  methods: {
    categoryLabel,
    notify(text, type = 'success') {
      this.message = text;
      this.messageType = type;
      setTimeout(() => (this.message = ''), 3000);
    },
    async reload() {
      this.tips = await api.get('/tips');
    },
    edit(tip) {
      this.editing = tip;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    async save(form) {
      try {
        if (this.editing) {
          await api.put(`/tips/${this.editing.id}`, form);
          this.notify('Tip updated.');
        } else {
          await api.post('/tips', form);
          this.notify('Tip added.');
        }
        this.editing = null;
        await this.reload();
      } catch (e) {
        this.notify(e.message, 'error');
      }
    },
    async remove(tip) {
      if (!window.confirm(`Delete “${tip.title}”?`)) return;
      try {
        await api.delete(`/tips/${tip.id}`);
        this.tips = this.tips.filter((t) => t.id !== tip.id);
        if (this.editing?.id === tip.id) this.editing = null;
        this.notify('Tip deleted.');
      } catch (e) {
        this.notify(e.message, 'error');
      }
    },
  },
};
</script>

<style scoped>
.admin { display: grid; grid-template-columns: 340px 1fr; gap: 4rem; align-items: start; margin-top: 2.5rem; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.toolbar .input { width: auto; padding: 0.5rem 0.8rem; }
.table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
.table th { text-align: left; font-weight: 500; font-size: 0.8rem; color: var(--muted); padding: 0.6rem 0.5rem; border-bottom: 1px solid var(--line); }
.table td { padding: 0.8rem 0.5rem; border-bottom: 1px solid var(--line); }
.table tr.is-editing td { color: var(--yellow); }
.actions { text-align: right; white-space: nowrap; }
.actions .link-btn + .link-btn { margin-left: 0.9rem; }
@media (max-width: 950px) { .admin { grid-template-columns: 1fr; } }
</style>
