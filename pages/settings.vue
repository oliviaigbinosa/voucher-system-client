<template>
  <div class="page-wrap">
    <div class="vouchers-header">
      <div>
        <h1 class="serif vouchers-title">Settings</h1>
        <p class="vouchers-sub">Update your account password</p>
      </div>
    </div>

    <div class="settings-form card">
      <h2 class="settings-form__title serif">Change Password</h2>
      <p class="settings-form__sub">
        Signed in as <strong>{{ userEmail }}</strong>
      </p>

      <form class="settings-form__fields" @submit.prevent="handleChangePassword" novalidate>
        <div class="field">
          <label class="mono-label">Current Password </label>
          <div class="pwd-wrap">
            <input
              v-model="form.currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              placeholder="Enter current password"
              :class="{ error: errors.currentPassword }"
              :disabled="saving"
              @input="delete errors.currentPassword"
            />
            <button
              type="button"
              class="pwd-toggle"
              :aria-label="showCurrent ? 'Hide password' : 'Show password'"
              @click="showCurrent = !showCurrent"
            >
              <svg
                v-if="!showCurrent"
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
          </div>
          <span v-if="errors.currentPassword" class="err-msg">{{ errors.currentPassword }}</span>
        </div>

        <div class="field">
          <label class="mono-label">New Password </label>
          <div class="pwd-wrap">
            <input
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="Enter new password"
              :class="{ error: errors.newPassword }"
              :disabled="saving"
              @input="delete errors.newPassword"
            />
            <button
              type="button"
              class="pwd-toggle"
              :aria-label="showNew ? 'Hide password' : 'Show password'"
              @click="showNew = !showNew"
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
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <span v-if="errors.newPassword" class="err-msg">{{ errors.newPassword }}</span>
        </div>

        <div class="field">
          <label class="mono-label">Confirm New Password </label>
          <div class="pwd-wrap">
            <input
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Re-enter new password"
              :class="{ error: errors.confirmPassword }"
              :disabled="saving"
              @input="delete errors.confirmPassword"
            />
            <button
              type="button"
              class="pwd-toggle"
              :aria-label="showConfirm ? 'Hide password' : 'Show password'"
              @click="showConfirm = !showConfirm"
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
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="err-msg">{{ errors.confirmPassword }}</span>
        </div>

        <span v-if="errors.general" class="err-msg">{{ errors.general }}</span>
        <p v-if="successMessage" class="settings-form__success">{{ successMessage }}</p>

        <button type="submit" class="btn btn-primary settings-form__submit" :disabled="saving">
          {{ saving ? 'Updating…' : 'Update Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { changePassword, userEmail } from '~/composables/appState'

const saving = ref(false)
const successMessage = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

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

async function handleChangePassword() {
  if (saving.value) return
  delete errors.currentPassword
  delete errors.newPassword
  delete errors.confirmPassword
  delete errors.general
  successMessage.value = ''

  if (!form.currentPassword) {
    errors.currentPassword = 'Current password is required'
  }
  
  const passwordError = validatePassword(form.newPassword)
  if (passwordError) {
    errors.newPassword = passwordError
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password'
  }
  if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  if (Object.keys(errors).length) return

  saving.value = true
  try {
    await changePassword(form.currentPassword, form.newPassword)
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    successMessage.value = 'Your password has been updated.'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update password'
    if (message.toLowerCase().includes('current password')) {
      errors.currentPassword = message
    } else {
      errors.general = message
    }
  } finally {
    saving.value = false
  }
}
</script>
