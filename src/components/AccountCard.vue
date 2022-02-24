<template lang="pug">
.q-pa-md
  q-card.account-card
    q-card-section
      .inline-section
        .text-h6 {{ account }}
        .text-subtitle created by 
          router-link( :to="{ path: 'account', params: { account: creatingAccount}}") {{ creatingAccount }}
      .resources.inline-section
        .resource.inline-section CPU {{ cpu }}% used
        .resource.inline-section NET {{ net }}% used
        .resource.inline-section RAM {{ ram }}% used
    q-markup-table
      thead
        tr
          th.text-left BALANCE
        tbody.table-body
          tr
            td.text-left TOTAL   
            td.text-right.total {{ total }}
          tr
            td.text-left REFUNDING
            td.text-right {{ refunding }} 
          tr
            td.text-left STAKED BY OTHERS
            td.text-right {{ staked }}
          tr
            td.text-left REX
            td.text-right {{ rex }}
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Token } from 'src/types';
import { defineComponent } from 'vue';
import { mapGetters, mapMutations } from 'vuex';

const HUNDRED = 100.0;
const NONE = '0 TLOS';
const SYSTEM_TOKEN = 'eosio.token';
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
      net: ''
    };
  },
  async mounted() {
    await this.loadAccountData();
    this.creatingAccount = (await this.$api.getCreator(this.account)).creator;
  },
  computed: {
    ...mapGetters({ token: 'chain/getToken' })
  },
  methods: {
    ...mapMutations({ setToken: 'chain/setToken' }),
    async loadAccountData(): Promise<void> {
      try {
        const data = await this.$api.getAccount(this.account);
        const account = data.account;
        this.total = account.core_liquid_balance;
        this.refunding = account.refund_request ? account.refund_request : NONE;
        if (this.token.symbol === '') {
          const tokenList = await this.$api.getTokens(SYSTEM_TOKEN);
          const token = tokenList.find(
            (token: Token) => token.contract === SYSTEM_TOKEN
          );
          this.setToken(token);
        }
        this.staked = account.voter_info
          ? (
              account.voter_info.staked / Math.pow(10, this.token.precision)
            ).toFixed(2)
          : NONE;
        this.rex = account.rex_info ? account.rex_info.vote_stake : NONE;
        this.ram = (
          (account.ram_usage / account.total_resources.ram_bytes) *
          HUNDRED
        ).toFixed(2);
        this.cpu = (
          (account.cpu_limit.used / account.cpu_limit.max) *
          HUNDRED
        ).toFixed(2);
        this.net = (
          (account.net_limit.used / account.net_limit.max) *
          HUNDRED
        ).toFixed(2);
      } catch (e) {
        console.log(e);
      }
    }
  }
});
</script>
<style lang="sass" scoped>
$medium:750px

.account-card
  max-width: 100%
.table-body
  width: 100%
  display: table
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
