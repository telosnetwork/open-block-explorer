<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'SendDialog',
  setup() {
    return {
      openCoinDialog: ref<boolean>(false),
      stakingAccount: ref<string>(''),
      cpuTokens: ref<string>('0.0000'),
      netTokens: ref<string>('0.0000')
    };
  }
});
</script>

<template lang="pug">
.container
  .row.full-width
    .row.full-width.q-pt-lg.q-px-lg
      .col-6.text-h6 Refunding Total
      .col-6.text-h6.text-right 1000 TLOS
    .row.full-width.q-py-md
      q-seperator(dark)
    .row.full-width.q-pb-lg
      .col-xs-12.col-sm-5.q-px-lg
        .row
          .col-7 ramijames123
          .col-5.text-right 100TLOS
        .row.q-pt-sm
          .col-7 ramijames123
          .col-5.text-right 100TLOS
      .col-xs-12.col-sm-7.q-px-lg
        .row
          .col-7 1 day left
          .col-5.text-right 100TLOS
        .row.q-pt-sm
          .col-7 Refund Failed
          .col-5.text-right 100TLOS

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
.container
  border: 2px solid $grey-3
  border-radius: 13px
</style>
