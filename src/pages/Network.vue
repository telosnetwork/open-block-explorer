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
<style lang="sass">
.gradient-box
    min-height: 232px
    width: 100%
    background: linear-gradient(180deg, #071A5F 0%, #571AFF 175.31%)
.price-box-position
    margin-top: -100px
</style>
