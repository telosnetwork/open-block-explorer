<script lang="ts">
import {
    defineComponent,
    computed,
    ref,
    PropType,
    toRef,
    onMounted,
} from 'vue';
import { useStore } from 'src/store';
import { Action, TransferData } from 'src/types';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';

export default defineComponent({
    name: 'ActionFormat',
    components: { AccountFormat },
    props: {
        action: {
            type: Object as PropType<Action>,
            required: true,
        },
        showTransferLabel: {
            // show/hide send/receive label for transfers
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const store = useStore();
        const account = computed((): string => store.state.account.accountName);
        const divClass = ref<string>('');
        const divContent = ref<string>('');
        const tx = toRef(props, 'action');
        const showLabel = toRef(props, 'showTransferLabel');

        onMounted(() => {
            const data = tx.value.act.data as TransferData;
            if (showLabel.value && data.from === account.value) {
                divContent.value = 'SEND';
            } else if (showLabel.value && data.to === account.value) {
                divContent.value = 'RECEIVE';
            }
        });

        return {
            divClass,
            divContent,
            tx,
        };
    },
});
</script>

<template lang="pug">
.action-container
    div(class="action action-general")
      AccountFormat(:account="tx.act.account" type="account")
      span.inline &nbsp; → &nbsp;
      span.text-no-wrap {{tx.act.name}}
    div.action.action-transfer(v-if="divContent") {{ divContent }}
</template>

<style lang="sass" scoped>
.action-container
    display: flex
    justify-content: flex-start
    align-items: center
    gap: 8px

.action
  padding: 0 0.5rem
  &.action-transfer
    background: rgba(196, 196, 196, 0.3)
    font-weight: bold
  &.action-general
    border: 0.1rem solid rgba(196, 196, 196, 0.3)
</style>
