import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'PollsList',
    component: () => import('@/views/PollsListView.vue'),
  },
  {
    path: '/poll/:id/vote',
    name: 'PollVote',
    component: () => import('@/views/PollVotingView.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
