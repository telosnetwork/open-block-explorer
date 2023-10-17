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
    <div class="items-center q-pa-xs action action-general row">
        <AccountFormat :account="tx.act.account" type="account"/><span class="inline">&nbsp; → &nbsp;</span><span>{{tx.act.name}}</span>
    </div>
    <div v-if="divContent" class="action action-transfer">{{ divContent }}</div>
</div>

</template>

<style lang="scss" >
.action-container{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
}

.action{
  &.action-transfer{
    background: rgba(196, 196, 196, 0.3);
    font-weight: bold;
  }

  &.action-general{
    border: 0.1rem solid rgba(196, 196, 196, 0.3);
  }
}
</style>
