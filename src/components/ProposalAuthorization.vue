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
      label="Actor"
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
            q-item-label(v-else) {{ actor ? 'Nothing found' : 'Search by actor' }}

  div.col-6.col-sm
    q-select(
      outlined
      dense
      hide-bottom-space
      bg-color="white"
      label="Permission"
      :loading="isLoading"
      v-model="permissionValue"
      :options="permissionsOptions"
      :rules="[value => !!value || 'Field is required']"
    )
      template(#no-option)
        q-item
          q-item-section.text-center
            q-item-label(v-if="isLoading") Searching...
            q-item-label(v-else) {{ actor ? 'Nothing found' : 'Search by actor before' }}

  div.col-auto(v-if="requiredAccounts?.accounts?.length > 0")
    q-btn(flat padding="sm md" color="white" text-color="primary" title="Required accounts")
      q-icon(name="people" class="cursor-pointer" size="20px")
      q-popup-proxy(transition-show="scale" transition-hide="scale")
        q-card
          q-card-section
            div.text-body1.text-weight-bold.text-center {{ requiredAccounts.permissionName }} ({{ requiredAccounts.threshold }})
            q-separator.q-my-sm
            table
              tr(v-for="(item, index) in requiredAccounts.accounts" :key="index").q-pb-xs
                td.text-body2.text-no-wrap {{ item.weight }}
                td.text-body2.text-weight-bold.text-no-wrap.q-px-md {{ item.actor }}
                td.text-body2.text-no-wrap {{ item.permission }}

  div.col-auto
    q-btn(
      outline
      padding="sm md"
      color="white"
      text-color="primary"
      label="Remove"
      @click="$emit('remove')"
      :disabled="disabledRemoveButton"
    )
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from 'vue';
import { api } from 'src/api';

interface RequiredAccounts {
  permissionName: string;
  threshold: number;
  accounts: {
    weight: string;
    actor: string;
    permission: string;
  }[];
}

export default defineComponent({
  name: 'ProposalAuthorization',
  props: {
    actor: {
      type: String,
      default: ''
    },
    permission: {
      type: String,
      default: ''
    },
    disabledRemoveButton: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:actor', 'update:permission', 'remove'],
  setup(props, context) {
    const actorsOptions = ref<string[]>([]);
    const permissionsOptions = ref<string[]>([]);
    const allRequiredAccounts = ref<RequiredAccounts[]>([]);

    const isActorError = ref(false);
    const isLoading = ref(false);
    const waitToSearch = ref<ReturnType<typeof setTimeout> | null>(null);

    const actorValue = computed({
      get: () => {
        return props.actor;
      },
      set: (value) => {
        context.emit('update:actor', value);
      }
    });

    const permissionValue = computed({
      get: () => {
        return props.permission;
      },
      set: (value) => {
        context.emit('update:permission', value);
      }
    });

    onMounted(async () => {
      if (props.actor) {
        await searchAccounts(props.actor);
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
        context.emit('update:permission', '');
        return;
      }

      waitToSearch.value = setTimeout(() => {
        waitToSearch.value = null;
      }, 1000);
    });

    watch(waitToSearch, async (currentValue) => {
      if (currentValue) return;

      const queryValue = props.actor.toLowerCase();
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

          const { account } = await api.getHyperionAccountData(value);

          if (typeof account !== 'undefined') {
            allRequiredAccounts.value = account.permissions.map(
              (permission) => {
                return {
                  permissionName: permission.perm_name,
                  threshold: permission.required_auth.threshold,
                  accounts: permission.required_auth.accounts.map((item) => ({
                    weight: `+ ${item.weight}`,
                    actor: item.permission.actor,
                    permission: item.permission.permission
                  }))
                };
              }
            );

            permissionsOptions.value = account.permissions.map(
              (permission) => permission.perm_name
            );
            context.emit('update:permission', permissionsOptions.value[0]);
          }
        } else {
          isActorError.value = true;
        }
      } catch (error) {
        isActorError.value = true;
        context.emit('update:permission', '');
      }
    }

    const requiredAccounts = computed(() => {
      if (!permissionValue.value) return [];
      return allRequiredAccounts.value.find(
        (item) => item.permissionName === permissionValue.value
      );
    });

    return {
      actorValue,
      permissionValue,
      isActorError,
      requiredAccounts,
      actorsOptions,
      permissionsOptions,
      isLoading
    };
  }
});
</script>
