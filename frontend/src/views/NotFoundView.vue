<!-- 404 page -->
<template>
  <div class="container notfound">
    <h1><span class="accent">404</span></h1>
    <p class="muted">This page doesn't exist. Maybe a future destination?</p>
    <router-link to="/">Back home</router-link>
  </div>
</template>

<script>
export default { name: 'NotFoundView' };
</script>

<style scoped>
.notfound { text-align: center; padding: 4rem 0; }
</style>
