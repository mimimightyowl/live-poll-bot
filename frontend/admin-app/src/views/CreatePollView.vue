<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Create Poll</h1>
    </div>

    <div class="card max-w-2xl">
      <PollForm @submit="handleSubmit" @cancel="handleCancel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import PollForm from '@/components/PollForm.vue';
import { pollsApi } from '@shared/api/polls';
import type { CreatePollDto } from '@shared/types';

const router = useRouter();

const handleSubmit = async (data: CreatePollDto) => {
  try {
    const poll = await pollsApi.create(data);
    router.push(`/poll/${poll.id}`);
  } catch (err: any) {
    alert(err.message || 'Failed to create poll');
  }
};

const handleCancel = () => {
  router.push('/');
};
</script>
