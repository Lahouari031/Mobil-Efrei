<!--
  "Back to top" button.
  Example of handling a DOM event "by hand": a listener is added on window
  with addEventListener and a callback function, then removed when the component disappears.
-->
<template>
  <button v-show="visible" class="scroll-top" aria-label="Back to top" @click="scrollUp">↑</button>
</template>

<script>
export default {
  name: 'ScrollTopButton',
  data() {
    return { visible: false };
  },
  mounted() {
    // Callback called on every page scroll
    this.onScroll = () => {
      this.visible = window.scrollY > 500;
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
  },
  unmounted() {
    window.removeEventListener('scroll', this.onScroll);
  },
  methods: {
    scrollUp() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
};
</script>

<style scoped>
.scroll-top {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--blue);
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s;
}
.scroll-top:hover { border-color: var(--yellow); color: var(--yellow); }
</style>
