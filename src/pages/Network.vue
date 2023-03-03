<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import PriceChart from 'components/PriceChart.vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import WorldMap from 'components/WorldMap.vue';
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
        const mapDisplay = ConfigManager.get().getCurrentChain().getMapDisplay();
        const showMap = ref(false);
        const toggleMap = () => {
            showMap.value = !showMap.value;
        };
        onMounted(() => {
            window.setInterval(() => {
                if (mapDisplay) {
                    void store.dispatch('chain/updateBlockData');
                }
            }, 2000);
        });

        return {
            mapDisplay,
            showMap,
            toggleMap,
        };
    },
});
</script>

<template>
<div class="row">
    <div class="col-12">
        <div v-if="mapDisplay && showMap" class="row gradient-box justify-center" >
            <div class="row full-width chevron-toggle hide" @click="toggleMap">
                <div v-if="showMap" class="items-center arrow-button" >
                    <q-icon class="fas fa-chevron-up q-pr-lg chevron" size="17px"/>
                </div>
                <div class="full-width text-center justify-center actor-font"> HIDE MAP </div>
            </div>
            <div class="col-12">
                <WorldMap/>
            </div>
        </div>
    </div>
    <div v-if="mapDisplay" class="row full-width chevron-toggle" @click="toggleMap">
        <div class="full-width text-center justify-center actor-font"> SHOW MAP </div>
        <div v-if="!showMap" class="items-center arrow-button" >
            <q-icon class="fas fa-chevron-down q-pr-lg chevron" size="17px" />
        </div>
    </div>
    <div v-if="mapDisplay" class="col-12 map-data-position" :class="{'overlap-map' : mapDisplay && showMap}">
        <MapData :mapVisible="showMap" />
    </div>
    <PriceChart class="price-box-position" :class="{'overlap-map' : mapDisplay && showMap}"/>
    <TransactionsTable/>
</div>
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
