<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';

export default defineComponent({
  name: 'StakeTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    const openTransaction = ref<boolean>(false);
    const stakingAccount = computed(
      (): string => store.state.account.accountName
    );
    const accountTotal = computed(
      (): string => store.state.account.data.account?.core_liquid_balance
    );
    const cpuTokens = ref<string>('0.0000');
    const netTokens = ref<string>('0.0000');

    function formatDec() {
      cpuTokens.value = Number(cpuTokens.value).toLocaleString('en-US', {
        style: 'decimal',
        maximumFractionDigits: store.state.chain.token.precision,
        minimumFractionDigits: store.state.chain.token.precision
      });
      netTokens.value = Number(netTokens.value).toLocaleString('en-US', {
        style: 'decimal',
        maximumFractionDigits: store.state.chain.token.precision,
        minimumFractionDigits: store.state.chain.token.precision
      });
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
      accountTotal: assetToAmount(accountTotal.value)
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
        stake_cpu_quantity:
          String(parseFloat(this.cpuTokens).toFixed(4)) + String(' TLOS'),
        stake_net_quantity:
          String(parseFloat(this.netTokens).toFixed(4)) + String(' TLOS'),
        transfer: false
      };
      const authenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const users = await authenticators[0].login();
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.signTransaction({
            account: 'eosio',
            name: 'delegatebw',
            user: users[0],
            data
          })
        ).transactionId as string;
      } catch (e) {
        this.transactionError = e;
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
  q-card-section
    .row
      .col-12
        .row.justify-between.q-pb-sm STAKING ACCOUNT
          q-space
          .color-grey-3 Defaults to selected account
        q-input.full-width(standout dense dark v-model="stakingAccount" :lazy-rules='true' :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]" )
    .row.q-py-md
      .col-6
        .row.justify-between.q-pb-sm STAKE TO CPU
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="cpuTokens" :lazy-rules='true' :rules="[ val => val <= accountTotal && val >= 0 || 'Invalid amount.' ]" type="text" dense dark)

      .col-6.q-pl-md
        .row.justify-between.q-pb-sm STAKE TO NET
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="netTokens" :lazy-rules='true' :rules="[ val => val <= accountTotal && val >= 0 ||'Invalid amount.' ]" type="text" dense dark)
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
