<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import axios from 'axios';
import { AccountDetails, Token } from 'src/types';
import { defineComponent, computed, ref } from 'vue';
import { useStore } from '../store';
import PercentCircle from 'src/components/PercentCircle.vue';
import { exchangeStatsUrl } from 'src/components/PriceChart.vue';
import SendDialog from 'src/components/SendDialog.vue';

export default defineComponent({
  name: 'AccountCard',
  components: {
    PercentCircle,
    SendDialog
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      creatingAccount: '',
      total: '',
      totalValue: '',
      refunding: '',
      staked: '',
      rex: '',
      ram: '',
      cpu: '',
      net: '',
      none: '',
      system_account: 'eosio',
      zero: '0.00',
      radius: 44,
      availableTokens: <Token[]>[]
    };
  },
  setup(props) {
    const store = useStore();
    return {
      openSendDialog: ref<boolean>(false),
      isAccount: computed((): boolean => {
        return store.state.account.accountName === props.account;
      }),
      token: computed((): Token => store.state.chain.token),
      setToken: (value: Token) => {
        store.commit('chain/setToken', value);
      }
    };
  },
  async mounted() {
    debugger;
    await this.loadSystemToken();
    this.none = `${this.zero} ${this.token.symbol}`;
    await this.loadAccountData();
    await this.loadPriceData();
  },
  methods: {
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        debugger;
        data = await this.$api.getAccount(this.account);
      } catch (e) {
        debugger;
        this.ram = this.cpu = this.net = this.zero;
        this.total = this.refunding = this.staked = this.rex = this.none;
        this.$q.notify(`account ${this.account} not found!`);
        return;
      }
      try {
        this.creatingAccount = (
          await this.$api.getCreator(this.account)
        ).creator;
      } catch (e) {
        this.$q.notify(`creator account for ${this.account} not found!`);
      }
      this.availableTokens = data.tokens;
      const account = data.account;
      this.total = this.getAmount(account.core_liquid_balance);
      this.refunding = this.getAmount(account.refund_request);
      this.staked = account.voter_info
        ? this.formatStaked(account.voter_info.staked)
        : this.none;
      this.rex = account.rex_info ? account.rex_info.vote_stake : this.none;
      if (this.account !== this.system_account) {
        this.ram = this.formatResourcePercent(
          account.ram_usage,
          account.ram_quota
        );
        this.cpu = this.formatResourcePercent(
          account.cpu_limit.used,
          account.cpu_limit.max
        );
        this.net = this.formatResourcePercent(
          account.net_limit.used,
          account.net_limit.max
        );
      }
    },
    async loadSystemToken(): Promise<void> {
      if (this.token.symbol === '') {
        const tokenList = await this.$api.getTokens(this.system_account);
        const token = tokenList.find(
          (token: Token) => token.contract === `${this.system_account}.token`
        );
        this.setToken(token);
      }
    },
    getAmount(property: undefined | string): string {
      return property ? property : `${this.none}`;
    },
    formatStaked(staked: number): string {
      const stakedValue = (staked / Math.pow(10, this.token.precision)).toFixed(
        2
      );
      return `${stakedValue} ${this.token.symbol}`;
    },
    formatResourcePercent(used: number, total: number): string {
      return ((used / total) * 100.0).toFixed(2);
    },
    async loadCreatorAccount(): Promise<void> {
      await this.$router.push({
        name: 'account',
        params: {
          account: this.creatingAccount
        }
      });
      this.$router.go(0);
    },
    async loadPriceData(): Promise<void> {
      debugger;
      const telosPrice: number = (await axios.get(exchangeStatsUrl)).data.telos
        .usd;
      const dollarAmount = telosPrice * parseFloat(this.total);
      this.totalValue = `$${dollarAmount.toFixed(2)} (@ $${telosPrice}/TLOS)`;
    }
  }
});
</script>

<template lang="pug">
.q-pa-md
  q-card.account-card
    q-card-section
      q-btn( @click="openSendDialog = true" color='primary' label='send' v-if='isAccount')
      .inline-section
        .text-title {{ account }}
        .text-subtitle(v-if="creatingAccount !== '__self__'") created by 
          a( @click='loadCreatorAccount') &nbsp;{{ creatingAccount }} 
        q-space
      .resources(v-if="account !== system_account")
        PercentCircle(:radius='radius' :percentage='parseFloat(cpu)' label='CPU')
        PercentCircle(:radius='radius' :percentage='parseFloat(net)' label='NET')
        PercentCircle(:radius='radius' :percentage='parseFloat(ram)' label='RAM')
    q-markup-table
      thead
        tr
          th.text-left BALANCE
        tbody.table-body
          tr
          tr
            td.text-left.total-label TOTAL 
            td.text-right.total-amount {{ total }} 
          tr.total-row
            td.text-left 
            td.text-right.total-value {{ totalValue }}
          tr
          tr
            td.text-left REFUNDING
            td.text-right {{ refunding }}
          tr
            td.text-left STAKED BY OTHERS
            td.text-right {{ staked }}
          tr
            td.text-left REX
            td.text-right {{ rex }}
    sendDialog(v-model="openSendDialog" :availableTokens="availableTokens")
</template>

<style lang="sass" scoped>
$medium:750px

.q-markup-table
  width: 100%
  th,td
    padding: unset

.account-card
  color: white
  font-size: 36px
  max-width: 100%
  background: unset

  .q-table tbody td
    font-size: 12px
    &.total-label, &.total-value
      color: white
      font-size: 14px
    &.total-amount
      font-size: 20px

  .q-table__card
    background: unset
    color: $black-5

  .q-table--horizontal-separator
    thead th
      border-bottom: 1px solid $black-13
    tbody tr:not(:last-child) td
      border-bottom: none

  .q-table thead tr, .q-table tbody td
    height: 36px

    &.total-row
      height: 48px

.table-body
  width: 100%
  display: table
  tr
    border-width: 0

.inline-section
  width:100%
  display: inline-block

.resources
  text-align: center
  width: 27rem
  margin: 1rem auto 0 auto

.resource
  margin-right: 2rem

.text-right
  font-weight: bold

.text-title, .text-subtitle
  display: flex
  align-items: center
  justify-content: center

.text-subtitle
  text-transform: uppercase
  color: $black-5
  font-size: 12px
  a
    cursor: pointer
    text-decoration: underline

.total-amount
  color: white
  font-size: 20px
  font-family: Silka
  font-weight: normal

.total-value
  font-family: Silka
  font-weight: normal

@media screen and (max-width: $medium) // screen < $medium
  .account-card
    width: 100%
    padding: unset
    margin-top: unset
    height: 100%
    border-radius: unset

  .q-markup-table
    overflow: unset
    width: unset
    margin-right: .5rem
    margin-left: .5rem

  .resources
    float: unset

  .inline-section
    width: 100%

.total-row
  a
    cursor: pointer
    text-decoration: underline
    color: white
    font-size: 16px
    font-family: Silka
    font-weight: normal
</style>
