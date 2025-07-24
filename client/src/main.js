
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { registerValidationRules } from './validation/vee-validation';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Toast from 'vue3-toastify';
import 'vue3-toastify/dist/index.css'; // Import the Toastify CSS


const app = createApp(App);

registerValidationRules();

app.use(Toast, {
  position: 'top-right',  // Use the position string directly
  autoClose: 5000,        // Auto-close after 5 seconds
  hideProgressBar: false, // Show progress bar
  closeOnClick: true,     // Close when clicked
  pauseOnHover: true,     // Pause on hover
  draggable: true,        // Make it draggable
});

app.use(router);

app.mount('#app');
