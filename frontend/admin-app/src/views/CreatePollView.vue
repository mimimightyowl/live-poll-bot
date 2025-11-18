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
import { toast } from '@shared/utils';

const router = useRouter();

const handleSubmit = async (data: CreatePollDto) => {
  try {
    const poll = await pollsApi.create(data);
    toast.success('Poll created successfully!');
    router.push(`/poll/${poll.id}`);
  } catch (err: any) {
    // API client already shows error toast
  }
};

const handleCancel = () => {
  router.push('/');
};
</script>
