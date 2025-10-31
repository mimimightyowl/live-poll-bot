<template>
  <div>
    <div class="mb-6">
      <button @click="$router.push('/')" class="btn-secondary mb-4">
        ← Back to Polls
      </button>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Loading poll...</p>
      </div>

      <div v-else-if="error" class="card bg-red-50 border border-red-200">
        <p class="text-red-600">{{ error }}</p>
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
          <!-- Poll Options Manager -->
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Manage Options</h2>
            <PollOptionManager
              v-if="poll"
              :poll-id="poll.id"
              @options-changed="fetchResults"
            />
          </div>

          <!-- Poll Results -->
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
import { pollsApi } from '@/api/polls';
import { formatDate } from '@/utils/helpers';
import type { Poll, PollResults as PollResultsType } from '@/types';

const route = useRoute();
const poll = ref<Poll | null>(null);
const results = ref<PollResultsType | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const pollId = Number(route.params.id);

const fetchPoll = async () => {
  try {
    loading.value = true;
    error.value = null;
    poll.value = await pollsApi.getById(pollId);
  } catch (err: any) {
    error.value = err.message || 'Failed to load poll';
  } finally {
    loading.value = false;
  }
};

const fetchResults = async () => {
  try {
    results.value = await pollsApi.getResults(pollId);
  } catch (err: any) {
    console.error('Failed to load results:', err);
  }
};

onMounted(async () => {
  await fetchPoll();
  await fetchResults();
});
</script>

