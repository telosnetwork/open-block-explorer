<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

export default defineComponent({
  name: 'SellRam',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    let openTransaction = ref<boolean>(false);
    const sellAmount = ref('');
    const symbol = ref<string>(chain.getSymbol());
    const transactionId = computed(
      (): string => store.state.account.TransactionId
    );
    const transactionError = computed(
      () => store.state.account.TransactionError
    );
    const ramPrice = computed((): string => {
      return store.state?.chain.ram_price;
    });
    const sellPreview = computed(
      () =>
        ((Number(sellAmount.value) / 1000) * Number(ramPrice.value)).toFixed(
          4
        ) + ' TLOS'
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
      sellAmount.value = parseInt(sellAmount.value)
        .toString()
        .replace(/[^0-9.]/g, '');
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
      sellAmount,
      transactionId,
      transactionError,
      ramAvailable,
      accountData,
      symbol,
      sellPreview,
      formatDec,
      sell,
      assetToAmount
    };
  }
});
</script>

<template lang="pug">
.staking-form
  q-card-section.text-grey-3
    .row
      .row.q-pb-sm.full-width
        .col-12 {{ `Amount of RAM to sell in Bytes` }}
      q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0' v-model="sellAmount" :lazy-rules='true' :rules="[ val => val >= 0  && val <= ramAvailable && val != ''  || 'Invalid amount.' ]" type="text" dense dark)
    .row.q-pb-sm
      .text-weight-normal.text-right.text-grey-3 ≈ {{sellPreview}}
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
