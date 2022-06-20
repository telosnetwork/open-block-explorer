<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { AccountDetails, Token } from 'src/types';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';

export default defineComponent({
  name: 'ProcessingTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    const progress = ref<number>(0.2);
    const token = computed((): Token => store.state.chain.token);
    const accountData = computed((): AccountDetails => {
      return store.state?.account.data;
    });

    function assetToAmount(asset: string, decimals = -1): number {
      try {
        let qty: string = asset.split(' ')[0];
        let val: number = parseFloat(qty);
        if (decimals > -1) qty = val.toFixed(decimals);
        return val;
      } catch (error) {
        return 0;
      }
    }

    function refundProgress(): number {
      let diff =
        Math.round(
          new Date(
            new Date(
              accountData.value.account?.refund_request?.request_time + 'Z'
            ).toUTCString()
          ).getTime() / 1000
        ) +
        604800 - //The max amount it can take in seconds
        Math.round(new Date(Date.now()).getTime() / 1000);
      let time = diff / 604800;
      return time > 0 ? time : 0;
    }

    function maturitiesCountdown(): string {
      let diff =
        Math.round(
          new Date(
            new Date(
              accountData.value.account?.rex_info?.rex_maturities[0].first + 'Z'
            )
          ).getTime() / 1000
        ) - Math.round(new Date(new Date().toISOString()).getTime() / 1000);
      if (diff > 0) {
        var days = component(diff, 24 * 60 * 60), // calculate days from timestamp
          hours = component(diff, 60 * 60) % 24; // hours
        // minutes = component(diff, 60) % 60, // minutes
        // seconds = component(diff, 1) % 60;// seconds
        return `${days} days, ${hours} hours remaining`;
      } else {
        return 'No maturing Rex';
      }
    }

    function maturingRex(): string {
      const mature =
        assetToAmount(accountData.value.account.rex_info?.vote_stake) -
        assetToAmount(accountData.value.account.rex_info?.matured_rex);
      return mature.toString() + ' TLOS';
    }

    function component(x: number, v: number) {
      return Math.floor(x / v);
    }

    return {
      store,
      accountData,
      token,
      progress,
      refundProgress,
      maturitiesCountdown,
      maturingRex,
      ...mapActions({ refund: 'account/refund' }),
      transactionId: ref<string>(null),
      transactionError: null
    };
  }
});
</script>

<template lang="pug">
.q-pt-lg
  .container-refund.q-pa-sm
    .row.full-width
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-6 Rex maturing
          .col-6.text-right.text-weight-bold {{maturingRex()}}
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-7 {{maturitiesCountdown()}}
          .col-5.text-right.text-weight-bold 
            q-linear-progress( :value="refundProgress()" :buffer="buffer" color="grey-3" class="q-mt-sm")
    ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

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
