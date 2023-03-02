<template lang="pug">
div.row.q-col-gutter-md.q-mb-md
  div.col-6.col-sm
    q-select(
      outlined
      dense
      use-input
      hide-selected
      fill-input
      hide-bottom-space
      bg-color="white"
      :label="label"
      :loading="isLoading"
      :model-value="actorValue"
      @input-value="(value) => actorValue = value"
      :options="actorsOptions"
      :rules="[value => !!value || 'Field is required', (value) => isLoading || actorsOptions.includes(value) || 'Field invalid']"
      reactive-rules
      :error="isActorError"
    )
      template(#no-option)
        q-item
          q-item-section.text-center
            q-item-label(v-if="isLoading") Searching...
            q-item-label(v-else) {{ actor ? 'Nothing found' : 'Search by account' }}
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from 'vue';
import { api } from 'src/api';

export default defineComponent({
  name: 'AccountSearch',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, context) {
    const actorsOptions = ref<string[]>([]);

    const isActorError = ref(false);
    const isLoading = ref(false);
    const waitToSearch = ref<ReturnType<typeof setTimeout> | null>(null);

    const actorValue = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        context.emit('update:modelValue', value);
      }
    });

    onMounted(async () => {
      if (props.modelValue) {
        await searchAccounts(props.modelValue);
      }
    });

    watch(actorValue, (currentValue) => {
      isLoading.value = true;
      isActorError.value = false;

      if (waitToSearch.value) {
        clearTimeout(waitToSearch.value);
      }

      if (currentValue === '') {
        actorsOptions.value = [];
        isLoading.value = false;
        return;
      }

      waitToSearch.value = setTimeout(() => {
        waitToSearch.value = null;
      }, 1000);
    });

    watch(waitToSearch, async (currentValue) => {
      if (currentValue) return;

      const queryValue = props.modelValue.toLowerCase();
      actorsOptions.value = [];

      await searchAccounts(queryValue);

      isLoading.value = false;
    });

    async function searchAccounts(value: string): Promise<void> {
      try {
        const accounts = await api.getTableByScope({
          code: 'eosio',
          limit: 5,
          lower_bound: value,
          table: 'userres',
          upper_bound: value.padEnd(12, 'z')
        });

        if (accounts.length > 0) {
          // because the get table by scope for userres does not include eosio account
          if ('eosio'.includes(value)) {
            actorsOptions.value.push('eosio');
          }

          accounts.forEach((user) => {
            actorsOptions.value.push(user.payer);
          });
        } else {
          isActorError.value = true;
        }
      } catch (error) {
        isActorError.value = true;
      }
    }

    return {
      actorValue,
      isActorError,
      actorsOptions,
      isLoading
    };
  }
});
</script>
