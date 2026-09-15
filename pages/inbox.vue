<template>
  <div class="page-wrap">
    <div class="vouchers-header">
      <div>
        <h1 class="serif vouchers-title">Demo Inbox</h1>
        <p class="vouchers-sub">Your received emails will appear here</p>
      </div>
    </div>

    <div v-if="loading" class="vouchers-empty">
      <p>Loading emails...</p>
    </div>

    <div v-else-if="emails.length === 0" class="vouchers-empty">
      <p class="vouchers-empty__title">No emails yet</p>
      <p class="vouchers-empty__sub">When vouchers, invites, leave requests, or password reset emails are sent to you, they'll appear here.</p>
    </div>

    <div v-else class="inbox-list card">
      <div
        v-for="email in emails"
        :key="email._id"
        @click="openEmail(email)"
        :class="['inbox-item', { 'unread': !email.isRead }]"
      >
        <div class="inbox-item__left">
          <div class="inbox-item__avatar">{{ getInitial(email.senderName || email.senderEmail) }}</div>
          <div class="inbox-item__content">
            <div class="inbox-item__header">
              <span class="inbox-item__sender">{{ email.senderName || email.senderEmail }}</span>
              <span class="inbox-item__time">{{ formatTime(email.createdAt) }}</span>
            </div>
            <div class="inbox-item__subject">{{ email.subject }}</div>
            <div class="inbox-item__preview">{{ getPreview(email.text) }}</div>
            <div class="inbox-item__type">
              <span :class="['type-badge', `type-${email.type}`]">{{ formatType(email.type) }}</span>
            </div>
          </div>
        </div>
        <div v-if="!email.isRead" class="inbox-item__unread-dot"></div>
      </div>
    </div>

    <!-- Email Preview Modal -->
    <div v-if="selectedEmail" @click.self="closeEmail" class="modal-backdrop">
      <div role="dialog" aria-modal="true" class="modal modal-large">
        <div class="modal-header">
          <div class="modal-header__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Email Preview
          </div>
          <button @click="closeEmail" aria-label="Close" class="modal-close">✕</button>
        </div>
        <div class="modal-body modal-body--email">
          <div class="email-preview">
            <div class="email-preview__header">
              <h2 class="email-preview__subject">{{ selectedEmail.subject }}</h2>
              <div class="email-preview__meta">
                <div class="email-preview__from">
                  <span class="email-preview__label">From:</span>
                  <span>{{ selectedEmail.senderName || selectedEmail.senderEmail }}</span>
                  <span class="email-preview__email">&lt;{{ selectedEmail.senderEmail }}&gt;</span>
                </div>
                <div class="email-preview__to">
                  <span class="email-preview__label">To:</span>
                  <span>{{ selectedEmail.recipientEmail }}</span>
                </div>
                <div class="email-preview__date">
                  <span class="email-preview__label">Date:</span>
                  <span>{{ formatDate(selectedEmail.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="email-preview__body">
              <div v-if="selectedEmail.html" v-html="selectedEmail.html" class="email-preview__html"></div>
              <pre v-else class="email-preview__text">{{ selectedEmail.text }}</pre>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEmail" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userEmail, API_BASE } from '~/composables/appState'

const loading = ref(true)
const emails = ref([])
const selectedEmail = ref(null)

async function fetchEmails() {
  try {
    if (!userEmail.value) return
    const response = await fetch(`${API_BASE}/api/email/inbox?email=${userEmail.value}`)
    const data = await response.json()
    let fetched = data.emails || []

    // Keep finance inbox aligned with server-side routing.
    // For finance.manager we show all emails sent to that mailbox, except
    // department-member declined voucher notices that are intentionally excluded.
    const FINANCE_EMAIL = 'finance.manager@getpayedmail.com'
    const DEPT_MEMBER_EMAIL = 'department.member@getpayedmail.com'
    const me = String(userEmail.value || '').toLowerCase()
    if (me === FINANCE_EMAIL) {
      fetched = fetched.filter((e) => {
        const type = String(e.type || '').toLowerCase()
        const sender = String(e.senderEmail || '').toLowerCase()
        const recipient = String(e.recipientEmail || '').toLowerCase()
        const status = String(e?.metadata?.voucherStatus || '').toLowerCase()

        if (recipient !== FINANCE_EMAIL) return false

        if (type === 'leave-status') {
          return sender === FINANCE_EMAIL && ['approved', 'declined'].includes(status)
        }

        if (type === 'leave-request') {
          // Show leave requests where finance.manager is the recipient
          return true
        }

        if ((type === 'voucher' || type === 'voucher-status')) {
          if (sender === DEPT_MEMBER_EMAIL && status === 'declined') return false

          const isApprovedDeptVoucher = sender === DEPT_MEMBER_EMAIL && status === 'approved'
          const isFinanceProcessedRejected = sender === FINANCE_EMAIL && ['processed', 'rejected'].includes(status)
          const isAdminOrOtherNonFinanceVoucher = sender && sender !== FINANCE_EMAIL && sender !== DEPT_MEMBER_EMAIL && !['processed', 'rejected'].includes(status)

          return isApprovedDeptVoucher || isFinanceProcessedRejected || isAdminOrOtherNonFinanceVoucher
        }

        return false
      })
    }

    emails.value = fetched
  } catch (error) {
    console.error('Failed to fetch emails:', error)
  } finally {
    loading.value = false
  }
}

async function markAsRead(emailId) {
  try {
    await fetch(`${API_BASE}/api/email/${emailId}/read`, {
      method: 'PATCH',
    })
    window.dispatchEvent(new CustomEvent('inbox-updated'))
  } catch (error) {
    console.error('Failed to mark email as read:', error)
  }
}

function openEmail(email) {
  selectedEmail.value = email
  if (!email.isRead) {
    markAsRead(email._id)
    email.isRead = true
  }
}

function closeEmail() {
  selectedEmail.value = null
}

function getInitial(nameOrEmail) {
  if (!nameOrEmail) return '?'
  const [local] = nameOrEmail.split('@')
  const parts = local.split(/[.\-_]+/).filter(Boolean)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('').slice(0, 2)
}

function getPreview(text) {
  if (!text) return ''
  return text.slice(0, 120) + (text.length > 120 ? '...' : '')
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  
  return date.toLocaleDateString()
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

function formatType(type) {
  const typeMap = {
    'voucher': 'Voucher',
    'invite': 'Invite',
    'leave-request': 'Leave Request',
    'leave-status': 'Leave Status',
    'voucher-status': 'Voucher Status',
    'password-reset': 'Password Reset',
  }
  return typeMap[type] || type
}

onMounted(() => {
  fetchEmails()
  window.addEventListener('inbox-updated', fetchEmails)
})
</script>

<style scoped>
.inbox-list {
  padding: 0;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.inbox-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.inbox-item:last-child {
  border-bottom: none;
}

.inbox-item:hover {
  background: var(--muted);
}

.inbox-item.unread {
  background: color-mix(in srgb, var(--primary) 3%, transparent);
}

.inbox-item__left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.inbox-item__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.inbox-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inbox-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.inbox-item__sender {
  font-weight: 600;
  font-size: 14px;
  color: var(--fg);
}

.inbox-item__time {
  font-size: 12px;
  color: var(--muted-fg);
  white-space: nowrap;
}

.inbox-item__subject {
  font-weight: 500;
  font-size: 14px;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inbox-item__preview {
  font-size: 13px;
  color: var(--muted-fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inbox-item__type {
  margin-top: 4px;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-voucher {
  background: #dbeafe;
  color: #1e40af;
}

.type-invite {
  background: #d1fae5;
  color: #065f46;
}

.type-leave-request,
.type-leave-status {
  background: #fef3c7;
  color: #92400e;
}

.type-voucher-status {
  background: #e0e7ff;
  color: #3730a3;
}

.inbox-item__unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.modal-large {
  max-width: 800px;
}

.modal-body--email {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.email-preview {
  padding: 24px;
}

.email-preview__header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.email-preview__subject {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 16px;
}

.email-preview__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.email-preview__from,
.email-preview__to,
.email-preview__date {
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-preview__label {
  color: var(--muted-fg);
  font-weight: 500;
  min-width: 50px;
}

.email-preview__email {
  color: var(--muted-fg);
}

.email-preview__body {
  line-height: 1.6;
}

.email-preview__text {
  white-space: pre-wrap;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg);
  margin: 0;
}

.email-preview__html {
  font-size: 14px;
  color: var(--fg);
}

.email-preview__html :deep(p) {
  margin-bottom: 12px;
}
</style>
