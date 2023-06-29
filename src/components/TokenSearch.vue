<template>

<q-select
    class="search-input"
    borderless
    dense
    filled
    use-input
    hide-selected
    fill-input
    hide-bottom-space
    placeholder="token"
    :loading="isLoading"
    :model-value="inputValue"
    :options="options"
    @input-value="(value) => inputValue = value"
    @keyup.enter="handleSelected(inputValue)"
>
    <template #prepend>
        <q-icon class="rotate-90" name="search" size="20px"/>
    </template>
    <template #no-option>
        <q-item>
            <q-item-section class="text-center">
                <q-item-label v-if="isLoading">Searching...</q-item-label>
                <q-item-label v-else>{{ inputValue ? 'Nothing found' : 'Search for token symbol or contract' }}</q-item-label>
            </q-item-section>
        </q-item>
    </template>
    <template #option="scope">
        <q-item
            v-bind="scope.itemProps"
            exact="exact"
            clickable="clickable"
            @click="handleSelected(scope.opt)"
        >
            <q-item-section class="items-center" avatar>
                <q-avatar size="24px"><img :src="scope.opt.logo ?? '~src/assets/token_placeholder.svg'"></q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>{{ scope.opt.symbol }} ({{scope.opt.contract}})</q-item-label>
            </q-item-section>
        </q-item>
    </template>
</q-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { api } from 'src/api';
import { useQuasar } from 'quasar';
import { Token } from 'src/types';

export default defineComponent({
    name: 'TokenSearch',
    props: {
        modelValue: {
            type: Object,
        },
    },
    emits: ['update:modelValue'],
    setup(props, context) {
        const $q = useQuasar();

        const inputValue = ref('');
        const options = ref<Token[]>([]);
        const isLoading = ref(false);

        watch(inputValue, async () => {
            if (inputValue.value === '') {
                options.value = [];
                return;
            }

            if (typeof inputValue.value !== 'string') {
                options.value = [];
                return;
            }

            isLoading.value = true;
            const queryValue = inputValue.value.toLowerCase();

            await Promise.all([searchTokens(queryValue)]).then((results) => {
                options.value = ([] as Token[]).concat.apply([], results);
            });

            isLoading.value = false;
        });

        async function searchTokens(value: string): Promise<Token[]> {
            try {
                const tokens: Token[] = (await api.getTokens()).filter(x =>
                    JSON.stringify(x).toLowerCase().includes(value.toLowerCase()),
                );
                return tokens;
            } catch (error) {
                return;
            }
        }

        async function handleSelected(token?: Token | string) {
            if (!inputValue.value) {
                return;
            }

            // if clicked/selected from dropdown search results
            if (typeof token !== 'string') {
                context.emit('update:modelValue', token);
                return;
            }

            // we check if the account exists
            const result: Token[] = await searchTokens(token.toLowerCase());
            if (result.length === 0) {
                $q.notify(`account ${inputValue.value} not found!`);
                return;
            }
            context.emit('update:modelValue', result[0]);
            return;
        }

        return {
            inputValue,
            options,
            isLoading,
            handleSelected,
        };
    },
});
</script>
