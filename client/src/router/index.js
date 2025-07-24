import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import About from '@/views/About.vue'
import SignUp from '@/views/SignUp.vue'
import Login from '@/views/Login.vue'
import SUPER_ADMIN_ROUTES from './superAdmin'

const routes = [
  {path: '/', name: 'Home', component: HomeView},
  {path: '/about', name: 'About', component: About},
  {path: '/signup', name: 'SignUp', component: SignUp},
  {path: '/login', name: 'Login', component: Login},
  ...SUPER_ADMIN_ROUTES,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
