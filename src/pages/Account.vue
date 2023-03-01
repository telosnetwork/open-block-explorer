<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import TokensPanel from 'components/TokensPanel.vue';
import KeysPanel from 'components/KeysPanel.vue';
import ChildrenPanel from 'components/ChildrenPanel.vue';
import AccountCard from 'components/AccountCard.vue';
import ContractTabs from 'components/contract/ContractTabs.vue';
import { api } from 'src/api';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'src/store';

export default defineComponent({
    name: 'AccountPage',
    components: {
        TransactionsTable,
        TokensPanel,
        KeysPanel,
        ChildrenPanel,
        AccountCard,
        ContractTabs,
    },
    setup() {
        const store = useStore();
        const route = useRoute();
        const router = useRouter();
        const tab = ref<string>((route.query['tab'] as string) || 'transactions');
        const account = computed(() => (route.params.account as string) || '');
        const abi = computed(() => store.state.account.abi.abi);
        const tokenList = ref(api.getTokens(account.value));

        onMounted(async () => {
            await store.dispatch('account/updateABI', route.params.account);
        });

        watch([tab], () => {
            void router.push({
                path: router.currentRoute.value.path,
                query: {
                    tab: tab.value,
                },
            });
        });

        return {
            tab,
            account,
            abi,
            tokenList,
        };
    },
});
</script>

<template>

<div class="row col-12">
    <div class="column col-12 gradient-box">
        <div class="row">
            <AccountCard class="account-card" :account="account" :tokens="tokenList"/>
        </div>
        <q-tabs v-model="tab" class="tabs" no-caps>
            <q-tab name="transactions" label="Transactions"/>
            <q-tab v-if="abi" name="contract" label="Contract"/>
            <q-tab name="tokens" label="Tokens"/>
            <q-tab name="keys" label="Keys"/>
            <q-tab name="children" label="Children"/>
        </q-tabs>
    </div>
    <q-tab-panels v-model="tab" class="col-12">
        <q-tab-panel name="transactions">
            <TransactionsTable :account="account"/>
        </q-tab-panel>
        <q-tab-panel v-if="abi" name="contract">
            <ContractTabs/>
        </q-tab-panel>
        <q-tab-panel name="tokens">
            <TokensPanel :account="account"/>
        </q-tab-panel>
        <q-tab-panel name="keys">
            <KeysPanel :account="account"/>
        </q-tab-panel>
        <q-tab-panel name="children">
            <ChildrenPanel :account="account"/>
        </q-tab-panel>
    </q-tab-panels>
</div>
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
