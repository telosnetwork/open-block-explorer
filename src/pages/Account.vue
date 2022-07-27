<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import TokensPanel from 'components/TokensPanel.vue';
import KeysPanel from 'components/KeysPanel.vue';
import ChildrenPanel from 'components/ChildrenPanel.vue';
import AccountCard from 'components/AccountCard.vue';
import ContractTabs from 'components/contract/ContractTabs.vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'src/store';

export default defineComponent({
  name: 'Account',
  components: {
    TransactionsTable,
    TokensPanel,
    KeysPanel,
    ChildrenPanel,
    AccountCard,
    ContractTabs
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const tab = ref<string>((route.query['tab'] as string) || 'transactions');
    const account = computed(() => (route.params.account as string) || '');
    const abi = computed(() => store.state.account.abi.abi);

    onMounted(async () => {
      await store.dispatch('account/updateABI', route.params.account);
    });

    watch([tab], () => {
      void router.push({
        path: router.currentRoute.value.path,
        query: {
          tab: tab.value
        }
      });
    });

    return {
      tab,
      account,
      abi
    };
  }
});
</script>

<template lang="pug">
div.row.col-12
  div.column.col-12.gradient-box
    div.row
      AccountCard.account-card(:account='account')
    q-tabs(v-model="tab" no-caps).tabs
      q-tab( name="transactions" label="Transactions" )
      q-tab( name="contract" label="Contract" v-if="abi")
      q-tab( name="tokens" label="Tokens" )
      q-tab( name="keys" label="Keys" )
      q-tab( name="children" label="Children" )
  q-tab-panels(v-model="tab").col-12
    q-tab-panel(name="transactions")
      TransactionsTable(:account='account')
    q-tab-panel(name="contract" v-if="abi")
      ContractTabs
    q-tab-panel(name="tokens")
      TokensPanel(:account='account')
    q-tab-panel(name="keys")
      KeysPanel(:account='account')
    q-tab-panel(name="children")
      ChildrenPanel(:account='account')
</template>

<style lang="sass">
.account-card
  width: 550px
  border-radius: .5rem
  margin-top: 1rem
  margin-left: auto
  margin-right: auto
  margin-bottom: 2rem
  box-shadow: none
.tabs
  color: white
</style>
