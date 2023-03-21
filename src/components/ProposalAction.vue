<script lang="ts">
import {
    defineComponent,
    ref,
    watch,
    computed,
    PropType,
    onMounted,
} from 'vue';
import ProposalAuthorization from 'components/ProposalAuthorization.vue';
import TransferAction from 'components/TransferAction.vue';
import { api } from 'src/api';
import { ProposalAction } from 'src/types';

interface Struct {
    name: string;
    fields: {
        name: string;
        type: string;
    }[];
}
export default defineComponent({
    name: 'ProposalAction',
    components: {
        ProposalAuthorization,
        TransferAction,
    },
    props: {
        modelValue: {
            type: Object as PropType<ProposalAction>,
        },
    },
    emits: ['update:modelValue', 'remove'],
    setup(props, context) {
        const structs = ref<Struct[]>([]);
        const isAccountLoading = ref(false);
        const isAccountError = ref(false);
        const waitToSearch = ref<ReturnType<typeof setTimeout> | null>(null);
        const action = computed({
            get: () => props.modelValue,
            set: (value) => {
                context.emit('update:modelValue', value);
            },
        });

        watch(
            () => action.value.account,
            (currentValue) => {
                isAccountLoading.value = true;
                isAccountError.value = false;

                if (structs.value.length > 0) {
                    structs.value = [];
                }

                if (waitToSearch.value) {
                    clearTimeout(waitToSearch.value);
                }

                if (currentValue === '') {
                    isAccountLoading.value = false;
                    return;
                }

                waitToSearch.value = setTimeout(() => {
                    waitToSearch.value = null;
                }, 1000);
            },
        );

        watch(waitToSearch, async (currentValue) => {
            if (currentValue) {
                return;
            }

            const queryValue = action.value.account.toLowerCase();

            try {
                const { abi } = await api.getABI(queryValue);
                action.value.name = abi.structs[0].name;
                structs.value = abi.structs;
            } catch (error) {
                isAccountError.value = true;
            }

            isAccountLoading.value = false;
        });

        onMounted(async () => {
            if (!props.modelValue.account || !props.modelValue.name) {
                return;
            }

            const queryValue = props.modelValue.account.toLowerCase();

            try {
                const { abi } = await api.getABI(queryValue);
                const actionNameIndex = abi.structs.findIndex(
                    item => props.modelValue.name === item.name,
                );
                action.value.name = abi.structs[actionNameIndex ?? 0].name;
                structs.value = abi.structs;
            } catch (error) {
                isAccountError.value = true;
            }

            isAccountLoading.value = false;
        });

        const actionOptions = computed(() => {
            if (structs.value.length === 0) {
                return [];
            }
            return structs.value.map(item => item.name);
        });

        const fields = computed(() => {
            if (structs.value.length === 0) {
                return [];
            }

            const { fields } = structs.value.find(
                item => item.name === action.value.name,
            );

            return fields;
        });

        /* eslint-disable */
        watch(fields, (currentValue) => {
            const actionFields = {} as any;

            for (let index = 0; index < currentValue.length; index++) {
                const element = currentValue[index];
                actionFields[element.name] = props.modelValue.data[element.name] ?? '';
            }

            action.value.data = actionFields
        });
        /* eslint-enable */

        return {
            action,
            isAccountLoading,
            isAccountError,
            actionOptions,
            fields,
        };
    },
});
</script>

<template>
<q-card class="q-mt-md">
    <q-expansion-item switch-toggle-side default-opened>
        <template v-slot:header>
            <div class="proposal-action__header full-width row items-center justify-between">
                <div class="col-auto"><span class="text-h6 text-weight-regular">{{ action.account && action.name ? `${action.account} - ${action.name}` : 'Action' }}</span></div>
                <div class="col-auto">
                    <q-btn
                        outline
                        padding="sm md"
                        color="white"
                        text-color="primary"
                        label="Remove"
                        @click.stop="$emit('remove')"
                    />
                </div>
            </div>
        </template>
        <div class="q-pa-md">
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6">
                    <q-input
                        v-model="action.account"
                        outlined
                        dense
                        hide-bottom-space
                        lazy-rules
                        label="account"
                        :error="isAccountError"
                        :loading="isAccountLoading"
                        :rules="[value => !!value || 'Account is required']"
                    />
                </div>
                <div v-if="actionOptions.length > 0" class="col-6">
                    <q-select
                        v-model="action.name"
                        outlined
                        dense
                        hide-bottom-space
                        bg-color="white"
                        label="Action"
                        :options="actionOptions"
                        :rules="[value => !!value || 'Field is required']"
                    >
                        <template #no-option>
                            <q-item>
                                <q-item-section class="text-center">
                                    <q-item-label>No option</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </div>
            </div>
            <TransferAction
                v-if="action?.account === 'eosio.token' && action?.name === 'transfer'"
                v-model="action"
                :fields="fields"
            />
            <div v-else-if="!!fields" class="row q-col-gutter-md">
                <div v-for="field in fields" :key="field.name" class="col-12 col-sm-4">
                    <q-input
                        v-model="action.data[field.name]"
                        outlined
                        dense
                        hide-bottom-space
                        lazy-rules
                        :label="field.name"
                    />
                </div>
            </div>
            <div>
                <p class="text-body1 q-my-md q-mb-none">Authorization</p>
                <ProposalAuthorization
                    v-for="(authorizationItem, authorizationIndex) in action.authorization"
                    :key="authorizationIndex"
                    v-model:actor="authorizationItem.actor"
                    v-model:permission="authorizationItem.permission"
                    :disabledRemoveButton="action.authorization.length === 1"
                    @remove="action.authorization.splice(authorizationIndex, 1)"
                />
                <q-btn
                    outline
                    padding="sm md"
                    color="white"
                    text-color="primary"
                    label="Add"
                    @click.stop="action.authorization.push({ actor: '', permission: '' })"
                />
            </div>
        </div>
    </q-expansion-item>
</q-card>
</template>

<style lang="sass">
.proposal-action
    &__header
        min-eight: '36px'

</style>
