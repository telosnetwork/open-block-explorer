<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import BlockTransactionsTable from 'src/components/BlockTransactionsTable.vue';
import BlockCard from 'components/BlockCard.vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'src/api';
import { Action, Block } from 'src/types';

export default defineComponent({
    name: 'BlockPage',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const found = ref(true);
        const block = ref<Block>(null);
        const block_num = ref<string>(route.params.block as string);
        const actions = ref<Action[]>([]);
        const tab = ref<string>((route.query['tab'] as string) || 'actions');
        const tries = 3;
        const error = ref<string>('');
        // tryToLoadBlock is a function that tries to load a block from the API at least 3 times before giving up
        const tryToLoadBlock = async (block_num: string) => {
            error.value = '';
            let block = null;
            for (let i = 0; i < tries; i++) {
                try {
                    block = await api.getBlock(block_num);
                    break;
                } catch (e) {
                    console.error(`Failed to load block ${block_num} on try ${i + 1}`);
                    if (i === tries - 1) {
                        throw e;
                    }
                }
            }
            return block;
        };
        onMounted(async () => {
            // api get block and set block
            try {
                block.value = await tryToLoadBlock(block_num.value);
                block.value.transactions.forEach((tr) => {
                    const act = tr.trx.transaction?.actions.map(act => ({
                        ...act,
                        trx_id: tr.trx.id,
                        act: {
                            ...act.act,
                            name: act.name,
                            data: act.data,
                            account: act.account,
                        },
                        '@timestamp': block.value.timestamp,
                    }));
                    actions.value = actions.value.concat(act);
                });
                found.value = !!block.value;
            } catch (e) {
                found.value = false;
                error.value = 'Unable to load block, try refreshing the page';
            }
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
            Actions: actions,
            block,
            block_num,
            error,
        };
    },
    components: {
        BlockTransactionsTable,
        BlockCard,
    },
});
</script>

<template>

<div class="row">
    <div class="col-12 header-support q-pb-lg">
        <BlockCard
            v-if="found"
            class="q-pa-lg"
            :block="block"
            :block_num="block_num"
        />
        <div v-else class="q-pa-lg">
            <div class="row full-width justify-center">
                <div class="col-xs-12 col-md-8 col-lg-6">
                    <q-card class="info-card" flat>
                        <div class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs q-pa-xl-lg">
                            <q-card-section class="q-pl-md">
                                <div class="text-h4 text-bold">block not found</div>
                            </q-card-section>
                            <q-card-section v-if="error" class="q-pl-md">
                                <div class="text-h6 text-bold">{{ error }}</div>
                            </q-card-section>
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
    <div class="q-pt-lg container-max-width">
        <BlockTransactionsTable :actions="Actions" :toggleEnabled="false"/>
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
