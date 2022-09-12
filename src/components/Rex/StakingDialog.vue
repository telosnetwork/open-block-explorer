<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Token, AccountDetails } from 'src/types';
import { mapActions, mapGetters } from 'vuex';
import { isValidAccount } from 'src/utils/stringValidator';
import StakingInfo from './StakingInfo.vue';
import StakedTab from './StakedTab.vue';
import ProcessingTab from './ProcessingTab.vue';
import LiquidTab from './LiquidTab.vue';
import HistoryTab from './HistoryTab.vue';
import SavingsTab from './SavingsTab.vue';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();
const symbol = chain.getSymbol();

export default defineComponent({
  name: 'StakingDialog',
  components: {
    StakingInfo,
    StakedTab,
    ProcessingTab,
    LiquidTab,
    HistoryTab,
    SavingsTab
  },
  data() {
    return {
      sendToken: {
        symbol,
        precision: 4,
        amount: 0,
        contract: 'eosio.token'
      } as Token,
      transactionId: null,
      transactionError: null,
      sendDialog: false
    };
  },
  props: {
    availableTokens: {
      type: Array as PropType<Token[]>,
      required: true
    }
  },
  setup() {
    return {
      openCoinDialog: ref<boolean>(false),
      recievingAccount: ref<string>(''),
      sendAmount: ref<string>('0.0000'),
      memo: ref<string>(''),
      tab: ref('liquid'),
      ...mapActions({ signTransaction: 'account/sendTransaction' })
    };
  },
  computed: {
    ...mapGetters({ account: 'account/accountName' }),
    transactionForm(): boolean {
      return !(this.transactionError || this.transactionId);
    }
  },
  methods: {
    isValidAccount,
    async sendTransaction(): Promise<void> {
      const actionAccount = this.sendToken.contract;
      const data = {
        from: this.account as string,
        to: this.recievingAccount,
        quantity: `${this.sendAmount} ${this.sendToken.symbol}`,
        memo: this.memo
      };
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.signTransaction({
            account: actionAccount,
            data,
            name: 'transfer'
          })
        ).transactionId as string;
      } catch (e) {
        this.transactionError = e;
      }
    },
    setDefaults() {
      if (this.availableTokens.length > 0) {
        this.sendToken = this.availableTokens.find((token) => {
          return token.symbol === this.sendToken.symbol;
        });
      }
    },
    updateSelectedCoin(token: Token): void {
      this.sendToken = token;
    },
    resetForm() {
      this.transactionId = null;
      this.transactionError = null;
      this.sendToken = {
        symbol,
        precision: 4,
        amount: 0,
        contract: 'eosio.token'
      };
    },
    async navToTransaction() {
      await this.$router.push({
        name: 'transaction',
        params: { transaction: this.transactionId as string }
      });
      this.$router.go(0);
    },
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        data = await this.$api.getAccount(this.account);
        this.$store.commit('account/setAccountData', data);
      } catch (e) {
        return;
      }
    }
  },
  async mounted() {
    await this.loadAccountData();
  }
});
</script>

<template lang="pug">
q-dialog( @show='setDefaults' :persistent='true' @hide='resetForm' maximized)
  q-card.rexCard
    .row.justify-center.items-center.full-height.full-width
      .absolute-top-right
        q-btn(size="20px" flat dense round icon="clear" v-close-popup)
      .col-xs-12.col-sm-10.col-md-7.col-lg-7.maxSize
        .row.q-pl-sm
          .text-h4.q-pb-md.inline-block.color-grey-3.inline Staking (REX)
        .q-pa-sm
          StakingInfo
          .q-pt-lg.text-grey-3.text-weight-light
            q-tabs.text-grey-5.tab-text(
              v-model="tab"
              dense class="text-grey"
              indicator-color="grey-3"
              active-color="grey-3"
              narrow-indicator
              align="left"
              :breakpoint="0"
              no-caps)

              q-tab(name="liquid" label="Lend")
              q-tab(name="staked" label="Lend CPU/NET")
              q-tab(name="savings" label="Savings")
              q-tab(name="staking" label="Staking")
              q-tab(name="history" label="History")

            q-separator(color="grey-8")

            q-tab-panels(v-model="tab" class="tab-panel")
              q-tab-panel(name="liquid")
                LiquidTab
              q-tab-panel(name="staked")
                StakedTab
              q-tab-panel(name="savings")
                SavingsTab
              q-tab-panel(name="staking")
                ProcessingTab
              q-tab-panel(name="history")
                HistoryTab

</template>

<style lang="sass" scoped>

.rexCard
  color: $grey-6
  background: radial-gradient(circle at 48% 100%, rgba(108, 35, 255, 1) 0%, rgba(84, 0, 253, 1) 20%, rgba(2, 27, 100, 1) 92%)
  .send-icon
    padding-bottom: 30px
  .button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
  .color-grey-3
    color: $grey-3

.sarrowButton
  background: rgba($grey-9, 0.1)

.selector-container
  cursor: pointer
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  height: 40px
  margin-top: 1px
  color: var(--q-dark)
  &:hover
    background: rgba($grey-4, 0.3)
    border-color: $grey-1
    border-radius: 4px
  .arrowButton
    color: $grey-4

  .text-h6
    color: $grey-4
    font-weight: 600
    font-size: 1.1rem
  .subtitle
    color: $grey-4
.send-img
  height: 35px !important

.tab-panel
  background: inherit !important

.tab-text
  font-size: 30px !important

.q-tab-panel
  padding-left: 0 !important
  padding-right: 0 !important
</style>
