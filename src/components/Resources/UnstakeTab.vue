<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';
import { getChain } from 'src/config/ConfigManager';
import { isValidAccount } from 'src/utils/stringValidator';

const chain = getChain();
const symbol = chain.getSymbol();

export default defineComponent({
  name: 'UnstakeTab',
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
    const netStake = computed(
      (): string => store.state.account.data.account.total_resources.net_weight
    );
    const cpuStake = computed(
      (): string => store.state.account.data.account.total_resources.cpu_weight
    );

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
      ...mapActions({ signTransaction: 'account/sendTransaction' }),
      transactionId: ref<string>(null),
      transactionError: null,
      formatDec,
      netStake: assetToAmount(netStake.value),
      cpuStake: assetToAmount(cpuStake.value),
      isValidAccount
    };
  },
  methods: {
    async sendTransaction(): Promise<void> {
      this.transactionError = '';
      if (this.cpuTokens === '0.0000' && this.netTokens === '0.0000') {
        return;
      }
      const data = {
        from: this.stakingAccount.toLowerCase(),
        receiver: this.stakingAccount.toLowerCase(),
        unstake_cpu_quantity: `${parseFloat(this.cpuTokens).toFixed(
          4
        )} ${symbol}`,
        unstake_net_quantity: `${parseFloat(this.netTokens).toFixed(
          4
        )} ${symbol}`,
        transfer: false
      };
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.signTransaction({
            account: 'eosio',
            name: 'undelegatebw',
            data
          })
        ).transactionId as string;
        this.$store.commit('account/setTransaction', this.transactionId);
      } catch (e) {
        this.transactionError = e;
        this.$store.commit('account/setTransactionError', e);
      }
      await this.loadAccountData();
      this.openTransaction = true;
    },
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        data = await this.$api.getAccount(this.stakingAccount);
        this.$store.commit('account/setAccountData', data);
      } catch (e) {
        return;
      }
    }
  }
});
</script>

<template lang="pug">
.staking-form
  q-card-section.text-grey-3.text-weight-light
    .row
      .col-12
        .row.justify-between.q-pb-sm STAKING ACCOUNT
          q-space
          .text-grey-3 Defaults to selected account
        q-input.full-width(standout="bg-deep-purple-2 text-white" dense dark v-model="stakingAccount" :lazy-rules='true' :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]" )
    .row.q-py-md
      .col-6
        .row.justify-between.q-pb-sm UNSTAKE TO CPU
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="cpuTokens" :lazy-rules='true' :rules="[ val => val <= cpuStake && val >= 0  || 'Invalid amount.' ]" type="text" dense dark)

      .col-6.q-pl-md
        .row.justify-between.q-pb-sm UNSTAKE TO NET
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="netTokens" :lazy-rules='true' :rules="[ val => val <= netStake && val >= 0  || 'Invalid amount.' ]" type="text" dense dark)
    .row
      .col-12.q-pt-md
        q-btn.full-width.button-accent(label="Confirm" flat @click="sendTransaction" )
    ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
</style>
