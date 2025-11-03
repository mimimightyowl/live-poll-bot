<template>
  <div id="app" class="min-h-screen">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-primary-600">
              Polls & Votes
            </router-link>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-4"></div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>

    <!-- Dev Mode: User Info Display -->
    <DevUserInfo />
  </div>
</template>

<script setup lang="ts">
import DevUserInfo from '@/components/DevUserInfo.vue';
</script>