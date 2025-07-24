<template>
  <header class="header">
    <h1 class="logo">
      <router-link to="/">Build Aura</router-link>
    </h1>
    <nav class="nav">
      <router-link to="/about">About</router-link>
      <router-link to="/signup">SignUp</router-link>
    </nav>
  </header>
</template>

<script setup>
// No logic needed for now
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #42b983;
  color: white;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav a {
  color: white;
  margin-left: 1rem;
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-active {
  text-decoration: underline;
}
</style>
