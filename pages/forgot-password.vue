<template>
  <div class="login-wrap">
    <div class="login-card forgot-card">
      <div class="login-card__logo">
        <img src="/logo.svg" alt="Getpayed logo" width="40" height="40" />
      </div>
      <h1 class="forgot-title">Forgot Password?</h1>
      

      <form class="login-form" @submit.prevent="handleSubmit" novalidate>
        <label for="forgot-email" class="forgot-label">Email Address:</label>
        <div class="email-field">
          <span class="email-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            :disabled="loading"
            :class="{ error: error }"
          />
        </div>

        <span v-if="error" class="err-msg">{{ error }}</span>
        <span v-if="message" class="success-msg">{{ message }}</span>

        <button
          type="submit"
          class="btn btn-primary login-submit"
          :disabled="loading"
        >
          {{ loading ? 'Sending...' : 'Send reset password link' }}
        </button>
      </form>

      <a href="/login" class="forgot-link">Back to Login</a>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
import { ref } from 'vue'
import { API_BASE } from '~/composables/appState'

useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
})

const email = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')

async function handleSubmit() {
  error.value = ''
  message.value = ''

  if (!email.value.trim()) {
    error.value = 'Email is required'
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim().toLowerCase() }),
    })
    const data = await res.json()

    if (!res.ok) {
      // Handle rate limiting specifically
      if (data.error && data.error.includes('Too many password reset attempts')) {
        error.value = data.error
      } else {
        error.value = data.error || 'Failed to send reset link'
      }
      return
    }

    message.value = 'A reset link has been sent to your email. Please check your inbox.'
    email.value = ''
  } catch {
    error.value = 'Could not reach the server. Make sure the backend is running.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-title {
  font-size: 23px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: 0.4px;
  width: 100%;
  margin: 0 0 8px;
  text-align: center;
}

.forgot-sub {
  font-size: 14px;
  color: var(--muted-fg);
  margin-bottom: 28px;
  transform: translateY(-28px);
  text-align: center;
}

.forgot-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  margin: 28px 0 4px;
  transform: translateY(13px);
}

.email-field {
  position: relative;
}

.email-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-fg);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.email-field input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--input-bg);
  font-size: 14px;
  color: var(--fg);
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.email-field input:focus {
  border-color: color-mix(in srgb, var(--primary) 50%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
}

.email-field input.error {
  border-color: color-mix(in srgb, var(--destructive) 60%, transparent);
}

.forgot-link {
  display: block;
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
}

.forgot-link:hover {
  color: var(--accent);
}

.forgot-card {
  max-width: 520px;
  padding: 32px 40px;
  min-height: 380px;
  justify-content: center;
}

.success-msg {
  font-size: 13px;
  color: #059669;
  text-align: center;
}

@media (max-width: 480px) {
  .forgot-card {
    padding: 24px 16px;
    min-height: auto;
  }

  .forgot-title {
    font-size: 20px;
    transform: none;
    margin-top: 0;
  }

  .forgot-label {
    margin: 32px 0 4px;
    transform: none;
  }

  .email-field input {
    padding: 10px 12px 10px 38px;
    font-size: 13px;
  }

  .email-icon {
    left: 10px;
  }

  .email-icon svg {
    width: 16px;
    height: 16px;
  }
}
</style>
