import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Users from '../views/Users.vue';
import VacationRequests from '../views/VacationRequests.vue';
import Preferences from '../views/Preferences.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/vacation-requests',
    name: 'VacationRequests',
    component: VacationRequests
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: Preferences
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
