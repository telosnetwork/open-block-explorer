<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { isValidAccount } from 'src/utils/stringValidator';
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
          ((Number(buyAmount.value) / 1000) * Number(ramPrice.value)).toFixed(
            4,
          ) +
          ' ' +
          buyOptions[0]
        );
      }
    });
    const transactionError = computed(
      () => store.state.account.TransactionError,
    );
    const ramPrice = computed((): string => {
      return store.state?.chain.ram_price;
    });
    const ramAvailable = computed(() =>
      UInt64.sub(
        store.state.account.data.ram_quota,
        store.state.account.data.ram_usage,
      ),
    );
    const accountData = computed((): API.v1.AccountObject => {
      return store.state?.account.data;
    });

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
      } else if (buyAmount.value != '') {
        buyAmount.value = parseInt(buyAmount.value)
          .toString()
          .replace(/[^0-9.]/g, '');
      }
    }

    async function buy() {
      void store.dispatch('account/resetTransaction');
      if (buyOption.value === buyOptions[0]) {
        if (
          buyAmount.value === '0.0000' ||
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

      if (localStorage.getItem('autoLogin') !== 'cleos') {
        openTransaction.value = true;
      }
    }

    function buyLimit(): number {
      if (buyOption.value === buyOptions[0]) {
        return accountData.value.core_liquid_balance.value;
      } else {
        return (
          (Number(accountData.value.core_liquid_balance.value) * 1000) /
          Number(ramPrice.value)
        );
      }
    }

    watch(buyOption, (newVal) => {
      if (newVal === buyOptions[0]) {
        buyAmount.value = '0.0000';
      } else {
        buyAmount.value = '0';
      }
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
      isValidAccount,
    };
  },
});
</script>

<template lang="pug">
.staking-form
  q-card-section.text-grey-3
    .row.q-col-gutter-md
      .text-weight-bold.text-right.text-grey-3 Buy in {{symbol}} or Bytes?
    .row.q-col-gutter-md.q-pb-md
      q-radio(v-model="buyOption" dark color="white" :val="symbol" :label="symbol")
      q-radio(v-model="buyOption" dark color="white" val="Bytes" label="Bytes")
    .row
      .col-12
        .row.justify-between.q-pb-sm RAM Receiver:
          q-space
          .text-grey-3 Defaults to connected account
        q-input.full-width(standout="bg-deep-purple-2 text-white" dense dark v-model="receivingAccount" :lazy-rules='true' :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]" )
    .row
      .row.q-pb-sm.full-width
        .col-12 {{ `Amount of RAM to buy in ` + buyOption}}
      q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="buyAmount" :lazy-rules='true' :rules="[ val => val >= 0 && val <= buyLimit() && val != '' || 'Invalid amount.' ]" type="text" dense dark)
    .row.q-pb-sm
      .text-weight-normal.text-right.text-grey-3 ≈ {{buyPreview}}
    .row
      q-btn.full-width.button-accent(label="Buy" flat @click="buy" )
    ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style scoped lang="sass">
.button-accent
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  color: $grey-4
.grey-3
  color: $grey-3
</style>
