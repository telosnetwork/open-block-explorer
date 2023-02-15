<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import ProposalTable from 'src/components/ProposalTable.vue';
import { api } from 'src/api';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'src/store';

export default defineComponent({
    name: 'ProposalPage',
    components: {
        ProposalTable,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const store = useStore();
        const blockProducers = ref<string[]>([]);
        const account = computed(() => store.state.account.accountName);
        const isAuthenticated = computed(() => store.state.account.isAuthenticated);

        const tab = ref<string>((route.query['tab'] as string) || 'myProposal');

        onMounted(() => {
            if (!isAuthenticated.value) {
                tab.value = 'allProposal';
            }
        });

        onMounted(async () => {
            const producers = await api.getProducers();
            const producersAccount = [] as string[];

            for (let index = 0; index < producers.rows.length; index++) {
                const item = producers.rows[index];
                if (item.is_active === 1) {
                    producersAccount.push(item.owner);
                }
            }

            blockProducers.value = producersAccount;
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
            isAuthenticated,
            blockProducers,
        };
    },
});
</script>

<template lang="pug">
q-page(padding)
  div.row.justify-between.items-center.q-pt-lg.q-pb-sm
    h1.text-h5.q-ma-none Multisig Transactions
    q-btn(
      v-if="isAuthenticated"
      padding="sm md"
      color="primary"
      label="New proposal"
      to="/proposal/new")

  q-tabs(v-model="tab" align="left" active-color="primary" content-class="text-grey-7"  no-caps)
    q-tab(v-if="isAuthenticated" name="myProposal" label="My proposals")
    q-tab(name="allProposal" label="All proposals")

  q-separator

  q-tab-panels(v-model="tab")
    q-tab-panel(v-if="isAuthenticated" name="myProposal").q-pa-none
      div.q-py-lg
        ProposalTable(
          title="Needs your signature"
          type="needsYourSignature"
          :account="account"
        )
        ProposalTable(
          title="Proposals created"
          type="proposalsCreated"
          :account="account"
        )

    q-tab-panel(name="allProposal").q-pa-none
      div.q-py-lg
        ProposalTable(
          title="Proposals"
          type="allProposals"
          :account="account"
          :blockProducers="blockProducers"
        )
</template>
