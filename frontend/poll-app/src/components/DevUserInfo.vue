<template>
  <div
    v-if="isDev"
    class="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 shadow-lg z-50"
  >
    <div class="flex items-center gap-2 mb-2">
      <svg
        class="w-5 h-5 text-yellow-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span class="text-sm font-semibold text-yellow-800">DEV Mode</span>
    </div>

    <div class="text-xs text-yellow-700 space-y-1">
      <div class="flex items-center justify-between gap-4">
        <span class="font-medium">User ID:</span>
        <span class="font-mono bg-yellow-50 px-2 py-0.5 rounded">{{
          userInfo.id
        }}</span>
      </div>
      <div class="flex items-center justify-between gap-4">
        <span class="font-medium">Username:</span>
        <span class="font-mono bg-yellow-50 px-2 py-0.5 rounded">{{
          userInfo.username
        }}</span>
      </div>
    </div>

    <div class="mt-3 pt-2 border-t border-yellow-300 flex gap-2">
      <button
        @click="changeUser"
        class="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
        title="Change user ID"
      >
        Change User
      </button>
      <button
        @click="clearVoted"
        class="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
        title="Clear all voted statuses"
      >
        Reset Votes
      </button>
    </div>

    <div class="mt-2 text-xs text-yellow-600">
      <details>
        <summary class="cursor-pointer hover:text-yellow-800">
          Console Commands
        </summary>
        <div class="mt-1 text-xs font-mono bg-yellow-50 p-2 rounded">
          mockAuth.setUserId(2)<br />
          mockAuth.clearAllVoted()
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getMockUserInfo,
  setMockUserId,
  clearAllVotedStatuses,
} from '@/utils/mockAuth';

// @ts-ignore
const isDev = import.meta.env.DEV as boolean;
const userInfo = ref(getMockUserInfo());

const changeUser = () => {
  const newUserId = prompt('Enter new user ID:', String(userInfo.value.id));
  if (newUserId && !isNaN(Number(newUserId))) {
    setMockUserId(Number(newUserId));
    userInfo.value = getMockUserInfo();
    window.location.reload();
  }
};

const clearVoted = () => {
  if (
    confirm(
      'Clear all voted statuses? This will allow you to vote again in all polls.'
    )
  ) {
    clearAllVotedStatuses();
    window.location.reload();
  }
};

// Update user info when it changes
onMounted(() => {
  // Check for changes every second
  setInterval(() => {
    const current = getMockUserInfo();
    if (current.id !== userInfo.value.id) {
      userInfo.value = current;
    }
  }, 1000);
});
</script>
