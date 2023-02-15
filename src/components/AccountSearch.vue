<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { OptionsObj } from 'src/types';
import { api } from 'src/api';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'AccountSearch',
  props: {
    modelValue: {
      type: String
    }
  },
  emits: ['update:modelValue', 'remove'],
  setup(props, context) {
    const $q = useQuasar();

    const inputValue = ref('');
    const options = ref<OptionsObj[]>([]);
    const isLoading = ref(false);

    watch(inputValue, async () => {
      if (inputValue.value === '') {
        options.value = [];
        return;
      }

      isLoading.value = true;
      const queryValue = inputValue.value.toLowerCase();

      await Promise.all([searchAccountsDelay(queryValue)]).then((results) => {
        options.value = ([] as OptionsObj[]).concat.apply([], results);
      });

      isLoading.value = false;
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
          upper_bound: value.padEnd(12, 'z')
        };
        const accounts = await api.getTableByScope(request);

        if (accounts.length > 0) {
          results.push({
            label: 'Accounts',
            to: '',
            isHeader: true
          });

          // because the get table by scope for userres does not include eosio account
          if ('eosio'.includes(value)) {
            results.push({
              label: 'eosio',
              to: 'eosio',
              isHeader: false
            });
          }

          accounts.forEach((user) => {
            if (user.payer.includes(value)) {
              results.push({
                label: user.payer,
                to: `${user.payer}`,
                isHeader: false
              });
            }
          });
        }
        return results;
      } catch (error) {
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
      handleSelected
    };
  }
});
</script>

<template lang="pug">
q-select(
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
  @input-value="(value) => inputValue = value"
  @keyup.enter="handleSelected"
  :options="options"
  :option-disable="(item) => item.isHeader"
).search-input
  template(#prepend)
    q-icon(name="search" size="20px").rotate-90

  template(#no-option)
    q-item
      q-item-section.text-center
        q-item-label(v-if="isLoading") Searching...
        q-item-label(v-else) {{ inputValue ? 'Nothing found' : 'Search for an account name' }}

  template(#option="scope")
    q-item-label(v-if="scope.opt.isHeader" header) {{ scope.opt.label }}
    q-item(v-else v-bind="scope.itemProps" exact @click="handleSelected(scope.opt.to)" clickable)
      q-item-section
        q-item-label {{ scope.opt.label }}
</template>
