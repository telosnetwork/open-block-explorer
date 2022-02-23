<template lang="pug">
div.row.col-12
    div.row.col-12.gradient-box
      AccountCard.account-card
    TransactionsTable(:account='account')
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import AccountCard from 'components/AccountCard.vue';

export default defineComponent({
  name: 'Account',
  data() {
    return {
      account: this.$route.params.account
    };
  },
  components: {
    TransactionsTable,
    AccountCard
  }
});
</script>
<style lang="sass">
.gradient-box
    min-height: 632px
    width: 100%
    background: linear-gradient(180deg, #071A5F 0%, #571AFF 175.31%)
.price-box-position
    margin-top: -100px
.account-card
  margin-top: 15rem
  margin-left: auto
  margin-right: auto
  margin-bottom: 2rem
</style>
