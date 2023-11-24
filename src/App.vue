<template>
<v-app>
  <RouterView />
</v-app>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

html, body {
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    color: #fff;
}
#app {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  color: #fff;
}
</style>
