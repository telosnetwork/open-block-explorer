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
      }, 500);
    });

    return {};
  }
});
</script>

<template lang="pug">
div.row
  .col-12(v-if="$q.screen.gt.md")
    .row.gradient-box
      .col-xl-8.col-lg-10
        Map
      .col-xl-4.col-lg-2
        MapData(:mobile="false")
  .col-12(v-else)
    .row.gradient-box
      .col-12
        Map
  .col-12.map-data-position.z-top(v-if="$q.screen.lt.lg")
    MapData(:mobile="true")
  PriceChart.z-top.price-box-position
  TransactionsTable

</template>
