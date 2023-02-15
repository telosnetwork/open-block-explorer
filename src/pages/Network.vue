<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Index from 'src/pages/Index.vue';
import PriceChart from 'components/PriceChart.vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import Map from 'components/Map.vue';
import MapData from 'components/MapData.vue';
import { useStore } from 'src/store';
import ConfigManager from 'src/config/ConfigManager';

export default defineComponent({
    name: 'PageIndex',
    components: {
        Index,
        PriceChart,
        TransactionsTable,
        Map,
        MapData,
    },
    setup() {
        const store = useStore();
        const displayMap = ConfigManager.get().getCurrentChain().getMapDisplay();
        onMounted(() => {
            window.setInterval(() => {
                if (displayMap) {
                    void store.dispatch('chain/updateBlockData');
                }
            }, 2000);
        });

        return {
            displayMap,
        };
    },
});
</script>

<template lang="pug">
div.row
  .col-12(v-if="displayMap")
    .row.gradient-box.justify-center
      .col-12
        Map

  .col-12.map-data-position(v-if="displayMap" :class="{'overlap-map' : displayMap}")
    MapData(:mobile="true")
  PriceChart.price-box-position(:class="{'overlap-map' : displayMap}")
  TransactionsTable

</template>

<style lang="sass">
.overlap-map
  &.map-data-position
    margin-top: -200px
  &.price-box-position
    margin-top: -100px
</style>
