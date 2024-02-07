<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { OptionsObj, TableByScope } from 'src/types';
import { api } from 'src/api';
import { useQuasar } from 'quasar';
import { systemAccounts } from 'src/utils/systemAccount';

export default defineComponent({
    name: 'AccountSearch',
    props: {
        modelValue: {
            type: String,
        },
        withValidation: {
            type: Boolean,
            default: false,
        },
        removeSearchIcon: {
            type: Boolean,
            default: false,
        },
        // this prop controls if we will also emit the update event when the user is typing
        emitUpdateOnInput: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'remove'],
    setup(props, context) {
        const $q = useQuasar();

        const options = ref<OptionsObj[]>([]);
        const isLoading = ref(false);
        const isError = ref(false);

        const inputValue = ref('');

        watch(inputValue, async () => {
            if (inputValue.value === '') {
                options.value = [];
                return;
            }

            isLoading.value = true;
            isError.value = false;
            const queryValue = inputValue.value.toLowerCase();

            const results = await searchAccountsDelay(queryValue);
            options.value = [...results];
            isLoading.value = false;
        });

        watch(props, async (currentValue) => {
            if (currentValue.modelValue) {
                inputValue.value = currentValue.modelValue;
                await searchAccounts(currentValue.modelValue);
            }
        });

        onMounted(async () => {
            if (props.modelValue) {
                inputValue.value = props.modelValue;
                await searchAccounts(props.modelValue);
            }
        });

        const timer = setTimeout(() => 0, 0);

        function searchAccountsDelay(value: string): Promise<OptionsObj[]> {
            clearTimeout(timer);
            return new Promise<OptionsObj[]>((resolve) => {
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                setTimeout(async () => {
                    const result = await searchAccounts(value);
                    if (inputValue.value === value) {
                        resolve(result);
                    }
                }, 500);
            });
        }

        async function searchAccounts(value: string): Promise<OptionsObj[]> {
            try {
                const results = [] as OptionsObj[];
                const request = {
                    code: 'eosio',
                    limit: 5,
                    lower_bound: cleanSearchInput(value),
                    table: 'userres',
                    upper_bound: value.padEnd(12, 'z'),
                };
                const accounts = await api.getTableByScope(request);

                // because the get table by scope for userres does not include eosio system or null accounts
                if (value.includes('eosio')) {
                    for (const systemAccount of systemAccounts){
                        accounts.push(
                            {
                                payer: systemAccount,
                            } as TableByScope,
                        );
                    }
                }

                if (accounts.length > 0) {
                    results.push({
                        label: 'Accounts',
                        to: '',
                        isHeader: true,
                    });

                    accounts.forEach((user) => {
                        if (user.payer.includes(value)) {
                            results.push({
                                label: user.payer,
                                to: `${user.payer}`,
                                isHeader: false,
                            });
                        }
                    });

                    // if has only one result and it's the one that is on the inputValue, emit update
                    if (props.emitUpdateOnInput) {
                        if (results.length === 2 && results[1].label === inputValue.value) {
                            isError.value = false;
                            context.emit('update:modelValue', inputValue.value);
                        } else {
                            isError.value = true;
                        }
                    }
                } else {
                    isError.value = true;
                }
                return results;
            } catch (error) {
                isError.value = true;
                return;
            }
        }

        function cleanSearchInput(value: string): string {
            // remove leading and trailing spaces and periods from search input for query
            return value.replace(/^[\s.]+|[\s.]+$/g, '');
        }

        async function handleSelected(account_name?: string) {
            if (!inputValue.value) {
                return;
            }

            // if clicked/selected from dropdown search results
            if (typeof account_name === 'string') {
                inputValue.value = account_name;
                context.emit('update:modelValue', inputValue.value);
                return;
            }

            try {
                // we check if the account exists
                await api.getAccount(inputValue.value.toLowerCase());
                context.emit('update:modelValue', inputValue.value);
                return;
            } catch (error) {
                $q.notify(`account ${inputValue.value} not found!`);
            }
        }

        return {
            inputValue,
            options,
            isLoading,
            isError,
            handleSelected,
        };
    },
});
</script>

<template>

<q-select
    borderless
    dense
    filled
    use-input
    hide-selected
    fill-input
    hide-bottom-space
    placeholder="name"
    :loading="isLoading"
    :model-value="inputValue"
    :options="options"
    :option-disable="(item) => item.isHeader"
    :reactive-rules="withValidation"
    :rules="withValidation ? [value => !!value || 'Field is required', (value) => isLoading || options.filter(o => o.label === value).length === 1 || 'Field invalid'] : []"
    :error="withValidation && isError"
    @input-value="(value) => inputValue = value"
    @keyup.enter="handleSelected"
>
    <template v-if="!removeSearchIcon" #prepend>
        <q-icon class="rotate-90" name="search" size="20px"/>
    </template>
    <template #no-option>
        <q-item>
            <q-item-section class="text-center">
                <q-item-label v-if="isLoading">Searching...</q-item-label>
                <q-item-label v-else>{{ inputValue ? 'Nothing found' : 'Search for an account name' }}</q-item-label>
            </q-item-section>
        </q-item>
    </template>
    <template #option="scope">
        <q-item-label v-if="scope.opt.isHeader" header>{{ scope.opt.label }}</q-item-label>
        <q-item
            v-else
            v-bind="scope.itemProps"
            exact="exact"
            clickable="clickable"
            @click="handleSelected(scope.opt.to)"
        >
            <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
        </q-item>
    </template>
</q-select>

</template>
