<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

export default defineComponent({
  name: 'LiquidTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    let openTransaction = ref<boolean>(false);
    const buyAmount = ref<string>('0.0000');
    const sellAmount = ref<string>('0');
    const symbol = ref<string>(chain.getSymbol());
    const transactionId = computed(
      (): string => store.state.account.TransactionId
    );
    const transactionError = computed(
      () => store.state.account.TransactionError
    );
    const ramAvailable = computed(
      () =>
        store.state.account.data.account.ram_quota -
        store.state.account.data.account.ram_usage
    );
    const accountData = computed((): AccountDetails => {
      return store.state?.account.data;
    });

    function formatDec() {
      const precision = store.state.chain.token.precision;
      buyAmount.value = Number(buyAmount.value)
        .toLocaleString('en-US', {
          style: 'decimal',
          maximumFractionDigits: precision,
          minimumFractionDigits: precision
        })
        .replace(/[^0-9.]/g, '');
    }

    async function buy() {
      void store.dispatch('account/resetTransaction');
      if (
        buyAmount.value === '0.0000' ||
        Number(buyAmount.value) >=
          Number(accountData.value.account.core_liquid_balance.split(' ')[0])
      ) {
        return;
      }
      await store.dispatch('account/buyRam', {
        amount: buyAmount.value + ' ' + symbol.value
      });
      openTransaction.value = true;
    }

    async function sell() {
      void store.dispatch('account/resetTransaction');
      if (
        sellAmount.value === '0.0000' ||
        !ramAvailable.value ||
        Number(sellAmount.value) >= ramAvailable.value
      ) {
        return;
      }
      await store.dispatch('account/sellRam', {
        amount: sellAmount.value
      });
      openTransaction.value = true;
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
      openTransaction,
      buyAmount,
      sellAmount,
      transactionId,
      transactionError,
      ramAvailable,
      formatDec,
      buy,
      sell,
      assetToAmount,
      accountData,
      symbol
    };
  }
});
</script>

<template lang="pug">
.staking-form
  q-card-section
    .row.q-col-gutter-md
      .col-xs-12.col-sm-12.col-md-6
        .row
          .row.q-pb-sm.full-width
            .col-8 {{ `AMOUNT TO BUY` }}
            .col-4.text-weight-bold.text-right {{accountData.account.core_liquid_balance}}
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="buyAmount" :lazy-rules='true' :rules="[ val => val >= 0 && val <= assetToAmount(accountData.account.core_liquid_balance)  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Buy" flat @click="buy" )
      .col-xs-12.col-sm-12.col-md-6
        .row
          .row.q-pb-sm.full-width
            .col-8 {{ `AMOUNT TO SELL` }}
            .col-4.text-weight-bold.text-right {{ramAvailable}} Bytes
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="sellAmount" :lazy-rules='true' :rules="[ val => val >= 0  && val <= ramAvailable  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Sell" flat @click="sell" )
    ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style scoped lang="sass">
.button-accent
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  color: $grey-4
.grey-3
  color: $grey-3
</style>
