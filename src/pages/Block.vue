<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import TransactionTable from 'src/components/zjcomponents/TransactionsTable.vue';
import BlockCard from 'components/BlockCard.vue';
import { useRoute, useRouter } from 'vue-router';
import { zjApi } from 'src/api/zjApi';
import { Block } from 'src/types/zj_tpyes/Block';
import { Transaction } from 'src/types/zj_tpyes/Transaction';

export default defineComponent({
    name: 'BlockPage',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const found = ref(false);
        const block = ref<Block>(null);
        const transactions = ref<Transaction[]>([]);
        const tab = ref<string>((route.query['tab'] as string) || 'actions');
        onMounted(async () => {
            // api get block and set block
            block.value = await zjApi.getBlock(route.params.block as string);
            block.value.transactions.forEach((tr) => {
                transactions.value = transactions.value.concat(tr);
            });
            found.value = block.value ? true : false;
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
            Transactions: transactions,
            block,
        };
    },
    components: {
        TransactionTable,
        BlockCard,
    },
});
</script>

<template>

<div class="row">
    <div class="col-12 header-support q-pb-lg">
        <BlockCard v-if="found" class="q-pa-lg" :block="block"/>
        <div v-else class="q-pa-lg">
            <div class="row full-width justify-center">
                <div class="col-xs-12 col-md-8 col-lg-6">
                    <q-card class="info-card" flat>
                        <div class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs q-pa-xl-lg">
                            <q-card-section class="q-pl-md">
                                <div class="text-h4 text-bold">Block not found.</div>
                            </q-card-section>
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
    <div class="q-pt-lg container-max-width">
        <TransactionTable :transactions="Transactions" :toggleEnabled="false"/>
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
