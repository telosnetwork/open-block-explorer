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
            td.text-right {{ total }}
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

import { defineComponent } from 'vue';

const HUNDRED = 100.0;
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
  },
  methods: {
    async loadAccountData(): Promise<void> {
      const data = await this.$api.getAccount(this.account);
      this.total = data.account.core_liquid_balance;
      this.refunding = data.account.refund_request
        ? data.account.refund_request
        : '0 TLOS';
      this.staked = data.account.voter_info.staked
        ? data.account.voter_info.staked
        : '0 TLOS';
      this.rex = data.account.rex_info ? data.account.rex_info : '0 TLOS';
      this.ram = (
        (data.account.ram_usage / data.account.total_resources.ram_bytes) *
        HUNDRED
      ).toFixed(2);
      this.cpu = (
        (data.account.cpu_limit.used / data.account.cpu_limit.max) *
        HUNDRED
      ).toFixed(2);
      this.net = (
        (data.account.net_limit.used / data.account.net_limit.max) *
        HUNDRED
      ).toFixed(2);
    }
  }
});
</script>
<style lang="sass" scoped>
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
  margin-right: 3rem
.resource
  margin-right: 2rem
</style>
