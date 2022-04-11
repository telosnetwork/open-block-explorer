<script lang="ts">
import { defineComponent } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import TransactionCard from 'components/TransactionCard.vue';

export default defineComponent({
  name: 'Transaction',
  data() {
    return {
      transaction: <string>this.$route.params.transaction
    };
  },
  components: {
    TransactionsTable,
    TransactionCard
  }
});
</script>

<template lang="pug">
div.row.col-12
    div.row.col-12.gradient-box
      TransactionCard.q-pa-lg(:transactionId='transaction')
    TransactionsTable(:account='transaction')
</template>
