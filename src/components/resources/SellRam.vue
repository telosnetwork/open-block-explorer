<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { formatCurrency } from 'src/utils/string-utils';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

export default defineComponent({
    name: 'SellRam',
    components: {
        ViewTransaction,
    },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        const chain = getChain();
        let openTransaction = ref<boolean>(false);
        const sellAmount = ref('');
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const transactionId = computed(() => accountStore.TransactionId);
        const transactionError = computed(() => accountStore.TransactionError);
        const ramPrice = computed((): string => chainStore.ram_price);
        const sellPreview = computed(
            () => formatCurrency((Number(sellAmount.value) / 1000) * Number(ramPrice.value), 4, symbol.value),
        );
        const ramAvailable = computed(() => Number(accountStore.data.ram_quota.value) - Number(accountStore.data.ram_usage.value));
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);

        function formatDec() {
            sellAmount.value = parseInt(sellAmount.value)
                .toString()
                .replace(/[^0-9.]/g, '');
        }
        async function sell() {
            void accountStore.resetTransaction();
            if (
                sellAmount.value === '0' ||
                !ramAvailable.value ||
                Number(sellAmount.value) > ramAvailable.value
            ) {
                return;
            }
            await accountStore.sellRam({
                amount: sellAmount.value,
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        return {
            openTransaction,
            sellAmount,
            transactionId,
            transactionError,
            ramAvailable,
            accountData,
            symbol,
            sellPreview,
            formatDec,
            sell,
        };
    },
    computed: {
        inputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val <= this.ramAvailable || 'Not enough RAM',
            ];
        },
        disableCta(): boolean {
            return +this.sellAmount === 0 || +this.sellAmount > this.ramAvailable;
        },
    },
});
</script>

<template>

<div class="staking-form">
    <q-card-section class="text-grey-3">
        <div class="row">
            <div class="row q-pb-sm full-width">
                <div class="col-6">{{ `Amount of RAM to sell in Bytes` }}</div>
                <div class="col-6">
                    <div class="color-grey-3 flex justify-end items-center" @click="sellAmount = ramAvailable.toString()"><span class="text-weight-bold balance-amount">{{ `${ramAvailable} AVAILABLE` }}</span>
                        <q-icon class="q-ml-xs" name="info"/>
                        <q-tooltip>Click to fill full amount</q-tooltip>
                    </div>
                </div>
            </div>
            <q-input
                v-model="sellAmount"
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
            <div class="text-weight-normal text-right text-grey-3">≈ {{sellPreview}}</div>
        </div>
        <div class="row">
            <q-btn
                class="full-width button-accent"
                label="Sell"
                flat
                :disable="disableCta"
                @click="sell"
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

.balance-amount:hover
  color: $primary
  cursor: pointer
</style>
