<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API, Asset } from '@greymass/eosio';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

export default defineComponent({
    name: 'StakeFromResources',
    components: {
        ViewTransaction,
    },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        const openTransaction = ref<boolean>(false);
        const chain = getChain();
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const cpuTokens = ref<string>('');
        const netTokens = ref<string>('');
        const cpuWithdraw = ref<string>('0');
        const netWithdraw = ref<string>('0');
        const transactionId = ref<string>(accountStore.TransactionId);
        const transactionError = ref<unknown>(accountStore.TransactionError);
        const stakingAccount = computed(
            (): string => accountStore.accountName,
        );
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const cpuWeight = computed(
            (): Asset => accountData.value.total_resources.cpu_weight,
        );
        const netWeight = computed(
            (): Asset => accountData.value.total_resources.net_weight,
        );

        function formatDec() {
            if (cpuTokens.value !== '') {
                cpuTokens.value = Number(cpuTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: chainStore.token.precision,
                        minimumFractionDigits: chainStore.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
            if (netTokens.value !== '') {
                netTokens.value = Number(netTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: chainStore.token.precision,
                        minimumFractionDigits: chainStore.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        async function stake() {
            void accountStore.resetTransaction();
            if (
                (cpuTokens.value === '0' && netTokens.value === '0') ||
                Number(cpuTokens.value) >= Number(cpuWeight.value) ||
                Number(netTokens.value) >= Number(accountData.value.total_resources.net_weight)
            ) {
                return;
            }

            await accountStore.stakeCpuNetRex({
                cpuAmount: cpuTokens.value || '0',
                netAmount: netTokens.value || '0',
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        async function unstake() {
            void accountStore.resetTransaction();
            if (cpuWithdraw.value === '0' && netWithdraw.value === '0') {
                return;
            }
            await accountStore.unstakeCpuNetRex({
                cpuAmount: cpuWithdraw.value || '0',
                netAmount: netWithdraw.value || '0',
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        function setMaxNetValue() {
            netTokens.value = netWeight.value.toString();
            void formatDec();
        }

        function setMaxCpuValue() {
            cpuTokens.value = cpuWeight.value.toString();
            void formatDec();
        }

        return {
            openTransaction,
            stakingAccount,
            cpuTokens,
            netTokens,
            symbol,
            cpuWithdraw,
            netWithdraw,
            transactionId,
            transactionError,
            accountData,
            cpuWeight,
            netWeight,
            formatDec,
            stake,
            unstake,
            setMaxNetValue,
            setMaxCpuValue,
        };
    },
});
</script>

<template>

<div class="staking-form">
    <q-card-section>
        <div class="row q-col-gutter-md">
            <div class="col-12">
                <div class="row">
                    <div class="row q-pb-sm full-width">
                        <div class="col-9">TRANSFER CPU TO STAKING</div>
                        <div class="col-3">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxCpuValue">
                                <div class="text-weight-bold text-right balance-amount">{{cpuWeight}}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Click to fill full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        v-model="cpuTokens"
                        class="full-width"
                        dense
                        dark
                        standout="bg-deep-purple-2 text-white"
                        placeholder='0'
                        type="text"
                        :lazy-rules='true'
                        :rules="[ val => val >= 0 && val <= cpuWeight.value  || 'Invalid amount.' ]"
                        @blur='formatDec'
                    />
                    <div class="row"></div>
                    <div class="row q-pb-sm full-width">
                        <div class="col-9">TRANSFER NET TO STAKING</div>
                        <div class="col-3">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxNetValue">
                                <div class="text-weight-bold text-right balance-amount" @click="setMaxNetValue">{{netWeight}}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Click to fill full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        v-model="netTokens"
                        class="full-width"
                        standout="bg-deep-purple-2 text-white"
                        placeholder='0'
                        :lazy-rules='true'
                        :rules="[ val =>  val >= 0 && val <= netWeight.value || 'Invalid amount.' ]"
                        type="text"
                        dense
                        dark
                        @blur='formatDec'
                    />
                </div>
                <div class="row">
                    <q-btn
                        class="full-width button-accent"
                        :label=" 'Stake ' + symbol"
                        flat
                        @click="stake"
                    />
                </div>
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
</style>
