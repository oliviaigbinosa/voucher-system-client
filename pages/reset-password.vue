<template>
  <div class="login-wrap">
    <div v-if="!success" class="login-card">
      <h1 class="forgot-title">Reset Password</h1>
      <p class="forgot-sub">Create a new password for your account.</p>

      <form class="login-form" @submit.prevent="handleSubmit" novalidate>
        <FormField
          v-model="newPassword"
          label="New Password"
          :type="showNew ? 'text' : 'password'"
          placeholder="Enter new password"
          :error="errors.newPassword"
          :disabled="loading"
          @input="delete errors.newPassword"
        >
          <template #suffix>
            <button
              type="button"
              class="pwd-toggle"
              @click="showNew = !showNew"
              :aria-label="showNew ? 'Hide password' : 'Show password'"
            >
              <svg
                v-if="!showNew"
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
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </template>
        </FormField>

        <FormField
          v-model="confirmPassword"
          label="Confirm Password"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="Confirm new password"
          :error="errors.confirmPassword"
          :disabled="loading"
          @input="delete errors.confirmPassword"
        >
          <template #suffix>
            <button
              type="button"
              class="pwd-toggle"
              @click="showConfirm = !showConfirm"
              :aria-label="showConfirm ? 'Hide password' : 'Show password'"
            >
              <svg
                v-if="!showConfirm"
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
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </template>
        </FormField>

        <span v-if="errors.general" class="err-msg login-general-error">{{
          errors.general
        }}</span>

        <button
          type="submit"
          class="btn btn-primary login-submit"
          :disabled="loading"
        >
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <a href="/login" class="forgot-link">Back to Login</a>
    </div>

    <div v-else class="login-card success-card">
      <div class="success-icon">✓</div>
      <h2 class="serif success-title">Your password has been successfully reset</h2>
      <a href="/login" class="btn btn-primary login-submit">Back to Login</a>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import FormField from '../components/FormField.vue'
import { API_BASE } from '~/composables/appState'

const route = useRoute()
const token = computed(() => String(route.query.token || ''))
const email = computed(() => String(route.query.email || ''))

const newPassword = ref('')
const confirmPassword = ref('')
const showNew = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const success = ref(false)
const errors = reactive({})

function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character'
  return null
}

async function handleSubmit() {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!token.value) errors.general = 'Reset link is missing or invalid'

  const passwordError = validatePassword(newPassword.value)
  if (passwordError) errors.newPassword = passwordError

  if (!confirmPassword.value) {
    errors.confirmPassword = 'Please confirm your password'
  }
  if (newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (Object.keys(errors).length) return

  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        email: email.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      // Handle rate limiting specifically
      if (data.error && data.error.includes('Too many reset attempts')) {
        errors.general = data.error
      } else {
        errors.general = data.error || 'Failed to reset password'
      }
      return
    }

    success.value = true
  } catch {
    errors.general = 'Could not reach the server. Make sure the backend is running.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 8px;
  text-align: center;
}

.forgot-sub {
  font-size: 14px;
  color: var(--muted-fg);
  margin-bottom: 28px;
  text-align: center;
}

.forgot-link {
  display: block;
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
}

.forgot-link:hover {
  color: var(--accent);
}

.success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #d1fae5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
}

.success-title {
  font-size: 22px;
  font-weight: 700;
}

@media (max-width: 480px) {
  .forgot-title {
    font-size: 22px;
  }

  .forgot-sub {
    font-size: 13px;
    margin-bottom: 20px;
  }

  .success-icon {
    width: 52px;
    height: 52px;
    font-size: 24px;
  }

  .success-title {
    font-size: 18px;
  }
}
</style>
