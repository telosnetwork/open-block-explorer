<template lang="pug">
div(:style="isLoading ? '' : 'max-height: 12rem;'").full-width.row.justify-center.items-center.gradient-box
  div(v-if="isLoading").col.text-center
    q-spinner(color="white" size="2em")

  div(v-else).col.text-center
    h1.text-h4.text-white.q-ma-none Proposal {{proposalName}}
    p.text-caption.text-white.text-uppercase.q-mt-xs(:style="{opacity:'0.5'}").
      PROPOSER <router-link :to="'/account/' + proposer" class="text-white cursor-pointer">{{proposer}}</router-link> • APPROVAL STATUS {{approvalStatus}} • EXPIRATION {{expirationDate}}
    div.q-mb-lg
      q-badge(v-if="isExecuted && !isCanceled" color="green" label="EXECUTED")
      q-badge(v-if="!isExecuted && !isCanceled" color="orange" label="NOT EXECUTED")
      q-badge(v-if="isCanceled" color="red" label="CANCELED")

    div.row.q-gutter-sm.justify-center.items-center
      q-btn(v-if="isShowExecuteButton" outline padding="sm md" color="white" text-color="white" label="Execute" @click="onExecute")
      q-btn(v-if="isShowCancelButton" outline padding="sm md" color="white" text-color="white" label="Cancel" @click="onCancel")
      q-btn(v-if="isShowApproveButton" outline padding="sm md" color="white" text-color="white" label="Approve" @click="onApprove")
      q-btn(v-if="isShowUnapproveButton" outline padding="sm md" color="white" text-color="white" label="Unapprove" @click="onUnapprove")

q-page(v-if="!isLoading" padding)
  h2.text-h6.text-weight-regular Multisig Transaction
  q-card(
    v-for="(multsigTransactionItem, multsigTransactionIndex) in multsigTransactionData"
    :key="multsigTransactionIndex"
  ).q-mt-md
    q-expansion-item(
      switch-toggle-side
      default-opened
    )
      template(v-slot:header)
        span.text-h6.text-weight-regular {{(multsigTransactionItem.account)}} - {{multsigTransactionItem.name}}
      json-viewer(
        :value="multsigTransactionItem"
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

  h2.text-h6.text-weight-regular.q-mt-xl Transaction history
  q-card(
    v-for="(transactionHistoryItem, transactionHistoryIndex) in transactionHistoryData"
    :key="transactionHistoryIndex"
  ).q-mt-md
    div(v-for="transactionItem in transactionHistoryItem" :key="transactionItem.trx_id")
      q-card-section.overflow-auto
        router-link(
          :to="'/transaction/' + transactionItem.trx_id"
          style="text-decoration:none"
        ).text-primary.cursor-pointer {{transactionItem.trx_id}}
      json-viewer(
        :value="transactionHistoryItem[0].act"
        :expand-depth="5"
        preview-mode
        boxed
        copyable
        sort
      )
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import JsonViewer from 'vue-json-viewer';
import moment from 'moment';
import { api } from 'src/api';
import { useAuthenticator } from 'src/composables/useAuthenticator';
import { RequestedApprovals, Error, Proposal } from 'src/types';
import { deserializeActionData } from 'src/utils/deserializeActionData';

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
    const { account, isAuthenticated, getUser } = useAuthenticator();

    const isLoading = ref(true);

    const proposer = ref('');
    const approvalStatus = ref('');
    const expirationDate = ref('');

    const hasUserAlreadyApproved = ref(false);
    const isExecuted = ref(false);
    const isCanceled = ref(false);
    const isUserApprovalList = ref(false);

    const multsigTransactionData = ref<unknown>({});
    const requestedApprovalsRows = ref<RequestedApprovals[]>([]);
    const transactionHistoryData = ref<unknown>([]);

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

    const hasProposalAlreadyExpired = computed(() =>
      moment(new Date()).isAfter(new Date(expirationDate.value))
    );

    const isShowApproveButton = computed(() => {
      return (
        isAuthenticated.value &&
        isUserApprovalList.value &&
        !hasProposalAlreadyExpired.value &&
        !hasUserAlreadyApproved.value &&
        !isExecuted.value &&
        !isCanceled.value
      );
    });

    const isShowUnapproveButton = computed(() => {
      return (
        isAuthenticated.value &&
        hasUserAlreadyApproved.value &&
        !hasProposalAlreadyExpired.value &&
        !isExecuted.value &&
        !isCanceled.value
      );
    });

    const isShowExecuteButton = computed(() => {
      return (
        isAuthenticated.value &&
        !hasProposalAlreadyExpired.value &&
        (account.value === proposer.value ||
          isUserApprovalList.value ||
          hasUserAlreadyApproved.value) &&
        !isExecuted.value &&
        !isCanceled.value
      );
    });

    const isShowCancelButton = computed(() => {
      return (
        isAuthenticated.value &&
        account.value === proposer.value &&
        !hasProposalAlreadyExpired.value &&
        !isExecuted.value &&
        !isCanceled.value
      );
    });

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

    function handleRequestedApprovals(proposal: Proposal) {
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

      return requestedApprovals.map((item, index) => ({
        ...item,
        index: index + 1
      }));
    }

    async function loadProposal() {
      try {
        const { proposals } = await api.getProposals({
          proposal: proposalName as string,
          limit: 1
        });

        return proposals[0];
      } catch (e) {
        handleError(e, 'Proposal not found');
        await router.push('/proposal');
      }
    }

    async function handleMultsigTransaction(proposal: Proposal) {
      let action;
      let actionSkip = 0;
      const actionLimit = 100;

      while (typeof action === 'undefined') {
        try {
          const { actions } = await api.getActions(
            proposal.proposer,
            'eosio.msig:propose',
            actionLimit,
            actionSkip
          );

          [action] = actions.filter((action) => {
            const { proposal_name } = action.act.data as {
              proposal_name: string;
            };
            return proposal_name === proposal.proposal_name;
          });

          actionSkip += actionLimit;
        } catch (error) {
          console.log(error);
        }
      }

      const { trx } = action.act.data as {
        trx: {
          expiration: string;
          actions: {
            account: string;
            name: string;
            data: string | unknown;
          }[];
        };
      };

      expirationDate.value = trx.expiration;

      if (!isAuthenticated.value) {
        return trx.actions;
      }

      const actionsPromises = trx.actions.map(async (action) => {
        if (!action.data) {
          return action;
        }

        const data = await deserializeActionData({
          account: action.account,
          name: action.name,
          hexData: action.data as string
        });

        return {
          ...action,
          data
        };
      });

      return await Promise.all(actionsPromises);
    }

    async function handleTransactionHistory(blockNumber: number) {
      const block = await api.getBlock(String(blockNumber));
      const transactionsPromise = block.transactions.map(
        async (transaction) => {
          const { actions } = await api.getTransaction(transaction.trx.id);
          return actions;
        }
      );
      return await Promise.all(transactionsPromise);
    }

    onMounted(async () => {
      const proposal = await loadProposal();

      if (typeof proposal === 'undefined') {
        handleError(null, 'Proposal not found');
        await router.push('/proposal');
        return;
      }

      proposer.value = proposal.proposer;
      approvalStatus.value = `${proposal.provided_approvals.length}/${
        proposal.provided_approvals.length + proposal.requested_approvals.length
      }`;
      isExecuted.value = proposal.executed;
      hasUserAlreadyApproved.value = proposal.provided_approvals.some(
        (item) => item.actor === account.value
      );
      isUserApprovalList.value = proposal.requested_approvals.some(
        (item) => item.actor === account.value
      );

      requestedApprovalsRows.value = handleRequestedApprovals(proposal);
      multsigTransactionData.value = await handleMultsigTransaction(proposal);

      const transactions = await handleTransactionHistory(proposal.block_num);
      transactionHistoryData.value = transactions;

      isCanceled.value = transactions.some(
        (item) =>
          item[0].act.account === 'eosio.msig' && item[0].act.name === 'cancel'
      );

      isLoading.value = false;
    });

    async function signTransaction({
      name,
      data
    }: {
      name: 'approve' | 'unapprove' | 'cancel' | 'exec';
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
        console.log(e);
        handleError(e, 'Unable approve proposal');
      }
    }

    async function onUnapprove() {
      try {
        await signTransaction({
          name: 'unapprove',
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
        console.log(e);
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
      isLoading,
      account,

      proposalName,
      proposer,
      approvalStatus,
      expirationDate,

      isShowApproveButton,
      isShowUnapproveButton,
      isShowExecuteButton,
      isShowCancelButton,
      isExecuted,
      isCanceled,

      multsigTransactionData,
      requestedApprovalsRows,
      requestedApprovalsColumns,
      transactionHistoryData,

      onApprove,
      onUnapprove,
      onExecute,
      onCancel
    };
  }
});
</script>
