<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useChainStore } from 'src/stores/chain';

export default defineComponent({
    name: 'MapData',
    props: {
        mapVisible: {
            type: Boolean,
            required: true,
        },
    },
    setup() {
        const chainStore = useChainStore();
        const HeadBlockProducer = computed(
            (): string => chainStore.head_block_producer,
        );
        const HeadBlock = computed((): number => chainStore.head_block_num);
        const lastIrreversibleBlock = computed(
            (): number => chainStore.last_irreversible_block_num,
        );

        return {
            HeadBlock,
            HeadBlockProducer,
            lastIrreversibleBlock,
        };
    },
});
</script>

<template>
<div class="row full-width text-center justify-center actor-font map-data" :class="{'map-data--visible text-grey-3' : mapVisible}">
    <div class="col-3 stat-block">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-uppercase stat-label">Head Block</div>
            <div class="col-12 text-subtitle1 text-bold stat-value">{{HeadBlock.toLocaleString()}}</div>
        </div>
    </div>
    <div class="col-1">
        <div class="hr-vertical"> </div>
    </div>
    <div class="col-3 stat-block">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-uppercase stat-label">Producing</div>
            <div class="col-12 text-subtitle1 text-bold stat-value">{{HeadBlockProducer}}</div>
        </div>
    </div>
    <div class="col-1">
        <div class="hr-vertical"></div>
    </div>
    <div class="col-3 stat-block">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-uppercase stat-label">Irreversible Block</div>
            <div class="col-12 text-subtitle1 text-bold stat-value">{{lastIrreversibleBlock.toLocaleString()}}</div>
        </div>
    </div>
</div>
</template>

<style scoped lang="sass">
.container
  margin-top: 9rem
.map-data
  position: relative
  padding: 16px 12px
  background: linear-gradient(90deg, rgba(0, 242, 254, 0.06) 0%, rgba(255, 255, 255, 0.94) 34%, rgba(196, 113, 245, 0.06) 100%)
  border-top: 1px solid rgba(79, 172, 254, 0.18)
  border-bottom: 1px solid rgba(79, 172, 254, 0.18)
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.08)
.map-data--visible
  background: linear-gradient(90deg, rgba(44, 43, 47, 0.52) 0%, rgba(64, 65, 66, 0.42) 50%, rgba(79, 172, 254, 0.34) 100%)
  border-color: rgba(255, 255, 255, 0.22)
.stat-label
  color: var(--q-secondary)
  font-size: 14px
  font-weight: 600
  letter-spacing: 0
.stat-value
  color: var(--q-dark)
  font-size: 18px
  font-weight: 700
.map-data--visible
  .stat-label,
  .stat-value
    color: #FFFFFF
hr
  content: ""
  display: block
  width: 50%
  border-size: 0.5rem
  border : 0px
  border-top: 2px solid var(--q-primary)
  margin-left: 1rem
  margin-right: 1rem
.hr-vertical
  content: ""
  display: block
  height: 100%
  border-size: 0.5rem
  border : 0px
  border-right: 2px solid var(--q-primary)
  margin-left: 1rem
  margin-right: 1rem
  margin-top: -0.1rem

@media screen and (max-width: 420px)
  .actor-font
    .text-bold
        font-size: 18px
    .text-weight-thin
        font-size: 10px
</style>
