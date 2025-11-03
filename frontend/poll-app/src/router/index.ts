import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import PollsListView from '@/views/PollsListView.vue';
import PollVotingView from '@/views/PollVotingView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'PollsList',
    component: PollsListView,
  },
  {
    path: '/poll/:id/vote',
    name: 'PollVote',
    component: PollVotingView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
