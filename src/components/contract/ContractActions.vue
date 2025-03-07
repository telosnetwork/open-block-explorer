<script lang="ts">
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { useAccountStore } from 'src/stores/account';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';

export default defineComponent({
    name: 'ContractActions',
    components: { ViewTransaction },
    setup() {
        const actionData = ref<Record<string, unknown>>({});
        const permission = ref<string>('');
        const accountStore = useAccountStore();
        const actor = ref('');
        const openTransaction = ref<boolean>(false);
        const transactionId = ref<string>(accountStore.TransactionId);
        const transactionError = ref<unknown>(accountStore.TransactionError);
        const actions = computed(() =>
            accountStore.abi.abi.actions.map(a => a.name),
        );
        const action = ref<string>(actions.value[0]);
        const fields = computed(
            () =>
                accountStore.abi.abi.structs.find(s => s.name === action.value)
                    .fields,
        );

        async function signAction() {
            const actDataObj = actionDataToObject();
            await accountStore.sendAction({
                name: action.value,
                actor: actor.value,
                permission: permission.value,
                data: actDataObj,
            });
            openTransaction.value = true;
        }

        function actionDataToObject() {
            const obj: {[key: string]: unknown} = {};
            for (let key in actionData.value) {
                const field = fields.value.find(val => val.name === key);
                let value = actionData.value[key];
                if (typeof value === 'string' && field.type.endsWith('[]')) {
                    value = JSON.parse(value);
                }
                obj[key] = value;
            }
            return obj;
        }

        function formatActionData() {
            for (let key in actionData.value) {
                const field = fields.value.find(val => val.name === key);
                if (field.type === 'bool') {
                    actionData.value[key] = actionData.value[key] === 'true' ||
                        actionData.value[key] === '1' ||
                        actionData.value[key] === 'True' ||
                        actionData.value[key] === 'T' ||
                        actionData.value[key] === 't';
                }
            }
        }

        watch(actions, () => {
            action.value = actions.value[0];
            actionData.value = {};
        });

        onMounted(() => {
            actor.value = accountStore.accountName;
            permission.value = accountStore.accountPermission;
        });

        return {
            action,
            actions,
            fields,
            memo: actionData,
            signAction,
            actor,
            permission,
            openTransaction,
            transactionId,
            transactionError,
            formatMemo: formatActionData,
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
