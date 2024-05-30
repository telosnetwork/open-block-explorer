<script lang="ts">
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { useAccountStore } from 'src/stores/account';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';

export default defineComponent({
    name: 'ContractActions',
    components: { ViewTransaction },
    setup() {
        const memo = ref<Record<string, unknown>>({});
        const permission = ref<string>('');
        const accountStore = useAccountStore();
        const actor = ref('');
        const openTransaction = ref<boolean>(false);
        const transactionId = ref<string>(accountStore.transactionId);
        const transactionError = ref<unknown>(accountStore.transactionError);
        const actions = computed(() =>
            accountStore.abi.abi.actions.map(a => a.name.toString()),
        );
        const action = ref<string>(actions.value[0]);
        const fields = computed(
            () =>
                accountStore.abi.abi.structs.find(s => s.name === action.value)
                    .fields,
        );

        async function signAction() {
            await accountStore.sendAction({
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
                    memo.value[key] = memo.value[key] === 'true' ||
                        memo.value[key] === '1' ||
                        memo.value[key] === 'True' ||
                        memo.value[key] === 'T' ||
                        memo.value[key] === 't';
                }
            }
        }

        watch(actions, () => {
            action.value = actions.value[0];
            memo.value = {};
        });

        onMounted(() => {
            actor.value = accountStore.accountName;
            permission.value = accountStore.accountPermission;
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
                    class="bg-white"
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
                    class="bg-white"
                    @blur="formatMemo"
                />
            </div>
            <div class="col-xs-6 col-sm-3">
                <div class="text-bold q-pb-sm">actor</div>
                <q-input
                    v-model="actor"
                    outlined
                    dense
                    class="bg-white"
                />
            </div>
            <div class="col-xs-6 col-sm-3">
                <div class="text-bold q-pb-sm">permission</div>
                <q-input
                    v-model="permission"
                    outlined
                    dense
                    class="bg-white"
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
