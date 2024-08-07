<script lang="ts">
import {
    defineComponent,
    ref,
    computed,
    PropType,
    watch,
    onMounted,
} from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { Block } from 'src/types';
import { useRouter } from 'vue-router';
import { formatDate } from 'src/utils/string-utils';

export default defineComponent({
    name: 'BlockCard',
    props: {
        block_num: {
            type: String,
            required: true,
        },
        block: {
            type: Object as PropType<Block>,
            required: false,
            default: null,
        },
    },
    setup(props) {
        const loading = ref<boolean>(true);
        const router = useRouter();
        const q = useQuasar();
        const blockNum = computed(() => props.block_num);
        const Block = computed(() => props.block);
        const blockInfo = ref<{ key: string; value: string }[]>([]);
        async function nextBlock() {
            await router.push({
                name: 'block',
                params: {
                    block: Block.value.block_num + 1,
                },
            });
            router.go(0);
        }
        async function previousBlock() {
            await router.push({
                name: 'block',
                params: {
                    block: Block.value.block_num - 1,
                },
            });
            void router.go(0);
        }
        function copy(value: string) {
            copyToClipboard(value)
                .then((): void => {
                    q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        message: 'Copied to clipboard',
                        timeout: 1000,
                    });
                })
                .catch(() => {
                    q.notify({
                        color: 'red-8',
                        textColor: 'white',
                        message: 'Could not copy',
                        timeout: 1000,
                    });
                });
        }
        function numberWithCommas(x: number) {
            if (!x) {
                return 0;
            }
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        function setBlockData() {
            if (Block.value) {
                let actionCount = 0;
                let cpu = 0;
                let net = 0;
                Block.value.transactions.forEach((tx) => {
                    if (tx.trx.transaction && tx.trx.transaction.actions) {
                        actionCount += tx.trx.transaction.actions.length;
                    }
                    cpu += tx.cpu_usage_us;
                    net += tx.net_usage_words;
                });
                blockInfo.value = [
                    { key: 'Producer', value: Block.value.producer },
                    { key: 'Block time', value: formatDate(Block.value.timestamp) },
                    { key: 'CPU usage', value: cpu.toString() + ' μs' },
                    { key: 'Net usage', value: (net * 8).toString() + ' Bytes' },
                    {
                        key: 'Schedule Version',
                        value: Block.value.schedule_version.toString(),
                    },
                    {
                        key: 'Transactions',
                        value: Block.value.transactions.length.toString(),
                    },
                    { key: 'Actions', value: actionCount.toString() },
                ];
                loading.value = false;
            }
        }
        watch(Block, () => {
            setBlockData();
        });
        onMounted(() => {
            setBlockData();
        });
        return {
            nextBlock,
            previousBlock,
            numberWithCommas,
            formatDate,
            copy,
            blockInfo,
            blockNum,
            loading,
        };
    },
});
</script>

<template>

<div class="row full-width justify-center">
    <div class="col-xs-12 col-md-8 col-lg-6">
        <q-card class="info-card container-max-width" flat>
            <div class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs q-pa-xl-lg">
                <q-card-section class="q-pl-md">
                    <div class="row q-col-gutter-sm justify-between">
                        <div class="col-auto text-h4 text-bold">Block</div>
                        <div class="col-auto">
                            <div class="row q-col-gutter-sm">
                                <div class="col-auto">
                                    <q-btn
                                        class="button-primary"
                                        flat
                                        dense
                                        size="md"
                                        icon="arrow_back"
                                        @click="previousBlock"
                                    />
                                </div>
                                <div class="col-auto">
                                    <q-btn
                                        class="button-primary"
                                        flat
                                        dense
                                        size="md"
                                        icon="arrow_forward"
                                        @click="nextBlock"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <div class="row items-center">
                        <div class="col-11 text-bold ellipsis">{{numberWithCommas(parseInt(block_num))}}</div>
                        <div class="col-1">
                            <q-btn
                                class="float-right"
                                flat
                                round
                                color="black"
                                icon="content_copy"
                                size="sm"
                                @click="copy(block_num.toString())"
                            />
                        </div>
                    </div>
                </q-card-section>
                <!-- we show a centered spinner if loading is true -->
                <q-card-section v-if="loading" class="q-pa-none">
                    <div class="row full-width justify-center">
                        <q-spinner-dots color="primary" size="40px"/>
                    </div>
                </q-card-section>
                <template v-else>
                    <q-card-section>
                        <div class="text-grey-7">SUMMARY</div>
                    </q-card-section>
                    <div v-for="item in blockInfo" :key="item.key">
                        <q-separator class="card-separator" inset="inset"/>
                        <q-card-section>
                            <div class="row">
                                <div class="col-xs-12 col-sm-6">
                                    <div class="text-body1 text-weight-medium text-uppercase">{{item.key}}</div>
                                </div>
                                <div class="col-xs-12 col-sm-6 text-right text-bold">{{item.value}}</div>
                            </div>
                        </q-card-section>
                    </div>
                </template>
            </div>
        </q-card>
    </div>
</div>

</template>

<style lang="sass"></style>
