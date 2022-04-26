<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { AccountDetails, Token, Refund } from 'src/types';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';

export default defineComponent({
  name: 'ProcessingTab',
  components: {
    ViewTransaction
  },
  setup() {
    const store = useStore();
    const openTransaction = ref<boolean>(false);
    const stakingAccount = ref<string>('');
    const total = ref<string>('0.0000');
    const progress = ref<number>(0.2);
    const token = computed((): Token => store.state.chain.token);
    const accountData = computed((): AccountDetails => {
      return store.state?.account.data;
    });

    function formatStaked(staked: number): string {
      const stakedValue = (
        staked / Math.pow(10, token.value.precision)
      ).toFixed(2);
      return `${stakedValue} ${token.value.symbol}`;
    }

    function formatTotalRefund(refund: Refund): string {
      const totalRefund = (
        assetToAmount(refund?.cpu_amount, token.value.precision) +
        assetToAmount(refund?.net_amount, token.value.precision)
      ).toFixed(2);
      return `${totalRefund} ${token.value.symbol}`;
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

    function refundProgress(): number {
      let diff =
        Math.round(
          new Date(
            new Date(
              accountData.value.account?.refund_request?.request_time + 'Z'
            ).toUTCString()
          ).getTime() / 1000
        ) +
        259200 -
        Math.round(new Date(Date.now()).getTime() / 1000);
      let time = diff / 259200;
      return time > 0 ? time : 0;
    }

    function refundCountdown(): string {
      let diff =
        Math.round(
          new Date(
            new Date(
              accountData.value.account?.refund_request?.request_time + 'Z'
            )
          ).getTime() / 1000
        ) +
        259200 -
        Math.round(new Date(new Date().toISOString()).getTime() / 1000);
      if (diff > 0) {
        var days = component(diff, 24 * 60 * 60), // calculate days from timestamp
          hours = component(diff, 60 * 60) % 24; // hours
        // minutes = component(diff, 60) % 60, // minutes
        // seconds = component(diff, 1) % 60;// seconds
        return `${days} days, ${hours} hours remaining`;
      } else {
        return 'No pending refund';
      }
    }

    function component(x: number, v: number) {
      return Math.floor(x / v);
    }

    return {
      store,
      openTransaction,
      stakingAccount,
      total,
      accountData,
      token,
      progress,
      formatStaked,
      formatTotalRefund,
      refundProgress,
      refundCountdown,
      ...mapActions({ refund: 'account/refund' }),
      transactionId: ref<string>(null),
      transactionError: null
    };
  },
  methods: {
    async sendTransaction(): Promise<void> {
      this.transactionError = '';
      const data = {
        owner: this.accountData.account.account_name,
        transfer: false
      };
      const authenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const users = await authenticators[0].login();
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.refund({
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
.q-pt-lg
  .container-refund.q-pa-sm
    .row.full-width
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-6 Staked CPU Withdraw
          .col-6.text-right.grey-3 {{accountData.account?.refund_request?.cpu_amount || '0'}}
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-7 {{refundCountdown()}}
          .col-5.text-right.grey-3 
            q-linear-progress( :value="refundProgress()" :buffer="buffer" color="grey-3" class="q-mt-sm")
    .row.full-width
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-6 Liquid Withdraw
          .col-6.text-right.grey-3 {{accountData.account?.refund_request?.cpu_amount || '0'}}
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-7 {{refundCountdown()}}
          .col-5.text-right.grey-3 
            q-linear-progress( :value="refundProgress()" :buffer="buffer" color="grey-3" class="q-mt-sm")
    ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
.container-refund
  border: 1px solid $grey-8
  border-radius: 13px
.grey-3
  color: $grey-3
</style>
