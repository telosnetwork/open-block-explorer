<script lang="ts">
import {
    defineComponent,
    ref,
    PropType,
    toRef,
    onMounted,
} from 'vue';
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
        account: {
            type: String || null,
            required: false,
            default: null,
        },
    },
    setup(props) {
        const divClass = ref<string>('');
        const divContent = ref<string>('');
        const tx = toRef(props, 'action');
        const showLabel = toRef(props, 'showTransferLabel');
        const account = toRef(props, 'account');

        onMounted(() => {
            const data = tx.value.act.data as TransferData;
            const isTransfer = tx.value.act.name === 'transfer';

            if (showLabel.value && account.value && isTransfer) {
                if (data.from === account.value) {
                    divContent.value = 'SEND';
                } else if (data.to === account.value) {
                    divContent.value = 'RECEIVE';
                }
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

<template>
<div class="action-container">
    <div class="action action-general">
        <AccountFormat :account="tx.act.account" type="account"/><span class="inline">&nbsp; → &nbsp;</span><span class="text-no-wrap">{{tx.act.name}}</span>
    </div>
    <div v-if="divContent" class="action action-transfer">{{ divContent }}</div>
</div>

</template>

<style  scoped>
.action-container{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
}

.action{
  padding: 0 0.5rem;
  white-space: nowrap;
}

.action.action-transfer{
    background: rgba(196, 196, 196, 0.3);
    font-weight: bold;
}

.action.action-general{
    border: 0.1rem solid rgba(196, 196, 196, 0.3);
}
</style>
