<script lang="ts">
import { computed, defineComponent, PropType, ref, toRef } from 'vue';
import CoinSelectorDialog from 'src/components/CoinSelectorDialog.vue';
import { Token } from 'src/types';
import { isValidAccount } from 'src/utils/stringValidator';
import { getChain } from 'src/config/ConfigManager';
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';
import { mapActions } from 'vuex';

const chain = getChain();

export default defineComponent({
  name: 'SendDialog',
  components: {
    CoinSelectorDialog
  },
  props: {
    availableTokens: {
      type: Array as PropType<Token[]>,
      required: true
    }
  },
  emits: ['update-token-balances'],
  setup(props, context) {
    const store = useStore();
    const router = useRouter();
    const sendToken = ref<Token>(chain.getSystemToken());
    const availableTokens = toRef(props, 'availableTokens');
    const sendDialog = ref<boolean>(false);
    const openCoinDialog = ref<boolean>(false);
    const recievingAccount = ref<string>('');
    const sendAmount = ref<string>('');
    const memo = ref<string>('');

    const account = computed(() => store.state.account.accountName);
    const transactionId = computed(
      (): string => store.state.account.TransactionId
    );
    const transactionError = computed(
      () => store.state.account.TransactionError
    );
    const transactionForm = computed(
      () => !(transactionError.value || transactionId.value)
    );
    const validated = computed(
      () =>
        parseFloat(sendAmount.value) > 0 && recievingAccount.value.length > 0
    );

    const sendTransaction = async (): Promise<void> => {
      void store.dispatch('account/resetTransaction');
      const actionAccount = sendToken.value.contract;
      const data = {
        from: account.value,
        to: recievingAccount.value,
        quantity: `${sendAmount.value} ${sendToken.value.symbol}`,
        memo: memo.value
      };
      await store.dispatch('account/sendTransaction', {
        account: actionAccount,
        data,
        name: 'transfer'
      });
      context.emit('update-token-balances');
    };

    const setDefaults = () => {
      void store.dispatch('account/resetTransaction');
      if (availableTokens.value.length > 0) {
        sendToken.value = availableTokens.value.find((token) => {
          return (
            token.symbol === sendToken.value.symbol &&
            token.contract === sendToken.value.contract
          );
        });
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
        contract: 'eosio.token'
      };
    };

    const navToTransaction = async () => {
      await router.push({
        name: 'transaction',
        params: { transaction: transactionId.value }
      });
      router.go(0);
      void store.dispatch('account/resetTransaction');
    };

    const formatDec = () => {
      let amount = Number(sendAmount.value);
      if (sendAmount.value != '') {
        sendAmount.value = amount
          .toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: sendToken.value.precision,
            minimumFractionDigits: sendToken.value.precision
          })
          .replace(/,/g, '');
      }
      sendAmount.value = sendAmount.value.replace(/[^0-9.]/g, '');
    };

    const setMaxValue = () => {
      sendAmount.value = (sendToken.value.amount - 0.1).toString();
      void formatDec();
    };

    return {
      sendToken,
      transactionId,
      transactionError,
      sendDialog,
      openCoinDialog,
      recievingAccount,
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
      ...mapActions({ signTransaction: 'account/sendTransaction' })
    };
  }
});
</script>

<template lang="pug">
q-dialog( @show='setDefaults' :persistent='true' @hide='resetForm' maximized)
  q-card.sendCard
    .row.justify-center.items-center.full-height.full-width
      .absolute-top-right
        q-btn(size="20px" flat dense round icon="clear" v-close-popup)
      .col-xs-12.col-sm-8.col-md-7.col-lg-6.maxSize
        .row
          q-card-section
            img.send-img.q-pr-md( src="~assets/send.svg")
            .text-h4.q-pb-md.inline-block.color-grey-3 Send Tokens

        .transaction-form(v-if='transactionForm').text-grey-3.text-weight-light
          q-separator(dark v-if='transactionForm')
          q-card-section(v-if='transactionForm')
            .row
              .col-12
                .row.justify-between.q-px-sm.q-pb-sm.q-gutter-x-sm RECIEVING ACCOUNT
                q-input.full-width(standout dense dark v-model="recievingAccount" :lazy-rules='true' :rules="[ val => isValidAccount(val) || 'Invalid account name.' ]" )
            .row.q-py-md
              .col-4
                .row.justify-between.q-px-sm.q-pb-sm.q-gutter-x-sm TOKEN
                .row.items-center.no-wrap.selector-container.q-py-sm(@click="openCoinDialog = true" )
                  .col-8.text-subtitle-1.q-mx-sm.subtitle {{ sendToken?.symbol}}
                  .col-4
                    .row.justify-end.items-center.arrowButton
                      q-icon.fas.fa-chevron-down.q-pr-lg(size="17px")

              .col-8.q-pl-md
                .row.justify-between.q-pb-sm.q-gutter-x-sm
                  div AMOUNT
                  q-space
                  .row.flex-center.q-hoverable.cursor-pointer(@click='setMaxValue')
                    .color-grey-3.text-weight-bold.balance-amount {{ sendToken?.amount ? `${sendToken.amount } AVAILABLE` : '--' }}
                    q-icon.q-ml-xs( name="info" )
                    q-tooltip Click to fill full amount
                q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0.0000' v-model="sendAmount" :debounce='1000' :rules='[val => val > 0 && val < sendToken?.amount || "invalid amount" ]' type="text" dense dark)
            .row
              .col-12
                .row.justify-between.q-px-sm.q-pb-sm.q-gutter-x-sm OPTIONAL MEMO
                .row
                  q-input.full-width.send-input(standout="bg-deep-purple-2 text-white" v-model="memo" dark type="textarea")
            .row
              .col-12.q-pt-md
                .row.justify-between.q-px-sm.q-pb-lg.q-gutter-x-sm Your wallet must be open to allow authorization of this transaction.
                q-btn.full-width.button-accent(label="Confirm" flat @click="sendTransaction" :disabled='!validated')
        .transaction-result(v-else)
          q-card-section(v-if='transactionId')
            .row
              .col-12
                .row You successfully sent {{ sendAmount }} {{ sendToken?.symbol }} to {{ recievingAccount }}.
                .row.ellipsis-overflow(@click='navToTransaction') Click to view transaction: {{ transactionId }}
          q-card-section(v-else)
            .row
              .col-12
                .row Transaction Failed: {{ transactionError }}
          q-btn.close-dialog( v-close-popup label='Close' @click='setDefaults')
    CoinSelectorDialog(:updateSelectedCoin="updateSelectedCoin" v-model="openCoinDialog" :availableTokens="availableTokens")
</template>

<style lang="sass" scoped>

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
