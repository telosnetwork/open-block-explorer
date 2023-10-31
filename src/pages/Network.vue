<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import PriceChart from 'components/PriceChart.vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import WorldMap from 'components/WorldMap.vue';
import MapData from 'components/MapData.vue';
import ConfigManager from 'src/config/ConfigManager';
import { useChainStore } from 'src/stores/chain';

enum MapReveal {
    Reveal,
    Top,
    None
}

export default defineComponent({
    name: 'PageNetwork',
    components: {
        PriceChart,
        TransactionsTable,
        WorldMap,
        MapData,
    },
    setup() {
        const chainStore = useChainStore();
        const mapDisplay = ConfigManager.get().getCurrentChain().getMapDisplay();
        const showMap = ref(false);
        const showMapHint = ref(false);
        const SCROLL_TIMEOUT = 100;
        let mapReveal = ref(MapReveal.None);
        let isScrolling: NodeJS.Timeout;
        const toggleMap = () => {
            showMap.value = !showMap.value;
            if (!showMap.value && mapReveal.value !== MapReveal.None) {
                mapReveal.value = MapReveal.None;
            }
        };
        const scrollReveal = () => {
            if (document.documentElement.scrollTop === 0){
                if (!showMap.value){
                    // on initial scroll to 'top' do not reveal map
                    if (mapReveal.value === MapReveal.None){
                        mapReveal.value = MapReveal.Top;
                        return;
                    }
                    // on additional scroll at top reveal map
                    if (mapReveal.value === MapReveal.Top){
                        mapReveal.value = MapReveal.Reveal;
                        toggleMap();
                    }
                }
            }else{
                mapReveal.value = MapReveal.None;
            }
        };
        watch(mapReveal, (val) => {
            if (val === MapReveal.Top){
                showMapHint.value = true;
                setTimeout(() => {
                    showMapHint.value = false;
                }, 2000);
            }
        });
        const eventTimeout = function () {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(scrollReveal, SCROLL_TIMEOUT);
        };
        const keyUpTimeout = function (e: KeyboardEvent) {
            if (e.key === 'ArrowUp'){
                eventTimeout();
            }
        };
        const clearListeners = () => {
            window.removeEventListener('scroll', eventTimeout);
            window.removeEventListener('wheel', eventTimeout);
            window.removeEventListener('keyup', keyUpTimeout);
        };

        onMounted(() => {
            if (mapDisplay){
                window.addEventListener('scroll', eventTimeout, false);
                window.addEventListener('wheel', eventTimeout, false);
                window.addEventListener('keyup', keyUpTimeout, false);
                window.setInterval(() => {
                    void chainStore.updateBlockData();
                }, 2000);
            }
        });

        onBeforeUnmount(() => {
            clearListeners();
        });

        return {
            mapDisplay,
            showMap,
            showMapHint,
            toggleMap,
        };
    },
});
</script>

<template>
<div class="row">
    <div class="col-12">
        <div v-if="mapDisplay" class="row header-support justify-center render-container" :class="{'show-map' : showMap}">
            <div class="row full-width chevron-toggle hide" @click="toggleMap">
                <div v-if="showMap" class="items-center arrow-button" >
                    <q-icon class="fas fa-chevron-up q-pr-lg chevron" size="17px"/>
                </div>
                <div class="full-width text-center justify-center actor-font"> </div>
            </div>
            <div class="col-12">
                <WorldMap/>
            </div>
        </div>
    </div>
    <div v-if="mapDisplay" class="row full-width chevron-toggle" @click="toggleMap">
        <div class="full-width text-center justify-center actor-font">  </div>
        <div v-if="!showMap" class="items-center arrow-button" >
            <q-icon class="fas fa-chevron-down q-pr-lg chevron" size="17px" />
        </div>
        <div class="map-hint" :class="{'fade-in' : showMapHint, 'fade-out' : !showMapHint}">(click or scroll to view producer map)</div>

    </div>
    <div v-if="mapDisplay && showMap" class="col-12 map-data-position overlap-map">
        <MapData :mapVisible="showMap" />
    </div>
    <div class="container-max-width" :class="{'container-margin' : !showMap}">
        <div v-if="mapDisplay && !showMap" class="col-12 map-data-position">
            <MapData :mapVisible="showMap" />
        </div>
        <PriceChart class="price-box-position" :class="{'overlap-map' : mapDisplay && showMap}"/>
        <TransactionsTable/>
    </div>
</div>
</template>

<style lang="scss">
.arrow-button{
  position: absolute;
  left: calc(50% - 33px);
  z-index: 10;
  .chevron{
    padding-left: 25px;
  }
}
.container-margin{
    margin-top: 2rem;
}
.map-hint{
  position: absolute;
  top: 140px;
  left: calc(50% - 110px);
  &.fade-in{
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0s, opacity 500ms;
  }
  &.fade-out{
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s linear 500ms, opacity 500ms;
  }
}
.render-container{
    position: absolute;
    left: 100000px;
    &.show-map{
      position: relative;
      left:0;
    }
}
.hide{
  color: white;
}
.chevron-toggle{
  cursor: pointer;
}
.map-data-position{
  margin-top: 1rem;
  color: black;
  &.overlap-map{
    margin-top: -200px;
  }
}
.price-box-position{
  margin-top: 2rem;
  &.overlap-map{
    margin-top: -100px;
  }
}
</style>
