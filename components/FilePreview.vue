<template>
  <div v-if="show" @click.self="close" class="modal-backdrop file-preview-backdrop">
    <button type="button" @click="close" aria-label="Close" class="file-preview-close">✕</button>
    <div class="file-preview-title">{{ file?.name }}</div>
    <div class="file-preview-stage">
      <img
        v-if="isImage"
        :src="file?.data"
        :alt="file?.name"
        class="file-preview-content file-preview-content--image"
        :style="{ transform: `scale(${zoomLevel})` }"
      />
      <object
        v-else-if="isPdf"
        :data="file?.data"
        type="application/pdf"
        class="file-preview-content file-preview-content--pdf"
      ></object>
      <div v-else class="file-preview-fallback">
        <div class="file-preview-fallback__icon">📄</div>
        <p class="file-preview-fallback__text">Preview not available for this file type.</p>
        <a :href="file?.data" :download="file?.name" class="btn btn-primary">
          Download {{ file?.name }}
        </a>
      </div>
    </div>
    <div v-if="isImage" class="file-preview-zoom-controls">
      <button type="button" @click="zoomOut" aria-label="Zoom out" class="file-preview-zoom-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button type="button" @click="zoomIn" aria-label="Zoom in" class="file-preview-zoom-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  file: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const zoomLevel = ref(1)

const isImage = computed(() => props.file?.type?.startsWith('image/'))
const isPdf = computed(
  () =>
    props.file?.type === 'application/pdf' ||
    props.file?.name?.toLowerCase().endsWith('.pdf'),
)

watch(() => props.show, (newValue) => {
  if (!newValue) {
    zoomLevel.value = 1
  }
})

function close() {
  emit('close')
}

function zoomIn() {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25
  }
}

function zoomOut() {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25
  }
}
</script>

