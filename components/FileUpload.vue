<template>
  <div class="field">
    <label v-if="label" class="mono-label">{{ label }}</label>
    <button type="button" @click="fileInput.click()" class="upload-zone">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
      <span class="upload-title">{{ uploadTitle }}</span>
    </button>
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      style="display: none"
      @change="handleFiles"
    />
    <ul v-if="files.length" class="file-list">
      <li v-for="(file, i) in files" :key="i" class="file-item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <a
          href="#"
          @click.prevent="emit('preview', file)"
          class="file-name"
        >{{ file.name }}</a>
        <button
          type="button"
          @click="removeFile(i)"
          aria-label="Remove"
          class="file-remove"
        >
          ✕
        </button>
      </li>
    </ul>
    <span v-if="hint" class="hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  files: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  uploadTitle: { type: String, default: 'Click to attach files' },
  hint: { type: String, default: '' },
  multiple: { type: Boolean, default: true },
  accept: { type: String, default: '' }
})

const fileInput = ref(null)
const emit = defineEmits(['update:files', 'preview'])

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function handleFiles(e) {
  const incoming = Array.from(e.target.files ?? [])
  if (!incoming.length) return

  const pending = incoming.map((file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    data: null,
  }))

  emit("update:files", [...props.files, ...pending])

  e.target.value = ""

  const ready = await Promise.all(
    incoming.map(async (file, index) => ({
      ...pending[index],
      data: await readFileAsDataURL(file),
    }))
  )

  const updated = props.files.map((file) => {
    const replacement = ready.find((r) => r.id === file.id)
    return replacement || file
  })

  emit("update:files", [
    ...updated,
    ...ready.filter(
      (r) => !updated.some((u) => u.id === r.id)
    ),
  ])
}

function removeFile(i) {
  const next = [...props.files]
  next.splice(i, 1)
  emit('update:files', next)
}
</script>