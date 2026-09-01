<template>
  <div>
    <div v-if="sidebarOpen" @click="emit('close')" class="sidebar-overlay"></div>
    <aside :class="['sidebar', { 'open': sidebarOpen }]">
      <div class="sidebar__brand">
        <div class="sidebar__icon">
          <img src="/logo.svg" alt="Getpayed logo" width="28" height="28" />
        </div>
        <div>
          <p class="sidebar__company">Getpayed Ltd.</p>
          <p class="sidebar__system">PCV System</p>
        </div>
        <button @click="emit('close')" aria-label="Close menu" class="sidebar__close">
          ✕
        </button>
      </div>

      <div class="sidebar__user">
        <div class="sidebar__avatar">{{ userInitial }}</div>
        <div class="sidebar__user-info">
          <p class="sidebar__user-email">{{ userEmail }}</p>
          <p v-if="isAdmin" class="sidebar__user-role">{{ userRole === 'super admin' ? 'Super Admin' : 'Administrator' }}</p>
        </div>
      </div>

      <nav class="sidebar__nav">
        <div class="sidebar__nav-head">
          <p class="sidebar__nav-group">Navigation</p>
          <NuxtLink
           
           
            :to="{ name: 'settings' }"
            aria-label="Settings"
            @click="emit('close')"
           :class="['sidebar__settings-btn', { 'active': route.name === 'settings' }]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          </NuxtLink>
        </div>
        <NuxtLink
         
         
          :to="{ name: 'form' }"
          @click="emit('close')"
         :class="['sidebar__nav-item', { 'active': route.name === 'form' }]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Petty Cash Form
        </NuxtLink>
        <NuxtLink
         
         
          :to="{ name: 'vouchers' }"
          @click="emit('close')"
         :class="['sidebar__nav-item', { 'active': route.name === 'vouchers' }]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 2h16v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1V2z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="16" y2="11" />
            <line x1="8" y1="15" x2="12" y2="15" />
          </svg>
          Vouchers
        </NuxtLink>
        <NuxtLink
          :to="{ name: 'leaverequest' }"
          @click="emit('close')"
          :class="['sidebar__nav-item', { 'active': route.name === 'leaverequest' }]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Leave Request
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
         
         
          :to="{ name: 'admin' }"
          @click="emit('close')"
         :class="['sidebar__nav-item', { 'active': route.name === 'admin' }]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Admin Panel
        </NuxtLink>
      </nav>

      <div class="sidebar__footer">

        <button @click="handleLogout" class="sidebar__logout">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>

    <div v-if="showLogoutModal" @click.self="showLogoutModal = false" class="modal-backdrop">
      <div role="dialog" aria-modal="true" aria-label="Sign out confirmation" style="max-width: 640px;" class="modal">
        <div style="padding: 8px 24px 4px;" class="modal-header">
          <div style="font-size: 16px; font-weight: 700; letter-spacing: -0.04em;" class="modal-header__title">Sign out?</div>
          <button @click="showLogoutModal = false" aria-label="Close" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 18px; font-weight: 900; letter-spacing: -0.04em; margin: 0;">Are you sure you want to sign out of this form?</p>
        </div>
        <div style="border-top: none;" class="modal-footer">
          <button style="border-radius: 9999px;" @click="showLogoutModal = false" class="btn btn-outline">Cancel</button>
          <button style="border-radius: 9999px;" @click="confirmLogout" class="btn btn-primary">Yes, Sign out</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAdmin, logoutUser, userEmail, userRole } from '~/composables/appState'

const props = defineProps({
  sidebarOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const showLogoutModal = ref(false)

const userInitial = computed(() => {
  if (!userEmail.value) return ''
  const [local] = userEmail.value.split('@')
  const parts = local.split(/[.\-_]+/).filter(Boolean)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
})


function handleLogout() {
  showLogoutModal.value = true
}

function confirmLogout() {
  logoutUser()
  showLogoutModal.value = false
  router.push({ name: 'login', query: { logout: 'true' } })
}
</script>
