<template>
  <div class="field">
    <label v-if="label" :for="inputId" class="mono-label">{{ label }}</label>

    <div v-if="(prefix || $slots.suffix) && !isTextarea && !isSelect" class="input-prefix">
      <span v-if="prefix" class="prefix">{{ prefix }}</span>
      <div class="date-input-wrapper">
        <input
          :id="inputId"
          :type="type"
          :value="modelValue"
          :placeholder="type === 'date' ? '' : placeholder"
          :readonly="readonly"
          :disabled="disabled"
          :inputmode="inputmode || undefined"

          @input="handleInput" :class="[inputClass, { 'error': !!error }]" />
        <span v-if="type === 'date' && !modelValue" class="date-placeholder">mm/dd/yy</span>
      </div>
      <slot name="suffix" />
    </div>

    <div v-else-if="!isTextarea && !isSelect" class="date-input-wrapper">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="type === 'date' ? '' : placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :inputmode="inputmode || undefined"

        @input="handleInput" :class="[inputClass, { 'error': !!error }]" />
      <span v-if="type === 'date' && !modelValue" class="date-placeholder">mm/dd/yy</span>
    </div>

    <select
      v-else-if="isSelect"
      :id="inputId"
      :value="modelValue"
      :disabled="disabled"
      @change="handleChange"
     :class="[inputClass, { 'error': !!error }]">
      <option value="">{{ placeholder || 'Select...' }}</option>
      <option v-for="opt in options" :key="opt[optionValue]" :value="opt[optionValue]">
        {{ opt[optionLabel] }}
      </option>
    </select>

    <textarea
      v-else-if="isTextarea"
      :id="inputId"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      @input="handleInput"
     :class="[inputClass, { 'error': !!error }]"></textarea>

    <span v-if="error" class="err-msg">{{ error }}</span>
    <span v-if="hint" class="hint">{{ hint }}</span>
    <slot name="hint" />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  id: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  optionValue: { type: String, default: 'value' },
  optionLabel: { type: String, default: 'label' },
  prefix: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  inputmode: { type: String, default: '' },
  inputClass: { type: String, default: '' },
  filter: { type: String, default: '' },
  hint: { type: String, default: '' }
})

import { computed } from 'vue'

const emit = defineEmits(['update:modelValue', 'input', 'change'])

const generatedId = `ff-${Math.random().toString(36).slice(2, 9)}`
const inputId = computed(() => props.id || generatedId)
const isTextarea = computed(() => props.type === 'textarea')
const isSelect = computed(() => props.type === 'select')
const filterRegex = computed(() => (props.filter ? new RegExp(props.filter, 'g') : null))

function handleInput(e) {
  let value = e.target.value
  if (filterRegex.value && value) {
    value = value.replace(filterRegex.value, '')
    if (e.target.value !== value) {
      e.target.value = value
    }
  }
  emit('update:modelValue', value)
  emit('input', e)
}

function handleChange(e) {
  emit('update:modelValue', e.target.value)
  emit('change', e)
}

</script>

<style scoped>
/* Date input wrapper for placeholder */
.date-input-wrapper {
  position: relative;
}

.date-placeholder {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-fg);
  pointer-events: none;
  font-size: 14px;
  z-index: 1;
  white-space: nowrap;
}

/* Hide placeholder when input has value */
.date-input-wrapper input:not(:placeholder-shown) + .date-placeholder {
  display: none;
}

/* Date input specific fixes */
.field input[type="date"] {
  /* Fix for iOS date input display */
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

/* Additional iOS date input fixes */
.field input[type="date"]::-webkit-date-and-time-value {
  text-align: left;
}

.field input[type="date"]::-webkit-calendar-picker-indicator {
  padding: 0;
  margin: 0;
  opacity: 1;
  cursor: pointer;
}

/* Firefox date input fixes */
.field input[type="date"]::-moz-calendar-picker-indicator {
  padding: 0;
  margin: 0;
  opacity: 1;
  cursor: pointer;
}

@media (max-width: 768px) {
  .field input,
  .field textarea,
  .field select {
    font-size: 16px; /* Prevent iOS zoom on focus */
  }
}

@media (max-width: 480px) {
  .field input,
  .field textarea,
  .field select {
    font-size: 16px; /* Prevent iOS zoom on focus */
  }

  /* Ensure date placeholder is visible on mobile */
  .date-placeholder {
    font-size: 14px;
    left: 10px;
  }

  /* Hide default date placeholder on mobile */
  .field input[type="date"]::-webkit-datetime-edit {
    color: transparent;
  }

  .field input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit {
    color: var(--fg);
  }
}
</style>

