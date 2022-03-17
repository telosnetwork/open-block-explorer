<template lang="pug">
q-dialog.dialogContainer( v-model="openCoinDialog")
  q-card.dialogCard
    .dialogHeader
      .row.justify-between.items-center.q-pt-sm-center
        .text-h6.q-pl-md Select a token
        .q-pr-sm
          q-btn(size="12px" flat dense round icon="clear" v-close-popup @click="callback")
      .row
        .col-12.q-pa-sm
          q-input( v-model="search" @input="filterTokens()" outlined dark round placeholder="Search contract name or symbol" )
    q-seperator
    q-list.dialogList
      q-item(v-for="token in availableTokens"
        :key="`${token.chain}-${token.contract}-${token.symbol}`"
        clickable
        v-close-popup
        @click="updateSelectedCoin(token); callback();")
        q-item-section
          q-item-label {{ token.symbol }}
          q-item-label {{ token.contract }}
        q-item-section
          q-item-label {{ token.amount }}
      q-item(v-if="availableTokens.length == 0") No tokens found

</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Token } from 'src/types';

export default defineComponent({
  name: 'SendDialog',
  props: {
    openCoinDialog: {
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
    },
    updateSelectedCoin: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      search: '',
      filteredTokens: new Array<Token>()
    };
  },
  methods: {
    filterTokens() {
      console.log('hello');
      if (this.search.length > 0) {
        this.filterByText(this.availableTokens);
      } else this.filteredTokens = this.availableTokens;
    },
    filterByText(tokens: Token[]) {
      this.filteredTokens = tokens.filter((token) => {
        return (
          token.symbol.toLowerCase().includes(this.search.toLowerCase()) ||
          token.contract.toLowerCase().includes(this.search.toLowerCase())
        );
      });
      console.log(this.filteredTokens);
    }
  }
});
</script>

<style lang="sass" scoped>
.dialogCard
  flex: 0 1 350px
  height: 80vh

.greyItem
  background: rgba($grey-4, 20%)

.addToken
  //   color: $primary;
  text-decoration: underline
  cursor: pointer

.addBtn
  color: white
  background-image: linear-gradient(to right, $deep-purple-2 20%, $light-blue-6 80% )

  &:hover
    background-image: linear-gradient(to left, $deep-purple-2 20%, $light-blue-6 80%)

.dialogCard
  background: radial-gradient(circle at 48% 100%, rgba(108, 35, 255, 1) 0%, rgba(84, 0, 253, 1) 20%, rgba(2, 27, 100, 1) 92%)
  color: white

  // Hide scrollbar for Chrome, Safari and Opera
  &::-webkit-scrollbar
    display: none

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none // IE and Edge
  scrollbar-width: none // Firefox

.dialogHeader
  position: sticky
  position: -webkit-sticky
  top: 0
  z-index: 1
  background: inherit

.dialogList
  z-index: -1
</style>
