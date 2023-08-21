<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { assetToAmount } from 'src/utils/string-utils';

const chain = getChain();

export default defineComponent({
    name: 'StakingTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        let openTransaction = ref<boolean>(false);
        const stakeTokens = ref<string>('');
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const transactionId = computed(
            (): string => store.state.account.TransactionId,
        );
        const transactionError = computed(
            () => store.state.account.TransactionError,
        );
        const accountData = computed((): API.v1.AccountObject => store.state?.account.data);
        const rexInfo = computed(() => store.state.account.data.rex_info);
        const rexbal = computed(() => store.state.account.rexbal);
        const maturedRex = computed(() => store.state.account.maturedRex);
        const liquidBalance = computed(
            () => accountData.value?.core_liquid_balance.value,
        );

        const inputRules = computed((): Array<(data: string) => boolean | string> => [
            (val: string) => +val >= 0 || 'Value must not be negative',
            (val: string) => +val <= assetToAmount((accountData.value.core_liquid_balance ?? 0).toString()) || 'Balance too low',
        ]);

        function formatDec() {
            const precision = store.state.chain.token.precision;
            if (stakeTokens.value !== '') {
                stakeTokens.value = Number(stakeTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: precision,
                        minimumFractionDigits: precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        async function stake() {
            void store.dispatch('account/resetTransaction');
            if (
                stakeTokens.value === '0' ||
                Number(stakeTokens.value) >=
                Number(accountData.value.core_liquid_balance.toString())
            ) {
                return;
            }
            await store.dispatch('account/stakeRex', {
                amount: stakeTokens.value,
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        function setMaxValue() {
            stakeTokens.value = (
                assetToAmount(accountData.value.core_liquid_balance.toString())
            ).toString();
            void formatDec();
        }

        return {
            openTransaction,
            stakeTokens,
            transactionId,
            transactionError,
            accountData,
            rexInfo,
            rexbal,
            maturedRex,
            liquidBalance,
            symbol,
            inputRules,
            formatDec,
            stake,
            assetToAmount,
            setMaxValue,
        };
    },
});
</script>

<template>

<div class="staking-form">
    <q-card-section>
        <div class="row q-col-gutter-md">
            <div class="col-12">
                <div class="row q-mb-md">
                    <div class="row q-pb-sm full-width">
                        <div class="col-8">{{ `LIQUID ${symbol}` }}</div>
                        <div class="col-4">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxValue">
                                <div class="text-weight-bold text-right balance-amount">{{ `${liquidBalance} AVAILABLE` }}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Click to fill full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        v-model="stakeTokens"
                        dense
                        dark
                        class="full-width"
                        standout="bg-deep-purple-2 text-white"
                        placeholder='0'
                        :lazy-rules='true'
                        :rules="inputRules"
                        type="text"
                        @blur='formatDec'
                    />
                </div>
                <div class="row">
                    <q-btn
                        class="full-width button-accent"
                        :label='"Stake " + symbol'
                        flat
                        @click="stake"
                    />
                </div>
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

<style scoped lang="sass">
.button-accent
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  color: $grey-4
.grey-3
  color: $grey-3
.balance-amount:hover
  color: $primary
</style>
