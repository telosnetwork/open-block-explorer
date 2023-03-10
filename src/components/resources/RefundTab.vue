<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { Token } from 'src/types';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { API } from '@greymass/eosio';

export default defineComponent({
    name: 'RefundTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        const openTransaction = ref<boolean>(false);
        const stakingAccount = ref<string>('');
        const total = ref<string>('0');
        const progress = ref<number>(0.2);
        const refundRequest = computed((): API.v1.AccountRefundRequest => accountData.value?.refund_request);
        const cpuAmount = computed(
            (): number => refundRequest.value?.cpu_amount.value,
        );
        const netAmount = computed(
            (): number => refundRequest.value?.net_amount.value,
        );
        const token = computed((): Token => store.state.chain.token);
        const accountData = computed((): API.v1.AccountObject => store.state?.account.data);
        const totalRefund = computed((): string => {
            const totalRefund = refundRequest.value
                ? (
                    refundRequest.value.cpu_amount.value +
                    refundRequest.value.net_amount.value
                ).toFixed(4)
                : 0;
            return `${totalRefund} ${token.value.symbol}`;
        });

        function formatStaked(staked: number): string {
            const stakedValue = (
                staked / Math.pow(10, token.value.precision)
            ).toFixed(2);
            return `${stakedValue} ${token.value.symbol}`;
        }

        function refundProgress(): number {
            let diff =
                Math.round(
                    new Date(
                        new Date(
                            accountData.value.refund_request?.request_time.toString() + 'Z',
                        ).toUTCString(),
                    ).getTime() / 1000,
                ) +
                259200 -
                Math.round(new Date(Date.now()).getTime() / 1000);
            let time = diff / 259200;
            return time > 0 ? time : 0;
        }

        function refundCountdown(): string {
            let diff =
                Math.round(
                    new Date(
                        new Date(
                            accountData.value?.refund_request?.request_time.toString() + 'Z',
                        ),
                    ).getTime() / 1000,
                ) +
                259200 -
                Math.round(new Date(new Date().toISOString()).getTime() / 1000);
            if (diff > 0) {
                var days = component(diff, 24 * 60 * 60), // calculate days from timestamp
                    hours = component(diff, 60 * 60) % 24; // hours
                return `${days} days, ${hours} hours remaining`;
            } else {
                return 'No pending refund';
            }
        }

        function component(x: number, v: number) {
            return Math.floor(x / v);
        }

        return {
            store,
            openTransaction,
            stakingAccount,
            total,
            totalRefund,
            accountData,
            refundRequest,
            cpuAmount,
            netAmount,
            token,
            progress,
            formatStaked,
            refundProgress,
            refundCountdown,
            ...mapActions({ sendAction: 'account/sendAction' }),
            transactionId: ref<string>(null),
            transactionError: null,
        };
    },
    methods: {
        async sendTransaction(): Promise<void> {
            this.transactionError = '';
            const data = {
                owner: this.accountData.account_name,
                transfer: false,
            };
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.transactionId = (
                    await this.sendAction({
                        account: 'eosio',
                        name: 'refund',
                        data,
                    })
                ).transactionId as string;
            } catch (e) {
                this.transactionError = e;
            }
            await this.loadAccountData();

            if (localStorage.getItem('autoLogin') !== 'cleos') {
                this.openTransaction = true;
            }
        },
        async loadAccountData(): Promise<void> {
            try {
                const data = await this.$api.getAccount(
                    this.store.state.account.abi.account_name,
                );
                this.$store.commit('account/setAccountData', data);
            } catch (e) {
                return;
            }
        },
    },
});
</script>

<template>

<div class="q-pt-lg">
    <div class="container-refund">
        <div class="row full-width">
            <div class="row full-width q-pt-lg q-px-lg">
                <div class="col-6 text-h6 grey-3">Refunding Total</div>
                <div class="col-6 text-h6 text-right grey-3">{{ totalRefund }}</div>
            </div>
            <div class="row full-width q-py-md">
                <hr>
            </div>
            <div class="row full-width q-pb-lg text-grey-3 text-weight-light">
                <div class="col-xs-12 col-sm-6 q-px-lg q-pt-sm">
                    <div class="row">
                        <div class="col-6">CPU</div>
                        <div class="col-6 text-right text-weight-bold">{{ cpuAmount || '0'}}</div>
                    </div>
                    <div class="row q-pt-md">
                        <div class="col-6">NET</div>
                        <div class="col-6 text-right text-weight-bold">{{ netAmount || '0'}}</div>
                    </div>
                </div>
                <div class="col-xs-12 col-sm-6 q-px-lg q-pt-sm">
                    <div class="row">
                        <div class="col-7">{{refundCountdown()}}</div>
                        <div class="col-5 text-right text-weight-bold">
                            <q-linear-progress class="q-mt-sm" :value="refundProgress()" color="grey-3"/>
                        </div>
                    </div>
                    <div class="row q-pt-sm">
                        <div class="col-7 q-pt-sm">Refund
                            <q-icon class="q-ml-xs" name="far fa-question-circle">
                                <q-tooltip class="bg-deep-purple-12" anchor="top middle" self="center middle">If it has been more than 72 hours since your unstake transaction. Click on Refund to claim your tokens.</q-tooltip>
                            </q-icon>
                        </div>
                        <div class="col-5 text-right grey-3">
                            <q-btn
                                class="full-width button-accent"
                                label="Refund"
                                flat
                                @click="sendTransaction"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ViewTransaction
            v-model="openTransaction"
            :transactionId="transactionId"
            :transactionError="transactionError || ''"
            message="transaction complete"
        />
    </div>
</div>
</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
.container-refund
  border: 1px solid $grey-8
  border-radius: 13px
.grey-3
  color: $grey-3
</style>
