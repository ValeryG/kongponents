<template>
  <KMultiselect
    v-model="selected"
    autosuggest
    collapsed-context
    :items="items"
    :selected-row-count="1"
    @query-change="onQueryChange"
  />
  <pre>
    {{ modelJson }}
  </pre>
</template>
<script setup lang="ts">
import { KMultiselect } from '@/components'
import { computed, ref } from 'vue'

const allItems = ref(Array.from(new Array(100)).map((_, i) => ({ label: `Item ${i}`, value: `${i}` })))
const selected = ref(Array.from(new Array(10)).map((_, i) => `${i}`))

const items = ref(allItems.value.slice(0, 10))

const onQueryChange = () => {
  setTimeout(() => {
    items.value = allItems.value.slice(5, 20)
  }, 100)
}

const modelJson = computed(() => JSON.stringify(selected.value, undefined, 2))

</script>
