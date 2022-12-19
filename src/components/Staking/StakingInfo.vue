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
    const rexInfo = computed(() => {
      return accountData.value.rex_info;
    });
    const maturingRex = computed(() => {
      return accountData.value.rex_info.rex_maturities;
    });
    const coreRexBalance = computed(() => {
      return accountData.value.rex_info.rex_balance;
    });
    const maturedRex = computed(() => {
      return accountData.value.rex_info.matured_rex;
    });

    return {
      store,
      stakingAccount,
      total,
      accountData,
      token,
      maturingRex,
      rexInfo,
      coreRexBalance,
      maturedRex,
      symbol
    };
  }
});
</script>

<template lang="pug">
.container.text-grey-3.text-weight-light
  .row.full-width
    .row.full-width.q-pt-md.q-px-lg
      .col-6.text-h6.grey-3 ACCOUNT TOTAL
      .col-6.text-h6.text-right.grey-3 {{accountData.value.rex_balance.value}}
    .row.full-width.q-py-md.q-px-md
      hr

    .row.full-width.q-pb-lg
      .col-xs-12.col-sm-6.q-px-lg
        .row
          .col-7 {{ `TOTAL ${symbol} STAKED` }}
          .col-5.text-right.text-weight-bold {{coreRexBalance}}
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
