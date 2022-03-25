<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Action, NewAccountData } from 'src/types';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ChildrenPanel',
  components: {},
  props: {
    account: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      children: []
    };
  },
  async mounted() {
    await this.loadAccountData();
  },
  methods: {
    async loadAccountData(): Promise<void> {
      let data: Action[];
      try {
        data = await this.$api.getChildren(this.account);
        // console.log(data);
      } catch (e) {
        this.$q.notify(`Keys for account ${this.account} not found!`);
        return;
      }
      this.children = data.map((el) =>
        this.formatAccount((el.act.data as NewAccountData).newact, 'account')
      );
      // console.log(this.children);
    },
    // TODO Refactor
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
              p.panel-title Children
          q-space
      q-separator.row.col-12.q-mt-md.separator
      div.col-12.q-py-lg.row
        div( v-for="child in children" :key="child" v-html="child").child

</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  color: $dark
  &:hover
    text-decoration: underline

.child
  flex-basis: 10em
  flex-shrink: 0
  line-height: 2em
</style>
