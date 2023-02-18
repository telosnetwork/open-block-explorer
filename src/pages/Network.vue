<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Index from './Index.vue';
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
    MapData
  },
  setup() {
    const store = useStore();
    const mapDisplay = ConfigManager.get().getCurrentChain().getMapDisplay();
    const showMap = ref(false);
    const toggleMap = () => {
      showMap.value = !showMap.value;
    };
    onMounted(() => {
      window.setInterval(() => {
        if (mapDisplay) void store.dispatch('chain/updateBlockData');
      }, 2000);
    });

    return {
      mapDisplay,
      showMap,
      toggleMap
    };
  }
});
</script>

<template lang="pug">
div.row
  .col-12
    .row.gradient-box.justify-center(v-if="mapDisplay && showMap")
      .row.full-width.chevron-toggle.hide(@click="toggleMap")
        .items-center.arrow-button(v-if="showMap")
          q-icon.fas.fa-chevron-up.q-pr-lg.chevron(size="17px")
        .full-width.text-center.justify-center.actor-font HIDE MAP
      .col-12
        Map
  .row.full-width.chevron-toggle(v-if='mapDisplay' @click="toggleMap")
    .full-width.text-center.justify-center.actor-font SHOW MAP
    .items-center.arrow-button(v-if='!showMap')
      q-icon.fas.fa-chevron-down.q-pr-lg.chevron(size="17px")
  .col-12.map-data-position(v-if="mapDisplay" :class="{'overlap-map' : mapDisplay && showMap}")
    MapData(:mapVisible='showMap')
  PriceChart.price-box-position(:class="{'overlap-map' : mapDisplay && showMap}")
  TransactionsTable

</template>

<style lang="sass">
.arrow-button
  margin: auto
  .chevron
    padding-left: 25px
.hide
  color: white
.chevron-toggle
  cursor: pointer
.map-data-position
  margin-top: 1rem
  color: black
  &.overlap-map
    margin-top: -200px
.price-box-position
  margin-top: 2rem
  &.overlap-map
    margin-top: -100px
</style>
