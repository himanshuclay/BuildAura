<script setup>

</script>

<template>
  <div id="app">
      <router-view />
  </div>
</template>

<style scoped>
nav {
  padding: 1rem;
  background-color: #f5f5f5;
  margin-bottom: 1rem;
}

nav a {
  margin-right: 15px;
  text-decoration: none;
  color: #333;
}

nav a.router-link-active {
  font-weight: bold;
  color: #42b983;
}
</style>
