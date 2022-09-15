<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

export default defineComponent({
  name: 'StakingTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    let openTransaction = ref<boolean>(false);
    const stakeTokens = ref<string>('0.0000');
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
      stakeTokens.value = Number(stakeTokens.value)
        .toLocaleString('en-US', {
          style: 'decimal',
          maximumFractionDigits: precision,
          minimumFractionDigits: precision
        })
        .replace(/[^0-9.]/g, '');
    }

    async function stake() {
      void store.dispatch('account/resetTransaction');
      if (
        stakeTokens.value === '0.0000' ||
        Number(stakeTokens.value) >=
          Number(accountData.value.account.core_liquid_balance.split(' ')[0])
      ) {
        return;
      }
      await store.dispatch('account/stakeRex', {
        amount: stakeTokens.value
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
      stakeTokens,
      transactionId,
      transactionError,
      formatDec,
      stake,
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
            .col-8 {{ `LIQUID ${symbol}` }}
            .col-4.text-weight-bold.text-right {{accountData.account.core_liquid_balance}}
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="stakeTokens" :lazy-rules='true' :rules="[ val => val >= 0 && val <= assetToAmount(accountData.account.core_liquid_balance)  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(:label='"Stake " + symbol' flat @click="stake" )
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
