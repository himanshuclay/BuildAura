<template>
  <div class="dashboard-container">
    <Sidebar />
    <div class="main-content">
      <div class="section">Section 1</div>
      <div class="section">Section 2</div>
      <div class="section">Section 3</div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/sidebar/superAdmin/Sidebar.vue';

export default {
  name: 'SuperAdmin',
  components: {
    Sidebar,
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  background-color: #f9f9f9;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}
</style>
