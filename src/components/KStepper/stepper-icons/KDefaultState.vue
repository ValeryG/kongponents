<template>
  <svg
    class="k-step-state-icon"
    data-testid="k-step-default"
    fill="none"
    viewBox="0 0 24 24"
  >
    <title>{{ title }}</title>
    <circle
      cx="12.375"
      cy="12"
      r="11"
      stroke-width="2"
    />
  </svg>
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: 'Default',
  },
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/functions';

.k-step-state-icon {
  circle {
    stroke: var(--KStepDefaultColor, var(--grey-300));
  }
}
</style>
