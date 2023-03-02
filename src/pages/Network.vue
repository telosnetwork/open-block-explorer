<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import PriceChart from 'components/PriceChart.vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import WorldMap from 'components/Map.vue';
import MapData from 'components/MapData.vue';
import { useStore } from 'src/store';
import ConfigManager from 'src/config/ConfigManager';

export default defineComponent({
    name: 'PageNetwork',
    components: {
        PriceChart,
        TransactionsTable,
        WorldMap,
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

<template>

<div class="row">
    <div v-if="displayMap" class="col-12">
        <div class="row gradient-box justify-center">
            <div class="col-12">
                <WorldMap/>
            </div>
        </div>
    </div>
    <div v-if="displayMap" class="col-12 map-data-position" :class="{'overlap-map' : displayMap}">
        <MapData :mobile="true"/>
    </div>
    <PriceChart class="price-box-position" :class="{'overlap-map' : displayMap}"/>
    <TransactionsTable/>
</div>

</template>

<style lang="sass">
.overlap-map
  &.map-data-position
    margin-top: -200px
  &.price-box-position
    margin-top: -100px
</style>
