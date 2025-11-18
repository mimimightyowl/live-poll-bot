<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Polls</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p class="text-gray-600 mt-4">Loading polls...</p>
    </div>

    <div v-else-if="error" class="card bg-red-50 border border-red-200">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1">
          <p class="text-red-600 font-medium">{{ error.message }}</p>
          <button @click="fetchPolls" class="btn-secondary mt-4 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </div>

    <PollsList v-else :polls="polls" @start-vote="handleStartVote" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { pollsApi } from '@/api/polls';
import PollsList from '@/components/PollsList.vue';
import type { Poll, ApiError } from '@shared/types';
import { retryWithNotification } from '@shared/utils';

const router = useRouter();
const polls = ref<Poll[]>([]);
const loading = ref(true);
const error = ref<ApiError | null>(null);

const fetchPolls = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Use retry mechanism for network resilience
    polls.value = await retryWithNotification(
      () => pollsApi.getAll(),
      {
        maxRetries: 2,
        resourceName: 'polls',
      }
    );
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

const handleStartVote = (id: number) => {
  router.push(`/poll/${id}/vote`);
};

onMounted(fetchPolls);
</script>
