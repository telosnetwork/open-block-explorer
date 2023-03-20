<script lang="ts">
import { computed, defineComponent, PropType, ref, toRef } from 'vue';
import CoinSelectorDialog from 'src/components/CoinSelectorDialog.vue';
import { Token } from 'src/types';
import { isValidAccount } from 'src/utils/string-utils';
import { getChain } from 'src/config/ConfigManager';
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';

const chain = getChain();

export default defineComponent({
    name: 'SendDialog',
    components: {
        CoinSelectorDialog,
    },
    props: {
        availableTokens: {
            type: Array as PropType<Token[]>,
            required: true,
        },
    },
    emits: ['update-token-balances'],
    setup(props, context) {
        const store = useStore();
        const router = useRouter();
        const sendToken = ref<Token>(chain.getSystemToken());
        const availableTokens = toRef(props, 'availableTokens');
        const sendDialog = ref<boolean>(false);
        const openCoinDialog = ref<boolean>(false);
        const receivingAccount = ref<string>('');
        const sendAmount = ref<string>('');
        const memo = ref<string>('');

        const account = computed(() => store.state.account.accountName);
        const transactionId = computed(
            (): string => store.state.account.TransactionId,
        );
        const transactionError = computed(
            () => store.state.account.TransactionError,
        );
        const transactionForm = computed(
            () => !(transactionError.value || transactionId.value),
        );
        const validated = computed(
            () =>
                parseFloat(sendAmount.value) > 0 && receivingAccount.value.length > 0,
        );

        const sendTransaction = async (): Promise<void> => {
            void store.dispatch('account/resetTransaction');
            const actionAccount = sendToken.value?.contract;
            const data = {
                from: account.value,
                to: receivingAccount.value,
                quantity: `${sendAmount.value} ${sendToken.value?.symbol}`,
                memo: memo.value,
            };
            await store.dispatch('account/sendAction', {
                account: actionAccount,
                data,
                name: 'transfer',
            });
            void store.dispatch('account/loadAccountData');
            context.emit('update-token-balances');
        };

        const setDefaults = () => {
            void store.dispatch('account/resetTransaction');
            if (availableTokens.value.length > 0) {
                sendToken.value = availableTokens.value.find(token => (
                    token.symbol === sendToken.value?.symbol &&
                    token.contract === sendToken.value?.contract
                ));
            }
        };

        const updateSelectedCoin = (token: Token): void => {
            sendToken.value = token;
        };

        const resetForm = () => {
            sendToken.value = {
                symbol: chain.getSystemToken().symbol,
                precision: 4,
                amount: 0,
                contract: 'eosio.token',
            };
        };

        const navToTransaction = async () => {
            await router.push({
                name: 'transaction',
                params: { transaction: transactionId.value },
            });
            router.go(0);
            void store.dispatch('account/resetTransaction');
        };

        const formatDec = () => {
            let amount = Number(sendAmount.value);
            if (sendAmount.value !== '') {
                sendAmount.value = amount
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: sendToken.value.precision,
                        minimumFractionDigits: sendToken.value.precision,
                    })
                    .replace(/,/g, '');
            }
            sendAmount.value = sendAmount.value.replace(/[^0-9.]/g, '');
        };

        const setMaxValue = () => {
            sendAmount.value = sendToken.value.amount.toString();
            void formatDec();
        };

        return {
            sendToken,
            transactionId,
            transactionError,
            sendDialog,
            openCoinDialog,
            receivingAccount,
            sendAmount,
            memo,
            transactionForm,
            account,
            validated,
            setDefaults,
            updateSelectedCoin,
            setMaxValue,
            navToTransaction,
            sendTransaction,
            isValidAccount,
            formatDec,
            resetForm,
        };
    },
    // watch availableTokens and if it changes print the new value
    watch: {
        availableTokens: {
            handler() {
                if (this.availableTokens.length > 0) {
                    this.sendToken = this.availableTokens.find(token => (
                        token.symbol === this.sendToken.symbol &&
                        token.contract === this.sendToken.contract
                    ));
                }

                if (!this.sendToken || this.sendToken.amount === 0) {
                    this.openCoinDialog = true;
                }
            },
            deep: true,
            immediate: true,
        },
    },
});
</script>

<template>

<q-dialog
    :persistent="true"
    maximized
    @show="setDefaults"
    @hide="resetForm"
>
    <q-card class="sendCard">
        <div class="row justify-center items-center full-height full-width">
            <div class="absolute-top-right">
                <q-btn
                    v-close-popup
                    size="20px"
                    flat
                    dense
                    round
                    icon="clear"
                />
            </div>
            <div class="col-xs-12 col-sm-8 col-md-7 col-lg-6 max-dialog-width">
                <div class="row">
                    <q-card-section>
                        <img class="send-img q-pr-md" src="~assets/send.svg">
                        <div class="text-h4 q-pb-md inline-block color-grey-3">Send Tokens</div>
                    </q-card-section>
                </div>
                <div v-if="transactionForm" class="transaction-form text-grey-3 text-weight-light">
                    <q-separator v-if="transactionForm" dark/>
                    <q-card-section v-if="transactionForm">
                        <div class="row">
                            <div class="col-12">
                                <div class="row justify-between q-px-sm q-pb-sm q-gutter-x-sm">RECEIVING ACCOUNT</div>
                                <q-input
                                    v-model="receivingAccount"
                                    class="full-width"
                                    standout="standout"
                                    dense
                                    dark
                                    :lazy-rules="true"
                                    :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]"
                                />
                            </div>
                        </div>
                        <div class="row q-py-md">
                            <div class="col-4">
                                <div class="row justify-between q-px-sm q-pb-sm q-gutter-x-sm">TOKEN</div>
                                <div class="row items-center no-wrap selector-container q-py-sm" @click="openCoinDialog = true">
                                    <div class="col-8 text-subtitle-1 q-mx-sm subtitle">{{ sendToken?.symbol}}</div>
                                    <div class="col-4">
                                        <div class="row justify-end items-center arrowButton">
                                            <q-icon class="fas fa-chevron-down q-pr-lg" size="17px"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-8 q-pl-md">
                                <div class="row justify-between q-pb-sm q-gutter-x-sm">
                                    <div>AMOUNT</div>
                                    <q-space/>
                                    <div class="row flex-center q-hoverable cursor-pointer" @click="setMaxValue">
                                        <div class="color-grey-3 text-weight-bold balance-amount">{{ `${sendToken?.amount ?? 0 } AVAILABLE` }}</div>
                                        <q-icon class="q-ml-xs" name="info"/>
                                        <q-tooltip>Click to fill full amount</q-tooltip>
                                    </div>
                                </div>
                                <q-input
                                    v-model="sendAmount"
                                    class="full-width"
                                    standout="bg-deep-purple-2 text-white"
                                    placeholder="0"
                                    :debounce="1000"
                                    :rules="[val => val > 0 && val <= sendToken?.amount || 'invalid amount' ]"
                                    type="text"
                                    dense
                                    dark
                                    @blur="formatDec"
                                />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <div class="row justify-between q-px-sm q-pb-sm q-gutter-x-sm">OPTIONAL MEMO</div>
                                <div class="row">
                                    <q-input
                                        v-model="memo"
                                        class="full-width send-input"
                                        standout="bg-deep-purple-2 text-white"
                                        dark
                                        type="textarea"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 q-pt-md">
                                <div class="row justify-between q-px-sm q-pb-lg q-gutter-x-sm">Your wallet must be open to allow authorization of this transaction.</div>
                                <q-btn
                                    class="full-width button-accent"
                                    label="Confirm"
                                    flat
                                    :disabled="!validated"
                                    @click="sendTransaction"
                                />
                            </div>
                        </div>
                    </q-card-section>
                </div>
                <div v-else class="transaction-result">
                    <q-card-section v-if="transactionId">
                        <div class="row">
                            <div class="col-12">
                                <div>You successfully sent {{ sendAmount }} {{ sendToken?.symbol }} to {{ receivingAccount }}.</div>
                            </div>
                            <div class="col-12">
                                Click to view transaction:
                                <a class="ellipsis-overflow text-blue" @click="navToTransaction">{{ transactionId }}</a>
                            </div>
                        </div>
                    </q-card-section>
                    <q-card-section v-else>
                        <div class="row">
                            <div class="col-12">
                                <div class="row">Transaction Failed: {{ transactionError }}</div>
                            </div>
                        </div>
                    </q-card-section>
                    <div class="row">
                        <div class="col-12 flex justify-end">
                            <q-btn
                                v-close-popup
                                flat
                                class="close-dialog"
                                label="Close"
                                @click="setDefaults"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <CoinSelectorDialog v-model="openCoinDialog" :updateSelectedCoin="updateSelectedCoin" :availableTokens="availableTokens"/>
    </q-card>
</q-dialog>
</template>

<style lang="sass" scoped>
.transaction-result
    color: white


.sendCard
  color: $grey-6
  background: radial-gradient(circle at 48% 100%, rgba(108, 35, 255, 1) 0%, rgba(84, 0, 253, 1) 20%, rgba(2, 27, 100, 1) 92%)
  .send-icon
    padding-bottom: 30px
  .button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
  .color-grey-3
    color: $grey-3

.sarrowButton
  background: rgba($grey-9, 0.1)

.selector-container
  cursor: pointer
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  height: 40px
  margin-top: 1px
  color: var(--q-dark)
  &:hover
    background: rgba($grey-4, 0.3)
    border-color: $grey-1
    border-radius: 4px
  .arrowButton
    color: $grey-4

  .text-h6
    color: $grey-4
    font-weight: 600
    font-size: 1.1rem
  .subtitle
    color: $grey-4
.send-img
  height: 35px !important

.balance-amount:hover
  color: $primary
</style>
