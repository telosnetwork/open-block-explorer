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
.q-pt-lg
  .container-refund
    .row.full-width
      .row.full-width.q-pt-lg.q-px-lg
        .col-6.text-h6.grey-3 Refunding Total
        .col-6.text-h6.text-right.grey-3 1000 TLOS
      .row.full-width.q-py-md
        hr
      .row.full-width.q-pb-lg
        .col-xs-12.col-sm-5.q-px-lg
          .row
            .col-7 ramijames123
            .col-5.text-right.grey-3 100TLOS
          .row.q-pt-sm
            .col-7 ramijames123
            .col-5.text-right.grey-3 100TLOS
        .col-xs-12.col-sm-7.q-px-lg
          .row
            .col-7 1 day left
            .col-5.text-right.grey-3 100TLOS
          .row.q-pt-sm
            .col-7 Refund Failed
            .col-5.text-right.grey-3 100TLOS

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
.container-refund
  border: 1px solid $grey-8
  border-radius: 13px
.grey-3
  color: $grey-3
</style>
