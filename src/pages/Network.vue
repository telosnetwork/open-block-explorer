<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Index from './Index.vue';
import PriceChart from 'components/PriceChart.vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import Map from 'components/Map.vue';
import MapData from 'components/MapData.vue';
import { useStore } from 'src/store';

export default defineComponent({
  name: 'PageIndex',
  components: {
    Index,
    PriceChart,
    TransactionsTable,
    Map,
    MapData
  },
  setup() {
    const store = useStore();
    onMounted(() => {
      window.setInterval(() => {
        void store.dispatch('chain/updateBlockData');
      }, 2000);
    });

    return {};
  }
});
</script>

<template lang="pug">
div.row
  .col-12
    .row.gradient-box.justify-center
      .col-12
        Map
      
  .col-12.map-data-position
    MapData(:mobile="true")
  PriceChart.price-box-position
  TransactionsTable

</template>
