<template>
  <div>
    <div class="mb-6">
      <button class="btn-secondary mb-4" @click="$router.push('/')">
        Back to Polls
      </button>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="text-gray-600 mt-4">Loading poll...</p>
      </div>

      <div v-else-if="error" class="card bg-red-50 border border-red-200">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="flex-1">
            <p class="text-red-600 font-medium">{{ error.message }}</p>
            <button @click="fetchPoll" class="btn-secondary mt-4 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ poll?.question }}
            </h1>
            <p class="text-gray-600">
              Created {{ formatDate(poll?.created_at || '') }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Manage Options</h2>
            <PollOptionManager
              v-if="poll"
              :poll-id="poll.id"
              @options-changed="fetchResults"
            />
          </div>

          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Results</h2>
            <PollResults v-if="results" :results="results" />
            <div v-else class="text-center py-8">
              <p class="text-gray-600">No results available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PollOptionManager from '@/components/PollOptionManager.vue';
import PollResults from '@/components/PollResults.vue';
import { pollsApi } from '@shared/api/polls';
import { formatDate, retryWithNotification } from '@shared/utils';
import type { Poll, PollResults as PollResultsType, ApiError } from '@shared/types';

const route = useRoute();
const poll = ref<Poll | null>(null);
const results = ref<PollResultsType | null>(null);
const loading = ref(true);
const error = ref<ApiError | null>(null);

const pollId = Number(route.params.id);

const fetchPoll = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    poll.value = await retryWithNotification(
      () => pollsApi.getById(pollId),
      {
        maxRetries: 2,
        resourceName: 'poll',
      }
    );
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

const fetchResults = async () => {
  try {
    results.value = await retryWithNotification(
      () => pollsApi.getResults(pollId),
      {
        maxRetries: 2,
        resourceName: 'results',
      }
    );
  } catch (err: any) {
    // Silently fail for results, they're not critical
    console.error('Failed to load results:', err);
  }
};

onMounted(async () => {
  await fetchPoll();
  await fetchResults();
});
</script>
