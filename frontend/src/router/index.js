// Router: maps each URL to a view and protects the pages that require a signed-in user
import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../store/auth';

import LandingView from '../views/LandingView.vue';
import HomeView from '../views/HomeView.vue';
import ExploreView from '../views/ExploreView.vue';
import DestinationView from '../views/DestinationView.vue';
import AdminView from '../views/AdminView.vue';
import ShopView from '../views/ShopView.vue';
import NotFoundView from '../views/NotFoundView.vue';



const routes = [
  // Public landing page = sign-in page ("/") or sign-up page ("/register")
  { path: '/', name: 'landing', component: LandingView, meta: { guestOnly: true, immersive: true } },
  { path: '/register', name: 'register', component: LandingView, meta: { guestOnly: true, immersive: true } },
  { path: '/login', redirect: '/' },

  // Protected pages
  // Protected pages
{ path: '/explore', name: 'explore', component: ExploreView, meta: { requiresAuth: true } },
{ path: '/destinations', name: 'home', component: HomeView, meta: { requiresAuth: true } },
{ path: '/destinations/:slug', name: 'destination', component: DestinationView, meta: { requiresAuth: true }, props: true },
{ path: '/shop', name: 'shop', component: ShopView, meta: { requiresAuth: true } },
{ path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from) {
    // Switching between the sign-in and sign-up tabs must not jump to the top
    if (to.meta.immersive && from.meta.immersive) return false;
    return { top: 0 };
  },
});

// Navigation guard: runs before every page change
router.beforeEach(async (to) => {
  if (!auth.loaded) await auth.fetchMe(); // on first load, check whether a session exists

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'landing', query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'explore' };
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'explore' };
});

export default router;
