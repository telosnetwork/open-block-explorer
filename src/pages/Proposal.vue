<template lang="pug">
q-page(padding)
  div.row.justify-between.items-center.q-pt-lg.q-pb-sm
    h1.text-h5.q-ma-none Multisig Transactions

  q-tabs(v-model="tab" align="left" active-color="primary" content-class="text-grey-7"  no-caps)
    q-tab(v-if="isLogged" name="myProposal" label="My proposals")
    q-tab(name="allProposal" label="All proposals")

  q-separator

  q-tab-panels(v-model="tab")
    q-tab-panel(v-if="isLogged" name="myProposal").q-pa-none
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

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from '../store';
import ProposalTable from 'src/components/ProposalTable.vue';
import { api } from 'src/api';

export default defineComponent({
  name: 'Proposal',
  components: {
    ProposalTable
  },
  setup() {
    const store = useStore();
    const isLogged = computed((): boolean => !!store.state.account.accountName);
    const account = computed((): string => store.state.account.accountName);
    const blockProducers = ref<string[]>([]);

    const tab = ref<'myProposal' | 'allProposal'>('myProposal');

    onMounted(() => {
      if (!isLogged.value) {
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

    return {
      tab,
      account,
      isLogged,
      blockProducers
    };
  }
});
</script>
