import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '@shared/styles/main.css';

const app = createApp(App);

// Setup toast notifications
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
});

app.use(router);

app.mount('#app');
