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
<div class="row full-width text-center justify-center actor-font" :class="{'text-grey-3' : mapVisible}">
    <div class="col-3">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-uppercase">Head Block</div>
            <div class="col-12 text-subtitle1 text-bold">{{HeadBlock.toLocaleString()}}</div>
        </div>
    </div>
    <div class="col-1">
        <div class="hr-vertical"> </div>
    </div>
    <div class="col-3">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-uppercase">Producing</div>
            <div class="col-12 text-subtitle1 text-bold">{{HeadBlockProducer}}</div>
        </div>
    </div>
    <div class="col-1">
        <div class="hr-vertical"></div>
    </div>
    <div class="col-3">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-uppercase">Irreversible Block</div>
            <div class="col-12 text-subtitle1 text-bold">{{lastIrreversibleBlock.toLocaleString()}}</div>
        </div>
    </div>
</div>
</template>

<style scoped lang="sass">
.container
  margin-top: 9rem
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
