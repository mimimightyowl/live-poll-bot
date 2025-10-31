<template>
  <div>
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        Total Votes:
        <span class="font-semibold">{{ results.total_votes }}</span>
      </p>
    </div>

    <div v-if="results.options.length === 0" class="text-center py-8">
      <p class="text-gray-600">No options available</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="option in results.options"
        :key="option.id"
        class="border border-gray-200 rounded-lg p-4"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-gray-900">{{ option.text }}</span>
          <div class="text-right">
            <span class="text-sm text-gray-600">
              {{ option.vote_count }} votes
            </span>
            <span class="ml-2 text-sm font-semibold text-primary-600">
              ({{ calculatePercentage(option.vote_count) }}%)
            </span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            :style="{
              width: `${calculatePercentage(option.vote_count)}%`,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PollResults } from '@/types';
import { calculatePercentage as calcPercentage } from '@/utils/helpers';

const props = defineProps<{
  results: PollResults;
}>();

const calculatePercentage = (value: number): number => {
  return calcPercentage(value, props.results.total_votes);
};
</script>

