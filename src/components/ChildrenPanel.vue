<script lang="ts">
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
      } catch (e) {
        this.$q.notify(`Keys for account ${this.account} not found!`);
        return;
      }
      this.children = data.map((el) =>
        this.formatAccount((el.act.data as NewAccountData).newact, 'account')
      );
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
div.row.col-12.q-mt-lg.q-mb-xs.q-px-xl.justify-center.text-left
  p.panel-title Children
  q-space
  q-separator.row.col-12.q-mt-md.separator
  div.col-12.q-py-lg.row
    div(v-if="children.length == 0 ") No children found
    .child( v-for="child in children" :key="child" v-html="child")

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
