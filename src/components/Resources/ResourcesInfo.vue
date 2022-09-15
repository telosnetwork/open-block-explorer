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
    const ramPrice = computed((): string => {
      return store.state?.chain.ram_price;
    });
    const ramAvailable = computed(
      () =>
        store.state.account.data.account.ram_quota -
        store.state.account.data.account.ram_usage
    );

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
      ramPrice,
      ramAvailable,
      formatStaked,
      formatTotalRefund
    };
  }
});
</script>

<template lang="pug">
.container.grey-3
  .row.full-width
    .row.full-width.q-pt-md.q-px-lg
      .col-6.text-h6.text-bold ACCOUNT TOTAL
      .col-6.text-h6.text-right.text-bold {{accountData.account?.core_liquid_balance}}
    .row.full-width.q-py-md
      hr
    .row.full-width.q-pb-md
      .col-xs-12.col-sm-6.q-px-lg.q-pb-sm
        .row
          .col-7.text-weight-light CPU
          .col-5.text-right.text-bold {{accountData.account?.total_resources?.cpu_weight}}
        .row.q-pt-sm
          .col-7.text-weight-light NET
          .col-5.text-right.text-bold {{accountData.account?.total_resources?.net_weight}}
        .row.q-pt-sm
          .col-7.text-weight-light AVAILABLE RAM
          .col-5.text-right.text-bold {{ramAvailable}} Bytes
      .col-xs-12.col-sm-6.q-px-lg.q-pb-sm
        .row
          .col-7.text-weight-light DELEGATED
          .col-5.text-right.text-bold {{formatStaked(accountData.account?.voter_info?.staked)}}
        .row.q-pt-sm
          .col-7.text-weight-light REFUNDING
          .col-5.text-right.text-bold {{formatTotalRefund(accountData.account?.refund_request)}}
        .row.q-pt-sm
          .col-7.text-weight-light RAM PRICE
          .col-5.text-right.text-bold {{ramPrice}} TLOS/KB

</template>

<style scoped lang="sass">
.container
  border: 2px solid $grey-3
  border-radius: 13px
.grey-3
  color: $grey-3
hr
  content: ""
  display: block
  width: 100%
  border-size: 0.5rem
  border : 0px
  border-bottom: 1px solid $grey-8
  margin-left: 1rem
  margin-right: 1rem
</style>
