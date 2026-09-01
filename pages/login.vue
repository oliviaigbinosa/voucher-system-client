<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-card__logo">
        <img src="/logo.svg" alt="Getpayed logo" width="40" height="40" />
      </div>
      <p class="login-card__company">Getpayed Technology Solutions Ltd.</p>
      <h1 class="login-card__title serif">Sign in to your account</h1>
      <p class="login-card__sub">Petty Cash Voucher System</p>

      <div v-if="showLogoutMessage" class="logout-success-block">
        <p class="logout-success-text">You have signed out successfully. Sign back in?</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin" novalidate>
        <FormField
          v-model="loginForm.email"
          label="Email Address"
          type="email"
          placeholder="Enter your getpayed email"
          :error="loginErrors.email"
          :disabled="loggingIn"
          @input="delete loginErrors.email"
        />

        <FormField
          v-model="loginForm.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your password"
          :error="loginErrors.password"
          :disabled="loggingIn"
          @input="delete loginErrors.password"
        >
          <template #suffix>
            <button
              type="button"
              class="pwd-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg
                v-if="!showPassword"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </template>
        </FormField>

        <NuxtLink to="/forgot-password" class="forgot-link">Forgot Password?</NuxtLink>

        <span v-if="loginErrors.general" class="err-msg login-general-error">{{
          loginErrors.general
        }}</span>

        <button
          type="submit"
          class="btn btn-primary login-submit"
          :disabled="loggingIn"
        >
          {{ loggingIn ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.forgot-link {
  display: inline-flex;
  align-self: flex-end;
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
  margin: -4px 0 6px;
}

.forgot-link:hover {
  color: var(--accent);
}

.logout-success-block {
  background: linear-gradient(to right, #1c3557 5px, #f3f4f6 5px);
  border-radius: 0;
  padding: 12px 23px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.logout-success-text {
  margin: 0;
  font-size: 14px;
  color: #000;
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .logout-success-block {
    padding: 10px 16px;
  }

  .logout-success-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .logout-success-block {
    padding: 8px 12px;
  }

  .logout-success-text {
    font-size: 12px;
    white-space: normal;
  }
}
</style>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FormField from '../components/FormField.vue'
import { API_BASE, loginUser, fetchVouchers, fetchLeaveRequests, fetchOnboardingUsers } from '~/composables/appState'

useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
})

const router = useRouter()
const route = useRoute()

function isLoginEmail(v) {
  return /^[^\s@]+@getpayedmail\.com$/.test(v)
}

const showPassword = ref(false)
const loggingIn = ref(false)
const loginForm = reactive({ email: '', password: '' })
const loginErrors = reactive({})
const showLogoutMessage = ref(route.query.logout === 'true')

// Clear the logout query parameter after showing the message once
if (showLogoutMessage.value) {
  router.replace({ query: {} })
}

async function handleLogin() {
  delete loginErrors.email
  delete loginErrors.password
  delete loginErrors.general

  if (!isLoginEmail(loginForm.email)) {
    loginErrors.email = 'Email must end with @getpayedmail.com'
  }
  if (!loginForm.password) {
    loginErrors.password = 'Password is required'
  }

  if (Object.keys(loginErrors).length) return

  loggingIn.value = true
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginForm.email,
        password: loginForm.password,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      // Handle rate limiting specifically
      if (data.error && data.error.includes('Too many login attempts')) {
        loginErrors.general = data.error
      } else {
        loginErrors.general = data.error || 'Login failed'
      }
      return
    }

    // Store JWT token
    if (data.token) {
      sessionStorage.setItem('pcv_token', data.token)
    }

    loginUser(data.email, data.role, data.department || '', data.createdBy || '')
    
    // Fetch vouchers and leave requests immediately after login
    const fetchPromises = [
      fetchVouchers(),
      fetchLeaveRequests()
    ]
    
    // Fetch onboarding users if the user is an admin or super admin
    if (data.role === 'admin' || data.role === 'super admin') {
      fetchPromises.push(fetchOnboardingUsers())
    }
    
    await Promise.all(fetchPromises)
    
    router.replace(data.role === 'admin' || data.role === 'super admin' ? { name: 'admin' } : { name: 'form' })
  } catch {
    loginErrors.general = 'Could not reach the server. Make sure the backend is running.'
  } finally {
    loggingIn.value = false
  }
}
</script>
