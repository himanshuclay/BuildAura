<template>
  <Header />
  <div>
    <h1>Welcome to Home Page</h1>
  </div>
</template>

<script>
import Header from '@/components/header/Header.vue';

export default {
  name: 'HomeView',
  components: {
    Header,
  },
}
</script>
