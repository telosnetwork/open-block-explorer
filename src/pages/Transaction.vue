<script lang="ts">
import { defineComponent, ref } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import TransactionCard from 'components/TransactionCard.vue';

export default defineComponent({
  name: 'Transaction',
  data() {
    return {
      transaction: <string>this.$route.params.transaction
    };
  },
  setup() {
    return {
      tab: ref('actions')
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
    .q-pt-lg
      q-tabs(
        v-model="tab" 
        dense class="text-grey"
        indicator-color="grey-3"
        active-color="grey-3"
        narrow-indicator
        no-caps
        class="text-grey-5 tab-text")
        
        .row.full-height.items-center
          .col-10
            q-tab(name="actions" label="Actions")
          .col-2
            q-badge(color="red" ) 2
        q-tab(name="traces" label="Traces")
        q-tab(name="raw" label="Raw")

      q-separator(color="grey-8")

      q-tab-panels(v-model="tab" class="tab-panel")
        q-tab-panel(name="actions")
          TransactionsTable(:account='transaction')

        q-tab-panel(name="traces")
          TransactionsTable(:account='transaction')

        q-tab-panel(name="raw")
          TransactionsTable(:account='transaction')
</template>
