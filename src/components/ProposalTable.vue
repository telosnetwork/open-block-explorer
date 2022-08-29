<template lang="pug">
q-table(
  color="primary"
  flat
  :bordered="false"
  :square="true"
  :title="title"
  table-header-class="text-grey-7"
  :rows="rows"
  :columns="columns"
  row-key="proposalName"
  :rows-per-page-options="[20,40,80,160]"
  v-model:pagination="pagination"
  @request="onRequest"
)
  template(v-slot:top)
    div.q-table__control.full-width.justify-between
      div.q-table__title(v-text="title")
      div
        q-btn-dropdown(outlined flat :color="hasSomeFilterActive ? 'primary': ''" :label="hasSomeFilterActive ? '• Filter by': 'Filter by'" v-model="filterDropdown")
          div.q-pt-md.q-px-md
            div(v-if="type === 'needsYourSignature'").q-pr-md.q-pb-md
              q-toggle(label="Already signed" v-model="isSigned")

            div(v-if="type === 'allProposals'").q-pb-md
              span.block.q-mb-sm.text-body3 Pending signature from
              q-select(
                outlined
                dense
                v-model="blockProducer"
                label="Block Producer"
                hide-bottom-space
                hide-selected
                fill-input
                :options="optionsBlockProducers"
                use-input
                input-debounce="0"
                clearable
                @filter="onFilterBlockProducer"
              )
                template(v-slot:no-option)
                  q-item
                    q-item-section No results

            div.q-pr-md.q-pb-md
              q-toggle(label="Inactive proposals" v-model="isExecuted")

  template(v-slot:no-data)
    span.q-pa-md.full-width.text-center.text-body2.
      No proposals

  template(v-slot:body="props")
    q-tr(:props="props")
      q-td(key="proposalName" :props="props")
        router-link(:to="'/proposal/' + props.row.proposalName" style="text-decoration:none").text-primary.cursor-pointer {{props.row.proposalName}}
      q-td(key="approvalStatus" :props="props")
        span {{ props.row.approvalStatus }}
      q-td(key="proposer" :props="props")
        router-link(:to="'/account/' + props.row.proposer" style="text-decoration:none").text-primary.cursor-pointer {{props.row.proposer}}
      q-td(key="executed" :props="props")
        q-badge(:color="props.row.executed ? 'green' : 'orange'" :label="props.row.executed ? 'EXECUTED' : 'NOT EXECUTED'")
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  watch,
  PropType,
  computed
} from 'vue';
import { useQuasar } from 'quasar';
import {
  GetProposals,
  ProposalTableRow,
  PaginationSettings,
  Error
} from 'src/types';
import { api } from 'src/api';

const initialStatePagination = {
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 20
};

export default defineComponent({
  name: 'ProposalTable',
  props: {
    title: {
      type: String,
      required: true
    },
    account: {
      type: String,
      required: true
    },
    type: {
      type: String as PropType<
        'needsYourSignature' | 'proposalsCreated' | 'allProposals'
      >,
      required: true
    },
    blockProducers: {
      type: Array as PropType<string[]>
    }
  },
  setup(setupProps) {
    const $q = useQuasar();

    const rows = ref<ProposalTableRow[]>([]);
    const pagination = ref(initialStatePagination);
    const isSigned = ref(false);
    const isExecuted = ref(false);
    const blockProducer = ref('');
    const filterDropdown = ref(false);

    const hasSomeFilterActive = computed(
      () => isSigned.value || isExecuted.value || blockProducer.value
    );

    const columns = [
      {
        name: 'proposalName',
        align: 'left',
        label: 'PROPOSAL NAME',
        field: 'proposalNameSliced'
      },
      {
        name: 'approvalStatus',
        align: 'left',
        label: 'APPROVAL STATUS',
        field: 'approvalStatus'
      },
      {
        name: 'proposer',
        align: 'left',
        label: 'PROPOSER',
        field: 'proposer'
      }
    ];

    async function onRequest(props: { pagination: PaginationSettings }) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const { account } = setupProps;

      const proposer = setupProps.type === 'proposalsCreated' ? account : '';

      let requested = '';
      if (setupProps.type === 'allProposals' && blockProducer.value) {
        requested = blockProducer.value;
      }
      if (setupProps.type === 'needsYourSignature' && !isSigned.value) {
        requested = account;
      }

      let provided = '';
      if (setupProps.type === 'needsYourSignature' && isSigned.value) {
        provided = account;
      }

      try {
        const data: GetProposals = await api.getProposals({
          proposer,
          requested,
          provided,
          executed: isExecuted.value,
          limit: rowsPerPage,
          skip: (page - 1) * rowsPerPage
        });

        pagination.value = {
          rowsNumber: data.total.value,
          page: page,
          rowsPerPage: rowsPerPage,
          sortBy: sortBy,
          descending: descending
        };

        rows.value = data.proposals.map((proposal) => {
          const approvalStatus = `${proposal.provided_approvals.length}/${
            proposal.provided_approvals.length +
            proposal.requested_approvals.length
          }`;

          return {
            primaryKey: proposal.primary_key,
            proposalName: proposal.proposal_name,
            approvalStatus,
            proposer: proposal.proposer
          };
        });
      } catch (e) {
        const error = JSON.parse(JSON.stringify(e)) as Error;
        $q.notify({
          color: 'negative',
          message: error?.cause?.json?.error?.what || 'Unable load proposals',
          actions: [
            {
              label: 'Dismiss',
              color: 'white'
            }
          ]
        });
      }
    }

    onMounted(async () => {
      await onRequest({
        pagination: pagination.value
      });
    });

    watch([isSigned, isExecuted, blockProducer], async () => {
      filterDropdown.value = false;
      pagination.value = initialStatePagination;
      await onRequest({
        pagination: pagination.value
      });
    });

    const optionsBlockProducers = ref<string[]>(setupProps.blockProducers);
    function onFilterBlockProducer(
      inputValue: string,
      update: (callback: () => void) => void
    ) {
      if (inputValue === '') {
        update(() => {
          optionsBlockProducers.value = setupProps.blockProducers;
        });
        return;
      }

      update(() => {
        const formattedValue = inputValue.toLowerCase();
        optionsBlockProducers.value = setupProps.blockProducers.filter(
          (item) => item.toLowerCase().indexOf(formattedValue) > -1
        );
      });
    }

    return {
      columns,
      rows,
      pagination,
      isSigned,
      isExecuted,
      blockProducer,
      hasSomeFilterActive,
      optionsBlockProducers,
      filterDropdown,
      onRequest,
      onFilterBlockProducer
    };
  }
});
</script>
