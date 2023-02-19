<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { API } from '@greymass/eosio';

export default defineComponent({
  name: 'SavingsTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    const openTransaction = ref<boolean>(false);
    const stakingAccount = computed(
      (): string => store.state.account.accountName
    );
    const toSavingAmount = ref<string>('');
    const fromSavingAmount = ref<string>('');
    const transactionId = ref<string>(store.state.account.TransactionId);
    const transactionError = ref<unknown>(store.state.account.TransactionError);
    const accountData = computed((): API.v1.AccountObject => {
      return store.state?.account.data;
    });
    const eligibleStaked = computed(() => {
      return (
        assetToAmount(store.state?.account.maturedRex) +
        assetToAmount(store.state?.account.maturingRex)
      );
    });
    const rexSavings = computed(() => {
      return store.state?.account.savingsRex;
    });

    function formatDec() {
      if (toSavingAmount.value != '') {
        toSavingAmount.value = Number(toSavingAmount.value)
          .toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: store.state.chain.token.precision,
            minimumFractionDigits: store.state.chain.token.precision
          })
          .replace(/[^0-9.]/g, '');
      }
      if (fromSavingAmount.value != '') {
        fromSavingAmount.value = Number(fromSavingAmount.value)
          .toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: store.state.chain.token.precision,
            minimumFractionDigits: store.state.chain.token.precision
          })
          .replace(/[^0-9.]/g, '');
      }
    }

    async function moveToSavings() {
      void store.dispatch('account/resetTransaction');
      if (
        toSavingAmount.value === '0.0000' ||
        toSavingAmount.value === '' ||
        Number(toSavingAmount.value) >= eligibleStaked.value
      ) {
        return;
      }
      await store.dispatch('account/moveToSavings', {
        amount: toSavingAmount.value
      });
      openTransaction.value = true;
    }

    async function moveFromSavings() {
      void store.dispatch('account/resetTransaction');
      if (
        fromSavingAmount.value === '0.0000' ||
        fromSavingAmount.value === '' ||
        Number(fromSavingAmount.value) >= assetToAmount(rexSavings.value)
      ) {
        return;
      }
      await store.dispatch('account/moveFromSavings', {
        amount: fromSavingAmount.value
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

    function setMaxSavingsValue() {
      toSavingAmount.value = eligibleStaked.value.toString();
      void formatDec();
    }

    function setMaxWithdrawValue() {
      fromSavingAmount.value = assetToAmount(rexSavings.value).toString();
      void formatDec();
    }

    return {
      openTransaction,
      stakingAccount,
      accountData,
      toSavingAmount,
      fromSavingAmount,
      eligibleStaked,
      rexSavings,
      transactionId,
      transactionError,
      formatDec,
      moveToSavings,
      moveFromSavings,
      assetToAmount,
      setMaxSavingsValue,
      setMaxWithdrawValue
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
            .col-9 STAKE TO SAVINGS
            .col-3
              .row.items-center.justify-end.q-hoverable.cursor-pointer(@click='setMaxSavingsValue')
                .text-weight-bold.text-right.balance-amount {{ eligibleStaked }}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Any balance currently maturing will be moved first, click to stake full amount
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="toSavingAmount" :lazy-rules='true' :rules="[ val => val >= 0 && val <= eligibleStaked  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Move To Savings" flat @click="moveToSavings" )
      .col-12.q-pt-xl
        .row
          .row.q-pb-sm.full-width
            .col-9 UNSTAKE FROM SAVINGS
            .col-3
              .row.items-center.justify-end.q-hoverable.cursor-pointer(@click='setMaxWithdrawValue')
                .text-weight-bold.text-right.balance-amount {{rexSavings}}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Click to stake full amount
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="fromSavingAmount" :lazy-rules='true' :rules="[ val => val >= 0 && val <= assetToAmount(rexSavings)  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Withdraw from Savings" flat @click="moveFromSavings" )
  ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style lang="sass">
.button-accent
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  color: $grey-4
.balance-amount:hover
  color: $primary
</style>
