import { reactive } from 'vue';
import { api } from '../api/client';

export const auth = reactive({
  user: null,
  loaded: false, 

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
  const result = await api.post('/auth/login', { login, password });
  this.user = result.user ?? null;
  return result;
},

async register(payload) {
  const result = await api.post('/auth/register', payload);
  this.user = result.user ?? null;
  return result;
},

async verifyEmail(code) {
  const { user } = await api.post('/auth/verify-email', { code });
  this.user = user;
},

  async logout() {
    await api.post('/auth/logout');
    this.user = null;
  },
});
