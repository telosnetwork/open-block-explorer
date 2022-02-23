<template lang="pug">
.q-pa-md
  q-card.account-card
    q-card-section
      .inline-section
        .text-h6 {{ account }}
        .text-subtitle2 created by 
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

import { defineComponent } from 'vue';

const HUNDRED = 100.0;
const NONE = '0 TLOS';
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
  methods: {
    async loadAccountData(): Promise<void> {
      const data = await this.$api.getAccount(this.account);
      this.total = data.core_liquid_balance;
      this.refunding = data.refund_request ? data.refund_request : NONE;
      this.staked = data.voter_info.staked.toFixed(2)
        ? data.voter_info.staked
        : NONE;
      this.rex = data.rex_info ? data.rex_info.vote_stake : NONE;
      this.ram = (
        (data.ram_usage / data.total_resources.ram_bytes) *
        HUNDRED
      ).toFixed(4);
      this.cpu = ((data.cpu_limit.used / data.cpu_limit.max) * HUNDRED).toFixed(
        4
      );
      this.net = ((data.net_limit.used / data.net_limit.max) * HUNDRED).toFixed(
        4
      );
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
