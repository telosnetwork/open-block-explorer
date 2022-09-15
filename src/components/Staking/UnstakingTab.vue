<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

export default defineComponent({
  name: 'UnstakingTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    let openTransaction = ref<boolean>(false);
    const withdrawTokens = ref<string>('0.0000');
    const symbol = ref<string>(chain.getSymbol());
    const transactionId = computed(
      (): string => store.state.account.TransactionId
    );
    const transactionError = computed(
      () => store.state.account.TransactionError
    );
    const accountData = computed((): AccountDetails => {
      return store.state?.account.data;
    });
    const rexInfo = computed(() => {
      return store.state.account.data.account.rex_info;
    });
    const rexbal = computed(() => {
      return store.state.account.rexbal;
    });
    const maturedRex = computed(() => {
      return store.state?.account.maturedRex;
    });

    function formatDec() {
      const precision = store.state.chain.token.precision;
      withdrawTokens.value = Number(withdrawTokens.value)
        .toLocaleString('en-US', {
          style: 'decimal',
          maximumFractionDigits: precision,
          minimumFractionDigits: precision
        })
        .replace(/[^0-9.]/g, '');
    }

    async function unstake() {
      void store.dispatch('account/resetTransaction');
      if (
        withdrawTokens.value === '0.0000' ||
        !rexbal.value.vote_stake ||
        Number(withdrawTokens.value) >=
          Number(rexbal.value.vote_stake.split(' ')[0])
      ) {
        return;
      }
      await store.dispatch('account/unstakeRex', {
        amount: withdrawTokens.value
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
      withdrawTokens,
      transactionId,
      transactionError,
      formatDec,
      unstake,
      assetToAmount,
      accountData,
      rexInfo,
      rexbal,
      maturedRex,
      symbol
    };
  }
});
</script>

<template lang="pug">
.staking-form
  q-card-section
    .row.q-col-gutter-md
      .col-12
        .row
          .row.q-pb-sm.full-width
            .col-8 {{ `LIQUID ${symbol} TO WITHDRAW` }}
            .col-4.text-weight-bold.text-right {{maturedRex}}
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="withdrawTokens" :lazy-rules='true' :rules="[ val => val >= 0  && val <= assetToAmount(maturedRex)  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Withdraw" flat @click="unstake" )
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
