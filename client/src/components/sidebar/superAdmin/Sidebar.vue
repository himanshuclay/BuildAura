<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2><router-link to="/" class="menu-item">BuildAura</router-link></h2>
    </div>
    <ul class="sidebar-menu">
      <li>
        <router-link to="/dashboard" class="menu-item">Dashboard</router-link>
      </li>
      <li>
        <router-link to="/company" class="menu-item">Company</router-link>
      </li>
      <li>
        <router-link to="/contact" class="menu-item">Contact</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #333;
  color: white;
  padding-top: 20px;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 30px;
}

.sidebar-menu {
  list-style-type: none;
  padding: 0;
}

.menu-item {
  display: block;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  margin: 5px 0;
  background-color: #444;
  border-radius: 4px;
}

.menu-item:hover {
  background-color: #555;
}

.router-link-exact-active {
  background-color: #666;
}
</style>
