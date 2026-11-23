<template>
  <aside class="urgent-alerts">
    <h2>⚠ Urgent alerts</h2>

    <p v-if="loading">Loading alerts...</p>

    <p v-else-if="error">{{ error }}</p>

    <p v-else-if="!alerts.length">
      No urgent alerts at this time.
    </p>

    <ul v-else>
      <li v-for="alert in alerts" :key="alert.id">

        <button
          type="button"
          class="alert-title"
          :aria-expanded="openedId === alert.id"
          @click="toggle(alert.id)"
        >
          <strong>{{ alert.title }}</strong>
          <time :datetime="alert.alertDate || alert.createdAt">
  {{ formatDate(alert.alertDate || alert.createdAt) }}
</time>
        </button>

        <p v-if="openedId === alert.id" class="alert-details">
          {{ alert.details }}
        </p>

      </li>
    </ul>
  </aside>
</template>

<script>
import { api } from '../api/client';

export default {
  name: 'UrgentAlerts',

  props: {
    destinationId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      alerts: [],
      loading: true,
      error: '',
      openedId: null
    };
  },

  watch: {
    destinationId: {
      immediate: true,
      handler: 'loadAlerts'
    }
  },

  methods: {
    async loadAlerts() {
      this.loading = true;
      this.error = '';
      this.openedId = null;

      try {
        this.alerts = await api.get(
          `/destinations/${this.destinationId}/urgent-alerts`
        );
      }  catch (e) {
  console.error('Urgent alerts error:', e);
  this.error = e.message || 'Unable to load alerts.';
} finally {
  this.loading = false;
}
    },

    toggle(id) {
      this.openedId = this.openedId === id ? null : id;
    },

    formatDate(date) {
  if (!date) return '';

  const value = date.length === 10
    ? `${date}T12:00:00`
    : date;

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
  }
};
</script>

<style scoped>
.urgent-alerts {
  background: rgba(180, 30, 30, 0.18);
  border: 1px solid #e35d5d;
  border-radius: 12px;
  padding: 1.2rem;
  width: 100%;
}

.urgent-alerts h2 {
  color: #ff9090;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.urgent-alerts ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.urgent-alerts li {
  padding: 0.7rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.alert-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.alert-title strong {
  font-size: 0.9rem;
}

.alert-title time {
  color: #ffb0b0;
  font-size: 0.75rem;
  white-space: nowrap;
}

.alert-details {
  font-size: 0.85rem;
  margin-top: 0.8rem;
  white-space: pre-line;
}
</style>