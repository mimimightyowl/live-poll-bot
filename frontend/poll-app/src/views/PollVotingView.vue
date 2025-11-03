<template>
  <div>
    <div class="mb-6">
      <button
        @click="goBack"
        class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Polls
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading poll...</p>
    </div>

    <div v-else-if="error" class="card bg-red-50 border border-red-200">
      <p class="text-red-600">{{ error }}</p>
      <button @click="fetchPoll" class="btn-secondary mt-4">
        Try Again
      </button>
    </div>

    <div v-else-if="poll" class="space-y-6">
      <VotingInterface
        :poll="poll"
        :user-id="currentUserId"
        @voted="handleVoted"
      />

      <LiveResults
        v-if="showResults"
        :poll-id="poll.id"
        :auto-refresh="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { pollsApi, type PollWithOptions } from '@/api/polls';
import VotingInterface from '@/components/VotingInterface.vue';
import LiveResults from '@/components/LiveResults.vue';
import { 
  getMockUserId, 
  hasVotedForPoll, 
  markPollAsVoted 
} from '@/utils/mockAuth';

const router = useRouter();
const route = useRoute();

const poll = ref<PollWithOptions | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showResults = ref(false);

// MOCK: Using fixed user ID for development
// In production this should come from auth service
const currentUserId = computed(() => getMockUserId());

const pollId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id, 10) : 0;
});

const fetchPoll = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!pollId.value) {
      throw new Error('Invalid poll ID');
    }

    poll.value = await pollsApi.getWithOptions(pollId.value);

    // Check if user has already voted
    if (hasVotedForPoll(pollId.value)) {
      showResults.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load poll';
    console.error('Failed to load poll:', err);
  } finally {
    loading.value = false;
  }
};

const handleVoted = () => {
  // Mark as voted in localStorage
  markPollAsVoted(pollId.value);
  showResults.value = true;
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchPoll();
});
</script>
