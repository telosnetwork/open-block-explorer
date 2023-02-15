<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { Token } from 'src/types';
import { mapActions, mapGetters } from 'vuex';
import { isValidAccount } from 'src/utils/stringValidator';
import StakingInfo from './StakingInfo.vue';
import StakeFromResources from './StakeFromResources.vue';
import ProcessingTab from './ProcessingTab.vue';
import StakingTab from './StakingTab.vue';
import UnstakingTab from './UnstakingTab.vue';
import HistoryTab from './HistoryTab.vue';
import SavingsTab from './SavingsTab.vue';
import { getChain } from 'src/config/ConfigManager';
import { useStore } from 'src/store';
import { API } from '@greymass/eosio';

const symbol = getChain().getSystemToken().symbol;

export default defineComponent({
  name: 'StakingDialog',
  components: {
    StakingInfo,
    StakeFromResources,
    ProcessingTab,
    StakingTab,
    UnstakingTab,
    HistoryTab,
    SavingsTab,
  },
  data() {
    return {
      sendToken: {
        symbol,
        precision: 4,
        amount: 0,
        contract: 'eosio.token',
      } as Token,
      sendDialog: false,
      apy: '--',
    };
  },
  props: {
    availableTokens: {
      type: Array as PropType<Token[]>,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const rexfund = computed(() => store.state.account.rexfund || 0);
    const symbol = computed(() => store.state.chain.token.symbol);
    const transactionId = ref<string>(null);
    const transactionError = ref<string>(null);

    const withdrawRexFund = async () => {
      await store.dispatch('account/unstakeRexFund', { amount: rexfund.value });
      void store.dispatch('account/updateRexData', {
        account: store.state.account.accountName,
      });
    };
    return {
      openCoinDialog: ref<boolean>(false),
      recievingAccount: ref<string>(''),
      sendAmount: ref<string>('0.0000'),
      memo: ref<string>(''),
      tab: ref('stake'),
      rexfund,
      symbol,
      transactionError,
      transactionId,
      withdrawRexFund,
      ...mapActions({ signTransaction: 'account/sendTransaction' }),
    };
  },
  computed: {
    ...mapGetters({ account: 'account/accountName' }),
    transactionForm(): boolean {
      return !(this.transactionError || this.transactionId);
    },
  },
  methods: {
    isValidAccount,
    async sendTransaction(): Promise<void> {
      const actionAccount = this.sendToken.contract;
      const data = {
        from: this.account as string,
        to: this.recievingAccount,
        quantity: `${this.sendAmount} ${this.sendToken.symbol}`,
        memo: this.memo,
      };
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.signTransaction({
            account: actionAccount,
            data,
            name: 'transfer',
          })
        ).transactionId as string;
      } catch (e) {
        this.transactionError = e as string;
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
    async navToTransaction() {
      await this.$router.push({
        name: 'transaction',
        params: { transaction: this.transactionId },
      });
      this.$router.go(0);
    },
    async loadAccountData(): Promise<void> {
      let data: API.v1.AccountObject;
      try {
        data = await this.$api.getAccount(this.account);
        this.$store.commit('account/setAccountData', data);
      } catch (e) {
        return;
      }
    },
  },
  async mounted() {
    try {
      const apyValue = await this.$api.getApy();
      this.apy = `${apyValue}%`;
    } catch (e) {
      console.error(e);
    }
    await this.loadAccountData();
  },
});
</script>

<template lang="pug">
q-dialog( @show='setDefaults' :persistent='true' maximized)
  q-card.rexCard
    .row.justify-center.q-pt-xl.full-height.full-width
      .absolute-top-right
        q-btn(size="20px" flat dense round icon="clear" v-close-popup)
      .col-xs-12.col-sm-10.col-md-7.col-lg-7.maxSize
        .row.q-pl-sm
          .text-h4.q-pb-md.inline-block.color-grey-3.inline Staking (REX)
          .text-h5.q-pb-md.inline-block.color-grey-3.inline.float-right APY: {{ apy }}
        .q-pa-sm
          StakingInfo
          .q-pt-lg.q-pl-lg(v-if='rexfund > 0')
            .row.q-col-gutter-md.items-center
              .col-auto.text-h6.text-white REX fund: {{rexfund.toFixed(4)}} {{symbol}}
              .col-auto
                q-btn.full-width.button-accent(label='Withdraw' flat @click="withdrawRexFund" )
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

              q-tab(name="stake" label="Stake")
              q-tab(name="unstake" label="Unstake")
              q-tab(name="stakecpunet" label="Stake from CPU/NET")
              q-tab(name="savings" label="Savings")
              q-tab(name="maturing" label="Maturing")
              q-tab(name="history" label="History")

            q-separator(color="grey-8")

            q-tab-panels(v-model="tab" class="tab-panel")
              q-tab-panel(name="stake")
                StakingTab
              q-tab-panel(name="unstake")
                UnstakingTab
              q-tab-panel(name="stakecpunet")
                StakeFromResources
              q-tab-panel(name="savings")
                SavingsTab
              q-tab-panel(name="maturing")
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

.float-right
  margin-left: auto
  margin-top: auto
  padding-right: 8px
</style>
