<template>
  <div class="field">
    <label v-if="label" :for="inputId" class="mono-label">{{ label }}</label>

    <div v-if="(prefix || $slots.suffix) && !isTextarea && !isSelect" class="input-prefix">
      <span v-if="prefix" class="prefix">{{ prefix }}</span>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :inputmode="inputmode || undefined"
       
        @input="handleInput" :class="[inputClass, { 'error': !!error }]" />
      <slot name="suffix" />
    </div>

    <input
      v-else-if="!isTextarea && !isSelect"
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :inputmode="inputmode || undefined"
     
      @input="handleInput" :class="[inputClass, { 'error': !!error }]" />

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

