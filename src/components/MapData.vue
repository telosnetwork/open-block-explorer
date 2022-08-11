<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';

export default defineComponent({
  name: 'MapData',
  props: {
    mobile: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const HeadBlockProducer = computed(
      (): string => store.state.chain.head_block_producer
    );
    const HeadBlock = computed((): number => store.state.chain.head_block_num);
    const lastIrreversibleBlock = computed(
      (): number => store.state.chain.last_irreversible_block_num
    );
    const isMobile = computed((): boolean => {
      return props.mobile;
    });

    return {
      isMobile,
      HeadBlock,
      HeadBlockProducer,
      lastIrreversibleBlock
    };
  }
});
</script>

<template lang="pug">
.row.full-width.q-pl-xl.container.actor-font(v-if="!isMobile")
  .col
    .row.full-width.q-pt-md.q-px-lg
      .col-12.text-subtitle1.text-weight-thin.text-grey-3 Head Block
      .col-12.text-h6.text-grey-3.text-bold {{HeadBlock}}
    hr
    .row.full-width.q-pt-md.q-px-lg
      .col-12.text-subtitle1.text-weight-thin.text-grey-3 Producing
      .col-12.text-h6.text-grey-3.text-bold {{HeadBlockProducer}}
    hr
    .row.full-width.q-pt-md.q-px-lg
      .col-12.text-subtitle1.text-weight-thin.text-grey-3 Irreversible Block
      .col-12.text-h6.text-grey-3.text-bold {{lastIrreversibleBlock}}
.row.full-width.text-center.justify-center.actor-font(v-else)
  .col-3
    .row
      .col-12.text-subtitle1.text-weight-thin.text-grey-3.text-uppercase Head Block
      .col-12.text-subtitle1.text-grey-3.text-bold {{HeadBlock}}
  .col-1
    .hr-vertical
  .col-3
    .row
      .col-12.text-subtitle1.text-weight-thin.text-grey-3.text-uppercase Producing
      .col-12.text-subtitle1.text-grey-3.text-bold {{HeadBlockProducer}}
  .col-1
    .hr-vertical
  .col-3
    .row
      .col-12.text-subtitle1.text-weight-thin.text-grey-3.text-uppercase Irreversible
      .col-12.text-subtitle1.text-grey-3.text-bold  {{lastIrreversibleBlock}}
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
