<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Token } from 'src/types';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'TokensPanel',
  // components: {
  // },
  props: {
    account: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      expanded: [],
      tokens: []
    };
  },
  async mounted() {
    await this.loadTokens();
  },
  // computed: {
  // },
  methods: {
    async loadTokens(): Promise<void> {
      // TODO Refactor redundant getTokens in AccountCard
      const tokenList = await this.$api.getTokens(this.account);
      // console.log(tokenList);
      this.tokens = tokenList.map(
        (token) =>
          ({
            symbol: token.symbol,
            precision: token.precision,
            amount: token.amount,
            contract: this.formatAccount(token.contract, 'account')
          } as Token)
      );
      this.tokens = this.tokens.filter((token) => token.amount !== null);
      // console.log(this.tokens);
    },
    // TODO Refactor duplicate function in TransactionsTable
    formatAccount(
      name: string,
      type: 'account' | 'transaction' | 'block'
    ): string {
      return `<a href="/${type}/${name}" class="hover-dec">${name}</a>`;
    }
  }
});
</script>
<template lang="pug">
div.row.col-12.q-my-xs.justify-center.text-left
    div.row.col-11
        div.row.col-12.q-mt-lg
            div
                p.panel-title Tokens 
            q-space
        q-separator.row.col-12.q-mt-md.separator
        div.col-12.q-mt-md.tokens-container
          div(v-if="tokens.length == 0") No tokens found
          q-card(v-for="token in tokens" :key="`${token.contract}-${token.symbol}`").token-card
            q-item 
              q-item-section(avatar).items-center
                q-avatar(color="white" size="2.8rem").shadow-3
                  q-avatar(size="1.2em")
                    img(src="~src/assets/token_placeholder.svg")
              q-item-section
                div(v-html="token.contract")
                div.text-bold {{`${token.amount} ${token.symbol}`}}
                div ≈ $0.00  
                // TODO Get USD value from oracle
</template>
<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  color: $dark
  &:hover
    text-decoration: underline

.tokens-container
  display: grid
  grid-gap: 2rem
  align-items: stretch
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))
  grid-template-rows: min-content

.token-card
  background: rgba(138, 101, 212, 0.1)
  border-radius: .2rem
  box-shadow: none
  padding: 0.5rem 0
  max-width: 260px
</style>
