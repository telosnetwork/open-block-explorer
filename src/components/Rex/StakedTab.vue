<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';

export default defineComponent({
  name: 'StakedTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    const openTransaction = ref<boolean>(false);
    const stakingAccount = computed(
      (): string => store.state.account.accountName
    );
    const cpuTokens = ref<string>('0.0000');
    const netTokens = ref<string>('0.0000');
    const cpuWithdraw = ref<string>('0.0000');
    const netWithdraw = ref<string>('0.0000');
    const transactionId = ref<string>(store.state.account.TransactionId);
    const transactionError = ref<unknown>(store.state.account.TransactionError);
    const accountData = computed((): AccountDetails => {
      return store.state?.account.data;
    });

    function formatDec() {
      cpuTokens.value = Number(cpuTokens.value)
        .toLocaleString('en-US', {
          style: 'decimal',
          maximumFractionDigits: store.state.chain.token.precision,
          minimumFractionDigits: store.state.chain.token.precision
        })
        .replace(/[^0-9.]/g, '');
      netTokens.value = Number(netTokens.value)
        .toLocaleString('en-US', {
          style: 'decimal',
          maximumFractionDigits: store.state.chain.token.precision,
          minimumFractionDigits: store.state.chain.token.precision
        })
        .replace(/[^0-9.]/g, '');
    }

    async function stake() {
      void store.dispatch('account/resetTransaction');
      if (
        (cpuTokens.value === '0.0000' && netTokens.value === '0.0000') ||
        Number(cpuTokens.value) >=
          assetToAmount(accountData.value.account.total_resources.cpu_weight) ||
        Number(netTokens.value) >=
          assetToAmount(accountData.value.account.total_resources.net_weight)
      ) {
        return;
      }
      await store.dispatch('account/stakeCpuNetRex', {
        cpuAmount: cpuTokens.value,
        netAmount: netTokens.value
      });
      openTransaction.value = true;
    }

    async function unstake() {
      void store.dispatch('account/resetTransaction');
      if (cpuWithdraw.value === '0.0000' && netWithdraw.value === '0.0000') {
        return;
      }
      await store.dispatch('account/unstakeCpuNetRex', {
        cpuAmount: cpuWithdraw.value,
        netAmount: netWithdraw.value
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
      stakingAccount,
      cpuTokens,
      netTokens,
      cpuWithdraw,
      netWithdraw,
      ...mapActions({ signTransaction: 'account/sendTransaction' }),
      transactionId,
      transactionError,
      formatDec,
      stake,
      unstake,
      assetToAmount,
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
            .col-9 STAKED CPU TO LEND
            .col-3.grey-3.text-right {{accountData.account.total_resources.cpu_weight}}
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="cpuTokens" :lazy-rules='true' :rules="[ val => val >= 0 && val <= assetToAmount(accountData.account.total_resources.cpu_weight)  || 'Invalid amount.' ]" type="text" dense dark)
          .row
          .row.q-pb-sm.full-width
            .col-9 STAKED NET TO LEND
            .col-3.grey-3.text-right {{accountData.account.total_resources.net_weight}}
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="netTokens" :lazy-rules='true' :rules="[ val =>  val >= 0 && val <= assetToAmount(accountData.account.total_resources.net_weight) || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Lend" flat @click="stake" )
      .col-xs-12.col-sm-12.col-md-6
        .row
          .row.q-pb-sm.full-width
            .col-9 STAKED CPU TO WITHDRAW
            .col-3.grey-3.text-right 0
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="cpuWithdraw" :lazy-rules='true' :rules="[ val =>  val >= 0 && val <= assetToAmount(accountData.account.total_resources.cpu_weight) || 'Invalid amount.' ]" type="text" dense dark)
          .row
          .row.q-pb-sm.full-width
            .col-9 STAKED NET TO WITHDRAW
            .col-3.grey-3.text-right 0
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="netWithdraw" :lazy-rules='true' :rules="[ val =>  val >= 0 && val <= assetToAmount(accountData.account.total_resources.net_weight) || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Withdraw" flat @click="unstake" )
  ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style lang="sass">
.button-accent
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  color: $grey-4
</style>
