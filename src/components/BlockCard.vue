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
                            </div>
                        </div>
                    </div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <div class="row items-center">
                        <div class="col-11 text-bold ellipsis">{{block_hash}}</div>
                        <div class="col-1">
                            <q-btn
                                class="float-right"
                                flat
                                round
                                color="black"
                                icon="content_copy"
                                size="sm"
                                @click="copy(block_hash.toString())"
                            />
                        </div>
                    </div>
                </q-card-section>
                <q-card-section>
                    <div class="text-grey-7">SUMMARY</div>
                </q-card-section>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">Block time</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">{{formatDate(block.timestamp)}}</div>
                    </div>
                </q-card-section>
                <div v-for="property in propertyOrder" :key="property">
                    <q-separator class="card-separator" inset="inset"/>
                    <q-card-section>
                        <div class="row">
                            <div class="col-xs-12 col-sm-6">
                                <div class="text-body1 text-weight-medium text-uppercase">{{ property.toUpperCase() }}</div>
                            </div>
                            <div class="col-xs-12 col-sm-6 text-right text-bold">
                                <TextFormat :text="blockData[property].toString()"/>
                            </div>
                        </div>
                    </q-card-section>
                </div>
            </div>
        </q-card>
    </div>
</div>

</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { Block } from 'src/types/zj_tpyes/Block';
import { useRouter } from 'vue-router';
import { formatDate } from 'src/utils/string-utils';
import TextFormat from 'components/transaction/TextFormat.vue';

export default defineComponent({
    name: 'BlockCard',
    components: { TextFormat },
    props: {
        block: {
            type: Object as PropType<Block>,
            required: false,
            default: null,
        },
    },
    setup(props) {
        const router = useRouter();
        const q = useQuasar();
        const blockData = computed(() => props.block);
        async function previousBlock() {
            await router.push({
                name: 'block',
                params: {
                    block: blockData.value.prehash,
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

        const propertyOrder: Array<string> = [
            'shard_id',
            'pool_index',
            'height',
            'prehash',
            'hash',
            'version',
            'vss',
            'elect_height',
            'bitmap',
            'timeblock_height',
            'bls_agg_sign_x',
            'bls_agg_sign_y',
            'commit_bitmap',
            'tx_size',
            'date',
            'gas_used_sum',
        ];
        return {
            block_hash: computed(() => blockData.value?.hash || ''),
            previousBlock,
            formatDate,
            copy,
            blockData,
            propertyOrder,
        };
    },
});
</script>

<style lang="sass"></style>
