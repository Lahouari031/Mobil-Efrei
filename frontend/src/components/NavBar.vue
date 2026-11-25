<!--
  Navigation bar: logo on the left, "hamburger" menu (3 lines) on the right.
  Clicking the button opens a drop-down menu with the links of the signed-in user.
-->
<template>
  <header class="navbar">
    <nav class="container navbar__inner" aria-label="Main navigation">
      <router-link :to="auth.isLoggedIn ? '/explore' : '/'" class="navbar__brand" aria-label="Mobil'Efrei home">
        <AppLogo :height="32" />
      </router-link>

      <div v-if="auth.isLoggedIn" ref="menu" class="menu">
        <button
          type="button"
          class="menu__toggle"
          :class="{ 'is-open': open }"
          :aria-expanded="open"
          aria-controls="main-menu"
          :aria-label="open ? 'Close the menu' : 'Open the menu'"
          @click="open = !open"
        >
          <span class="menu__bar"></span>
          <span class="menu__bar"></span>
          <span class="menu__bar"></span>
        </button>

        <transition name="drop">
          <ul v-show="open" id="main-menu" class="menu__panel">
            <li class="menu__user">
              <span class="muted">Signed in as</span>
              <strong>@{{ auth.user.username }}</strong>
            </li>
            <li><router-link to="/explore">Explore</router-link></li>
            <li><router-link to="/destinations">All destinations</router-link></li>
            <li><router-link to="/shop">Shop</router-link></li>
            <li v-if="auth.isAdmin"><router-link to="/admin">Admin</router-link></li>
            <li><button type="button" class="menu__logout" @click="onLogout">Sign out</button></li>
          </ul>
        </transition>
      </div>
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
    return { auth, open: false };
  },
  watch: {
    // The menu closes itself when we go to another page
    $route() {
      this.open = false;
    },
  },
  mounted() {
    // Click outside the menu or Escape key => the menu closes (event listeners on the document)
    this.onDocClick = (e) => {
      if (this.open && this.$refs.menu && !this.$refs.menu.contains(e.target)) this.open = false;
    };
    this.onKey = (e) => {
      if (e.key === 'Escape') this.open = false;
    };
    document.addEventListener('click', this.onDocClick);
    document.addEventListener('keydown', this.onKey);
  },
  unmounted() {
    document.removeEventListener('click', this.onDocClick);
    document.removeEventListener('keydown', this.onKey);
  },
  methods: {
    async onLogout() {
      this.open = false;
      await this.auth.logout();
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.navbar { border-bottom: 1px solid var(--line); position: relative; z-index: 1000; }
.navbar__inner { display: flex; align-items: center; justify-content: space-between; height: 72px; }
.navbar__brand { text-decoration: none; }

.menu { position: relative; }

/* The 3 horizontal lines; they turn into a cross when the menu is open */
.menu__toggle {
  width: 44px; height: 44px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 5px;
  background: none; border: 1px solid var(--line); border-radius: var(--radius); cursor: pointer;
}
.menu__toggle:hover, .menu__toggle.is-open { border-color: var(--yellow); }
.menu__toggle:focus-visible { outline: 2px solid var(--yellow); outline-offset: 2px; }
.menu__bar { display: block; width: 20px; height: 2px; border-radius: 2px; background: var(--text); transition: transform 0.25s, opacity 0.25s; }
.menu__toggle.is-open .menu__bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.menu__toggle.is-open .menu__bar:nth-child(2) { opacity: 0; }
.menu__toggle.is-open .menu__bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.menu__panel {
  position: absolute; right: 0; top: calc(100% + 0.6rem); min-width: 230px; margin: 0; padding: 0.5rem; list-style: none;
  background: var(--blue); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}
.menu__panel li a, .menu__logout {
  display: block; width: 100%; padding: 0.7rem 0.9rem; border-radius: 6px; text-align: left;
  color: var(--text); text-decoration: none; font-size: 0.95rem; background: none; border: 0; cursor: pointer;
}
.menu__panel li a:hover, .menu__logout:hover { background: rgba(255, 255, 255, 0.08); color: var(--yellow); }
.menu__panel li a.router-link-exact-active { color: var(--yellow); }
.menu__user { display: flex; flex-direction: column; padding: 0.6rem 0.9rem 0.8rem; margin-bottom: 0.3rem; border-bottom: 1px solid var(--line); font-size: 0.85rem; }
.menu__logout { border-top: 1px solid var(--line); border-radius: 0 0 6px 6px; margin-top: 0.3rem; }

.drop-enter-active, .drop-leave-active { transition: opacity 0.18s, transform 0.18s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
