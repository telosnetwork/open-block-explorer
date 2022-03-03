<template lang="pug">
.q-pa-md
  q-card.account-card
    q-card-section
      .inline-section
        .text-h6 {{ decodedAccount }}
        .text-subtitle(v-if="creatingAccount !== '__self__'") created by 
          a.creator-link( @click='loadCreatorAccount') {{ creatingAccount }} 
        q-space
      .resources.inline-section(v-if="account !== system_account")
        .resource.inline-section CPU {{ cpu }}% used
        .resource.inline-section NET {{ net }}% used
        .resource.inline-section RAM {{ ram }}% used
    q-markup-table
      thead
        tr
          th.text-left BALANCE
        tbody.table-body
          tr
            td.text-left AVAILABLE   
            td.text-right.total {{ total }}
          tr
            td.text-left REFUNDING
            td.text-right {{ refunding }} 
          tr
            td.text-left TOTAL STAKED
            td.text-right {{ staked }}
          tr
            td.text-left REX
            td.text-right {{ rex }}
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { AccountDetails, Token } from 'src/types';
import { defineComponent } from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import { decodeAccount } from 'src/utils/encodeAccount';

export default defineComponent({
  name: 'AccountCard',
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
      refunding: '',
      staked: '',
      rex: '',
      ram: '',
      cpu: '',
      net: '',
      none: '',
      system_account: 'eosio',
      zero: '0.00'
    };
  },
  async mounted() {
    await this.loadSystemToken();
    this.none = `${this.zero} ${(this.token as Token).symbol}`;
    await this.loadAccountData();
  },
  computed: {
    ...mapGetters({ token: 'chain/getToken' }),
    decodedAccount(): string {
      return decodeAccount(this.account);
    }
  },
  methods: {
    ...mapMutations({ setToken: 'chain/setToken' }),
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        data = await this.$api.getAccount(this.account);
      } catch (e) {
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
          account.total_resources.ram_bytes
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
      return (staked / Math.pow(10, this.token.precision)).toFixed(2);
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
    }
  }
});
</script>
<style lang="sass" scoped>
$medium:750px
.q-markup-table
  width: 100%
.account-card
  max-width: 100%
  background: unset
  color: white
  .q-table__card
    background: unset
    color: white
  .q-table--horizontal-separator thead th
    border-bottom-width: 0
.table-body
  width: 100%
  display: table
  tr
    border-bottom-width: 0
.inline-section
  display: inline-block
.resources
  float: right
  margin-top: 2.5rem
.resource
  margin-right: 2rem
.total
  font-size: 20px
.text-right
  font-weight: bold
.text-subtitle
  font-size: 12px
  a
    cursor: pointer
    text-decoration: none
    &:hover
      text-decoration: underline

@media screen and (max-width: $medium) // screen < $medium
  .account-card
    width: 100%
    padding: unset
    margin-top: unset
    height: 100%
    border-radius: unset
  .q-markup-table
    overflow: unset
  .resources
    float: unset
  .inline-section
    width: 100%
</style>
