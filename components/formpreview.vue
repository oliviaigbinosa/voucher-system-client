<template>
  <div v-if="modelValue" @click.self="closeModal" class="modal-backdrop">
    <div role="dialog" aria-modal="true" aria-label="Form Preview" class="modal">
      <div class="modal-header">
        <div class="modal-header__title">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Form Preview
        </div>
        <button @click="closeModal" aria-label="Close" class="modal-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="preview-head">
          <div>
            <p class="company-label">Getpayed Technology Solutions Ltd.</p>
            <h2 class="preview-title serif">Petty Cash Voucher</h2>
          </div>
          <div class="preview-head__right">
            <p class="mono-label tiny">Voucher No.</p>
            <code class="voucher-no">{{ voucherNo }}</code>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Email Details</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>From</span><span>{{ form.from || '—' }}</span>
            </div>
            <div class="preview-row">
              <span>To</span><span>{{ form.to || '—' }}</span>
            </div>
            <div v-if="form.cc" class="preview-row">
              <span>CC</span><span>{{ form.cc }}</span>
            </div>
            <div class="preview-row">
              <span>Subject</span><span>{{ form.subject || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Payee Information</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>Payee</span><span>{{ form.payee || '—' }}</span>
            </div>
            <div class="preview-row">
              <span>Department</span><span>{{ form.department || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Amount &amp; Purpose</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>Amount (Figures)</span>
              <span class="mono-input">₦{{ formattedAmount }}</span>
            </div>
            <div class="preview-row">
              <span>Amount (Words)</span><span>{{ form.amountWords || '—' }}</span>
            </div>
            <div class="preview-row block-row">
              <span>Purpose</span><span>{{ form.purpose || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section__title mono-label">Supporting Documents</h3>
          <div class="preview-rows">
            <div class="preview-row">
              <span>Submission Date</span><span>{{ form.submissionDate || '—' }}</span>
            </div>
            <div class="preview-row">
              <span>Attached Files</span>
              <span>
                <template v-if="form.supportingDocs?.length">
                  <span v-for="(file, i) in (form.supportingDocs || [])" :key="i">
                    <a
                     
                      href="#"
                      @click.prevent="openFilePreview(file)"
                     class="file-link">{{ file.name }}</a>{{ i < form.supportingDocs.length - 1 ? ', ' : '' }}
                  </span>
                </template>
                <template v-else>None</template>
              </span>
            </div>
          </div>
        </div>

        <div class="amount-banner">
          <span class="mono-label">Total Amount</span>
          <span class="amount-total serif">₦{{ formattedAmount }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button :disabled="sending" @click="closeModal" class="btn btn-outline">Back to Edit</button>
        <button :disabled="sending" @click="sendVoucher" class="btn btn-primary">
          <svg v-if="!sending"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          {{ sending ? 'Sending…' : 'Send Voucher' }}
        </button>
      </div>
      <p v-if="errorMessage" class="err-msg" style="margin-top: 12px; padding: 0 24px 24px;">{{ errorMessage }}</p>
    </div>
  </div>
  <FilePreview :show="showFilePreview" :file="previewFile" @close="showFilePreview = false" />
</template>

<script setup>
import { ref } from 'vue'
import { API_BASE } from '~/composables/appState'
import FilePreview from './FilePreview.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  form: {
    type: Object,
    required: true,
  },
  voucherNo: {
    type: String,
    required: true,
  },
  parsedAmount: {
    type: Number,
    required: true,
  },
  formattedAmount: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    default: '',
  },
  sending: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const showFilePreview = ref(false)
const previewFile = ref(null)

function closeModal() {
  emit('update:modelValue', false)
}

function openFilePreview(file) {
  previewFile.value = file
  showFilePreview.value = true
}

async function sendVoucher() {
  emit('submit')
}
</script>

