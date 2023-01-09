<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { Token } from 'src/types';

const chain = getChain();

export default defineComponent({
  name: 'StakingInfo',
  setup() {
    const store = useStore();
    const symbol = ref<string>(chain.getSystemToken().symbol);
    const stakingAccount = ref<string>('');
    const total = ref<string>('0.0000');
    const token = computed((): Token => store.state.chain.token);
    const accountData = computed((): API.v1.AccountObject => {
      return store.state.account.data;
    });
    const liquidBalance = computed(() => accountData.value.core_liquid_balance);
    const rexInfo = computed(() => accountData.value.rex_info);
    const coreRexBalance = computed(() => {
      return store.state?.account.coreRexBalance;
    });
    const maturingRex = computed(() => {
      return store.state?.account.maturingRex;
    });
    const maturedRex = computed(() => {
      return store.state?.account.maturedRex;
    });
    const rexSavings = computed(() => {
      return store.state?.account.savingsRex;
    });

    return {
      store,
      symbol,
      stakingAccount,
      total,
      accountData,
      token,
      liquidBalance,
      rexInfo,
      maturingRex,
      coreRexBalance,
      maturedRex,
      rexSavings
    };
  }
});
</script>

<template lang="pug">
.container.text-grey-3.text-weight-light
  .row.full-width
    .row.full-width.q-pt-md.q-px-lg
      .col-6.text-h6.grey-3 LIQUID BALANCE
      .col-6.text-h6.text-right.grey-3 {{ liquidBalance }}
    .row.full-width.q-py-md.q-px-md
      hr

    .row.full-width.q-pb-lg
      .col-xs-12.col-sm-6.q-px-lg
        .row
          .col-7 {{ `TOTAL ${symbol} STAKED` }}
          .col-5.text-right.text-weight-bold {{coreRexBalance}}
        .row.q-pt-sm
          .col-7 SAVINGS
          .col-5.text-right.text-weight-bold {{rexSavings}}
      .col-xs-12.col-sm-6.q-px-lg
        .row
          .col-7 MATURED
          .col-5.text-right.text-weight-bold {{maturedRex}}
        .row.q-pt-sm
          .col-7 MATURING
          .col-5.text-right.text-weight-bold {{maturingRex}}

</template>

<style lang="sass">
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
