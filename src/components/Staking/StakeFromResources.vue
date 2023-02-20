<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API, Asset } from '@greymass/eosio';

export default defineComponent({
  name: 'StakeFromResources',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    const openTransaction = ref<boolean>(false);
    const chain = getChain();
    const symbol = ref<string>(chain.getSystemToken().symbol);
    const cpuTokens = ref<string>('');
    const netTokens = ref<string>('');
    const cpuWithdraw = ref<string>('0.0000');
    const netWithdraw = ref<string>('0.0000');
    const transactionId = ref<string>(store.state.account.TransactionId);
    const transactionError = ref<unknown>(store.state.account.TransactionError);
    const stakingAccount = computed(
      (): string => store.state.account.accountName
    );
    const accountData = computed((): API.v1.AccountObject => {
      return store.state?.account.data;
    });
    const cpuWeight = computed(
      (): Asset => accountData.value.total_resources.cpu_weight
    );
    const netWeight = computed(
      (): Asset => accountData.value.total_resources.net_weight
    );

    function formatDec() {
      if (cpuTokens.value != '') {
        cpuTokens.value = Number(cpuTokens.value)
          .toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: store.state.chain.token.precision,
            minimumFractionDigits: store.state.chain.token.precision
          })
          .replace(/[^0-9.]/g, '');
      }
      if (netTokens.value != '') {
        netTokens.value = Number(netTokens.value)
          .toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: store.state.chain.token.precision,
            minimumFractionDigits: store.state.chain.token.precision
          })
          .replace(/[^0-9.]/g, '');
      }
    }

    async function stake() {
      void store.dispatch('account/resetTransaction');
      if (
        (cpuTokens.value === '0.0000' && netTokens.value === '0.0000') ||
        Number(cpuTokens.value) >= Number(cpuWeight.value) ||
        Number(netTokens.value) >=
          Number(accountData.value.total_resources.net_weight)
      ) {
        return;
      }
      await store.dispatch('account/stakeCpuNetRex', {
        cpuAmount: cpuTokens.value,
        netAmount: netTokens.value
      });

      if (localStorage.getItem('autoLogin') !== 'cleos') {
        openTransaction.value = true;
      }
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

      if (localStorage.getItem('autoLogin') !== 'cleos') {
        openTransaction.value = true;
      }
    }

    function setMaxNetValue() {
      netTokens.value = netWeight.value.toString();
      void formatDec();
    }

    function setMaxCpuValue() {
      cpuTokens.value = cpuWeight.value.toString();
      void formatDec();
    }

    return {
      openTransaction,
      stakingAccount,
      cpuTokens,
      netTokens,
      symbol,
      cpuWithdraw,
      netWithdraw,
      transactionId,
      transactionError,
      accountData,
      cpuWeight,
      netWeight,
      formatDec,
      stake,
      unstake,
      setMaxNetValue,
      setMaxCpuValue
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
            .col-9 TRANSFER CPU TO STAKING
            .col-3
              .row.items-center.justify-end.q-hoverable.cursor-pointer(@click='setMaxCpuValue')
                .text-weight-bold.text-right.balance-amount {{cpuWeight}}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Click to fill full amount
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="cpuTokens" :lazy-rules='true' :rules="[ val => val >= 0 && val <= cpuWeight.value  || 'Invalid amount.' ]" type="text" dense dark)
          .row
          .row.q-pb-sm.full-width
            .col-9 TRANSFER NET TO STAKING
            .col-3
              .row.items-center.justify-end.q-hoverable.cursor-pointer(@click='setMaxNetValue')
                .text-weight-bold.text-right.balance-amount(@click='setMaxNetValue') {{netWeight}}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Click to fill full amount
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="netTokens" :lazy-rules='true' :rules="[ val =>  val >= 0 && val <= netWeight.value || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(:label=" 'Stake ' + symbol" flat @click="stake" )
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
