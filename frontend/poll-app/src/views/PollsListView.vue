<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Polls</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading polls...</p>
    </div>

    <div v-else-if="error" class="card bg-red-50 border border-red-200">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <PollsList v-else :polls="polls" @start-vote="handleStartVote" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { pollsApi } from '@/api/polls';
import PollsList from '@/components/PollsList.vue';
import type { Poll } from '@shared/types';

const router = useRouter();
const polls = ref<Poll[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchPolls = async () => {
  try {
    loading.value = true;
    error.value = null;
    polls.value = await pollsApi.getAll();
  } catch (err: any) {
    error.value = err.message || 'Failed to load polls';
    console.error('Failed to load results:', error.value);
  } finally {
    loading.value = false;
  }
};

const handleStartVote = (id: number) => {
  router.push(`/poll/${id}/vote`);
};

onMounted(fetchPolls);
</script>
