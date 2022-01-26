<template lang="pug">
q-page.row.items-center.justify-evenly
  PriceChart
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PriceChart from 'components/PriceChart.vue';

export default defineComponent({
  name: 'PageIndex',
  components: {
    PriceChart
  }
});
</script>
