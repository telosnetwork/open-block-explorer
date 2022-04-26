<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { AccountDetails } from 'src/types';

export default defineComponent({
  name: 'LiquidTab',
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
      ...mapActions({ unstake: 'account/unstake' }),
      transactionId: ref<string>(null),
      transactionError: null,
      formatDec,
      netStake: assetToAmount(netStake.value),
      cpuStake: assetToAmount(cpuStake.value)
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
        unstake_cpu_quantity:
          String(parseFloat(this.cpuTokens).toFixed(4)) + String(' TLOS'),
        unstake_net_quantity:
          String(parseFloat(this.netTokens).toFixed(4)) + String(' TLOS'),
        transfer: false
      };
      const authenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const users = await authenticators[0].login();
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.unstake({
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
    .row.q-col-gutter-md
      .col-xs-12.col-sm-12.col-md-6
        .row
          .row.q-pb-sm.full-width
            .col-9 LIQUID TLOS TO LEND
            .col-3.grey-3.text-right 33
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="cpuTokens" :lazy-rules='true' :rules="[ val => val <= cpuStake && val >= 0  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Lend" flat @click="sendTransaction" )
      .col-xs-12.col-sm-12.col-md-6
        .row
          .row.q-pb-sm.full-width
            .col-9 LIQUID TLOS TO WITHDRAW
            .col-3.grey-3.text-right 33
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="netTokens" :lazy-rules='true' :rules="[ val => val <= netStake && val >= 0  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(label="Withdraw" flat @click="sendTransaction" )

</template>

<style scoped lang="sass">
.button-accent
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  color: $grey-4
.grey-3
  color: $grey-3
</style>
