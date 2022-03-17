<template lang="pug">
q-dialog( v-model="openSendDialog")
  q-card.sendCard
    .row.justify-center.items-center.full-height.full-width
      .col-xs-12.col-sm-8.col-md-7.col-lg-6
        .row
          q-card-section 
            q-icon.send-icon.rotate-315.q-py-sm(name="send" color="white" size="40px" )
            .text-h5.inline-block Send Tokens
        q-separator(dark)
        q-card-section 
          .row
            .col-12
              .row.justify-between.q-px-md.q-pb-sm.q-gutter-x-sm Recieving Account
              q-input.full-width(standout dense dark v-model="recievingAccount"  )
          .row.q-py-md
            .col-4
              .row.justify-between.q-px-md.q-pb-sm.q-gutter-x-sm Token
              .row.items-center.no-wrap.selectorContainer.q-py-sm(@click="toggleCoinDialog")
                .col-8.text-h6.q-mx-sm {{ sendToken.symbol}}
                .col-4
                  .row.justify-end.items-center.arrowButton
                    q-icon.fas.fa-chevron-down.q-pr-lg(size="17px")

            .col-8.q-pl-md
              .row.justify-between.q-px-md.q-pb-sm.q-gutter-x-sm 
                div Ammount
                q-space
                div {{sendToken.amount}} Available
              q-input.full-width(standout="bg-deep-purple-2 text-white" v-model.number="sendAmmount" type="number" dense dark)
          .row
            .col-12
              .row.justify-between.q-px-md.q-pb-sm.q-gutter-x-sm Optional memo
              q-input.full-width.send-input(standout="bg-deep-purple-2 text-white" v-model="memo" dark type="textarea")
          .row
            .col-12.q-pt-md
              .row.justify-between.q-px-md.q-pb-lg.q-gutter-x-sm Your wallet must be open to allow authorization of this transaction.
              q-btn.full-width.button-accent(label="Confirm" v-close-popup @click="callback" )
    CoinSelectorDialog(:updateSelectedCoin="updateSelectedCoin" :openCoinDialog="openCoinDialog" :callback="toggleCoinDialog" :availableTokens="availableTokens")

</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import CoinSelectorDialog from 'src/components/CoinSelectorDialog.vue';
import { Token } from 'src/types';

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
      } as Token
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
      required: true,
      type: Array as PropType<Token[]>
    }
  },
  setup() {
    return {
      openCoinDialog: ref<boolean>(false),
      recievingAccount: ref<string>(''),
      sendAmmount: ref<number>(0),
      memo: ref<string>('')
    };
  },
  mounted() {
    if (this.availableTokens.length > 0) {
      this.sendToken = this.availableTokens[0];
    }
  },
  methods: {
    toggleCoinDialog() {
      this.openCoinDialog = !this.openCoinDialog;
    },
    updateSelectedCoin(token: Token) {
      this.sendToken = token;
    }
  }
});
</script>

<style lang="sass" scoped>
$medium:750px

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
  color: $grey-4
  background: radial-gradient(circle at 48% 100%, rgba(108, 35, 255, 1) 0%, rgba(84, 0, 253, 1) 20%, rgba(2, 27, 100, 1) 92%)
  .send-icon
    padding-bottom: 30px
  .button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-1

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
    color: $grey-1

  .text-h6
    color: $grey-1
    font-weight: 600
    font-size: 1.1rem
</style>
