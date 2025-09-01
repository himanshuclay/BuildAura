<template>
  <div class="layout">
    <Sidebar />

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '~~/common/Sidebar.vue'
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.page {
  flex: 1;
  padding: 1rem;
}
</style>
