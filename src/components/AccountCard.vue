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
      MICRO_UNIT: Math.pow(10, -6),
      KILO_UNIT: Math.pow(10, 3),
      cpu_used: 0,
      cpu_max: 0,
      net_used: 0,
      net_max: 0,
      ram_used: 0,
      ram_max: 0,
      creatingAccount: '',
      liquid: '',
      total: '',
      totalValue: '',
      refunding: '',
      staked: '',
      rex: '',
      none: '',
      system_account: 'eosio',
      zero: 0.0,
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
    await this.loadSystemToken();
    this.none = `${this.zero.toFixed(this.token.precision)} ${
      this.token.symbol
    }`;
    await this.loadAccountData();
    await this.loadPriceData();
  },
  methods: {
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        data = await this.$api.getAccount(this.account);
      } catch (e) {
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
      this.ram_used = account.ram_usage / this.KILO_UNIT;
      this.ram_max = account.ram_quota / this.KILO_UNIT;
      this.cpu_used = parseFloat(
        (account.cpu_limit.used * this.MICRO_UNIT).toFixed(6)
      );
      this.cpu_max = parseFloat(
        (account.cpu_limit.max * this.MICRO_UNIT).toFixed(6)
      );
      this.net_used = account.net_limit.used / this.KILO_UNIT;
      this.net_max = account.net_limit.max / this.KILO_UNIT;
      this.liquid = this.getAmount(account.core_liquid_balance);
      if (account.rex_info) {
        const liqNum = account.core_liquid_balance.split(' ')[0];
        const rexNum = account.rex_info.vote_stake.split(' ')[0];
        const totalString = (parseFloat(liqNum) + parseFloat(rexNum)).toFixed(
          this.token.precision
        );
        this.total = `${totalString} ${this.token.symbol}`;
        this.rex = account.rex_info.vote_stake;
      } else {
        this.total = this.liquid;
        this.rex = this.none;
      }
      this.refunding = this.getAmount(account.refund_request);
      this.staked = account.voter_info
        ? this.formatStaked(account.voter_info.staked)
        : this.none;
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
        this.token.precision
      );
      return `${stakedValue} ${this.token.symbol}`;
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
        PercentCircle(:radius='radius' :fraction='cpu_used' :total='cpu_max' label='CPU' unit='s')
        PercentCircle(:radius='radius' :fraction='net_used' :total='net_max' label='NET' unit='kb')
        PercentCircle(:radius='radius' :fraction='ram_used' :total='ram_max' label='RAM' unit='kb')
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
            td.text-left LIQUID
            td.text-right {{ liquid }}
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
  width: 100%
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
