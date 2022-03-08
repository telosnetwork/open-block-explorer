<template lang="pug">
div.row.col-12
    div.row.col-12.gradient-box
      AccountCard.account-card(:account='account')
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
.account-card
  width: 648px
  border-radius: .5rem
  margin-top: 1rem
  margin-left: auto
  margin-right: auto
  margin-bottom: 2rem
  box-shadow: none
</style>
