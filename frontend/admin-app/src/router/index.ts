import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import PollsView from '../views/PollsView.vue';
import CreatePollView from '../views/CreatePollView.vue';
import PollDetailsView from '../views/PollDetailsView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Polls',
    component: PollsView,
  },
  {
    path: '/create',
    name: 'CreatePoll',
    component: CreatePollView,
  },
  {
    path: '/poll/:id',
    name: 'PollDetails',
    component: PollDetailsView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
