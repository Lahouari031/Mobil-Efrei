<!--
  Landing page (public) = sign-in / sign-up page.
  A short introduction and the account form.
  The guides themselves stay behind authentication.
-->
<template>
  <section class="landing container">
    <div class="landing__intro">
      <h1 class="fade">The semester abroad guide, <span class="accent">by EFREI students.</span></h1>
      <p class="muted fade">Practical advice and student experiences for your semester in South Africa.</p>
    </div>

    <div class="landing__auth fade">
      <AuthPanel :mode="mode" />
    </div>
  </section>
</template>

<script>
import { gsap } from 'gsap';
import AuthPanel from '../components/AuthPanel.vue';

export default {
  name: 'LandingView',
  components: { AuthPanel },
  computed: {
    // The active tab of the auth panel follows the URL ("/" or "/register")
    mode() {
      return this.$route.name === 'register' ? 'register' : 'login';
    },
  },
  mounted() {
    // Simple staggered fade-in on load (GSAP), scoped to this component
    this.ctx = gsap.context(() => {
      gsap.from('.fade', { opacity: 0, y: 16, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
    }, this.$el);
  },
  unmounted() {
    this.ctx?.revert();
  },
};
</script>

<style scoped>
.landing {
  flex: 1;
  min-height: calc(100vh - 150px);
  display: grid;
  grid-template-columns: 1fr minmax(460px, 540px);
  gap: 4rem;
  align-items: center;
  padding: 3rem 0;
}
.landing__intro h1 { font-size: clamp(2rem, 3.6vw, 2.9rem); max-width: 520px; }

@media (max-width: 900px) {
  .landing { grid-template-columns: 1fr; gap: 2rem; }
}
</style>
