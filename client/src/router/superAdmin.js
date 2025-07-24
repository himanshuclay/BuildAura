import SuperAdmin from '@/views/superAdmin/SuperAdmin.vue';
import Dashboard from '@/views/superAdmin/SuperAdmin.vue'

const SUPER_ADMIN_ROUTES = [
  {path: '/superAdmin/dashboard', name: 'SuperAdmin', component: SuperAdmin},
  {path: '/superAdmin/company', name: 'SuperAdmin', component: SuperAdmin},
]


export default SUPER_ADMIN_ROUTES;
