<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import CoinSelectorDialog from 'src/components/CoinSelectorDialog.vue';
import { Token } from 'src/types';
import { mapActions, mapGetters } from 'vuex';
import { isValidAccount } from 'src/utils/stringValidator';

export default defineComponent({
  name: 'SendDialog',
  components: {
    CoinSelectorDialog
  },
  data() {
    return {
      sendToken: {
        symbol: 'TLOS',
        precision: 4,
        amount: 0,
        contract: 'eosio.token'
      } as Token,
      transactionId: null,
      transactionError: null,
      sendDialog: false
    };
  },
  props: {
    availableTokens: {
      type: Array as PropType<Token[]>,
      required: true
    }
  },
  setup() {
    return {
      openCoinDialog: ref<boolean>(false),
      recievingAccount: ref<string>(''),
      sendAmount: ref<string>('0.0000'),
      memo: ref<string>(''),
      ...mapActions({ signTransaction: 'account/sendTransaction' })
    };
  },
  computed: {
    ...mapGetters({ account: 'account/accountName' }),
    transactionForm(): boolean {
      return !(this.transactionError || this.transactionId);
    },
    validated(): boolean {
      return (
        parseFloat(this.sendAmount) > 0 && this.recievingAccount.length > 0
      );
    }
  },
  methods: {
    isValidAccount,
    async sendTransaction(): Promise<void> {
      const actionAccount = this.sendToken.contract;
      const data = {
        from: this.account as string,
        to: this.recievingAccount,
        quantity: `${this.sendAmount} ${this.sendToken.symbol}`,
        memo: this.memo
      };
      const authenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const users = await authenticators[0].login();
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.transactionId = (
          await this.signTransaction({
            user: users[0],
            account: actionAccount,
            data
          })
        ).transactionId as string;
      } catch (e) {
        this.transactionError = e;
        this.resetForm();
      }
    },
    setDefaults() {
      this.transactionError = null;
      if (this.availableTokens.length > 0) {
        this.sendToken = this.availableTokens.find((token) => {
          return token.symbol === this.sendToken.symbol;
        });
      }
    },
    updateSelectedCoin(token: Token): void {
      this.sendToken = token;
    },
    resetForm() {
      this.transactionId = null;
      this.sendToken = {
        symbol: 'TLOS',
        precision: 4,
        amount: 0,
        contract: 'eosio.token'
      };
    },
    async navToTransaction() {
      await this.$router.push({
        name: 'transaction',
        params: { transaction: this.transactionId as string }
      });
      this.$router.go(0);
    },
    formatDec() {
      let amount = Number(this.sendAmount);
      this.sendAmount = amount.toLocaleString('en-US', {
        style: 'decimal',
        maximumFractionDigits: this.sendToken.precision,
        minimumFractionDigits: this.sendToken.precision
      });
      this.sendAmount = this.sendAmount.replace(/[^0-9.]/g, '');
    }
  }
});
</script>

<template lang="pug">
q-dialog( @show='setDefaults' :persistent='true' @hide='resetForm' maximized)
  q-card.sendCard
    .row.justify-center.items-center.full-height.full-width
      .absolute-top-right
        q-btn(size="20px" flat dense round icon="clear" v-close-popup)
      .col-xs-12.col-sm-8.col-md-7.col-lg-6
        .row
          q-card-section 
            img.send-img.q-pr-md( src="~assets/send.svg")
            .text-h4.q-pb-md.inline-block.color-grey-3 Send Tokens

        .transaction-form(v-if='transactionForm')
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
                  .col-8.text-subtitle-1.q-mx-sm.subtitle {{ sendToken.symbol}}
                  .col-4
                    .row.justify-end.items-center.arrowButton
                      q-icon.fas.fa-chevron-down.q-pr-lg(size="17px")

              .col-8.q-pl-md
                .row.justify-between.q-pb-sm.q-gutter-x-sm 
                  div AMOUNT
                  q-space
                  .color-grey-3 {{sendToken.amount}} AVAILABLE
                q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' v-model="sendAmount" :debounce='1000' :rules='[val => val > 0 && val < sendToken.amount || "invalid amount" ]' type="text" dense dark)
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
                .row You successfully sent {{ sendAmount }} {{ sendToken.symbol }} to {{ recievingAccount }}.
                .row.ellipsis-overflow(@click='navToTransaction') Click to view transaction: {{ transactionId }}            
          q-card-section(v-else)
            .row
              .col-12 
                .row Transaction Failed: {{ transactionError }}
          q-btn.close-dialog( v-close-popup label='Close')
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
  color: $dark
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
</style>
