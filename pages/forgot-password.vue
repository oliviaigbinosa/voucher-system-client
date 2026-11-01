<template>
  <div class="login-wrap">
    <div class="login-card forgot-card">
      <div class="login-card__logo">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1c3557"
          stroke-width="2"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
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
            placeholder="Test with demo email"
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
    // Store password reset email in session storage instead of sending to backend
    if (typeof window !== 'undefined') {
      try {
        const resetToken = 'demo-reset-token-' + Date.now()
        const displayName = email.value.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        const emailEntry = {
          _id: `email-${Date.now()}`,
          recipientEmail: email.value.trim().toLowerCase(),
          senderEmail: 'pettyflo.support@example.com',
          senderName: 'PettyFlo Support',
          subject: 'Reset your Petty Cash Voucher password',
          text: `Hello,\n\nYou requested a password reset for your Petty Cash Voucher account.\n\nClick the link below to set a new password:\nhttps://pettycashvoucher.netlify.app/reset-password?token=${resetToken}&email=${encodeURIComponent(email.value.trim().toLowerCase())}\n\nThis link will expire in 30 minutes. If you did not request this reset, please ignore this email.`,
          html: null,
          type: 'password-reset',
          relatedId: null,
          metadata: null,
          createdAt: new Date().toISOString(),
          isRead: false
        }

        // Get existing emails from session storage
        const existingEmails = JSON.parse(sessionStorage.getItem('pcv_emails') || '[]')
        // Add new email at the beginning
        const updatedEmails = [emailEntry, ...existingEmails]
        sessionStorage.setItem('pcv_emails', JSON.stringify(updatedEmails))
      } catch (error) {
        console.warn('Failed to store password reset email in session storage:', error)
      }
    }

    message.value = 'A reset link has been sent to your email. Please check your inbox.'
    email.value = ''
  } catch {
    error.value = 'Could not send reset link. Request failed'
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

@media (max-width: 768px) {
  /* Make content smaller and more compact on small screens */
  .forgot-card {
    padding: 16px 12px;
    transform: scale(0.95);
    transform-origin: center center;
  }

  .forgot-title {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .forgot-label {
    font-size: 14px;
    margin: 16px 0 4px;
  }

  .email-field input {
    padding: 8px 12px 8px 36px;
    font-size: 16px; /* Prevent iOS zoom on focus */
  }

  .email-icon {
    left: 12px;
  }

  .email-icon svg {
    width: 16px;
    height: 16px;
  }

  .login-submit {
    padding: 10px 16px;
    font-size: 14px;
  }

  .forgot-link {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  /* Make content even smaller on mobile screens */
  .forgot-card {
    padding: 12px 8px;
    transform: scale(0.9);
    transform-origin: center center;
  }

  .forgot-title {
    font-size: 18px;
    margin-bottom: 4px;
  }

  .forgot-label {
    font-size: 13px;
    margin: 12px 0 3px;
  }

  .email-field input {
    padding: 6px 10px 6px 32px;
    font-size: 16px; /* Prevent iOS zoom on focus */
  }

  .email-icon {
    left: 10px;
  }

  .email-icon svg {
    width: 14px;
    height: 14px;
  }

  .login-submit {
    padding: 8px 12px;
    font-size: 13px;
  }

  .forgot-link {
    font-size: 11px;
  }
}
</style>
