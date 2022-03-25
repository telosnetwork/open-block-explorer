<template lang="pug">
q-dialog( v-model="openSendDialog" no-backdrop-dismiss @show='setDefaults' @hide='resetForm')
  q-card.sendCard
    .row.justify-center.items-center.full-height.full-width
      .absolute-top-right
        q-btn(size="20px" flat dense round icon="clear" v-close-popup @click="callback")
      .col-xs-12.col-sm-8.col-md-7.col-lg-6
        .row
          q-card-section 
            img.send-img.q-pr-md( src="~assets/send.svg")
            .text-h4.q-pb-md.inline-block.color-grey-3 Send Tokens
        q-card-section(v-if='transactionId')
          .row
            .col-12 
              .row You successfully sent {{ sendAmount }} {{ sendToken.symbol }} to {{ recievingAccount }}.
              .row.ellipsis-overflow(@click='navToTransaction') Click to view transaction: {{ transactionId }}            
        q-card-section(v-if='transactionError')
          .row
            .col-12 
              .row Transaction Failed: {{ transactionError }}
        q-separator(dark v-if='transactionForm')
        q-card-section(v-if='transactionForm')
          .row
            .col-12
              .row.justify-between.q-px-sm.q-pb-sm.q-gutter-x-sm RECIEVING ACCOUNT
              q-input.full-width(standout dense dark v-model="recievingAccount"  )
          .row.q-py-md
            .col-4
              .row.justify-between.q-px-sm.q-pb-sm.q-gutter-x-sm TOKEN
              .row.items-center.no-wrap.selectorContainer.q-py-sm(@click="toggleCoinDialog")
                .col-8.text-subtitle-1.q-mx-sm.subtitle {{ sendToken.symbol}}
                .col-4
                  .row.justify-end.items-center.arrowButton
                    q-icon.fas.fa-chevron-down.q-pr-lg(size="17px")

            .col-8.q-pl-md
              .row.justify-between.q-pb-sm.q-gutter-x-sm 
                div AMOUNT
                q-space
                .color-grey-3 {{sendToken.amount}} AVAILABLE
              q-input.full-width(standout="bg-deep-purple-2 text-white" v-model.number="sendAmount" type="number" dense dark)
          .row
            .col-12
              .row.justify-between.q-px-sm.q-pb-sm.q-gutter-x-sm OPTIONAL MEMO
              .row
                q-input.full-width.send-input(standout="bg-deep-purple-2 text-white" v-model="memo" dark type="textarea")
          .row
            .col-12.q-pt-md
              .row.justify-between.q-px-sm.q-pb-lg.q-gutter-x-sm Your wallet must be open to allow authorization of this transaction.
              q-btn.full-width.button-accent(label="Confirm" flat v-close-popup @click="sendTransaction" )
    CoinSelectorDialog(:updateSelectedCoin="updateSelectedCoin" :openCoinDialog="openCoinDialog" :callback="toggleCoinDialog" :availableTokens="availableTokens")

</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import CoinSelectorDialog from 'src/components/CoinSelectorDialog.vue';
import { Token } from 'src/types';
import { mapActions, mapGetters } from 'vuex';

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
      transactionError: null
    };
  },
  props: {
    openSendDialog: {
      type: Boolean,
      required: true
    },
    callback: {
      type: Function,
      required: true
    },
    availableTokens: {
      type: Array as PropType<Token[]>,
      required: true
    }
  },
  setup() {
    return {
      openCoinDialog: ref<boolean>(false),
      recievingAccount: ref<string>(''),
      sendAmount: ref<number>(0),
      memo: ref<string>(''),
      ...mapActions({ signTransaction: 'account/sendTransaction' })
    };
  },
  computed: {
    ...mapGetters({ account: 'account/accountName' }),
    transactionForm(): boolean {
      return !(this.transactionError || this.transactionId);
    }
  },
  methods: {
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
      }
    },
    setDefaults() {
      if (this.availableTokens.length > 0) {
        this.sendToken = this.availableTokens.find((token) => {
          return token.symbol === this.sendToken.symbol;
        });
      }
    },
    toggleCoinDialog(): void {
      this.openCoinDialog = !this.openCoinDialog;
    },
    updateSelectedCoin(token: Token): void {
      this.sendToken = token;
    },
    resetForm() {
      this.transactionId = null;
      this.transactionError = null;
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
    }
  }
});
</script>

<style lang="sass" scoped>
$medium:750px

.ellipsis-overflow
  cursor: pointer
  white-space: nowrap
  text-overflow: ellipsis
  display: block
  overflow: hidden

.q-markup-table
  width: 100%
  th,td
    padding: unset

.account-card
  color: white
  font-size: 36px
  max-width: 100%
  background: unset

  .q-table tbody td
    font-size: 12px
    &.total-label, &.total-value
      color: white
      font-size: 14px
    &.total-amount
      font-size: 20px

  .q-table__card
    background: unset
    color: $black-5

  .q-table--horizontal-separator
    thead th
      border-bottom: 1px solid $black-13
    tbody tr:not(:last-child) td
      border-bottom: none

  .q-table thead tr, .q-table tbody td
    height: 36px

    &.total-row
      height: 48px

.table-body
  width: 100%
  display: table
  tr
    border-width: 0

.inline-section
  width:100%
  display: inline-block

.resources
  text-align: center
  width: 18rem
  margin: 1rem auto 0 auto

.resource
  margin-right: 2rem

.text-right
  font-weight: bold

.text-title, .text-subtitle
  display: flex
  align-items: center
  justify-content: center

.text-subtitle
  text-transform: uppercase
  color: $black-5
  font-size: 12px
  a
    cursor: pointer
    text-decoration: underline

.total-amount
  color: white
  font-size: 20px
  font-family: Silka
  font-weight: normal

.total-value
  font-family: Silka
  font-weight: normal

@media screen and (max-width: $medium) // screen < $medium
  .account-card
    width: 100%
    padding: unset
    margin-top: unset
    height: 100%
    border-radius: unset

  .q-markup-table
    overflow: unset
    width: unset
    margin-right: .5rem
    margin-left: .5rem

  .resources
    float: unset

  .inline-section
    width: 100%

.total-row
  a
    cursor: pointer
    text-decoration: underline
    color: white
    font-size: 16px
    font-family: Silka
    font-weight: normal

.sendCard
  width: 1000px !important
  max-width: 80vw !important
  height: 800px !important
  max-height: 80vh !important
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

.selectorContainer
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
