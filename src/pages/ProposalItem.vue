<template lang="pug">
div.full-width.row.justify-center.items-center.gradient-box
  div.col.text-center
    h1.text-h4.text-white.q-ma-none Proposal {{proposalName}}
    p.text-caption.text-white.text-uppercase.q-mt-xs(:style="{opacity:'0.5'}").
      PROPOSER <router-link :to="'/account/' + proposer" class="text-white cursor-pointer">{{proposer}}</router-link> • APPROVAL STATUS {{approvalStatus}}
    div(v-if="account").row.justify-center.items-center
      q-btn(outline padding="sm md" color="white" text-color="white" label="Approve" @click="onApprove").q-mr-sm
      q-btn(outline padding="sm md" color="white" text-color="white" label="Execute" @click="onExecute").q-mr-sm
      q-btn(outline padding="sm md" color="white" text-color="white" label="Cancel" @click="onCancel")

q-page(padding)
  h2.text-h6.text-weight-regular Transaction
  q-card
    q-card-section.overflow-auto
      router-link(:to="'/transaction/' + transactionId" style="text-decoration:none").text-primary.cursor-pointer {{transactionId}}
  q-card.q-mt-md
    json-viewer(
      :value="transactionData"
      :expand-depth="5"
      preview-mode
      boxed
      copyable
      sort
    )

  h2.text-h6.text-weight-regular.q-mt-xl Requested Approvals
    span.text-body1.q-ml-sm.text-grey {{approvalStatus}}
  q-card.q-mb-xl
    q-table(
        color="primary"
        flat
        :bordered="false"
        :square="true"
        table-header-class="text-grey-7"
        :rows="requestedApprovalsRows"
        :columns="requestedApprovalsColumns"
        row-key="index"
        :rows-per-page-options="[5,10,20,40,80,160]"
      )
        template(v-slot:body-cell-actor="props")
          q-td(:props="props")
            router-link(:to="'/account/' + props.value" style="text-decoration:none").text-primary.cursor-pointer {{props.value}}
        template(v-slot:body-cell-status="props")
          q-td(:props="props")
            q-badge(:color="props.value ? 'green' : 'orange'" :label="props.value ? 'APPROVED' : 'PENDING'")
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import JsonViewer from 'vue-json-viewer';
import { api } from 'src/api';
import { useAuthenticator } from 'src/composables/useAuthenticator';
import { RequestedApprovals, Error } from 'src/types';

export default defineComponent({
  name: 'ProposalItem',
  components: {
    JsonViewer: JsonViewer as unknown
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();

    const { proposalName } = route.params;
    const { account, getUser } = useAuthenticator();

    const proposer = ref('');
    const approvalStatus = ref('');
    const requestedApprovalsRows = ref<RequestedApprovals[]>([]);

    const transactionId = ref('');
    const transactionData = ref<unknown>({});

    const requestedApprovalsColumns = [
      {
        name: 'index',
        align: 'left',
        label: '#',
        field: 'index'
      },
      {
        name: 'actor',
        align: 'left',
        label: 'ACTOR',
        field: 'actor'
      },
      {
        name: 'permission',
        align: 'left',
        label: 'PERMISSION',
        field: 'permission'
      },
      {
        name: 'status',
        align: 'left',
        label: 'STATUS',
        field: 'status'
      }
    ];

    function handleError(e: unknown, defaultMessage: string) {
      const error = JSON.parse(JSON.stringify(e)) as Error;
      $q.notify({
        color: 'negative',
        message: error?.cause?.json?.error?.what || defaultMessage,
        actions: [
          {
            label: 'Dismiss',
            color: 'white'
          }
        ]
      });
    }

    onMounted(async () => {
      try {
        const {
          proposals: [proposal]
        } = await api.getProposals({
          proposal: proposalName as string,
          limit: 1
        });

        if (typeof proposal === 'undefined') {
          await router.push('/proposal');
        }

        proposer.value = proposal.proposer;
        approvalStatus.value = `${proposal.provided_approvals.length}/${
          proposal.provided_approvals.length +
          proposal.requested_approvals.length
        }`;

        let requestedApprovals: RequestedApprovals[] = [];

        proposal.requested_approvals.forEach((item) => {
          requestedApprovals.push({
            actor: item.actor,
            permission: item.permission,
            status: false,
            index: 0
          });
        });

        proposal.provided_approvals.forEach((item) => {
          requestedApprovals.push({
            actor: item.actor,
            permission: item.permission,
            status: true,
            index: 0
          });
        });

        requestedApprovalsRows.value = requestedApprovals.map(
          (item, index) => ({
            ...item,
            index: index + 1
          })
        );

        const block = await api.getBlock(String(proposal.block_num));
        transactionId.value =
          block.transactions[block.transactions.length - 1].trx.id;

        const transaction = await api.getTransaction(transactionId.value);
        transactionData.value = transaction.actions[0].act.data;
      } catch (e) {
        handleError(e, 'Proposal not found');
        await router.push('/proposal');
      }
    });

    async function signTransaction({
      name,
      data
    }: {
      name: 'approve' | 'cancel' | 'exec' | 'invalidate';
      data: unknown;
    }) {
      const user = await getUser();

      const response = await user.signTransaction(
        {
          actions: [
            {
              account: 'eosio.msig',
              name,
              authorization: [
                {
                  actor: account.value,
                  permission: 'active'
                }
              ],
              data
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      );

      return response;
    }

    async function onApprove() {
      try {
        await signTransaction({
          name: 'approve',
          data: {
            proposer: proposer.value,
            proposal_name: proposalName,
            level: {
              actor: account.value,
              permission: 'active'
            }
          }
        });

        document.location.reload();
      } catch (e) {
        handleError(e, 'Unable approve proposal');
      }
    }

    async function onExecute() {
      try {
        await signTransaction({
          name: 'exec',
          data: {
            proposer: proposer.value,
            proposal_name: proposalName,
            executer: account.value
          }
        });

        document.location.reload();
      } catch (e) {
        handleError(e, 'Unable execute proposal');
      }
    }

    async function onCancel() {
      try {
        await signTransaction({
          name: 'cancel',
          data: {
            proposer: proposer.value,
            proposal_name: proposalName,
            canceler: account.value
          }
        });

        document.location.reload();
      } catch (e) {
        handleError(e, 'Unable cancel proposal');
      }
    }

    return {
      account,

      proposalName,
      proposer,
      approvalStatus,
      transactionId,
      transactionData,

      requestedApprovalsRows,
      requestedApprovalsColumns,

      onApprove,
      onExecute,
      onCancel
    };
  }
});
</script>
