<!-- Navigation bar: logo on the left, a few text links on the right (depends on the signed-in user) -->
<template>
  <header class="navbar">
    <nav class="container navbar__inner">
      <router-link :to="auth.isLoggedIn ? '/explore' : '/'" class="navbar__brand" aria-label="Mobil'Efrei home">
        <AppLogo :height="32" />
      </router-link>

      <ul v-if="auth.isLoggedIn" class="navbar__links">
        <li><router-link to="/explore">Explore</router-link></li>
        <li v-if="auth.isAdmin"><router-link to="/admin">Admin</router-link></li>
        <li class="muted">@{{ auth.user.username }}</li>
        <li><button class="link-btn" @click="onLogout">Sign out</button></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import AppLogo from './AppLogo.vue';
import { auth } from '../store/auth';

export default {
  name: 'NavBar',
  components: { AppLogo },
  data() {
    return { auth };
  },
  methods: {
    async onLogout() {
      await this.auth.logout();
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.navbar { border-bottom: 1px solid var(--line); }
.navbar__inner { display: flex; align-items: center; justify-content: space-between; height: 72px; }
.navbar__brand { text-decoration: none; }
.navbar__links { display: flex; align-items: center; gap: 1.6rem; list-style: none; margin: 0; padding: 0; font-size: 0.92rem; }
.navbar__links a { text-decoration: none; color: var(--muted); }
.navbar__links a:hover,
.navbar__links a.router-link-active { color: var(--text); }
.navbar__links .link-btn { font-size: 0.92rem; }

@media (max-width: 600px) {
  .navbar__links { gap: 1rem; }
  .navbar__links .muted { display: none; }
}
</style>
