<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { copyToClipboard } from 'quasar';
import {  formatDate } from 'src/utils/string-utils';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';
import { useTransactionStore } from 'src/stores/transaction';

export default defineComponent({
    name: 'TransactionCard',
    components: { AccountFormat },
    setup() {
        const transactionStore = useTransactionStore();
        return {
            transaction: computed(() => transactionStore.transactionId),
            transactionData: computed(() => transactionStore.transaction),
            blockNum: computed(() => transactionStore.blockNum.toString()),
            timestamp: computed(() => transactionStore.timestamp),
            executed: computed(() => transactionStore.executed),
            irreversable: computed(() => transactionStore.irreversable),
            cpuUsage: computed(() => transactionStore.cpuUsage),
            netUsage: computed(() => transactionStore.netUsage),
            actionsTraces: ref<string>(''),
            actionNum: computed(() => transactionStore.actionCount),
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
                            <div class="text-body1 text-weight-medium text-uppercase">Block number</div>
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
                        <div class="col-xs-12 col-sm-6 text-right text-bold">{{formatDate(`${timestamp}Z`)}}</div>
                    </div>
                </q-card-section>
                <q-separator class="card-separator" inset="inset"/>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">Status</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">
                            <q-badge
                                class="text-bold"
                                transparent
                                align="middle"
                                color="purple-2"
                                text-color="black"
                            >{{executed ? 'EXECUTED' : 'PENDING'}}</q-badge>
                            <q-badge
                                v-if="irreversable"
                                class="q-ml-sm text-bold"
                                transparent
                                align="middle"
                                color="deep-orange-2"
                                text-color="black"
                            >{{'IRREVERSIBLE'}}</q-badge>
                        </div>
                    </div>
                </q-card-section>
                <q-separator class="card-separator" inset="inset"/>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">CPU usage</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">{{cpuUsage + ' μs'}}</div>
                    </div>
                </q-card-section>
                <q-separator class="card-separator" inset="inset"/>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">Net usage</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">{{netUsage + ' Bytes'}}</div>
                    </div>
                </q-card-section>
                <q-separator class="card-separator" inset="inset"/>
                <q-card-section>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <div class="text-body1 text-weight-medium text-uppercase">Actions/Traces</div>
                        </div>
                        <div class="col-xs-12 col-sm-6 text-right text-bold">{{actionNum+'/'+actionNum}}</div>
                    </div>
                </q-card-section>
            </div>
        </q-card>
    </div>
</div>

</template>

<style lang="sass"></style>
