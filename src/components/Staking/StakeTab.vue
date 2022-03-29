<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';

export default defineComponent({
  name: 'SendDialog',
  setup() {
    const store = useStore();
    const openCoinDialog = ref<boolean>(false);
    const stakingAccount = computed(
      (): string => store.state.account.accountName
    );
    const cpuTokens = ref<string>('0.0000');
    const netTokens = ref<string>('0.0000');

    return {
      openCoinDialog,
      stakingAccount,
      cpuTokens,
      netTokens,
      ...mapActions({ stake: 'account/stake' }),
      transactionId: ref<string>(null),
      transactionError: null
    };
  },
  methods: {
    async sendTransaction(): Promise<void> {
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
          await this.stake({
            user: users[0],
            data
          })
        ).transactionId as string;
      } catch (e) {
        this.transactionError = e;
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
        .row.justify-between.q-px-sm.q-pb-sm.q-gutter-x-sm STAKING ACCOUNT
          q-space
          .color-grey-3 Defaults to selected account
        q-input.full-width(standout dense dark v-model="stakingAccount" :lazy-rules='true' :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]" )
    .row.q-py-md
      .col-6
        .row.justify-between.q-pb-sm.q-gutter-x-sm TOKENS TO STAKE TO CPU
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="cpuTokens" :lazy-rules='true' :rules="[ val => val <= 20 || 'Invalid amount.' ]" type="text" dense dark)

      .col-6.q-pl-md
        .row.justify-between.q-pb-sm.q-gutter-x-sm TOKENS TO STAKE TO NET
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="netTokens" :lazy-rules='true' :rules="[ val => val <= 20|| 'Invalid amount.' ]" type="text" dense dark)
    .row
      .col-12.q-pt-md
        q-btn.full-width.button-accent(label="Confirm" flat @click="sendTransaction" )

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
</style>
