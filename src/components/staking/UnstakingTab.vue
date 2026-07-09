<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@wharfkit/session';
import { assetToAmount } from 'src/utils/string-utils';
import { QInput } from 'quasar';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

const chain = getChain();

export default defineComponent({
    name: 'UnstakingTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        let openTransaction = ref<boolean>(false);
        const unstakeTokens = ref<string>('');
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const unstakeInput = ref<QInput>(null);
        const transactionId = computed(
            (): string => accountStore.TransactionId,
        );
        const transactionError = computed(
            () => accountStore.TransactionError,
        );
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const rexInfo = computed(() => accountStore.data.rex_info);
        const rexbal = computed(() => accountStore.rexbal);
        const maturedRex = computed(() => accountStore.maturedRex);
        const maxUnlend = computed(() => assetToAmount(maturedRex.value) - .0001);

        function formatDec() {
            const precision = chainStore.token.precision;
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
            void accountStore.resetTransaction();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            if ((unstakeInput.value as any).hasError) {
                return;
            }
            await accountStore.unstakeRex({
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
                        standout="bg-dropdown-dark text-white"
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
  background: var(--q-primary)
  border-radius: 8px
  color: #FFFFFF
.grey-3
  color: #FFFFFF
.balance-amount:hover
  color: var(--q-info)
</style>
