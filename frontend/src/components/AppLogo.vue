<!-- Mobil'Efrei logo (yellow script lettering with the globe). The height is passed as a prop. -->
<template>
  <img :src="logo" alt="Mobil'Efrei" class="logo" :style="{ height: height + 'px' }" />
</template>

<script>
import logo from '../assets/logo.png';

export default {
  name: 'AppLogo',
  props: {
    height: { type: Number, default: 40 },
  },
  data() {
    return { logo };
  },
};
</script>

<style scoped>
.logo { width: auto; display: block; }
</style>
