<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import TokensPanel from 'components/TokensPanel.vue';
import KeysPanel from 'components/KeysPanel.vue';
import ChildrenPanel from 'components/ChildrenPanel.vue';
import AccountCard from 'components/AccountCard.vue';
import ContractTabs from 'components/contract/ContractTabs.vue';
import { useRoute } from 'vue-router';
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
  data() {
    return {
      account: this.$route.params.account
    };
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const tab = ref<string>('transactions');
    onMounted(async () => {
      await store.dispatch('account/updateABI', route.params.account);
    });
    return {
      tab
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
        q-tab( name="contract" label="Contract" )
        q-tab( name="tokens" label="Tokens" )
        q-tab( name="keys" label="Keys" )
        q-tab( name="children" label="Children" )
    q-tab-panels(v-model="tab").col-12
      q-tab-panel(name="transactions")
        TransactionsTable(:account='account')
      q-tab-panel(name="contract")
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
