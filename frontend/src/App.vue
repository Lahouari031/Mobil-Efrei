<!-- Root component: navigation bar + current page + footer -->
<template>
  <NavBar />
  <main :class="{ page: !$route.meta.immersive }" class="main">
    <router-view />
  </main>
  <footer class="footer">
    <div class="container">Mobil'Efrei · Advanced Web Programming Project 2026</div>
  </footer>
  <ScrollTopButton />
</template>

<script>
import NavBar from './components/NavBar.vue';
import ScrollTopButton from './components/ScrollTopButton.vue';

export default {
  name: 'App',
  components: { NavBar, ScrollTopButton },
};
</script>

<style scoped>
.main { flex: 1; display: flex; flex-direction: column; }
.footer { border-top: 1px solid var(--line); padding: 1.4rem 0; font-size: 0.8rem; color: var(--muted); }
</style>
