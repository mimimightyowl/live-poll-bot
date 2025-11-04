<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <div>
        <label
          for="question"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Poll Question
        </label>
        <textarea
          id="question"
          v-model="formData.question"
          rows="3"
          class="input"
          placeholder="What's your question?"
          required
        />
      </div>

      <div>
        <label
          for="created_by"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Created By (User ID)
        </label>
        <input
          id="created_by"
          v-model.number="formData.created_by"
          type="number"
          class="input"
          placeholder="Enter user ID"
          required
          min="1"
        />
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" class="btn-primary">Create Poll</button>
        <button type="button" class="btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { CreatePollDto } from '@shared/types';

const emit = defineEmits<{
  submit: [data: CreatePollDto];
  cancel: [];
}>();

const formData = reactive<CreatePollDto>({
  question: '',
  created_by: 1,
});

const handleSubmit = () => {
  emit('submit', { ...formData });
};
</script>
