<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { formatCurrency, isValidAccount } from 'src/utils/string-utils';
import { API, UInt64 } from '@greymass/eosio';

const chain = getChain();

export default defineComponent({
    name: 'BuyRam',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        let openTransaction = ref<boolean>(false);
        const buyAmount = ref<string>('');
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const buyOptions = [symbol.value, 'Bytes'];
        const buyOption = ref<string>(buyOptions[0]);
        const receivingAccount = ref<string>(store.state.account.accountName);
        const transactionId = computed(
            (): string => store.state.account.TransactionId,
        );
        const buyPreview = computed(() => {
            if (buyOption.value === buyOptions[0]) {
                return (
                    ((Number(buyAmount.value) * 1000) / Number(ramPrice.value)).toFixed(
                        0,
                    ) +
                    ' ' +
                    buyOptions[1]
                );
            } else {
                return (
                    formatCurrency((Number(buyAmount.value) / 1000) * Number(ramPrice.value), 4) +
                    ' ' +
                    buyOptions[0]
                );
            }
        });
        const transactionError = computed(
            () => store.state.account.TransactionError,
        );
        const ramPrice = computed((): string => store.state?.chain.ram_price);
        const ramAvailable = computed(() =>
            UInt64.sub(
                store.state.account.data.ram_quota,
                store.state.account.data.ram_usage,
            ),
        );
        const accountData = computed((): API.v1.AccountObject => store.state?.account.data);

        function formatDec() {
            const precision = store.state.chain.token.precision;
            if (buyOption.value === buyOptions[0]) {
                buyAmount.value = Number(buyAmount.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: precision,
                        minimumFractionDigits: precision,
                    })
                    .replace(/[^0-9.]/g, '');
            } else if (buyAmount.value !== '') {
                buyAmount.value = parseInt(buyAmount.value)
                    .toString()
                    .replace(/[^0-9.]/g, '');
            }
        }

        async function buy() {
            void store.dispatch('account/resetTransaction');
            if (buyOption.value === buyOptions[0]) {
                if (
                    buyAmount.value === '0' ||
                    '' ||
                    Number(buyAmount.value) >=
                        Number(accountData.value.core_liquid_balance.value)
                ) {
                    return;
                }
                await store.dispatch('account/buyRam', {
                    amount: buyAmount.value + ' ' + symbol.value,
                    receivingAccount: receivingAccount.value,
                });
            } else {
                if (
                    buyAmount.value === '0' ||
                    '' ||
                    Number(buyAmount.value) >=
                        (Number(accountData.value.core_liquid_balance.value) * 1000) /
                        Number(ramPrice.value)
                ) {
                    return;
                }
                await store.dispatch('account/buyRamBytes', {
                    amount: buyAmount.value,
                    receivingAccount: receivingAccount.value,
                });
            }

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        function buyLimit(): number {
            if (buyOption.value === buyOptions[0]) {
                return accountData.value.core_liquid_balance?.value ?? 0;
            } else {
                return (
                    (Number(accountData.value.core_liquid_balance?.value ?? 0) * 1000) / Number(ramPrice.value)
                );
            }
        }

        function prettyBuyLimit() {
            if (buyOption.value === buyOptions[0]) {
                return buyLimit();
            } else {
                return buyLimit().toFixed(0);
            }
        }

        watch(buyOption, () => {
            buyAmount.value = '0';
        });

        return {
            openTransaction,
            buyAmount,
            transactionId,
            transactionError,
            ramAvailable,
            accountData,
            receivingAccount,
            symbol,
            buyOption,
            buyPreview,
            formatDec,
            buy,
            buyLimit,
            prettyBuyLimit,
            isValidAccount,
        };
    },
    computed: {
        inputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val < this.buyLimit() || 'Not enough funds',
            ];
        },
        disableCta(): boolean {
            return +this.buyAmount === 0 || +this.buyAmount > this.buyLimit();
        },
    },
});
</script>

<template>

<div class="staking-form">
    <q-card-section class="text-grey-3">
        <div class="row q-col-gutter-md">
            <div class="text-weight-bold text-right text-grey-3">Buy in {{symbol}} or Bytes?</div>
        </div>
        <div class="row q-col-gutter-md q-pb-md">
            <q-radio
                v-model="buyOption"
                dark
                color="white"
                :val="symbol"
                :label="symbol"
            />
            <q-radio
                v-model="buyOption"
                dark
                color="white"
                val="Bytes"
                label="Bytes"
            />
        </div>
        <div class="row">
            <div class="col-12">
                <div class="row justify-between q-pb-sm">RAM Receiver:
                    <q-space/>
                    <div class="text-grey-3">Defaults to connected account</div>
                </div>
                <q-input
                    v-model="receivingAccount"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    dense
                    dark
                    :lazy-rules="true"
                    :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]"
                />
            </div>
        </div>
        <div class="row q-mb-md">
            <div class="row q-pb-sm full-width">
                <div class="col-6">{{ `Amount of RAM to buy in ` + buyOption}}</div>
                <div class="col-6 text-right">
                    <span class="text-weight-bold">{{ `${prettyBuyLimit()} AVAILABLE` }}</span>
                </div>
            </div>
            <q-input
                v-model="buyAmount"
                class="full-width"
                standout="bg-deep-purple-2 text-white"
                placeholder="0"
                :lazy-rules="true"
                :rules="inputRules"
                type="text"
                dense
                dark
                @blur="formatDec"
            />
        </div>
        <div class="row q-pb-sm">
            <div class="text-weight-normal text-right text-grey-3">≈ {{buyPreview}}</div>
        </div>
        <div class="row">
            <q-btn
                class="full-width button-accent"
                label="Buy"
                flat
                :disable="disableCta"
                @click="buy"
            />
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
</style>
