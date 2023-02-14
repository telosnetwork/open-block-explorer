<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  PropType,
  toRef,
  onMounted
} from 'vue';
import { useStore } from 'src/store';
import { Action, TransferData } from 'src/types';
import AccountFormat from 'src/components/Transaction/AccountFormat.vue';

export default defineComponent({
  name: 'ActionFormat',
  components: { AccountFormat },
  props: {
    action: {
      type: Object as PropType<Action>,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const account = computed((): string => store.state.account.accountName);
    const divClass = ref<string>('');
    const divContent = ref<string>('');
    const tx = toRef(props, 'action');

    onMounted(() => {
      const data = tx.value.act.data as TransferData;
      if (data.from === account.value) {
        divContent.value = 'SEND';
        divClass.value = 'action-transfer';
      } else if (data.to === account.value) {
        divContent.value = 'RECEIVE';
        divClass.value = 'action-transfer';
      } else {
        divContent.value = 'TRANSFER';
        divClass.value = 'action-transfer';
      }
    });

    return {
      divClass,
      divContent,
      tx
    };
  }
});
</script>

<template lang="pug">
div(:class="'action '+ divClass" v-if="tx.act.name === 'transfer'") {{divContent}}
div(v-else class="action action-general")
  AccountFormat(:account="tx.act.account" type="account")
  span.inline &nbsp; → &nbsp;
  span.text-no-wrap {{tx.act.name}}
</template>

<style lang="sass" scoped>
.action
  // margin: 0.5rem 0
  padding: 0 0.5rem
  &.action-transfer
    background: rgba(196, 196, 196, 0.3)
    font-weight: bold
  &.action-general
    border: 0.1rem solid rgba(196, 196, 196, 0.3)
</style>
