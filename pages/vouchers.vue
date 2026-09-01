<template>
  <div class="page-wrap">
    <!-- Voucher detail view -->
    <div v-if="selectedVoucher" class="voucher-detail">
      <button class="btn btn-outline voucher-detail__back" @click="selectedVoucher = null">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <template v-if="activeTab === 'received'">
        <div v-if="displayedSelectedStatus === 'Processed'" class="approve-message card processed">
          <span style="display: inline-flex; align-items: center; gap: 6px;">This voucher has been processed<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12" /></svg></span>
        </div>
        <div v-else-if="displayedSelectedStatus === 'Rejected'" class="approve-message card declined">
          <span style="display: inline-flex; align-items: center; gap: 6px;">This voucher has been rejected<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></span>
        </div>
        <div v-else-if="displayedSelectedStatus === 'Declined'" class="approve-message card declined-admin">
          This voucher has been declined
        </div>
        <div v-else-if="isToMe && displayedSelectedStatus === 'Approved' && !selectedVoucher.submitterIsAdmin && !(isSuperAdmin && activeTab === 'received')" class="approve-message card success">
          This voucher has been approved
        </div>
        <div v-else-if="canSuperAdminAct" class="approve-actions-bar">
          <button class="btn btn-primary" :disabled="processing" style="background: #314668;" @click="showProcessModal = true">
            {{ processing && processingAction === 'process' ? 'Processing…' : 'Process' }}
          </button>
          <button class="btn btn-decline-subtle" @click="declineAction = 'reject'; showDeclineModal = true">Reject</button>
        </div>
        <div v-else-if="isToMe && !selectedVoucher.submitterIsAdmin && displayedSelectedStatus === 'Pending'" class="approve-actions-bar">
          <button class="btn btn-approve" :disabled="processing" @click="showApproveModal = true">
            {{ processing && processingAction === 'approve' ? 'Approving…' : 'Approve' }}
          </button>
          <button class="btn btn-decline" @click="declineAction = 'decline'; showDeclineModal = true">Decline</button>
        </div>
      </template>

      <div class="card">
        <div class="preview-head">
          <div>
            <p class="company-label">Getpayed Technology Solutions Ltd.</p>
            <h2 class="preview-title serif">Petty Cash Voucher</h2>
          </div>
          <div class="preview-head__right">
            <p class="mono-label tiny">Voucher No.</p>
            <code class="voucher-no">{{ selectedVoucher.id }}</code>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Email Details</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>From</span><span>{{ selectedVoucher.from || '—' }}</span>
            </div>
            <div class="preview-row">
              <span>To</span><span>{{ selectedVoucher.to || '—' }}</span>
            </div>
            <div v-if="!selectedVoucher.submitterIsAdmin" class="preview-row">
              <span>CC</span><span>{{ selectedVoucher.cc || '—' }}</span>
            </div>
            <div class="preview-row">
              <span>Subject</span><span>{{ selectedVoucher.subject || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Payee Information</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>Payee</span><span>{{ selectedVoucher.payee || '—' }}</span>
            </div>
            <div class="preview-row">
              <span>Department</span><span>{{ selectedVoucher.department || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Amount &amp; Purpose</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>Amount (Figures)</span>
              <span class="mono-input">₦{{ selectedVoucher.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</span>
            </div>
            <div class="preview-row">
              <span>Amount (Words)</span><span>{{ selectedVoucher.amountWords || '—' }}</span>
            </div>
            <div class="preview-row block-row">
              <span>Purpose</span><span>{{ selectedVoucher.purpose || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Supporting Documents</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>Submission Date</span><span>{{ selectedVoucher.submissionDate || '—' }}</span>
            </div>
            <div class="preview-row">
              <span>Attached Files</span>
              <span>
                <template v-if="selectedVoucher.supportingDocs?.length">
                  <span v-for="(doc, i) in selectedVoucher.supportingDocs" :key="i">
                    <a
                      v-if="typeof doc === 'object' && doc?.data"
                      class="file-link"
                      href="#"
                      @click.prevent="openFilePreview(doc)"
                    >{{ doc.name }}</a>
                    <span v-else>{{ typeof doc === 'string' ? doc : doc?.name || '—' }}</span>
                    {{ i < selectedVoucher.supportingDocs.length - 1 ? ', ' : '' }}
                  </span>
                </template>
                <template v-else>None</template>
              </span>
            </div>
          </div>
        </div>

        <div class="amount-banner">
          <span class="mono-label">Total Amount</span>
          <span class="amount-total serif">₦{{ selectedVoucher.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</span>
        </div>

        <div v-if="selectedVoucher.approvedBy || selectedVoucher.declinedBy || selectedVoucher.processedBy || selectedVoucher.rejectedBy" class="status-lines">
          <p v-if="selectedVoucher.approvedBy" class="processed-by mono-label">
            Approved by {{ selectedVoucher.approvedBy }}
          </p>
          <p v-if="selectedVoucher.declinedBy && selectedVoucher.status === 'Declined'" class="processed-by mono-label">
            Declined by {{ selectedVoucher.declinedBy }}
          </p>
          <p v-if="selectedVoucher.rejectedBy && selectedVoucher.status === 'Rejected'" class="processed-by mono-label">
            Rejected by {{ selectedVoucher.rejectedBy }}
          </p>
          <p v-if="selectedVoucher.processedBy" class="processed-by mono-label">
            Processed by {{ selectedVoucher.processedBy }}
          </p>
        </div>
      </div>
    </div>

    <template v-else>
      <div class="vouchers-header">
        <div>
          <h1 class="serif vouchers-title">My Vouchers</h1>
          <p class="vouchers-sub">
            {{ displayedVouchers.length }} voucher{{ displayedVouchers.length !== 1 ? 's' : '' }} {{ isAdminOrSuper ? (activeTab === 'sent' ? 'sent by you' : 'sent to you') : 'sent by you' }}
          </p>
        </div>
        <button class="btn btn-primary" @click="goToForm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Voucher
        </button>
      </div>

      <nav v-if="isAdminOrSuper" class="dashboard-tabs" role="tablist" aria-label="My voucher tabs">
        <button
          role="tab"
          class="dashboard-tabs__tab"
          :class="{ active: activeTab === 'sent' }"
          :aria-selected="activeTab === 'sent'"
          @click="activeTab = 'sent'"
        >
          Sent
        </button>
        <button
          role="tab"
          class="dashboard-tabs__tab"
          :class="{ active: activeTab === 'received' }"
          :aria-selected="activeTab === 'received'"
          @click="activeTab = 'received'"
        >
          Received
        </button>
      </nav>

      <VoucherTableSkeleton v-if="loadingVouchers" />

      <div v-else-if="!displayedVouchers.length" class="vouchers-empty card">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p class="vouchers-empty__title">No {{ isAdminOrSuper ? (activeTab === 'sent' ? 'sent' : 'received') : 'sent' }} vouchers</p>
        <p class="vouchers-empty__sub">
          {{ isAdminOrSuper ? (activeTab === 'sent' ? 'Vouchers you submit will appear here.' : 'Vouchers sent to you will appear here.') : 'Vouchers you submit will appear here.' }}
        </p>
        <button v-if="!isAdminOrSuper || activeTab === 'sent'" class="btn btn-primary" @click="goToForm">Create your first voucher</button>
      </div>

      <div v-else class="vouchers-table-wrap card">
        <table class="vouchers-table">
          <thead>
            <tr>
              <th>Voucher No.</th>
              <th>Date</th>
              <th>Payee</th>
              <th>Department</th>
              <th>Purpose</th>
              <th class="text-right">Amount</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="voucher in displayedVouchers"
              :key="voucher.id"
              class="vouchers-table__row"
              @click="openVoucher(voucher)"
            >
              <td>
                <code class="voucher-cell-no">{{ voucher.id }}</code>
              </td>
              <td class="text-muted">{{ voucher.submissionDate }}</td>
              <td class="font-medium">{{ voucher.payee }}</td>
              <td class="text-muted">{{ voucher.department }}</td>
              <td><span class="voucher-purpose" :class="{ expanded: expandedPurposes[voucher.id] }" @click.stop="togglePurpose(voucher.id)">{{ voucher.purpose }}</span></td>
              <td class="text-right font-mono font-medium">₦{{ voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
              <td class="text-center">
                <span class="status-badge" :class="'status-badge--' + (displayStatusOf(voucher).toLowerCase())">
                  <svg v-if="displayStatusOf(voucher) === 'Processed'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 4px;"><polyline points="20 6 9 17 4 12" /></svg>
                  <svg v-if="displayStatusOf(voucher) === 'Rejected'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 4px;"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  {{ displayStatusOf(voucher) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <div v-if="showDeclineModal" class="modal-backdrop" @click.self="showDeclineModal = false">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="declineAction === 'reject' ? 'Reject confirmation' : 'Decline confirmation'" style="max-width: 640px;">
        <div class="modal-header" style="padding: 8px 24px 4px;">
          <div class="modal-header__title" style="font-size: 16px; font-weight: 700; letter-spacing: -0.04em;">{{ declineAction === 'reject' ? 'Reject voucher?' : 'Decline voucher?' }}</div>
          <button class="modal-close" @click="showDeclineModal = false" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 18px; font-weight: 900; letter-spacing: -0.04em; margin: 0;">Are you sure you want to {{ declineAction === 'reject' ? 'reject' : 'decline' }} this petty cash voucher?<span style="display: block; margin-top: 12px; font-size: 14px; color: var(--muted-fg); font-weight: 500;">This action cannot be undone.</span></p>
        </div>
        <div class="modal-footer" style="border-top: none;">
          <button class="btn btn-outline" style="border-radius: 9999px;" @click="showDeclineModal = false">Cancel</button>
          <button class="btn" :class="declineAction === 'reject' ? 'btn-decline-subtle' : 'btn-decline'" :disabled="processing" style="border-radius: 9999px;" @click="confirmDecline">
            {{ processing && processingAction === 'decline' ? (declineAction === 'reject' ? 'Rejecting…' : 'Declining…') : (declineAction === 'reject' ? 'Yes, Reject' : 'Yes, Decline') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showApproveModal" class="modal-backdrop" @click.self="showApproveModal = false">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Approve confirmation" style="max-width: 640px;">
        <div class="modal-header" style="padding: 8px 24px 4px;">
          <div class="modal-header__title" style="font-size: 16px; font-weight: 700; letter-spacing: -0.04em;">Approve voucher?</div>
          <button class="modal-close" @click="showApproveModal = false" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 18px; font-weight: 900; letter-spacing: -0.04em; margin: 0;">Are you sure you want to approve this petty cash voucher?<span style="display: block; margin-top: 12px; font-size: 14px; color: var(--muted-fg); font-weight: 500;">This action cannot be undone.</span></p>
        </div>
        <div class="modal-footer" style="border-top: none;">
          <button class="btn btn-outline" style="border-radius: 9999px;" @click="showApproveModal = false">Cancel</button>
          <button class="btn btn-approve" :disabled="processing" style="border-radius: 9999px;" @click="confirmApprove">
            {{ processing && processingAction === 'approve' ? 'Approving…' : 'Yes, Approve' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showProcessModal" class="modal-backdrop" @click.self="showProcessModal = false">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Process confirmation" style="max-width: 640px;">
        <div class="modal-header" style="padding: 8px 24px 4px;">
          <div class="modal-header__title" style="font-size: 16px; font-weight: 700; letter-spacing: -0.04em;">Process voucher?</div>
          <button class="modal-close" @click="showProcessModal = false" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 18px; font-weight: 900; letter-spacing: -0.04em; margin: 0;">Are you sure you want to process this petty cash voucher?<span style="display: block; margin-top: 12px; font-size: 14px; color: var(--muted-fg); font-weight: 500;">This action cannot be undone.</span></p>
        </div>
        <div class="modal-footer" style="border-top: none;">
          <button class="btn btn-outline" style="border-radius: 9999px;" @click="showProcessModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="processing" style="border-radius: 9999px;" @click="confirmProcess">
            {{ processing && processingAction === 'process' ? 'Processing…' : 'Yes, Process' }}
          </button>
        </div>
      </div>
    </div>

    <FilePreview :show="showFilePreview" :file="previewFile" @close="showFilePreview = false" />
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import FilePreview from '../components/FilePreview.vue'
import VoucherTableSkeleton from '../components/VoucherTableSkeleton.vue'
import { allVouchers, loadingVouchers, userEmail, userRole, updateVoucherStatus, fetchVouchers } from '~/composables/appState'

const router = useRouter()
const selectedVoucher = ref(null)
const showFilePreview = ref(false)
const previewFile = ref(null)
const expandedPurposes = reactive({})
const processing = ref(false)
const isSuperAdmin = computed(() => userRole.value === 'super admin')
const isAdminOrSuper = computed(() => userRole.value === 'admin' || userRole.value === 'super admin')
const processingAction = ref('')
const declineAction = ref('decline')
const FINANCE_EMAIL = 'finance@getpayedmail.com'
const FINANCE_MANAGER_EMAIL = 'gbemisola.olajide@getpayedmail.com'

const isFinanceRecipient = computed(() => {
  if (!selectedVoucher.value) return false
  const email = userEmail.value.toLowerCase()
  const recipients = selectedVoucher.value.financeSuperAdminRecipients || []
  if (recipients.some((recipient) => String(recipient).toLowerCase() === email)) {
    return true
  }
  if (!isSuperAdmin.value) return false
  const to = String(selectedVoucher.value.to || '').toLowerCase()
  const cc = String(selectedVoucher.value.cc || '').toLowerCase()
  return to === FINANCE_EMAIL || cc === FINANCE_EMAIL
})

const canSuperAdminAct = computed(() => {
  if (!selectedVoucher.value || !isSuperAdmin.value) return false
  const voucher = selectedVoucher.value
  const status = voucher.status || 'Pending'
  const isRecipient = isToMe.value || isCcMe.value || isFinanceRecipient.value
  if (!isRecipient) return false
  // For admin-sent vouchers, super admin can act when status is Pending or Approved
  if (voucher.submitterIsAdmin && (status === 'Pending' || status === 'Approved')) return true
  // For regular user vouchers, super admin can act when status is Approved
  if (status === 'Approved') return true
  return false
})

const isToMe = computed(() =>
  Boolean(selectedVoucher.value && String(selectedVoucher.value.to).toLowerCase() === userEmail.value.toLowerCase()),
)
const isCcMe = computed(() =>
  Boolean(selectedVoucher.value && String(selectedVoucher.value.cc).toLowerCase() === userEmail.value.toLowerCase()),
)
const showDeclineModal = ref(false)
const showApproveModal = ref(false)
const showProcessModal = ref(false)

function togglePurpose(id) {
  expandedPurposes[id] = !expandedPurposes[id]
}

function goToForm() {
  router.push({ name: 'form' })
}

function openVoucher(voucher) {
  selectedVoucher.value = voucher
}

async function setDecision(status) {
  if (!selectedVoucher.value) return
  await updateVoucherStatus(selectedVoucher.value.id, status)
}

async function confirmApprove() {
  if (processing.value) return
  processing.value = true
  processingAction.value = 'approve'
  try {
    await setDecision('Approved')
  } finally {
    processing.value = false
    processingAction.value = ''
  }
  showApproveModal.value = false
  const updated = allVouchers.value.find((v) => v.id === selectedVoucher.value.id)
  if (updated) selectedVoucher.value = updated
}

async function confirmProcess() {
  if (processing.value) return
  processing.value = true
  processingAction.value = 'process'
  try {
    await setDecision('Processed')
  } finally {
    processing.value = false
    processingAction.value = ''
  }
  showProcessModal.value = false
  const updated = allVouchers.value.find((v) => v.id === selectedVoucher.value.id)
  if (updated) selectedVoucher.value = updated
}

async function confirmDecline() {
  if (processing.value) return
  processing.value = true
  processingAction.value = 'decline'
  try {
    await setDecision(declineAction.value === 'reject' ? 'Rejected' : 'Declined')
  } finally {
    processing.value = false
    processingAction.value = ''
  }
  showDeclineModal.value = false
  const updated = allVouchers.value.find((v) => v.id === selectedVoucher.value.id)
  if (updated) selectedVoucher.value = updated
}

function openFilePreview(doc) {
  previewFile.value = doc
  showFilePreview.value = true
}

const activeTab = ref('sent')

onMounted(async () => {
  const saved = localStorage.getItem('pcv_vouchers_tab')
  if (saved === 'sent' || saved === 'received') activeTab.value = saved
  
  // Fetch vouchers when the page loads to ensure fresh data
  try {
    await fetchVouchers()
  } catch (error) {
    console.error('Failed to load vouchers', error)
  }
})

watch(activeTab, (value) => {
  localStorage.setItem('pcv_vouchers_tab', value)
})
const sentVouchers = computed(() =>
  allVouchers.value.filter((voucher) => voucher.submittedBy === userEmail.value),
)
const receivedVouchers = computed(() =>
  allVouchers.value.filter((voucher) => {
    const email = userEmail.value.toLowerCase()
    const toMatch = String(voucher.to).toLowerCase() === email
    const ccMatch = String(voucher.cc).toLowerCase() === email
    const financeRouted = String(voucher.to).toLowerCase() === FINANCE_EMAIL || 
                          String(voucher.cc).toLowerCase() === FINANCE_EMAIL

    const submittedBy = String(voucher.submittedBy || '').toLowerCase()
    // For super admins: 
    // - Vouchers from admins: show regardless of status (will display as pending unless processed/rejected)
    // - Vouchers from regular users: only show if approved
    if (isSuperAdmin.value) {
      if (voucher.submitterIsAdmin) {
        // Admin-sent vouchers: show regardless of status (will display as pending unless processed/rejected)
        // No filtering needed here
      } else {
        // Regular user vouchers: only show if approved (processed/rejected will be filtered out later)
        const st = (voucher.status || '').toLowerCase()
        if (st !== 'approved') return false
      }
    }
    const financeManagerSent = submittedBy === FINANCE_MANAGER_EMAIL.toLowerCase()
    const financeSuperAdminMatch =
      (voucher.financeSuperAdminRecipients || []).some(
        (recipient) => String(recipient).toLowerCase() === email,
      )

    if (isSuperAdmin.value && financeRouted && financeManagerSent && email !== FINANCE_MANAGER_EMAIL.toLowerCase()) {
      return false
    }

    const statusRaw = voucher.status || ''
    const ccApprovalsMatch =
      ccMatch && (voucher.submitterIsAdmin ? ['Approved', 'Processed', 'Rejected', 'Declined'].includes(statusRaw) : statusRaw === 'Approved')

    const isMatch = toMatch || financeSuperAdminMatch || ccApprovalsMatch || (financeRouted && isSuperAdmin.value)
    if (!isMatch) return false

    if (isSuperAdmin.value) {
      // For super admins, filter out vouchers that have been processed or rejected by anyone
      const processedBy = voucher.processedBy
      const rejectedBy = voucher.rejectedBy
      if (processedBy || rejectedBy) return false
      // For super admins, the status filtering is now handled at the per-voucher level above
      // based on whether the voucher is from an admin or regular user
      return true
    }

    // For admins (not super admins), filter out vouchers that have been approved or declined by anyone
    if (isAdminOrSuper.value && !isSuperAdmin.value) {
      const approvedBy = voucher.approvedBy
      const declinedBy = voucher.declinedBy
      if (approvedBy || declinedBy) return false
    }

    return true
  }),
)

function displayStatusOf(voucher) {
  if (!voucher) return 'Pending'
  if (isSuperAdmin.value && activeTab.value === 'received') {
    const status = voucher.status || 'Pending'
    // For super admins in received tab:
    // - Admin-sent vouchers show as "Pending" unless processed/rejected
    // - Regular user vouchers show as "Pending" when approved
    if (voucher.submitterIsAdmin) {
      // Admin-sent vouchers: only show actual status if processed/rejected, otherwise pending
      if (status === 'Processed' || status === 'Rejected') return status
      return 'Pending'
    } else {
      // Regular user vouchers: show approved as pending
      if (status === 'Approved') return 'Pending'
    }
  }
  return voucher.status || 'Pending'
}

const displayedSelectedStatus = computed(() => displayStatusOf(selectedVoucher.value))
const displayedVouchers = computed(() => {
  if (!isAdminOrSuper.value) return sentVouchers.value
  return activeTab.value === 'sent' ? sentVouchers.value : receivedVouchers.value
})


</script>

<style scoped>
.vouchers-table th:nth-child(2),
.vouchers-table td:nth-child(2) {
  text-align: center;
}

.voucher-purpose {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  white-space: normal;
  overflow-wrap: break-word;
  cursor: pointer;
  color: #000;
}

.voucher-purpose.expanded {
  -webkit-line-clamp: unset;
  line-clamp: unset;
  display: block;
}

.vouchers-loading {
  display: grid;
  place-items: center;
  min-height: 60vh;
  color: #000;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.approve-actions-bar .btn {
  padding: 11px 36px;
  font-size: 15px;
}

.page-wrap > .dashboard-tabs {
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.page-wrap > .dashboard-tabs .dashboard-tabs__tab {
  flex: 1;
  justify-content: center;
}

.processed-by {
  margin: 16px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  color: var(--muted-fg);
  font-size: 12px;
}

@media (max-width: 768px) {
  .approve-actions-bar .btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .voucher-purpose {
    max-width: 100px;
  }
}

@media (max-width: 480px) {
  .approve-actions-bar .btn {
    width: 100%;
  }

  .voucher-purpose {
    max-width: 80px;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
}
</style>
