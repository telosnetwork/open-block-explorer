<script lang="ts">
import { defineComponent, ref, toRaw, watch } from 'vue';
import { useRouter } from 'vue-router';
import { OptionsObj } from 'src/types';
import { api } from 'src/api';
import { isValidHex } from 'src/utils/stringValidator';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'HeaderSearch',
  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const inputValue = ref('');
    const options = ref<OptionsObj[]>([]);
    const isLoading = ref(false);

    const waitToSearch = ref<ReturnType<typeof setTimeout> | null>(null);

    watch(inputValue, (currentValue) => {
      isLoading.value = true;

      if (waitToSearch.value) {
        clearTimeout(waitToSearch.value);
      }

      if (currentValue === '') {
        options.value = [];
        isLoading.value = false;
        return;
      }

      waitToSearch.value = setTimeout(() => {
        waitToSearch.value = null;
      }, 1000);
    });

    watch(waitToSearch, async (currentValue) => {
      if (!currentValue) {
        const queryValue = inputValue.value.toLowerCase();
        options.value = [];

        await Promise.all([
          searchAccounts(queryValue),
          searchProposals(queryValue),
          searchTransactions(queryValue)
        ]);

        isLoading.value = false;
      }
    });

    async function searchAccounts(value: string): Promise<void> {
      try {
        const request = {
          code: 'eosio',
          limit: 5,
          lower_bound: value,
          table: 'userres',
          upper_bound: value.padEnd(12, 'z')
        };
        const accounts = await api.getTableByScope(request);

        if (accounts.length > 0) {
          options.value.push({
            label: 'Accounts',
            to: '',
            isHeader: true
          });

          // because the get table by scope for userres does not include eosio account
          if ('eosio'.includes(value)) {
            options.value.push({
              label: 'eosio',
              to: '/account/eosio',
              isHeader: false
            });
          }

          accounts.forEach((user) => {
            options.value.push({
              label: user.payer,
              to: `/account/${user.payer}`,
              isHeader: false
            });
          });
        }
      } catch (error) {
        return;
      }
    }

    async function searchProposals(value: string): Promise<void> {
      try {
        const { proposals } = await api.getProposals({ proposal: value });

        if (proposals.length > 0) {
          options.value.push({
            label: 'Proposals',
            to: '',
            isHeader: true
          });

          proposals.forEach((item) => {
            options.value.push({
              label: item.proposal_name,
              to: `/proposal/${item.proposal_name}`,
              isHeader: false
            });
          });
        }
      } catch (error) {
        return;
      }
    }

    async function searchTransactions(value: string): Promise<void> {
      if (value.length !== 64) {
        return;
      }

      try {
        const transactions = await api.getTransaction(value);

        if (transactions?.actions) {
          options.value.push({
            label: 'Transactions',
            to: '',
            isHeader: true
          });

          options.value.push({
            label: value,
            to: `/transaction/${value}`,
            isHeader: false
          });
        }
      } catch (error) {
        return;
      }
    }

    async function handleGoTo() {
      const optionsRaw = toRaw(options.value);

      if (!inputValue.value) {
        return;
      }

      if (isValidHex(inputValue.value) && inputValue.value.length == 64) {
        await router.push({
          name: 'transaction',
          params: { transaction: inputValue.value }
        });
        router.go(0);
      } else if (
        (inputValue.value.length == 53 && inputValue.value.startsWith('EOS')) ||
        (inputValue.value.length == 57 && inputValue.value.startsWith('PUB_K1'))
      ) {
        await router.push({
          name: 'key',
          params: { key: inputValue.value }
        });
        router.go(0);
      } else if (inputValue.value.length <= 12) {
        try {
          await api.getAccount(inputValue.value.toLowerCase());
          await router.push({
            name: 'account',
            params: {
              account: inputValue.value.toLowerCase()
            }
          });
          router.go(0);
        } catch (error) {
          $q.notify(`account ${inputValue.value} not found!`);
        }
      }
      const option = optionsRaw.find((item) => item.label === inputValue.value);
      const to = option ? option.to : optionsRaw[1].to;

      await router.push(to);
      router.go(0);
    }

    return {
      inputValue,
      options,
      isLoading,
      handleGoTo
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
  input-style="color:white"
  color="white"
  :loading="isLoading"
  :model-value="inputValue"
  @input-value="(value: string) => inputValue = value"
  @keyup.enter="handleGoTo"
  :options="options"
  :option-disable="(item) => item.isHeader"
).search-input
  template(#prepend)
    q-icon(name="search" color="white" size="20px").rotate-90

  template(#no-option)
    q-item
      q-item-section.text-center
        q-item-label(v-if="isLoading") Searching...
        q-item-label(v-else) {{ inputValue ? 'Nothing found' : 'Search by accounts, keys, proposals and transactions' }}

  template(#option="scope")
    q-item-label(v-if="scope.opt.isHeader" header) {{ scope.opt.label }}
    q-item(v-else v-bind="scope.itemProps" exact @click="handleGoTo" clickable)
      q-item-section
        q-item-label {{ scope.opt.label }}
</template>

<style lang="sass">
.search-input
  background: rgba(255, 255, 255, 0.05)
  border-radius: 4px

.search-input .q-select__dropdown-icon
  color: white
</style>
