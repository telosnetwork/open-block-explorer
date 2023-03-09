<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { isValidAccount } from 'src/utils/stringValidator';
import { API } from '@greymass/eosio';
import { StakeResourcesTransactionData } from 'src/types';

const chain = getChain();
const symbol = chain.getSystemToken().symbol;

export default defineComponent({
    name: 'StakeTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        const openTransaction = ref<boolean>(false);
        const stakingAccount = ref<string>(store.state.account.accountName || '');
        const accountTotal = computed((): string =>
            (store.state.account.data.core_liquid_balance ?? 0).toString(),
        );
        const cpuTokens = ref<string>('0');
        const netTokens = ref<string>('0');

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
            accountTotal: assetToAmount(accountTotal.value),
            isValidAccount,
        };
    },
    computed: {
        inputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val < this.accountTotal || 'Not enough funds',
            ];
        },
        notEnoughTlosForTransaction(): boolean {
            return +this.cpuTokens + +this.netTokens > this.accountTotal;
        },
        disableCta(): boolean {
            const allZero = +this.cpuTokens === 0 && +this.netTokens === 0;

            return this.notEnoughTlosForTransaction || allZero;
        },
    },
    methods: {
        async sendTransaction(): Promise<void> {
            this.transactionError = '';
            if (parseFloat(this.cpuTokens) <= 0 && parseFloat(this.netTokens) <= 0) {
                this.$q.notify('Enter valid value for CPU or NET to stake');
                return;
            }
            const data = {
                from: this.$store.state.account.accountName.toLowerCase(),
                receiver: this.stakingAccount.toLowerCase(),
                transfer: false,
                stake_cpu_quantity:
                    parseFloat(this.cpuTokens) > 0
                        ? `${parseFloat(this.cpuTokens).toFixed(4)} ${symbol}`
                        : `0.0000 ${symbol}`,
                stake_net_quantity:
                    parseFloat(this.netTokens) > 0
                        ? `${parseFloat(this.netTokens).toFixed(4)} ${symbol}`
                        : `0.0000 ${symbol}`,
            } as StakeResourcesTransactionData;
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.transactionId = (
                    await this.sendAction({
                        account: 'eosio',
                        name: 'delegatebw',
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
        <div class="row">
            <div class="col-12">
                <div class="row justify-between q-pb-sm">CPU/NET Receiver
                    <q-space/>
                    <div class="text-grey-3">Defaults to connected account</div>
                </div>
                <q-input
                    v-model="stakingAccount"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    dense
                    dark
                    :lazy-rules="true"
                    :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]"
                />
            </div>
        </div>
        <div class="row q-py-md">
            <div class="col-6">
                <div class="row q-pb-sm">
                    <div class="col-6">ADD CPU</div>
                    <div class="col-6">
                        <div class="color-grey-3 flex justify-end items-center" @click="cpuTokens = (accountTotal - 0.1).toString(); netTokens = '0'"><span class="text-weight-bold balance-amount">{{ accountTotal ? `${accountTotal } AVAILABLE` : '--' }}</span>
                            <q-icon class="q-ml-xs" name="info"/>
                            <q-tooltip>Click to fill full amount</q-tooltip>
                        </div>
                    </div>
                </div>
                <q-input
                    v-model="cpuTokens"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    placeholder="0.0000"
                    :lazy-rules="true"
                    :rules="inputRules"
                    type="text"
                    dense
                    dark
                    @blur="formatDec"
                />
            </div>
            <div class="col-6 q-pl-md">
                <div class="row q-pb-sm">
                    <div class="col-6">ADD NET</div>
                    <div class="col-6">
                        <div class="color-grey-3 flex justify-end items-center" @click="netTokens = (accountTotal - 0.1).toString(); cpuTokens = '0'"><span class="text-weight-bold balance-amount">{{ accountTotal ? `${accountTotal } AVAILABLE` : '--' }}</span>
                            <q-icon class="q-ml-xs" name="info"/>
                            <q-tooltip>Click to fill full amount</q-tooltip>
                        </div>
                    </div>
                </div>
                <q-input
                    v-model="netTokens"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    placeholder="0.0000"
                    :lazy-rules="true"
                    :rules="inputRules"
                    type="text"
                    dense
                    dark
                    @blur="formatDec"
                />
            </div>
        </div>
        <div v-if="notEnoughTlosForTransaction" class="row text-red">Balance too low for transaction</div>
        <div class="row">
            <div class="col-12 q-pt-md">
                <q-btn
                    class="full-width button-accent"
                    label="Confirm"
                    flat
                    :disable="disableCta"
                    @click="sendTransaction"
                />
            </div>
        </div>
    </q-card-section>
    <ViewTransaction
        v-model="openTransaction"
        :transactionId="transactionId"
        :transactionError="transactionError || ''"
        message="transaction complete"
    />
</div>

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4

.balance-amount:hover
  color: $primary
  cursor: pointer
</style>
