<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import JsonViewer from 'vue-json-viewer';
import moment from 'moment';
import { api } from 'src/api';
import { RequestedApprovals, Error, Proposal } from 'src/types';
import sha256 from 'fast-sha256';
import { ABI, ABIDef, Action, Serializer, Transaction } from '@greymass/eosio';
import { useStore } from 'src/store';
import { deserializeActionDataFromAbi } from 'src/api/eosio_core';
import { sleep } from 'src/utils/time';

export default defineComponent({
    name: 'ProposalItem',
    components: {
        JsonViewer: JsonViewer as unknown,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const $q = useQuasar();
        const store = useStore();

        const { proposalName } = route.params;
        const account = computed(() => store.state.account.accountName);
        const isAuthenticated = computed(() => store.state.account.isAuthenticated);
        const isLoading = ref(true);

        const proposer = ref('');
        const approvalStatus = ref('');
        const expirationDate = ref('');

        const hasUserAlreadyApproved = ref(false);
        const isExecuted = ref(false);
        const isCanceled = ref(false);
        const isUserApprovalList = ref(false);

        const multsigTransactionData = ref<Action[]>([]);
        const requestedApprovalsRows = ref<RequestedApprovals[]>([]);

        const requestedApprovalsColumns = [
            {
                name: 'actor',
                align: 'left',
                label: 'ACTOR',
                field: 'actor',
            },
            {
                name: 'permission',
                align: 'left',
                label: 'PERMISSION',
                field: 'permission',
            },
            {
                name: 'status',
                align: 'left',
                label: 'STATUS',
                field: 'status',
            },
        ];

        const hasProposalAlreadyExpired = computed(() =>
            moment(new Date()).isAfter(new Date(expirationDate.value)),
        );

        const isShowApproveButton = computed(() => (
            isAuthenticated.value &&
            isUserApprovalList.value &&
            !hasProposalAlreadyExpired.value &&
            !hasUserAlreadyApproved.value &&
            !isExecuted.value &&
            !isCanceled.value
        ));

        const isShowUnapproveButton = computed(() => (
            isAuthenticated.value &&
            hasUserAlreadyApproved.value &&
            !hasProposalAlreadyExpired.value &&
            !isExecuted.value &&
            !isCanceled.value
        ));

        const isShowExecuteButton = computed(() => (
            isAuthenticated.value &&
            !hasProposalAlreadyExpired.value &&
            (account.value === proposer.value ||
                isUserApprovalList.value ||
                hasUserAlreadyApproved.value) &&
            !isExecuted.value &&
            !isCanceled.value
        ));

        const isShowCancelButton = computed(() => (
            isAuthenticated.value &&
            account.value === proposer.value &&
            !hasProposalAlreadyExpired.value &&
            !isExecuted.value &&
            !isCanceled.value
        ));

        const producersApprovalStatus = computed(() => {
            const allProducers = requestedApprovalsRows.value.filter(
                item => item.isBp,
            );
            const producersHaveAlreadyApproved = allProducers.filter(
                item => item.status,
            );
            return `${producersHaveAlreadyApproved.length}/${allProducers.length}`;
        });

        function handleError(e: unknown, defaultMessage: string) {
            const error = JSON.parse(JSON.stringify(e)) as Error;
            $q.notify({
                color: 'negative',
                message: error?.cause?.json?.error?.what || defaultMessage,
                actions: [
                    {
                        label: 'Dismiss',
                        color: 'white',
                    },
                ],
            });
        }

        async function handleRequestedApprovals(proposal: Proposal) {
            const activeProducers = await api.getProducerSchedule();

            const activeProducersAccount = activeProducers.active.producers.map(
                producer => producer.producer_name,
            );

            let requestedApprovals: RequestedApprovals[] = [];

            proposal.requested_approvals.forEach((item) => {
                requestedApprovals.push({
                    actor: item.actor,
                    permission: item.permission,
                    status: false,
                    isBp: false,
                });
            });

            proposal.provided_approvals.forEach((item) => {
                requestedApprovals.push({
                    actor: item.actor,
                    permission: item.permission,
                    status: true,
                    isBp: false,
                });
            });

            requestedApprovals = requestedApprovals
                .map(item => ({
                    ...item,
                    isBp: activeProducersAccount.includes(item.actor),
                }))
                .sort((a, b) => a.actor.localeCompare(b.actor))
                .sort(
                    (a, b) =>
                        Number(b.isBp) - Number(a.isBp) ||
                        Number(a.status) - Number(b.status),
                );

            return requestedApprovals;
        }

        async function loadProposal() {
            try {
                const { proposals } = await api.getProposals({
                    proposal: proposalName as string,
                    limit: 1,
                });

                return proposals[0];
            } catch (e) {
                handleError(e, 'Proposal not found');
                await router.push('/proposal');
            }
        }

        /* eslint-disable */
        async function handleMultsigTransaction(proposal: Proposal): Promise<Action[]> {
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
                } catch (e) {
                    console.error(e);
                }
            }

            const { trx } = action.act.data;

            const transaction = Transaction.from(trx);
            expirationDate.value = transaction.expiration.toString();

            const setAbiCache : {[key: string]: ABIDef} = {};
            const actions: Action[] = [];

            for (let i = 0; i < transaction.actions.length; i++) {
                const action = transaction.actions[i];
                const contract = action.account.toString();
                let data;

                if (setAbiCache.hasOwnProperty(contract)) {
                    data = deserializeActionDataFromAbi(action, setAbiCache[contract]) as {
                        code: string,
                        abi: string,
                        account: string
                    };
                } else {
                    data = await api.deserializeActionData(action) as {
                        code: string,
                        abi: string,
                        account: string
                    };
                }


                if (contract === 'eosio' && action.name.toString() === 'setcode') {
                    data.code = `Binary data with SHA <${getShaForCode(data.code)}>`
                } else if (action.account.toString() === 'eosio' && action.name.toString() === 'setabi') {
                    const abi = Serializer.decode({data: data.abi, type: ABI})
                    setAbiCache[data.account] = abi;
                }
                actions.push({
                    ...Serializer.objectify(action),
                    data
                })
            }

            return actions;
        }
        /* eslint-enable */

        async function handleTransactionHistory(blockNumber: number) {
            const block = await api.getBlock(String(blockNumber));
            const transactionsPromise = block.transactions.map(
                async (transaction) => {
                    let trxId = transaction.trx.id;
                    if (typeof trxId !== 'string') {
                        trxId = transaction.trx.toString();
                    }
                    const { actions } = await api.getTransaction(trxId);
                    return actions;
                },
            );
            return await Promise.all(transactionsPromise);
        }

        onMounted(loadProposalAndUpdateFields);

        async function loadProposalAndUpdateFields() {
            isLoading.value = true;

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
                item => item.actor === account.value,
            );
            isUserApprovalList.value = proposal.requested_approvals.some(
                item => item.actor === account.value,
            );

            const [requestedApprovalsRowsValue, multsigTransactionDataValue] =
                await Promise.all([
                    handleRequestedApprovals(proposal),
                    handleMultsigTransaction(proposal),
                ]);

            requestedApprovalsRows.value = requestedApprovalsRowsValue;
            multsigTransactionData.value = multsigTransactionDataValue;

            const transactions = await handleTransactionHistory(proposal.block_num);

            isCanceled.value = transactions.some(
                item =>
                    item[0].act.account === 'eosio.msig' && item[0].act.name === 'cancel',
            );

            isLoading.value = false;
        }

        async function signTransaction({
            name,
            data,
        }: {
            name: 'approve' | 'unapprove' | 'cancel' | 'exec';
            data: unknown;
        }) {
            const response = await store.state.account.user.signTransaction(
                {
                    actions: [
                        {
                            account: 'eosio.msig',
                            name,
                            authorization: [
                                {
                                    actor: account.value,
                                    permission: store.state.account.accountPermission,
                                },
                            ],
                            data,
                        },
                    ],
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 30,
                },
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
                            permission: store.state.account.accountPermission,
                        },
                    },
                });
                await sleep();
                await loadProposalAndUpdateFields();
            } catch (e) {
                console.error(e);
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
                            permission: store.state.account.accountPermission,
                        },
                    },
                });
                await sleep();
                await loadProposalAndUpdateFields();
            } catch (e) {
                console.error(e);
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
                        executer: account.value,
                    },
                });
                await sleep();
                await loadProposalAndUpdateFields();
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
                        canceler: account.value,
                    },
                });
                await sleep();
                await loadProposalAndUpdateFields();
            } catch (e) {
                handleError(e, 'Unable cancel proposal');
            }
        }

        function getShaForCode(code: string): string {
            const codeArray = Uint8Array.from(Buffer.from(code, 'hex'));
            const sha: Uint8Array = sha256(codeArray);
            return Buffer.from(sha).toString('hex');
        }

        return {
            isLoading,
            account,

            proposalName,
            proposer,
            approvalStatus,
            producersApprovalStatus,
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

            onApprove,
            onUnapprove,
            onExecute,
            onCancel,

            getShaForCode,
        };
    },
});
</script>

<template>
<div class="proposal-item full-width row justify-center items-center header-support">
    <div v-if="isLoading" class="col text-center">
        <q-spinner color="white" size="2em"/>
    </div>
    <div v-else class="proposal-item__content col text-center">
        <h1 class="proposal-item__content-title text-h4 text-white q-ma-none ">Proposal {{proposalName}}</h1>
        <p class="proposal-item__content-sub text-caption text-white text-uppercase q-mt-xs">PROPOSER <router-link :to="'/account/' + proposer" class="text-white cursor-pointer">{{proposer}}</router-link> • APPROVAL STATUS {{approvalStatus}} • EXPIRATION {{expirationDate}}</p>
        <div class="q-mb-lg">
            <q-badge v-if="isExecuted &amp;&amp; !isCanceled" color="green" label="EXECUTED"/>
            <q-badge v-if="!isExecuted &amp;&amp; !isCanceled" color="orange" label="NOT EXECUTED"/>
            <q-badge v-if="isCanceled" color="red" label="CANCELED"/>
        </div>
        <div class="row q-gutter-sm justify-center items-center">
            <q-btn
                v-if="isShowExecuteButton"
                outline
                padding="sm md"
                color="white"
                text-color="white"
                label="Execute"
                @click="onExecute"
            />
            <q-btn
                v-if="isShowCancelButton"
                outline
                padding="sm md"
                color="white"
                text-color="white"
                label="Cancel"
                @click="onCancel"
            />
            <q-btn
                v-if="isShowApproveButton"
                outline
                padding="sm md"
                color="white"
                text-color="white"
                label="Approve"
                @click="onApprove"
            />
            <q-btn
                v-if="isShowUnapproveButton"
                outline
                padding="sm md"
                color="white"
                text-color="white"
                label="Unapprove"
                @click="onUnapprove"
            />
        </div>
    </div>
</div>
<q-page padding>
    <h2 class="text-h6 text-weight-regular">Multisig Transaction</h2>
    <q-card v-for="(multsigTransactionItem, multsigTransactionIndex) in multsigTransactionData" :key="multsigTransactionIndex" class="q-mt-md">
        <q-expansion-item switch-toggle-side default-opened>
            <template v-slot:header>
                <span class="text-h6 text-weight-regular">
                    {{(multsigTransactionItem.account)}} - {{multsigTransactionItem.name}}</span>
            </template>
            <JsonViewer
                :value="multsigTransactionItem"
                :expand-depth="5"
                preview-mode="preview-mode"
                boxed="boxed"
                copyable="copyable"
                sort="sort"
            />
        </q-expansion-item>
    </q-card>
    <h2 class="text-h6 text-weight-regular q-mt-xl"><span>Requested Approvals</span><span class="text-body1 q-ml-sm text-grey">{{approvalStatus}}</span><span class="q-mx-sm">•</span><span>Active BPs</span><span class="text-body1 q-ml-sm text-grey">{{producersApprovalStatus}}</span></h2>
    <q-card class="q-mb-xl">
        <q-table
            color="primary"
            flat
            :bordered="false"
            :square="true"
            table-header-class="text-grey-7"
            :rows="requestedApprovalsRows"
            :columns="requestedApprovalsColumns"
            row-key="index"
            :rows-per-page-options="[25,40,80,160]"
        >
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="actor" :props="props">
                        <router-link class="text-primary text-no-decoration cursor-pointer" :to="'/account/' + props.row.actor">{{props.row.actor}}</router-link>
                        <q-badge v-if="props.row.isBp" class="q-ml-xs" label="Active BP"/>
                    </q-td>
                    <q-td key="permission" :props="props"><span>{{props.row.permission}}</span></q-td>
                    <q-td key="status" :props="props">
                        <q-badge :color="props.row.status ? 'green' : 'orange'" :label="props.row.status ? 'APPROVED' : 'PENDING'"/>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </q-card>
</q-page>
</template>
<style lang="sass">
.proposal-item
    height: fit-content
    min-height: 25rem
    &__content
        height: 22rem
        padding-top: 6rem
    &__content-sub
        opacity: 0.5

</style>
