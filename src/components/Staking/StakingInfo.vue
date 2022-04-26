<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { AccountDetails, Token, Refund } from 'src/types';

export default defineComponent({
  name: 'StakingInfo',
  setup() {
    const store = useStore();
    const openCoinDialog = ref<boolean>(false);
    const stakingAccount = ref<string>('');
    const cpuTokens = ref<string>('0.0000');
    const netTokens = ref<string>('0.0000');
    const total = ref<string>('0.0000');
    const token = computed((): Token => store.state.chain.token);
    const accountData = computed((): AccountDetails => {
      return store.state?.account.data;
    });

    function formatStaked(staked: number): string {
      const stakedValue = (
        staked / Math.pow(10, token.value.precision)
      ).toFixed(2);
      return `${stakedValue} ${token.value.symbol}`;
    }

    function formatTotalRefund(refund: Refund): string {
      const totalRefund = (
        assetToAmount(refund?.cpu_amount, token.value.precision) +
        assetToAmount(refund?.net_amount, token.value.precision)
      ).toFixed(2);
      return `${totalRefund} ${token.value.symbol}`;
    }

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

    return {
      store,
      openCoinDialog,
      stakingAccount,
      cpuTokens,
      netTokens,
      total,
      accountData,
      token,
      formatStaked,
      formatTotalRefund
    };
  }
});
</script>

<template lang="pug">
.container
  .row.full-width
    .row.full-width.q-pt-md.q-px-lg
      .col-6.text-h6.grey-3 ACCOUNT TOTAL
      .col-6.text-h6.text-right.grey-3 {{accountData.account?.core_liquid_balance}}
    .row.full-width.q-py-md.q-px-md
      q-separator(color="grey-8" )
    .row.full-width.q-pb-lg
      .col-xs-12.col-sm-6.q-px-lg
        .row
          .col-7 STAKED TO CPU
          .col-5.text-right.grey-3 {{accountData.account?.total_resources?.cpu_weight}}
        .row.q-pt-sm
          .col-7 STAKED TO NET
          .col-5.text-right.grey-3 {{accountData.account?.total_resources?.net_weight}}
      .col-xs-12.col-sm-6.q-px-lg
        .row
          .col-7 STAKED BY OTHERS
          .col-5.text-right.grey-3 {{formatStaked(accountData.account?.voter_info?.staked)}}
        .row.q-pt-sm
          .col-7 REFUNDING
          .col-5.text-right.grey-3 {{formatTotalRefund(accountData.account?.refund_request)}}

</template>

<style lang="sass">
.container
  border: 2px solid $grey-3
  border-radius: 13px
.grey-3
  color: $grey-3
</style>
