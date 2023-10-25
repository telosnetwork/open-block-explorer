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
            store.state.account.abi.abi.actions.map(a => a.name),
        );
        const action = ref<string>(actions.value[0]);
        const fields = computed(
            () =>
                store.state.account.abi.abi.structs.find(s => s.name === action.value)
                    .fields,
        );

        async function signAction() {
            await store.dispatch('account/sendAction', {
                name: action.value,
                actor: actor.value,
                permission: permission.value,
                data: memo.value,
            });
            openTransaction.value = true;
        }

        function formatMemo() {
            for (let key in memo.value) {
                const field = fields.value.find(val => val.name === key);
                if (field.type === 'bool') {
                    if (
                        memo.value[key] === 'true' ||
                        memo.value[key] === '1' ||
                        memo.value[key] === 'True' ||
                        memo.value[key] === 'T' ||
                        memo.value[key] === 't'
                    ) {
                        memo.value[key] = true;
                    } else {
                        memo.value[key] = false;
                    }
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

<template>

<q-card class="card--light-bg" flat>
    <q-card-section class="q-pl-md section--light-bg">
        <div class="q-pb-sm text-subtitle2 text-bold">Select action</div>
        <div class="row justify-content full-width">
            <div class="col-xs-8 col-sm-10">
                <q-select
                    v-model="action"
                    outlined
                    dense
                    :options="actions"
                    color="primary"
                />
            </div>
            <div class="col-xs-4 col-sm-2 q-pl-md">
                <q-btn
                    class="full-width"
                    unelevated
                    color="primary"
                    label="Push transaction"
                    size="15px"
                    @click="signAction"
                />
            </div>
        </div>
    </q-card-section>
    <q-card-section class="q-pt-none">
        <div class="row q-py-md q-col-gutter-md">
            <div v-for="field in fields" :key="field.name" class="col-xs-6 col-sm-3">
                <div class="text-bold q-pb-sm">{{field.name}}</div>
                <q-input
                    v-model="memo[field.name]"
                    outlined
                    dense
                    :placeholder="field.type"
                    @blur="formatMemo"
                />
            </div>
            <div class="col-xs-6 col-sm-3">
                <div class="text-bold q-pb-sm">actor</div>
                <q-input
                    v-model="actor"
                    outlined
                    dense
                />
            </div>
            <div class="col-xs-6 col-sm-3">
                <div class="text-bold q-pb-sm">permission</div>
                <q-input
                    v-model="permission"
                    outlined
                    dense
                />
            </div>
        </div>
    </q-card-section>
</q-card>
<ViewTransaction
    v-model="openTransaction"
    :transactionId="transactionId"
    :transactionError="transactionError || ''"
    message="transaction complete"
/>

</template>

<style lang="sass"></style>
