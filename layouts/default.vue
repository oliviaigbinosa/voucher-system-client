<script setup>
import { computed, ref } from 'vue'

const route = useRoute()
const showSidebar = computed(() => !['login', 'index'].includes(String(route.name ?? '')))
const sidebarOpen = ref(false)
</script>

<template>
  <div class="app-layout">
    <Sidebar v-if="showSidebar" :sidebar-open="sidebarOpen" @close="sidebarOpen = false" />
    <main class="app-content">
      <div v-if="showSidebar" class="topbar">
        <button class="topbar__menu" aria-label="Open menu" @click="sidebarOpen = true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span class="topbar__title">PCV System</span>
      </div>
      <ClientOnly>
        <slot />
      </ClientOnly>
    </main>
  </div>
</template>
