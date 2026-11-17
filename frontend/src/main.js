// Creates the root Vue instance, adds the router and a global directive, then mounts it in <div id="app">
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/style.css';

const app = createApp(App);

// Custom directive v-reveal: direct DOM manipulation.
// When the element enters the viewport, the CSS class "is-visible" is added to it.
app.directive('reveal', {
  mounted(el) {
    el.classList.add('reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      });
    });
    observer.observe(el);
  },
});

app.use(router).mount('#app');
