<template>
  <div class="vouchers-table-wrap card" aria-busy="true" aria-label="Loading vouchers">
    <table class="vouchers-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="'h-' + col">
            <div class="skeleton skeleton--sm" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="'r-' + row" class="vouchers-table__row">
          <td v-for="col in columns" :key="'c-' + col">
            <div class="skeleton" :style="{ width: widths[(col - 1) % widths.length] }" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Number, default: 7 },
  rows: { type: Number, default: 6 },
})

const widths = ['60%', '75%', '70%', '80%', '65%', '85%', '70%', '80%']
</script>

<style scoped>
.skeleton {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--muted) 0%, #e8e5e0 50%, var(--muted) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}

.skeleton--sm {
  height: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
