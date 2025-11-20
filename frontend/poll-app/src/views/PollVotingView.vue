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

    <div v-if="loading || loadingUser" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
      ></div>
      <p class="text-gray-600 mt-4">
        {{ loading ? 'Loading poll...' : 'Loading user...' }}
      </p>
    </div>

    <div v-else-if="error" class="card bg-red-50 border border-red-200">
      <div class="flex items-start">
        <svg
          class="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="flex-1">
          <p class="text-red-600 font-medium">{{ error.message }}</p>
          <button
            @click="fetchPoll"
            class="btn-secondary mt-4 flex items-center"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="poll && currentUser" class="space-y-6">
      <VotingInterface
        :poll="poll"
        :user-id="currentUser.id"
        @voted="handleVoted"
      />

      <LiveResults v-if="showResults" :poll-id="poll.id" :auto-refresh="true" />
    </div>

    <div
      v-else-if="poll && !currentUser && !loadingUser"
      class="card bg-red-50 border border-red-200"
    >
      <div class="flex items-start">
        <svg
          class="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="flex-1">
          <p class="text-red-600 font-medium">Telegram ID is required</p>
          <p class="text-red-500 text-sm mt-2">
            Please access this page with a valid telegram_id query parameter.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { pollsApi, type PollWithOptions } from '@/api/polls';
import { usersApi } from '@/api/users';
import VotingInterface from '@/components/VotingInterface.vue';
import LiveResults from '@/components/LiveResults.vue';
import { getTelegramIdFromUrl } from '@/utils/telegramAuth';
import { retryWithNotification } from '@shared/utils';
import type { ApiError, User } from '@shared/types';

const router = useRouter();
const route = useRoute();

const poll = ref<PollWithOptions | null>(null);
const currentUser = ref<User | null>(null);
const loading = ref(true);
const loadingUser = ref(true);
const error = ref<ApiError | null>(null);
const showResults = ref(false);

const pollId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id, 10) : 0;
});

const fetchUser = async () => {
  try {
    loadingUser.value = true;
    const telegramId = getTelegramIdFromUrl();

    if (!telegramId) {
      loadingUser.value = false;
      return;
    }

    // Use retry mechanism for network resilience
    currentUser.value = await retryWithNotification(
      () => usersApi.getByTelegramId(telegramId),
      {
        maxRetries: 2,
        resourceName: 'user',
      }
    );
  } catch (err: any) {
    error.value = err;
  } finally {
    loadingUser.value = false;
  }
};

const fetchPoll = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!pollId.value) {
      throw new Error('Invalid poll ID');
    }

    // Use retry mechanism for network resilience
    poll.value = await retryWithNotification(
      () => pollsApi.getWithOptions(pollId.value),
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

const handleVoted = () => {
  showResults.value = true;
};

const goBack = () => {
  router.push('/');
};

onMounted(async () => {
  await Promise.all([fetchUser(), fetchPoll()]);
});
</script>
