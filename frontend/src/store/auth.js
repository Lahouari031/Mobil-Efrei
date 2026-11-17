// Global authentication state, shared by every component.
// reactive() makes the object reactive: when user changes, the UI updates by itself.
import { reactive } from 'vue';
import { api } from '../api/client';

export const auth = reactive({
  user: null,
  loaded: false, // have we already asked the server whether a session exists?

  get isLoggedIn() {
    return this.user !== null;
  },
  get isAdmin() {
    return this.user?.role === 'admin';
  },

  async fetchMe() {
    try {
      const { user } = await api.get('/auth/me');
      this.user = user;
    } catch {
      this.user = null;
    } finally {
      this.loaded = true;
    }
  },

  async login(login, password) {
    const { user } = await api.post('/auth/login', { login, password });
    this.user = user;
  },

  async register(payload) {
    const { user } = await api.post('/auth/register', payload);
    this.user = user;
  },

  async logout() {
    await api.post('/auth/logout');
    this.user = null;
  },
});
