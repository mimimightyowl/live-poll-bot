<template>
  <div>
    <!-- Add Option Form -->
    <form @submit.prevent="handleAdd" class="mb-6">
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

    <!-- Options List -->
    <div v-if="loading" class="text-center py-4">
      <p class="text-gray-600 text-sm">Loading options...</p>
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
          @click="handleDelete(props.pollId, option.id)"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { pollOptionsApi } from '@/api/pollOptions';
import type { PollOption } from '@/types';

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
    options.value = await pollOptionsApi.getByPollId(props.pollId);
  } catch (err: any) {
    console.error('Failed to load options:', err);
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
    emit('options-changed');
  } catch (err: any) {
    alert(err.message || 'Failed to add option');
  }
};

const handleDelete = async (pollId: number, poll_option_id: number) => {
  if (!confirm('Are you sure you want to delete this option?')) return;

  try {
    await pollOptionsApi.delete(pollId, poll_option_id);
    options.value = options.value.filter(opt => opt.id !== poll_option_id);
    emit('options-changed');
  } catch (err: any) {
    alert(err.message || 'Failed to delete option');
  }
};

onMounted(fetchOptions);
</script>

