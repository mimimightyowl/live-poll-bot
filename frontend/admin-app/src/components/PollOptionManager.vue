<template>
  <div>
    <form class="mb-6" @submit.prevent="handleAdd">
      <div class="flex gap-2">
        <input
          v-model="newOptionText"
          type="text"
          class="input flex-1"
          placeholder="New option text..."
          required
        />
        <button type="submit" class="btn-primary whitespace-nowrap">
          Add Option
        </button>
      </div>
    </form>

    <div v-if="loading" class="text-center py-4">
      <div
        class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"
      ></div>
      <p class="text-gray-600 text-sm mt-2">Loading options...</p>
    </div>

    <div v-else-if="options.length === 0" class="text-center py-8">
      <p class="text-gray-600">No options yet. Add your first option!</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="option in options"
        :key="option.id"
        class="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <span class="text-gray-900">{{ option.text }}</span>
        <button
          class="text-red-600 hover:text-red-800 text-sm font-medium"
          @click="handleDelete(props.pollId, option.id)"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { pollOptionsApi } from '@shared/api/pollOptions';
import type { PollOption } from '@shared/types';
import { toast, retryWithNotification } from '@shared/utils';

const props = defineProps<{
  pollId: number;
}>();

const emit = defineEmits<{
  'options-changed': [];
}>();

const options = ref<PollOption[]>([]);
const newOptionText = ref('');
const loading = ref(true);

const fetchOptions = async () => {
  try {
    loading.value = true;

    options.value = await retryWithNotification(
      () => pollOptionsApi.getByPollId(props.pollId),
      {
        maxRetries: 2,
        resourceName: 'options',
      }
    );
  } catch (err: any) {
    // API client already shows error toast
  } finally {
    loading.value = false;
  }
};

const handleAdd = async () => {
  if (!newOptionText.value.trim()) return;

  try {
    const option = await pollOptionsApi.create({
      poll_id: props.pollId,
      text: newOptionText.value,
    });
    options.value.push(option);
    newOptionText.value = '';
    toast.success('Option added successfully');
    emit('options-changed');
  } catch (err: any) {
    // API client already shows error toast
  }
};

const handleDelete = async (pollId: number, poll_option_id: number) => {
  if (!confirm('Are you sure you want to delete this option?')) return;

  try {
    await pollOptionsApi.delete(pollId, poll_option_id);
    options.value = options.value.filter(opt => opt.id !== poll_option_id);
    toast.success('Option deleted successfully');
    emit('options-changed');
  } catch (err: any) {
    // API client already shows error toast
  }
};

onMounted(fetchOptions);
</script>
