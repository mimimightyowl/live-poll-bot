<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Live Results</h2>
      <div class="flex items-center gap-2">
        <span
          class="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
          :class="wsConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="wsConnected ? 'bg-green-500' : 'bg-gray-400'"
          ></span>
          {{ wsConnected ? 'Live' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Loading results...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="results" class="space-y-4">
      <div class="text-sm text-gray-600 mb-4">
        Total votes: <span class="font-semibold">{{ results.total_votes }}</span>
      </div>

      <div
        v-for="option in results.options"
        :key="option.id"
        class="result-bar-container"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-900 font-medium">{{ option.text }}</span>
          <div class="flex items-center gap-3">
            <span class="text-gray-600">{{ option.vote_count }} votes</span>
            <span class="text-primary-600 font-semibold">
              {{ getPercentage(option.vote_count) }}%
            </span>
          </div>
        </div>
        <div class="result-bar-bg">
          <div
            class="result-bar-fill"
            :style="{ width: `${getPercentage(option.vote_count)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600">No results available yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { pollsApi } from '@/api/polls';
import { useWebSocket } from '@/composables/useWebSocket';
import type { PollResults } from '@shared/types';

const props = defineProps<{
  pollId: number;
  autoRefresh?: boolean;
}>();

const results = ref<PollResults | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// WebSocket connection
const { isConnected: wsConnected } = useWebSocket({
  pollId: props.pollId,
  onUpdate: (updatedResults) => {
    console.log('Received poll update:', updatedResults);
    results.value = updatedResults;
  },
  onError: (err) => {
    console.error('WebSocket error:', err);
  },
});

const getPercentage = (voteCount: number): number => {
  if (!results.value || results.value.total_votes === 0) {
    return 0;
  }
  return Math.round((voteCount / results.value.total_votes) * 100);
};

const fetchResults = async () => {
  try {
    loading.value = true;
    error.value = null;
    results.value = await pollsApi.getResults(props.pollId);
  } catch (err: any) {
    error.value = err.message || 'Failed to load results';
    console.error('Failed to load results:', err);
  } finally {
    loading.value = false;
  }
};

// Watch for pollId changes
watch(() => props.pollId, () => {
  fetchResults();
});

onMounted(() => {
  fetchResults();
});
</script>

<style scoped>
.result-bar-container {
  @apply transition-all;
}

.result-bar-bg {
  @apply w-full h-8 bg-gray-200 rounded-full overflow-hidden;
}

.result-bar-fill {
  @apply h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out;
}
</style>

