<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Polls</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading polls...</p>
    </div>

    <div v-else-if="error" class="card bg-red-50 border border-red-200">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <PollList
      v-else
      :polls="polls"
      @delete="handleDelete"
      @view-results="handleViewResults"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PollList from '@/components/PollList.vue';
import { pollsApi } from '@/api/polls';
import type { Poll } from '@/types';

const router = useRouter();
const polls = ref<Poll[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchPolls = async () => {
  try {
    loading.value = true;
    error.value = null;
    polls.value = await pollsApi.getAll();
  } catch (err: any) {
    error.value = err.message || 'Failed to load polls';
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this poll?')) return;

  try {
    await pollsApi.delete(id);
    polls.value = polls.value.filter(poll => poll.id !== id);
  } catch (err: any) {
    alert(err.message || 'Failed to delete poll');
  }
};

const handleViewResults = (id: number) => {
  router.push(`/poll/${id}`);
};

onMounted(fetchPolls);
</script>

