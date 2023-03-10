<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { StakeResourcesTransactionData } from 'src/types/StakeResourcesTransactionData';

const chain = getChain();
const symbol = chain.getSystemToken().symbol;

export default defineComponent({
    name: 'UnstakeTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        const openTransaction = ref<boolean>(false);
        const stakingAccount = ref<string>(
            store.state.account.accountName.toLowerCase() || '',
        );
        const cpuTokens = ref<string>('0');
        const netTokens = ref<string>('0');
        const netStake = computed((): string =>
            store.state.account.data.total_resources.net_weight.toString(),
        );
        const cpuStake = computed((): string =>
            store.state.account.data.total_resources.cpu_weight.toString(),
        );

        function formatDec() {
            if (cpuTokens.value !== '0') {
                cpuTokens.value = Number(cpuTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: store.state.chain.token.precision,
                        minimumFractionDigits: store.state.chain.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
            if (netTokens.value !== '0') {
                netTokens.value = Number(netTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: store.state.chain.token.precision,
                        minimumFractionDigits: store.state.chain.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        function assetToAmount(asset: string, decimals = -1): number {
            try {
                let qty: string = asset.split(' ')[0];
                let val: number = parseFloat(qty);
                if (decimals > -1) {
                    qty = val.toFixed(decimals);
                }
                return val;
            } catch (error) {
                return 0;
            }
        }

        return {
            openTransaction,
            stakingAccount,
            cpuTokens,
            netTokens,
            ...mapActions({ sendAction: 'account/sendAction' }),
            transactionId: ref<string>(null),
            transactionError: null,
            formatDec,
            netStake: assetToAmount(netStake.value),
            cpuStake: assetToAmount(cpuStake.value),
        };
    },
    computed: {
        cpuInputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val < this.cpuStake || 'Not enough staked',
            ];
        },
        netInputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val < this.netStake || 'Not enough staked',
            ];
        },
        ctaDisabled(): boolean {
            return this.cpuStake + this.netStake === 0;
        },
    },
    methods: {
        async sendTransaction(): Promise<void> {
            this.transactionError = '';
            if (parseFloat(this.cpuTokens) <= 0 && parseFloat(this.netTokens) <= 0) {
                this.$q.notify('Enter valid value for CPU or NET to unstake');
                return;
            }
            const data = {
                from: this.stakingAccount,
                receiver: this.stakingAccount,
                transfer: false,
                unstake_cpu_quantity:
                parseFloat(this.cpuTokens) > 0
                    ? `${parseFloat(this.cpuTokens).toFixed(4)} ${symbol}`
                    : `0 ${symbol}`,
                unstake_net_quantity:
                parseFloat(this.netTokens) > 0
                    ? `${parseFloat(this.netTokens).toFixed(4)} ${symbol}`
                    : `0 ${symbol}`,
            } as StakeResourcesTransactionData;
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.transactionId = (
                    await this.sendAction({
                        account: 'eosio',
                        name: 'undelegatebw',
                        data,
                    })
                ).transactionId as string;
                this.$store.commit('account/setTransaction', this.transactionId);
            } catch (e) {
                this.transactionError = e;
                this.$store.commit('account/setTransactionError', e);
            }
            await this.loadAccountData();

            if (localStorage.getItem('autoLogin') !== 'cleos') {
                this.openTransaction = true;
            }
        },
        async loadAccountData(): Promise<void> {
            let data: API.v1.AccountObject;
            try {
                data = await this.$api.getAccount(this.stakingAccount);
                this.$store.commit('account/setAccountData', data);
            } catch (e) {
                return;
            }
        },
    },
});
</script>

<template>

<div class="staking-form">
    <q-card-section class="text-grey-3 text-weight-light">
        <div class="row q-pb-md">
            <div class="col-6">
                <div class="row q-pb-sm">
                    <div class="col-6">REMOVE CPU</div>
                    <div class="col-6">
                        <div class="color-grey-3 flex justify-end items-center" @click="cpuTokens = cpuStake.toString()">
                            <span class="text-weight-bold balance-amount">{{ `${cpuStake} AVAILABLE` }}</span>
                            <q-icon class="q-ml-xs" name="info"/>
                            <q-tooltip>Click to fill full amount</q-tooltip>
                        </div>
                    </div>
                </div>
                <q-input
                    v-model="cpuTokens"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    placeholder="0"
                    :lazy-rules="true"
                    :rules="cpuInputRules"
                    type="text"
                    dense
                    dark
                    @blur="formatDec"
                />
            </div>
            <div class="col-6 q-pl-md">
                <div class="row q-pb-sm">
                    <div class="col-6">REMOVE NET</div>
                    <div class="col-6">
                        <div class="color-grey-3 flex justify-end items-center" @click="netTokens = netStake.toString()">
                            <span class="text-weight-bold balance-amount">{{ `${netStake} AVAILABLE` }}</span>
                            <q-icon class="q-ml-xs" name="info"/>
                            <q-tooltip>Click to fill full amount</q-tooltip>
                        </div>
                    </div>
                </div>
                <q-input
                    v-model="netTokens"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    placeholder="0"
                    :lazy-rules="true"
                    :rules="netInputRules"
                    type="text"
                    dense
                    dark
                    @blur="formatDec"
                />
            </div>
        </div>
        <div class="row">
            <div class="col-12 q-pt-md">
                <q-btn
                    class="full-width button-accent"
                    label="Confirm"
                    flat
                    :disable="ctaDisabled"
                    @click="sendTransaction"
                />
            </div>
        </div>
        <ViewTransaction
            v-model="openTransaction"
            :transactionId="transactionId"
            :transactionError="transactionError || ''"
            message="transaction complete"
        />
    </q-card-section>
</div>
</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
.balance-amount:hover
    cursor: pointer
    color: $primary
</style>
