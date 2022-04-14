<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, onMounted, computed } from 'vue';
import TransactionsTable from 'src/components/TransactionsTable.vue';
import TransactionCard from 'components/Transaction/TransactionCard.vue';
import JsonViewer from 'vue-json-viewer';
import { ActionData } from 'src/types';
import { useStore } from 'src/store';
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'Transaction',
  setup() {
    const store = useStore()
    const route = useRoute()
    onMounted(() => {
      store.commit('transaction/setTransactionId', route.params.transaction);
      store.dispatch('transaction/updateTransaction');
    })
    return {
      tab: ref('actions'),
      transaction: route.params.transaction,
      actionCount: computed(() => store.state.transaction.actionCount),
      jsonTransaction: computed(() => store.state.transaction),
      transactionData: ref<ActionData>(<ActionData>{}),
      updateTransaction: () => store.dispatch('transaction/updateTransactionId',)
    };
  },
  components: {
    TransactionsTable,
    TransactionCard,
    JsonViewer
  }
});
</script>

<template lang="pug">
div.row
  .col-12.gradient-box
    TransactionCard.q-pa-lg
    .q-pt-lg
      q-tabs(
        v-model="tab" 
        dense class="text-grey"
        indicator-color="grey-3"
        active-color="grey-3"
        align="center"
        no-caps
        class="text-grey-5 tab-text")
        
        .row.full-height.items-center
          .col-10
            q-tab(name="actions")
              .text-body Actions
                .q-pl-xs(style="display: inline-block")
                  .bg-blur
                    q-badge(color="transparent") {{actionCount}}
        q-tab(name="traces" label="Traces")
        q-tab(name="raw" label="Raw")

      q-separator(color="grey-8")

      q-tab-panels(v-model="tab" class="tab-panel")
        q-tab-panel(name="actions")
          TransactionsTable(:account='transaction')

        q-tab-panel(name="traces")
          TransactionsTable(:account='transaction')

        q-tab-panel(name="raw")
          json-viewer(
            :value="jsonTransaction"
            :expand-depth=5
            expanded
            copyable
            sort)
</template>

<style scoped lang="sass">
.bg-blur
  background: rgba(255,255,255,0.2)
  backdrop-filter: blur(5px)
  border-radius: 5px
.full-vw
  width: 100vw
</style>
