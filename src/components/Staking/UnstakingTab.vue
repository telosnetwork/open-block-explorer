<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';

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
            if (
                unstakeTokens.value === '0.0000' ||
        !rexbal.value.vote_stake ||
        Number(unstakeTokens.value) >=
          Number(rexbal.value.vote_stake.split(' ')[0])
            ) {
                return;
            }
            await store.dispatch('account/unstakeRex', {
                amount: unstakeTokens.value,
            });
            openTransaction.value = true;
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

        function setMaxValue() {
            unstakeTokens.value = assetToAmount(maturedRex.value).toString();
            void formatDec();
        }

        return {
            openTransaction,
            unstakeTokens,
            transactionId,
            transactionError,
            formatDec,
            unstake,
            assetToAmount,
            accountData,
            rexInfo,
            rexbal,
            maturedRex,
            symbol,
            setMaxValue,
        };
    },
});
</script>

<template lang="pug">
.staking-form
  q-card-section
    .row.q-col-gutter-md
      .col-12
        .row
          .row.q-pb-sm.full-width
            .col-8 {{ `MATURED ${symbol}` }}
            .col-4
              .row.items-center.justify-end.q-hoverable.cursor-pointer(@click='setMaxValue')
                .text-weight-bold.text-right.balance-amount {{maturedRex}}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Click to fill full amount
          q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="unstakeTokens" :lazy-rules='true' :rules="[ val => val >= 0  && val <= assetToAmount(maturedRex)  || 'Invalid amount.' ]" type="text" dense dark)
        .row
          q-btn.full-width.button-accent(:label='"Unstake " + symbol' flat @click="unstake" )
    ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

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
