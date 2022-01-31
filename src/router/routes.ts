import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Network.vue') }]
  },
  {
    path: '/network',
    name: 'Network',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Network.vue') }]
  },
  {
    path: '/vote',
    name: 'Vote',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Vote.vue') }]
  },
  {
    path: '/proposal',
    name: 'Proposal',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Proposal.vue') }]
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Explore.vue') }]
  },
  {
    path: '/therms',
    name: 'THERMS',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Therms.vue') }]
  },
  {
    path: '/privacy',
    name: 'PRIVACY',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Privacy.vue') }]
  },
  {
    path: '/repository',
    name: 'REPOSITORY',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Repository.vue') }]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
];

export default routes;
