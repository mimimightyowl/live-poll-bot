<template>
  <div class="space-y-4">
    <div v-if="polls.length === 0" class="card text-center py-12">
      <p class="text-gray-600">No polls found.</p>
    </div>

    <div
      v-for="poll in polls"
      :key="poll.id"
      class="card hover:shadow-xl transition-shadow"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ poll.question }}
          </h3>
          <p class="text-sm text-gray-600">
            Created {{ formatDate(poll.created_at) }}
          </p>
        </div>

        <div class="flex gap-2 ml-4">
          <button
            class="btn-primary text-sm"
            @click="$emit('start-vote', poll.id)"
          >
            Start Vote
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Poll } from '@shared/types';
import { formatDate } from '@shared/utils';

defineProps<{
  polls: Poll[];
}>();
</script>
