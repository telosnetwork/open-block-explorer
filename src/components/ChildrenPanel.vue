<script lang="ts">
import { useQuasar } from 'quasar';
import { api } from 'src/api';
import { Action, NewAccountData } from 'src/types';
import { defineComponent, onMounted, ref } from 'vue';
export default defineComponent({
  name: 'ChildrenPanel',
  components: {},
  props: {
    account: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const children = ref<string[]>([]);

    const loadAccountData = async (): Promise<void> => {
      let data: Action[];
      try {
        data = await api.getChildren(props.account);
      } catch (e) {
        $q.notify(`Keys for account ${props.account} not found!`);
        return;
      }
      children.value = data.map((el) =>
        formatAccount((el.act.data as NewAccountData).newact, 'account'),
      );
    };
    // TODO Refactor
    const formatAccount = (
      name: string,
      type: 'account' | 'transaction' | 'block',
    ): string => {
      return `<a href="/${type}/${name}" class="hover-dec">${name}</a>`;
    };

    onMounted(async () => {
      await loadAccountData();
    });
    return {
      children,
      loadAccountData,
    };
  },
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
  color: var(--q-dark)
  &:hover
    text-decoration: underline

.child
  flex-basis: 10em
  flex-shrink: 0
  line-height: 2em
</style>
