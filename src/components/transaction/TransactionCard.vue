<template>

<div class="row full-width justify-center">
    <div class="col-xs-12 col-md-8 col-lg-6">
        <q-card class="info-card container-max-width" flat>
            <div class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs q-pa-xl-lg">
                <q-card-section class="q-pl-md">
                    <div class="text-h4 text-bold">Transaction</div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <div class="row items-center">
                        <div class="col-11 text-bold ellipsis">{{transaction}}</div>
                        <div class="col-1">
                            <q-btn
                                class="float-right"
                                flat
                                round
                                color="black"
                                icon="content_copy"
                                size="sm"
                                @click="copy(transaction)"
                            />
                        </div>
                    </div>
                </q-card-section>
                <q-card-section>
                    <div class="text-grey-7">SUMMARY</div>
                </q-card-section>
                <q-separator class="card-separator" inset="inset"/>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">Block Hash</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">
                            <AccountFormat :account="blockNum" type="block"/>
                            <q-btn
                                flat
                                round
                                color="black"
                                icon="content_copy"
                                size="sm"
                                @click="copy(blockNum)"
                            />
                        </div>
                    </div>
                </q-card-section>
                <q-separator class="card-separator" inset="inset"/>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">Block time</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">{{formatDate(timestamp)}}</div>
                    </div>
                </q-card-section>
                <q-separator class="card-separator" inset="inset"/>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">Type</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">
                            <TypeFormat :type="transactionData.type"/>
                        </div>
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
                                <TextFormat :text="transactionData[property]"/>
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
import { defineComponent, ref, computed } from 'vue';
import { copyToClipboard } from 'quasar';
import { useStore } from 'src/store';
import {  formatDate } from 'src/utils/string-utils';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';
import TypeFormat from 'components/transaction/TypeFormat.vue';
import TextFormat from 'components/transaction/TextFormat.vue';

export default defineComponent({
    name: 'TransactionCard',
    components: { TextFormat, TypeFormat, AccountFormat },
    setup() {
        const store = useStore();
        const propertyOrder: string[] = [
            'date',
            'shard_id',
            'pool_index',
            'height',
            'transfers',
            'version',
            'vss',
            'elect_height',
            'bitmap',
            'timeblock_height',
            'bls_agg_sign_x',
            'bls_agg_sign_y',
            'commit_bitmap',
            'gid',
            'from_field',
            'from_pubkey',
            'from_sign',
            'to',
            'amount',
            'gas_limit',
            'gas_used',
            'gas_price',
            'balance',
            'to_add',
            'type',
            'attrs',
            'status',
            'call_contract_step',
            'storages',
        ];
        return {
            transaction: computed(() => store.state.transaction.transactionId),
            transactionData: computed(() => store.state.transaction.transaction),
            blockNum: computed(() => store.state.transaction.blockNum.toString()),
            timestamp: computed(() => store.state.transaction.timestamp),
            status: computed(() => store.state.transaction.transaction.status),
            irreversable: computed(() => store.state.transaction.irreversable),
            cpuUsage: computed(() => store.state.transaction.cpuUsage),
            netUsage: computed(() => store.state.transaction.netUsage),
            actionsTraces: ref<string>(''),
            actionNum: computed(() => store.state.transaction.actionCount),
            propertyOrder,
        };
    },
    methods: {
        formatDate,
        copy(value: string) {
            copyToClipboard(value)
                .then((): void => {
                    this.$q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        message: 'Copied to clipboard',
                        timeout: 1000,
                    });
                })
                .catch(() => {
                    this.$q.notify({
                        color: 'red-8',
                        textColor: 'white',
                        message: 'Could not copy',
                        timeout: 1000,
                    });
                });
        },
        numberWithCommas(x: number) {
            if (!x) {
                return 0;
            }
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
    },
});
</script>

<style lang="sass"></style>
