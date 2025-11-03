<template>
  <div class="card">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ poll.question }}</h2>

    <div v-if="!hasVoted" class="space-y-3">
      <div
        v-for="option in poll.options"
        :key="option.id"
        class="voting-option"
        :class="{ 'voting-option-selected': selectedOptionId === option.id }"
        @click="selectOption(option.id)"
      >
        <div class="flex items-center">
          <input
            type="radio"
            :id="`option-${option.id}`"
            :value="option.id"
            v-model="selectedOptionId"
            class="w-4 h-4 text-primary-600 focus:ring-primary-500"
          />
          <label
            :for="`option-${option.id}`"
            class="ml-3 text-gray-900 cursor-pointer flex-1"
          >
            {{ option.text }}
          </label>
        </div>
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <button
        class="btn-primary w-full mt-6"
        :disabled="!selectedOptionId || submitting"
        @click="submitVote"
      >
        {{ submitting ? 'Submitting...' : 'Submit Vote' }}
      </button>
    </div>

    <div v-else class="text-center py-8">
      <div class="mb-4">
        <svg
          class="mx-auto h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-xl font-semibold text-gray-900 mb-2">Vote Submitted!</p>
      <p class="text-gray-600">Thank you for voting. View live results below.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { votesApi } from '@/api/votes';
import type { PollOption, Poll } from '@shared/types';

interface PollWithOptions extends Poll {
  options: PollOption[];
}

const props = defineProps<{
  poll: PollWithOptions;
  userId: number;
}>();

const emit = defineEmits<{
  voted: [];
}>();

const selectedOptionId = ref<number | null>(null);
const hasVoted = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);

const selectOption = (optionId: number) => {
  if (!hasVoted.value) {
    selectedOptionId.value = optionId;
  }
};

const submitVote = async () => {
  if (!selectedOptionId.value) {
    return;
  }

  try {
    submitting.value = true;
    error.value = null;

    await votesApi.create({
      poll_option_id: selectedOptionId.value,
      user_id: props.userId,
    });

    hasVoted.value = true;
    emit('voted');
  } catch (err: any) {
    error.value = err.message || 'Failed to submit vote';
    console.error('Failed to submit vote:', err);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.voting-option {
  @apply p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all;
  @apply hover:border-primary-300 hover:bg-primary-50;
}

.voting-option-selected {
  @apply border-primary-500 bg-primary-50;
}
</style>

