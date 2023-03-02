<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';

export default defineComponent({
    name: 'MapData',
    props: {
        mobile: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const store = useStore();
        const HeadBlockProducer = computed(
            (): string => store.state.chain.head_block_producer,
        );
        const HeadBlock = computed((): number => store.state.chain.head_block_num);
        const lastIrreversibleBlock = computed(
            (): number => store.state.chain.last_irreversible_block_num,
        );
        const isMobile = computed((): boolean => props.mobile);

        return {
            isMobile,
            HeadBlock,
            HeadBlockProducer,
            lastIrreversibleBlock,
        };
    },
});
</script>

<template>

<div v-if="!isMobile" class="row full-width q-pl-xl container actor-font">
    <div class="col">
        <div class="row full-width q-pt-md q-px-lg">
            <div class="col-12 text-subtitle1 text-weight-thin text-grey-3">Head Block</div>
            <div class="col-12 text-h6 text-grey-3 text-bold">{{HeadBlock}}</div>
        </div>
        <hr>
        <div class="row full-width q-pt-md q-px-lg">
            <div class="col-12 text-subtitle1 text-weight-thin text-grey-3">Producing</div>
            <div class="col-12 text-h6 text-grey-3 text-bold">{{HeadBlockProducer}}</div>
        </div>
        <hr>
        <div class="row full-width q-pt-md q-px-lg">
            <div class="col-12 text-subtitle1 text-weight-thin text-grey-3">Irreversible Block</div>
            <div class="col-12 text-h6 text-grey-3 text-bold">{{lastIrreversibleBlock}}</div>
        </div>
    </div>
</div>
<div v-else class="row full-width text-center justify-center actor-font">
    <div class="col-3">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-grey-3 text-uppercase">Head Block</div>
            <div class="col-12 text-subtitle1 text-grey-3 text-bold">{{HeadBlock}}</div>
        </div>
    </div>
    <div class="col-1">
        <div class="hr-vertical"></div>
    </div>
    <div class="col-3">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-grey-3 text-uppercase">Producing</div>
            <div class="col-12 text-subtitle1 text-grey-3 text-bold">{{HeadBlockProducer}}</div>
        </div>
    </div>
    <div class="col-1">
        <div class="hr-vertical"></div>
    </div>
    <div class="col-3">
        <div class="row">
            <div class="col-12 text-subtitle1 text-weight-thin text-grey-3 text-uppercase">Irreversible</div>
            <div class="col-12 text-subtitle1 text-grey-3 text-bold"> {{lastIrreversibleBlock}}</div>
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
</style>
