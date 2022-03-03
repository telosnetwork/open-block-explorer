<template lang="pug">
div.row.col-12
    div.row.col-12.gradient-box
      AccountCard.account-card(:account='id' v-if='isAccountPage')
    TransactionsTable(:account='id')
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import AccountCard from 'components/AccountCard.vue';

export default defineComponent({
  name: 'Account',
  data() {
    return {
      id: this.$route.query.id
    };
  },
  components: {
    TransactionsTable,
    AccountCard
  },
  computed: {
    isAccountPage(): boolean {
      debugger;
      return this.$route.path === '/account';
    }
  }
});
</script>
<style lang="sass">
.account-card
  width: 35rem
  border-radius: .5rem
  margin-top: 1rem
  margin-left: auto
  margin-right: auto
  margin-bottom: 2rem
</style>
