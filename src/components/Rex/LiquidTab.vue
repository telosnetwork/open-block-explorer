<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';

export default defineComponent({
  name: 'LiquidTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    let openTransaction = ref<boolean>(false);
    const lendTokens = ref<string>('0.0000');
    const withdrawTokens = ref<string>('0.0000');
    const transactionId = computed(
      (): string => store.state.account.TransactionId
    );
    const transactionError = computed(
      () => store.state.account.TransactionError
    );
    const accountData = computed((): AccountDetails => {
      return store.state?.account.data;
    });

    function formatDec() {
      const precision = store.state.chain.token.precision;
      lendTokens.value = Number(lendTokens.value)
        .toLocaleString('en-US', {
          style: 'decimal',
          maximumFractionDigits: precision,
          minimumFractionDigits: precision
        })
        .replace(/[^0-9.]/g, '');
      withdrawTokens.value = Number(withdrawTokens.value)
        .toLocaleString('en-US', {
          style: 'decimal',
          maximumFractionDigits: precision,
          minimumFractionDigits: precision
        })
        .replace(/[^0-9.]/g, '');
    }

    async function stake() {
      void store.dispatch('account/resetTransaction');
      if (lendTokens.value === '0.0000') {
        return;
      }
      await store.dispatch('account/stakeRex', {
        amount: lendTokens.value
      });
      openTransaction.value = true;
    }

    async function unstake() {
      void store.dispatch('account/resetTransaction');
      if (withdrawTokens.value === '0.0000') {
        return;
      }
      await store.dispatch('account/unstakeRex', {
        amount: withdrawTokens.value
      });
      openTransaction.value = true;
    }

    return {
      openTransaction,
      lendTokens,
      withdrawTokens,
      transactionId,
      transactionError,
      formatDec,
      stake,
      unstake,
      accountData
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
            .col-9 LIQUID TLOS TO LEND
            .col-3.grey-3.text-right {{accountData.account.core_liquid_balance}}
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="lendTokens" :lazy-rules='true' :rules="[ val => val >= 0  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Lend" flat @click="stake" )
      .col-xs-12.col-sm-12.col-md-6
        .row
          .row.q-pb-sm.full-width
            .col-9 LIQUID TLOS TO WITHDRAW
            .col-3.grey-3.text-right {{accountData.account.rex_info?.matured_rex + ' TLOS'}}
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="withdrawTokens" :lazy-rules='true' :rules="[ val => val >= 0  || 'Invalid amount.' ]" type="text" dense dark)
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
