<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { assetToAmount } from 'src/utils/string-utils';
import { QInput } from 'quasar';

const chain = getChain();

export default defineComponent({
    name: 'UnstakingTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        let openTransaction = ref<boolean>(false);
        const unstakeTokens = ref<string>('');
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const unstakeInput = ref<QInput>(null);
        const transactionId = computed(
            (): string => store.state.account.TransactionId,
        );
        const transactionError = computed(
            () => store.state.account.TransactionError,
        );
        const accountData = computed((): API.v1.AccountObject => store.state?.account.data);
        const rexInfo = computed(() => store.state.account.data.rex_info);
        const rexbal = computed(() => store.state.account.rexbal);
        const maturedRex = computed(() => store.state?.account.maturedRex);
        const maxUnlend = computed(() => assetToAmount(maturedRex.value) - .0001);

        function formatDec() {
            const precision = store.state.chain.token.precision;
            if (unstakeTokens.value !== '') {
                unstakeTokens.value = Number(unstakeTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: precision,
                        minimumFractionDigits: precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        async function unstake() {
            void store.dispatch('account/resetTransaction');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            if ((unstakeInput.value as any).hasError) {
                return;
            }
            await store.dispatch('account/unstakeRex', {
                amount: unstakeTokens.value,
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        function setMaxValue() {
            unstakeTokens.value = maxUnlend.value.toString();
            void formatDec();
        }

        return {
            openTransaction,
            unstakeTokens,
            unstakeInput,
            transactionId,
            transactionError,
            formatDec,
            unstake,
            assetToAmount,
            accountData,
            rexInfo,
            rexbal,
            maturedRex,
            maxUnlend,
            symbol,
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
                <div class="row">
                    <div class="row q-pb-sm full-width">
                        <div class="col-8">{{ `MATURED ${symbol}` }}</div>
                        <div class="col-4">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxValue">
                                <div class="text-weight-bold text-right balance-amount">{{ maxUnlend }} {{ symbol }}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Click to fill full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        ref="unstakeInput"
                        v-model="unstakeTokens"
                        standout="bg-deep-purple-2 text-white"
                        placeholder='0'
                        :lazy-rules='true'
                        :rules="[ val => val >= 0  && val < assetToAmount(maturedRex)  || 'Invalid amount.' ]"
                        type="text"
                        dense
                        dark
                        @blur='formatDec'
                    />
                </div>
                <div class="row">
                    <q-btn
                        class="full-width button-accent"
                        :label="'Unstake ' + symbol"
                        flat
                        @click="unstake"
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
