<template lang="pug">
.q-pa-md
  q-card.account-card
    q-card-section
      .text-h6 {{ account }}
      .text-subtitle2 created by 
        router-link( :to="{ path: 'account', params: { account: creatingAccount}}") 
          {{ creatingAccount }}
    q-markup-table
      thead
        tr
          th.text-left BALANCE
        tbody
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
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AccountCard',
  data() {
    return {
      account: 'john',
      creatingAccount: 'bob',
      total: 9999,
      refunding: 3333,
      staked: 2222,
      rex: 4444
    };
  }
});
</script>
<style lang="sass" scoped>
.account-card
  width: 100%
  max-width: 500px
</style>
