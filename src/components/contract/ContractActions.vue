<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';

export default defineComponent({
    name: 'ContractActions',
    components: { ViewTransaction },
    setup() {
        const memo = ref<Record<string, unknown>>({});
        const permission = ref<string>('');
        const store = useStore();
        const actor = ref('');
        const openTransaction = ref<boolean>(false);
        const transactionId = ref<string>(store.state.account.TransactionId);
        const transactionError = ref<unknown>(store.state.account.TransactionError);
        const actions = computed(() =>
            store.state.account.abi.abi.actions.map((a) => a.name),
        );
        const action = ref<string>(actions.value[0]);
        const fields = computed(
            () =>
                store.state.account.abi.abi.structs.find((s) => s.name === action.value)
                    .fields,
        );

        async function signAction() {
            await store.dispatch('account/pushTransaction', {
                action: action.value,
                actor: actor.value,
                permission: permission.value,
                data: memo.value,
            });
            openTransaction.value = true;
        }

        function formatMemo() {
            for (var key in memo.value) {
                const field = fields.value.find((val) => val.name == key);
                if (field.type === 'bool') {
                    if (
                        memo.value[key] === 'true' ||
            memo.value[key] === '1' ||
            memo.value[key] === 'True' ||
            memo.value[key] === 'T' ||
            memo.value[key] === 't'
                    )
                        memo.value[key] = true;
                    else memo.value[key] = false;
                }
            }
        }

        onMounted(async () => {
            actor.value = await store.state.account.user.getAccountName();
            permission.value = store.state.account.accountPermission;
        });

        return {
            action,
            actions,
            fields,
            memo,
            signAction,
            actor,
            permission,
            openTransaction,
            transactionId,
            transactionError,
            formatMemo,
        };
    },
});
</script>

<template lang="pug">
q-card(
  flat
  style="background: #f4f0fb"
)
  q-card-section.q-pl-md(style="background: #eae2f7")
    div.q-pb-sm.text-subtitle2.text-bold Select action
    .row.justify-content.full-width
      .col-xs-8.col-sm-10
        q-select(outlined dense v-model="action" :options="actions" color="primary" style="background: #ffffff")
      .col-xs-4.col-sm-2.q-pl-md
        q-btn.full-width( unelevated color="primary" label="Push transaction" size="15px" @click="signAction")

  q-card-section.q-pt-none
    .row.q-py-md.q-col-gutter-md
      .col-xs-6.col-sm-3(v-for="field in fields" :key="field.name")
        .text-bold.q-pb-sm {{field.name}}
        q-input(outlined dense @blur="formatMemo" v-model="memo[field.name]" :placeholder="field.type" style="background: #ffffff")
      .col-xs-6.col-sm-3
        .text-bold.q-pb-sm actor
        q-input(outlined v-model="actor" dense style="background: #ffffff")
      .col-xs-6.col-sm-3
        .text-bold.q-pb-sm permission
        q-input(outlined v-model="permission" dense style="background: #ffffff")

ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style lang="sass"></style>
