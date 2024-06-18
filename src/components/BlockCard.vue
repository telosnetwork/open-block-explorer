<script lang="ts">
import {
    defineComponent,
    ref,
    computed,
    watch,
    onMounted,
} from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { formatDate } from 'src/utils/string-utils';
import { API } from '@wharfkit/session';

export default defineComponent({
    name: 'BlockCard',
    props: {
        block: {
            type: API.v1.GetBlockResponse,
            required: false,
            default: null,
        },
    },
    setup(props) {
        const router = useRouter();
        const q = useQuasar();
        const blockResponse = computed(() => props.block);
        const blockInfo = ref<{ key: string; value: string }[]>([]);
        async function nextBlock() {
            await router.push({
                name: 'block',
                params: {
                    block: blockResponse.value.block_num.toNumber() + 1,
                },
            });
            router.go(0);
        }
        async function previousBlock() {
            await router.push({
                name: 'block',
                params: {
                    block: blockResponse.value.block_num.toNumber() - 1,
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
            if (blockResponse.value) {
                let actionCount = 0;
                let cpu = 0;
                let net = 0;
                blockResponse.value.transactions.forEach((tx) => {
                    if (tx.trx.transaction && tx.trx.transaction.actions) {
                        actionCount += tx.trx.transaction.actions.length;
                    }
                    cpu += tx.cpu_usage_us.toNumber();
                    net += tx.net_usage_words.toNumber();
                });
                blockInfo.value = [
                    { key: 'Producer', value: blockResponse.value.producer.toString() },
                    { key: 'Block time', value: formatDate(blockResponse.value.timestamp.toString()) },
                    { key: 'CPU usage', value: cpu.toString() + ' μs' },
                    { key: 'Net usage', value: (net * 8).toString() + ' Bytes' },
                    {
                        key: 'Schedule Version',
                        value: blockResponse.value.schedule_version.toString(),
                    },
                    {
                        key: 'Transactions',
                        value: blockResponse.value.transactions.length.toString(),
                    },
                    { key: 'Actions', value: actionCount.toString() },
                ];
            }
        }
        watch(blockResponse, () => {
            setBlockData();
        });
        onMounted(() => {
            setBlockData();
        });
        return {
            block_num: computed(() => blockResponse.value?.block_num.toNumber() || 0),
            nextBlock,
            previousBlock,
            numberWithCommas,
            formatDate,
            copy,
            blockInfo,
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
                        <div class="col-11 text-bold ellipsis">{{numberWithCommas(block_num)}}</div>
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
                <q-card-section>
                    <div class="text-grey-7">SUMMARY</div>
                </q-card-section>
                <div v-for="item in blockInfo" :key="item.key">
                    <q-separator class="card-separator" inset/>
                    <q-card-section>
                        <div class="row">
                            <div class="col-xs-12 col-sm-6">
                                <div class="text-body1 text-weight-medium text-uppercase">{{item.key}}</div>
                            </div>
                            <div class="col-xs-12 col-sm-6 text-right text-bold">{{item.value}}</div>
                        </div>
                    </q-card-section>
                </div>
            </div>
        </q-card>
    </div>
</div>

</template>

<style lang="sass"></style>
