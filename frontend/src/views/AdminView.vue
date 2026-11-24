<!-- Admin area: tips table (Read) + form (Create / Update) + delete (Delete) -->
<template>
  <div class="container">
    <h1>Admin</h1>
    <p class="muted">Manage the tips, urgent alerts and videos shown on each destination.</p>

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
    <!-- Urgent alerts: kept in history, an admin activates / deactivates them -->
    <section class="alerts-admin">
      <h2>Urgent alerts</h2>

      <form @submit.prevent="publishAlert">
        <div class="form-field">
          <label for="alert-dest">Destination</label>
          <select id="alert-dest" v-model.number="newAlert.destinationId" class="input" required>
            <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.flag }} {{ d.city }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="alert-title">Alert title</label>
          <input id="alert-title" v-model="newAlert.title" class="input" maxlength="150" required />
        </div>

        <div class="form-field">
          <label for="alert-date">Alert date</label>
          <input id="alert-date" v-model="newAlert.alertDate" type="date" class="input" required />
        </div>

        <div class="form-field">
          <label for="alert-details">Alert details</label>
          <textarea id="alert-details" v-model="newAlert.details" class="input" rows="4" required></textarea>
        </div>

        <button class="btn" :disabled="savingAlert">{{ savingAlert ? 'Publishing…' : 'Publish alert' }}</button>
      </form>

      <h3>Published alerts</h3>
      <p v-if="!urgentAlerts.length" class="muted">No alerts yet.</p>
      <ul v-else>
        <li v-for="alert in urgentAlerts" :key="alert.id" :class="{ 'is-inactive': !alert.active }">
          <span class="tag">{{ alert.destination?.city }}</span>
          <strong>{{ alert.title }}</strong>
          <span class="muted">{{ formatAlertDate(alert.alertDate || alert.createdAt) }}</span>
          <span>{{ alert.active ? 'Active' : 'Inactive' }}</span>
          <button class="link-btn" @click="toggleAlert(alert)">{{ alert.active ? 'Deactivate' : 'Activate' }}</button>
        </li>
      </ul>
    </section>

    <!-- TikTok videos shown in the "Videos" tab of each destination -->
    <section class="alerts-admin">
      <h2>TikTok videos</h2>

      <form @submit.prevent="addVideo">
        <div class="form-field">
          <label for="video-dest">Destination</label>
          <select id="video-dest" v-model.number="newVideo.destinationId" class="input" required>
            <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.flag }} {{ d.city }}</option>
          </select>
        </div>
        <div class="form-field">
          <label for="video-url">TikTok link</label>
          <input id="video-url" v-model.trim="newVideo.url" class="input" placeholder="https://www.tiktok.com/@account/video/…" required />
        </div>
        <div class="form-field">
          <label for="video-title">Title (optional)</label>
          <input id="video-title" v-model="newVideo.title" class="input" maxlength="150" />
        </div>
        <button class="btn" :disabled="savingVideo">{{ savingVideo ? 'Adding…' : 'Add video' }}</button>
      </form>

      <p v-if="!videos.length" class="muted">No videos yet.</p>
      <ul v-else>
        <li v-for="video in videos" :key="video.id">
          <span class="tag">{{ video.destination?.city }}</span>
          <a :href="video.url" target="_blank" rel="noopener">{{ video.title || video.url }}</a>
          <button class="link-btn is-danger" @click="removeVideo(video)">Delete</button>
        </li>
      </ul>
    </section>
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
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    return {
      destinations: [],
      tips: [],
      editing: null,
      filterDest: 0,
      message: '',
      messageType: 'success',
      urgentAlerts: [],
      newAlert: { destinationId: null, title: '', details: '', alertDate: today },
      savingAlert: false,
      videos: [],
      newVideo: { destinationId: null, url: '', title: '' },
      savingVideo: false,
    };
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
    // Cape Town is selected by default in the alert and video forms
    const defaultId = destinations.find((d) => d.slug === 'cape-town')?.id ?? destinations[0]?.id ?? null;
    this.newAlert.destinationId = defaultId;
    this.newVideo.destinationId = defaultId;
    try {
      [this.urgentAlerts, this.videos] = await Promise.all([api.get('/urgent-alerts'), api.get('/videos')]);
    } catch (e) {
      this.notify(e.message, 'error');
    }
  },
  methods: {
    formatAlertDate(date) {
      return new Date(date).toLocaleDateString('en-GB');
    },
    async publishAlert() {
      if (this.savingAlert) return;
      this.savingAlert = true;
      try {
        await api.post('/urgent-alerts', {
          destinationId: this.newAlert.destinationId,
          title: this.newAlert.title.trim(),
          details: this.newAlert.details.trim(),
          alertDate: this.newAlert.alertDate,
        });
        this.urgentAlerts = await api.get('/urgent-alerts');
        this.newAlert.title = '';
        this.newAlert.details = '';
        this.notify('Alert published.');
      } catch (e) {
        this.notify(e.message, 'error');
      } finally {
        this.savingAlert = false;
      }
    },
    async toggleAlert(alert) {
      try {
        await api.put(`/urgent-alerts/${alert.id}`, { active: !alert.active });
        this.urgentAlerts = await api.get('/urgent-alerts');
        this.notify(alert.active ? 'Alert deactivated.' : 'Alert activated.');
      } catch (e) {
        this.notify(e.message, 'error');
      }
    },
    async addVideo() {
      if (this.savingVideo) return;
      this.savingVideo = true;
      try {
        await api.post('/videos', this.newVideo);
        this.videos = await api.get('/videos');
        this.newVideo.url = '';
        this.newVideo.title = '';
        this.notify('Video added.');
      } catch (e) {
        this.notify(e.message, 'error');
      } finally {
        this.savingVideo = false;
      }
    },
    async removeVideo(video) {
      if (!window.confirm('Delete this video?')) return;
      try {
        await api.delete(`/videos/${video.id}`);
        this.videos = this.videos.filter((v) => v.id !== video.id);
        this.notify('Video deleted.');
      } catch (e) {
        this.notify(e.message, 'error');
      }
    },
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
.alerts-admin {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--line);
}

.alerts-admin form {
  display: grid;
  gap: 1rem;
  max-width: 550px;
  margin: 1.5rem 0 2rem;
}

.alerts-admin li {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--line);
}
.alerts-admin li.is-inactive { opacity: 0.55; }
</style>
