import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Polls',
    component: () => import('@/views/PollsView.vue'),
  },
  {
    path: '/create',
    name: 'CreatePoll',
    component: () => import('@/views/CreatePollView.vue'),
  },
  {
    path: '/poll/:id',
    name: 'PollDetails',
    component: () => import('@/views/PollDetailsView.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
