<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Token } from 'src/types';
import { mapActions, mapGetters } from 'vuex';
import { isValidAccount } from 'src/utils/stringValidator';
import StakingInfo from 'src/components/Staking/StakingInfo.vue';
import StakingTab from 'src/components/Staking/StakeTab.vue';
import UnstakingTab from 'src/components/Staking/UnstakeTab.vue';
import RefundTab from 'src/components/Staking/RefundTab.vue';

export default defineComponent({
  name: 'StakingDialog',
  components: {
    StakingInfo,
    StakingTab,
    UnstakingTab,
    RefundTab
  },
  data() {
    return {
      sendToken: {
        symbol: 'TLOS',
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
      tab: ref('stake'),
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
      const authenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const users = await authenticators[0].login();
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.signTransaction({
            user: users[0],
            account: actionAccount,
            data
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
        symbol: 'TLOS',
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
    formatDec() {
      this.sendAmount = Number(this.sendAmount).toLocaleString('en-US', {
        style: 'decimal',
        maximumFractionDigits: this.sendToken.precision,
        minimumFractionDigits: this.sendToken.precision
      });
    }
  }
});
</script>

<template lang="pug">
q-dialog( @show='setDefaults' :persistent='true' @hide='resetForm')
  q-card.sendCard
    .row.justify-center.items-center.full-height.full-width
      .absolute-top-right
        q-btn(size="20px" flat dense round icon="clear" v-close-popup)
      .col-xs-12.col-sm-10.col-md-7.col-lg-7
        .row
          q-card-section 
            img.send-img.q-pr-md( src="~assets/send.svg")
            .text-h4.q-pb-md.inline-block.color-grey-3 Manage Staking
        .q-pa-sm
          stakingInfo
          .q-pt-lg
            q-tabs(
              v-model="tab" 
              dense class="text-grey"
              indicator-color="grey-3"
              active-color="grey-3"
              narrow-indicator
              align="left"
              :breakpoint="0"
              no-caps
              class="text-grey-5 tab-text")
              

              q-tab(name="stake" label="Stake") 
              q-tab(name="unstake" label="Unstake")
              q-tab(name="refund" label="Refund")

            q-separator(color="grey-8")

            q-tab-panels(v-model="tab" class="tab-panel")
              q-tab-panel(name="stake")
                stakingTab

              q-tab-panel(name="unstake")
                unstakingTab

              q-tab-panel(name="refund")
                refundTab

</template>

<style lang="sass" scoped>

.sendCard
  width: 1000px !important
  max-width: 80vw !important
  height: 800px !important
  max-height: 80vh !important
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
  color: $dark
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
