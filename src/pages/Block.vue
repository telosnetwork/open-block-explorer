<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import TransactionsTable from 'src/components/TransactionsTable.vue';
import BlockCard from 'components/BlockCard.vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'src/api';
import { Action, API, Transaction } from '@wharfkit/session';

export default defineComponent({
    name: 'BlockPage',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const found = ref(true);
        const block = ref<API.v1.GetBlockResponse>(null);
        const actions = ref<Action[]>([]);
        const tab = ref<string>((route.query['tab'] as string) || 'actions');
        onMounted(async () => {
            // api get block and set block
            block.value = await api.getBlock(route.params.block as string);
            block.value.transactions.forEach((transactionReceipt) => {
                const transaction = transactionReceipt.trx.transaction as Transaction;
                actions.value = transaction.actions;
            });
            found.value = !!block.value;
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
            found,
            actions,
            block,
        };
    },
    components: {
        TransactionsTable,
        BlockCard,
    },
});
</script>

<template>

<div class="row">
    <div class="col-12 header-support q-pb-lg">
        <BlockCard v-if="found" class="q-pa-lg" :block="block as API.v1.GetBlockResponse"/>
        <div v-else class="q-pa-lg">
            <div class="row full-width justify-center">
                <div class="col-xs-12 col-md-8 col-lg-6">
                    <q-card class="info-card" flat>
                        <div class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs q-pa-xl-lg">
                            <q-card-section class="q-pl-md">
                                <div class="text-h4 text-bold">block not found</div>
                            </q-card-section>
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
    <div class="q-pt-lg container-max-width">
        <TransactionsTable :actions="actions as Action[]" :toggleEnabled="false"/>
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
