<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { API } from '@greymass/eosio';
import { assetToAmount, formatNumberWithCommas } from 'src/utils/string-utils';
import { getChain } from 'src/config/ConfigManager';

export default defineComponent({
    name: 'SavingsTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        const openTransaction = ref<boolean>(false);
        const stakingAccount = computed(
            (): string => store.state.account.accountName,
        );
        const toSavingAmount = ref<string>('');
        const fromSavingAmount = ref<string>('');
        const transactionId = ref<string>(store.state.account.TransactionId);
        const transactionError = ref<unknown>(store.state.account.TransactionError);
        const accountData = computed((): API.v1.AccountObject => store.state?.account.data);
        const eligibleStaked = computed(() => (
            assetToAmount(store.state?.account.maturedRex) +
            assetToAmount(store.state?.account.maturingRex)
        ));
        const rexSavings = computed(() => store.state?.account.savingsRex);

        function formatDec() {
            if (toSavingAmount.value !== '') {
                toSavingAmount.value = Number(toSavingAmount.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: store.state.chain.token.precision,
                        minimumFractionDigits: store.state.chain.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
            if (fromSavingAmount.value !== '') {
                fromSavingAmount.value = Number(fromSavingAmount.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: store.state.chain.token.precision,
                        minimumFractionDigits: store.state.chain.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        async function moveToSavings() {
            void store.dispatch('account/resetTransaction');
            if (
                toSavingAmount.value === '0' ||
                toSavingAmount.value === '' ||
                Number(toSavingAmount.value) > eligibleStaked.value
            ) {
                return;
            }
            await store.dispatch('account/moveToSavings', {
                amount: toSavingAmount.value || '0',
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        async function moveFromSavings() {
            void store.dispatch('account/resetTransaction');
            if (
                fromSavingAmount.value === '0' ||
                fromSavingAmount.value === '' ||
                Number(fromSavingAmount.value) >= assetToAmount(rexSavings.value)
            ) {
                return;
            }
            await store.dispatch('account/moveFromSavings', {
                amount: fromSavingAmount.value || '0',
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        function setMaxSavingsValue() {
            toSavingAmount.value = eligibleStaked.value.toString();
            void formatDec();
        }

        function setMaxWithdrawValue() {
            fromSavingAmount.value = assetToAmount(rexSavings.value).toString();
            void formatDec();
        }

        return {
            openTransaction,
            stakingAccount,
            accountData,
            toSavingAmount,
            fromSavingAmount,
            eligibleStaked,
            rexSavings,
            transactionId,
            transactionError,
            formatNumberWithCommas,
            formatDec,
            moveToSavings,
            moveFromSavings,
            assetToAmount,
            setMaxSavingsValue,
            setMaxWithdrawValue,
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
                        <div class="col-9">STAKE TO SAVINGS</div>
                        <div class="col-3">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxSavingsValue">
                                <div class="text-weight-bold text-right balance-amount">{{ formatNumberWithCommas(eligibleStaked) }}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Any balance currently maturing will be moved first, click to stake full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        v-model="toSavingAmount"
                        standout="bg-deep-purple-2 text-white"
                        placeholder='0'
                        :lazy-rules='true'
                        :rules="[ val => val >= 0 && val <= eligibleStaked  || 'Invalid amount.' ]"
                        type="text"
                        dense
                        dark
                        @blur='formatDec'
                    />
                </div>
                <div class="row">
                    <q-btn
                        class="full-width button-accent"
                        label="Move To Savings"
                        flat
                        @click="moveToSavings"
                    />
                </div>
            </div>
            <div class="col-12">
                <div class="row">
                    <div class="row q-pb-sm full-width">
                        <div class="col-9">UNSTAKE FROM SAVINGS</div>
                        <div class="col-3">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxWithdrawValue">
                                <div class="text-weight-bold text-right balance-amount">{{rexSavings}}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Click to stake full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        v-model="fromSavingAmount"
                        standout="bg-deep-purple-2 text-white"
                        placeholder='0'
                        :lazy-rules='true'
                        :rules="[ val => val >= 0 && val <= assetToAmount(rexSavings)  || 'Invalid amount.' ]"
                        type="text"
                        dense
                        dark
                        @blur='formatDec'
                    />
                </div>
                <div class="row">
                    <q-btn
                        class="full-width button-accent"
                        label="Withdraw from Savings"
                        flat
                        @click="moveFromSavings"
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

<style lang="scss">
.button-accent{
  background: rgba(108, 35, 255, 1);
  border-radius: 4px;
  color: $grey-4;
}
.balance-amount:hover{
  color: $primary;
}
.staking-form .q-field{
    width:100%;
}
</style>
