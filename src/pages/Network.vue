<template lang="pug">
div.row.col-12
    div.row.col-12.gradient-box
    PriceChart.price-box-position
    LatestTransactionTable

</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Index from './Index.vue';
import PriceChart from 'components/PriceChart.vue';
import LatestTransactionTable from 'components/LatestTransactionTable.vue';

export default defineComponent({
  name: 'PageIndex',
  components: {
    Index,
    PriceChart,
    LatestTransactionTable
  }
});
</script>
<style lang="sass">
.gradient-box
    min-height: 632px
    width: 100%
    background: linear-gradient(180deg, #071A5F 0%, #571AFF 175.31%)
.price-box-position
    margin-top: -100px
</style>
