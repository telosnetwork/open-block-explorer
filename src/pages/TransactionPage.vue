<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import TransactionsTable from 'src/components/TransactionsTable.vue';
import TransactionCard from 'components/transaction/TransactionCard.vue';
import TraceTree from 'components/transaction/TraceTree.vue';
import JsonViewer from 'vue-json-viewer';
import { useStore } from 'src/store';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: 'TransactionPage',
    setup() {
        const store = useStore();
        const route = useRoute();
        const router = useRouter();
        const tab = ref<string>((route.query['tab'] as string) || 'actions');
        onMounted(() => {
            store.commit('transaction/setTransactionId', route.params.transaction);
            void store.dispatch('transaction/updateTransaction');
        });
        watch([tab], () => {
            void router.push({
                path: router.currentRoute.value.path,
                query: {
                    tab: tab.value,
                },
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        JsonViewer,
        TraceTree,
    },
});
</script>

<template>

<div class="row">
    <div class="col-12 header-support">
        <TransactionCard v-if="found" class="q-pa-lg" />
        <div v-else class="q-pa-lg">
            <div class="row full-width justify-center">
                <div class="col-xs-12 col-md-8 col-lg-6">
                    <q-card class="info-card" flat>
                        <div class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs q-pa-xl-lg">
                            <q-card-section class="q-pl-md">
                                <div class="text-h4 text-bold">Transaction not found.</div>
                            </q-card-section>
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
        <div class="q-pt-lg">
            <q-tabs
                v-model="tab"
                class="text-grey text-grey-5 tab-text"
                dense
                indicator-color="grey-3"
                active-color="grey-3"
                align="center"
                no-caps
            >
                <div class="row full-height items-center">
                    <div class="col-10">
                        <q-tab name="actions">
                            <div class="text-body">Actions
                                <div class="q-pl-xs inline-block">
                                    <div class="bg-blur">
                                        <q-badge color="transparent">{{actionCount}}</q-badge>
                                    </div>
                                </div>
                            </div>
                        </q-tab>
                    </div>
                </div>
                <div class="row full-height items-center">
                    <div class="col-10">
                        <q-tab name="traces">
                            <div class="text-body">Traces
                                <div class="q-pl-xs inline-block">
                                    <div class="bg-blur">
                                        <q-badge color="transparent">{{actionCount}}</q-badge>
                                    </div>
                                </div>
                            </div>
                        </q-tab>
                    </div>
                </div>
                <q-tab name="raw" label="Raw"/>
            </q-tabs>
            <q-separator color="grey-8"/>
            <q-tab-panels v-model="tab" class="tab-panel">
                <q-tab-panel name="actions">
                    <TransactionsTable :account="Array.isArray(transaction) ? transaction[0] : transaction" :toggleEnabled="false" />
                </q-tab-panel>
                <q-tab-panel name="traces" class="container-max-width">
                    <TraceTree/>
                </q-tab-panel>
                <q-tab-panel name="raw" class="container-max-width">
                    <JsonViewer
                        :value="jsonTransaction"
                        :expand-depth="5"
                        preview-mode="preview-mode"
                        boxed="boxed"
                        copyable="copyable"
                        sort="sort"
                    />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </div>
</div>

</template>

<style scoped lang="sass">
.bg-blur
  background: rgba(255,255,255,0.2)
  backdrop-filter: blur(5px)
  border-radius: 5px
.full-vw
  width: 100vw
</style>
