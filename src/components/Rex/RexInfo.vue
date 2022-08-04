<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { AccountDetails, Token } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

export default defineComponent({
  name: 'StakingInfo',
  setup() {
    const store = useStore();
    const symbol = ref<string>(chain.getSymbol());
    const stakingAccount = ref<string>('');
    const total = ref<string>('0.0000');
    const token = computed((): Token => store.state.chain.token);
    const accountData = computed((): AccountDetails => {
      return store.state.account.data;
    });
    const rexInfo = computed(() => {
      return store.state?.account.data.account.rex_info;
    });
    const maturingRex = computed(() => {
      return store.state?.account.maturingRex;
    });
    const coreRexBalance = computed(() => {
      return store.state?.account.coreRexBalance;
    });
    const maturedRex = computed(() => {
      return store.state?.account.maturedRex;
    });
    const rexSavings = computed(() => {
      return store.state?.account.savingsRex;
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
      rexSavings,
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
      .col-6.text-h6.text-right.grey-3 {{accountData.account?.core_liquid_balance}}
    .row.full-width.q-py-md.q-px-md
      hr
    //-.row.full-width.q-col-gutter-lg.q-pb-md
      .col-xs-12.col-sm-6
        div Your Cumulative Earnings
        .text-h6.grey-3 30.25 {{ ${symbol} }}
      .col-xs-12.col-sm-6.q-pt-xs-md.q-pr-lg
        .row(:class="$q.screen.gt.xs ? 'float-right' : '' ")
          .row.q-pr-sm
            .col-12(:class="$q.screen.gt.xs ? 'text-right' : '' ") 30 Day intrest
            .col-12.grey-3(:class="$q.screen.gt.xs ? 'text-right' : '' ")  Here
          q-separator(vertical color="primary")
          q-btn-dropdown( padding="xs" flat @click='onMainClick')
            q-list
              q-item(clickable v-close-popup @click='onItemClick')
                q-item-section
                  q-item-label 30 days
              q-item(clickable v-close-popup @click='onItemClick')
                q-item-section
                  q-item-label 3 months
              q-item(clickable v-close-popup @click='onItemClick')
                q-item-section
                  q-item-label 6 months
              q-item(clickable v-close-popup @click='onItemClick')
                q-item-section
                  q-item-label 1 year
              q-item(clickable v-close-popup @click='onItemClick')
                q-item-section
                  q-item-label 2 years
    //

    .row.full-width.q-pb-lg
      .col-xs-12.col-sm-6.q-px-lg
        .row
          .col-7 {{ `TOTAL ${symbol} IN REX` }}
          .col-5.text-right.text-weight-bold {{coreRexBalance}}
        .row.q-pt-sm
          .col-7 REX SAVINGS
          .col-5.text-right.text-weight-bold {{rexSavings}}
      .col-xs-12.col-sm-6.q-px-lg
        .row
          .col-7 MATURED REX
          .col-5.text-right.text-weight-bold {{maturedRex}}
        .row.q-pt-sm
          .col-7 MATURING REX
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
