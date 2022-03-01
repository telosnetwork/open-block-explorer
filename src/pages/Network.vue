<template lang="pug">
div.row.col-12
    div.row.col-12.gradient-box
    PriceChart.price-box-position
    TransactionsTable

</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Index from './Index.vue';
import PriceChart from 'components/PriceChart.vue';
import TransactionsTable from 'components/TransactionsTable.vue';

export default defineComponent({
  name: 'PageIndex',
  components: {
    Index,
    PriceChart,
    TransactionsTable
  }
});
</script>
