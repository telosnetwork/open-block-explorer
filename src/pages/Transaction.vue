<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import TransactionsTable from 'src/components/TransactionsTable.vue';
import TransactionCard from 'components/Transaction/TransactionCard.vue';
import TraceTree from 'components/Transaction/TraceTree.vue';
import JsonViewer from 'vue-json-viewer';
import { useStore } from 'src/store';
import { useRoute, useRouter } from 'vue-router';

/* eslint-disable */
export default defineComponent({
  name: 'Transaction',
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const tab = ref<string>((route.query['tab'] as string) || 'actions');
    onMounted(() => {
      store.commit('transaction/setTransactionId', route.params.transaction);
      store.dispatch('transaction/updateTransaction');
    });
    watch([tab], () => {
      void router.push({
        path: router.currentRoute.value.path,
        query: {
          tab: tab.value
        }
      });
    });
    return {
      tab,
      transaction: route.params.transaction,
      actionCount: computed(() => store.state.transaction.actionCount),
      jsonTransaction: computed(() => store.state.transaction.transaction),
      found: computed(() => store.state.transaction.transactionFound),
    };
  },
  components: {
    TransactionsTable,
    TransactionCard,
    JsonViewer,
    TraceTree
  }
});
</script>

<template lang="pug">
div.row
  .col-12.gradient-box
    TransactionCard.q-pa-lg(v-if='found')
    .q-pa-lg(v-else)
      .row.full-width.justify-center
        .col-xs-12.col-md-8.col-lg-6
          q-card(flat class="transaction-card")
            .q-pa-md-md.q-pa-sm-sm.q-pa-xs-xs.q-pa-xl-lg
              q-card-section.q-pl-md
                div(class="text-h4 text-bold") Transaction not found.
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
        .row.full-height.items-center
          .col-10
            q-tab(name="traces")
              .text-body Traces
                .q-pl-xs(style="display: inline-block")
                  .bg-blur
                    q-badge(color="transparent") {{actionCount}}
        q-tab(name="raw" label="Raw")

      q-separator(color="grey-8")

      q-tab-panels(v-model="tab" class="tab-panel")
        q-tab-panel(name="actions")
          TransactionsTable(:account='transaction')

        q-tab-panel(name="traces")
          TraceTree

        q-tab-panel(name="raw")
          json-viewer(
            :value="jsonTransaction"
            :expand-depth=5
            preview-mode
            boxed
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
