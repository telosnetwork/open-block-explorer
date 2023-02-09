<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';

const chain = getChain();

export default defineComponent({
  name: 'StakingTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    let openTransaction = ref<boolean>(false);
    const stakeTokens = ref<string>('');
    const symbol = ref<string>(chain.getSystemToken().symbol);
    const transactionId = computed(
      (): string => store.state.account.TransactionId
    );
    const transactionError = computed(
      () => store.state.account.TransactionError
    );
    const accountData = computed((): API.v1.AccountObject => {
      return store.state?.account.data;
    });
    const rexInfo = computed(() => {
      return store.state.account.data.rex_info;
    });
    const rexbal = computed(() => {
      return store.state.account.rexbal;
    });
    const maturedRex = computed(() => {
      return store.state.account.maturedRex;
    });
    const liquidBalance = computed(
      () => accountData.value?.core_liquid_balance.value
    );

    function formatDec() {
      const precision = store.state.chain.token.precision;
      if (stakeTokens.value != '') {
        stakeTokens.value = Number(stakeTokens.value)
          .toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: precision,
            minimumFractionDigits: precision
          })
          .replace(/[^0-9.]/g, '');
      }
    }

    async function stake() {
      void store.dispatch('account/resetTransaction');
      if (
        stakeTokens.value === '0.0000' ||
        Number(stakeTokens.value) >=
          Number(accountData.value.core_liquid_balance.toString())
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

    function setMaxValue() {
      stakeTokens.value = (
        assetToAmount(accountData.value.core_liquid_balance.toString()) - 0.1
      ).toString();
      void formatDec();
    }

    return {
      openTransaction,
      stakeTokens,
      transactionId,
      transactionError,
      accountData,
      rexInfo,
      rexbal,
      maturedRex,
      liquidBalance,
      symbol,
      formatDec,
      stake,
      assetToAmount,
      setMaxValue
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
            .col-4
              .row.items-center.justify-end.q-hoverable.cursor-pointer(@click='setMaxValue')
                .text-weight-bold.text-right.balance-amount {{ `${liquidBalance} ${symbol}` }}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Click to fill full amount
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="stakeTokens" :lazy-rules='true' :rules="[ val => val >= 0 && val <= assetToAmount(accountData.account.core_liquid_balance)  || 'Invalid amount.' ]" type="text" dense dark)
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
.balance-amount:hover
  color: $primary
</style>
