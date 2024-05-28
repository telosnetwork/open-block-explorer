<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { OptionsObj } from 'src/types';
import { api } from 'src/api';
import { useQuasar } from 'quasar';
import { searchAccounts } from 'src/utils/searchAccounts';

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
