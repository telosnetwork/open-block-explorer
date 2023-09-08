<!-- eslint-disable vue/no-static-inline-styles -->
<!-- eslint-disable vue/no-static-inline-styles -->
<!-- eslint-disable vue/no-static-inline-styles -->
<script lang="ts">
import { defineComponent, reactive, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
import ProposalSuccess from 'components/ProposalSuccess.vue';
import ProposalAuthorization from 'components/ProposalAuthorization.vue';
import ProposalAction from 'components/ProposalAction.vue';
import ProposalUploadCSV from 'components/ProposalUploadCSV.vue';
import { Authorization, ProposalForm, Error } from 'src/types';
import { api } from 'src/api';
import { randomEosioName } from 'src/utils/handleEosioName';
import { useQuasar } from 'quasar';
import { useStore } from 'src/store';

export default defineComponent({
    name: 'ProposalNew',
    components: {
        ProposalSuccess,
        ProposalAuthorization,
        ProposalAction,
        ProposalUploadCSV,
    },
    setup() {
        const router = useRouter();
        const store = useStore();
        const $q = useQuasar();
        const account = computed(() => store.state.account.accountName);
        const isAuthenticated = computed(() => store.state.account.isAuthenticated);
        const actionsTab = ref<'one' | 'batch'>('one');
        const amountOfDaysToExpire = ref(7);
        const blockProducers = ref<Authorization[]>([]);
        const areBlockProducersApproving = ref(false);

        const context_free_actions_input = ref('');
        const transaction_extensions_input = ref('');


        const success = reactive({
            proposalName: '',
            transactionId: '',
            showModal: false,
        });

        const formData: ProposalForm = reactive({
            proposer: '',
            proposal_name: '',
            requested: [
                {
                    actor: '',
                    permission: '',
                },
            ],
            trx: {
                expiration: moment()
                    .add(amountOfDaysToExpire.value, 'days')
                    .format('YYYY-MM-DDTHH:mm:ss'),
                ref_block_num: 0,
                ref_block_prefix: 0,
                max_net_usage_words: 0,
                max_cpu_usage_ms: 0,
                delay_sec: 0,
                context_free_actions: [''],
                transaction_extensions: [''],
                actions: [],
            },
        });

        onMounted(() => {
            formData.proposal_name = randomEosioName();
            formData.proposer = account.value;
        });

        onMounted(async () => {
            if (!isAuthenticated.value) {
                await router.push('/proposal');
            }
        });

        onMounted(async () => {
            const producers = await api.getProducers();
            const producersAccount = [] as Authorization[];

            for (let index = 0; index < producers.rows.length; index++) {
                const item = producers.rows[index];
                if (item.is_active === 1) {
                    producersAccount.push({
                        actor: item.owner,
                        permission: store.state.account.accountPermission,
                    });
                }
            }

            blockProducers.value = producersAccount;
        });

        function handleError(message: string) {
            $q.notify({
                color: 'negative',
                message,
                actions: [
                    {
                        label: 'Dismiss',
                        color: 'white',
                    },
                ],
            });
        }

        async function onSubmit() {
            const data = JSON.parse(JSON.stringify(formData)) as ProposalForm;

            if (areBlockProducersApproving.value) {
                data.requested = data.requested.concat(
                    JSON.parse(JSON.stringify(blockProducers.value)),
                );
            }

            if (data.requested.length === 0) {
                handleError('At least one requested approval');
                return;
            }

            if (data.trx.actions.length === 0) {
                handleError('At least one action');
                return;
            }

            data.trx.transaction_extensions = transaction_extensions_input.value
                ? transaction_extensions_input.value.split(',')
                : [];

            data.trx.context_free_actions = context_free_actions_input.value
                ? context_free_actions_input.value.split(',')
                : [];

            try {
                for (let i = 0; i < data.trx.actions.length; i++) {
                    const item = data.trx.actions[i] as {
                        account: string;
                        name: string;
                        data: unknown;
                    };

                    const hexData = await api.serializeActionData(
                        item.account,
                        item.name,
                        item.data,
                    );

                    data.trx.actions[i].data = hexData as { [key: string]: string | number; };
                }

                const transaction = await store.state.account.user.signTransaction(
                    {
                        actions: [
                            {
                                account: 'eosio.msig',
                                name: 'propose',
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
                if (store.state.account.autoLogin !== 'cleos') {
                    success.showModal = true;
                }

                success.transactionId = transaction.transactionId;
                success.proposalName = data.proposal_name;
            } catch (e) {
                const error = JSON.parse(JSON.stringify(e)) as Error;
                handleError(
                    error?.cause?.json?.error?.what || 'Unable to create a proposal',
                );
            }
        }

        function onAddAction() {
            const length = formData.trx.actions.length;
            formData.trx.actions.push({
                renderKey: (formData.trx.actions[length-1]?.renderKey ?? 0) + 1,
                account: '',
                name: '',
                authorization: [
                    {
                        actor: '',
                        permission: '',
                    },
                ],
                data: {},
            });
        }

        function onAmountOfDaysToExpire(days: string | number) {
            if (days) {
                formData.trx.expiration = moment()
                    .add(days, 'days')
                    .format('YYYY-MM-DDTHH:mm:ss');
            }
        }

        function onExpiration(value: string | number) {
            if (value === null) {
                amountOfDaysToExpire.value = 7;
                onAmountOfDaysToExpire(7);
                return;
            }

            const now = new Date().getTime();
            const date = new Date(value).getTime();
            if (!isNaN(date)) {
                const diffTime = Math.abs(date - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                amountOfDaysToExpire.value = diffDays;
            }
        }

        /* eslint-disable */
        function onUploadCSV(actions: any) {
            const length = formData.trx.actions.length;
            let actionsWithRenderKey = actions.map((value: any, index: number) => ({
                ...value, renderKey: (formData.trx.actions[length-1]?.renderKey ?? 0) + 1 + index
            }));
            formData.trx.actions = [
                ...formData.trx.actions,
                ...actionsWithRenderKey
            ];
        }
        /* eslint-enable */

        return {
            onSubmit,
            onAddAction,
            amountOfDaysToExpire,
            onAmountOfDaysToExpire,
            onExpiration,
            onUploadCSV,
            formData,
            areBlockProducersApproving,
            blockProducers,
            actionsTab,
            success,
            context_free_actions_input,
            transaction_extensions_input,
        };
    },
});
</script>

<template>

<ProposalSuccess v-model="success.showModal" :transactionId="success.transactionId" :proposalName="success.proposalName"/>
<q-page padding>
    <q-form greedy @submit="onSubmit">
        <div class="row justify-between items-center q-py-lg">
            <h1 class="text-h5 q-ma-none">New Proposal Multisig Transaction</h1>
            <div class="row">
                <q-btn
                    outline
                    class="q-mr-sm"
                    padding="sm md"
                    color="white"
                    text-color="primary"
                    label="Cancel"
                    to="/proposal"
                />
                <q-btn
                    unelevated
                    padding="sm md"
                    color="primary"
                    label="Send proposal"
                    type="submit"
                />
            </div>
        </div>
        <q-separator/>
        <q-card flat class="q-mt-md proposal-success__card--background" >
            <q-expansion-item switch-toggle-side default-opened>
                <template #header><span class="text-h6 text-weight-regular">Proposal Info</span></template>
                <div class="row q-col-gutter-md q-pa-md">
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.proposal_name"
                            outlined
                            dense
                            hide-bottom-space
                            lazy-rules
                            bg-color="white"
                            label="Proposal Name"
                            maxlength="13"
                            :rules="[value => !!value || 'Field is required', value=> /(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/.test(value) || 'Must be up to 12 characters (a-z, 1-5, .) and cannot end with a .']"
                        >
                            <template #append>
                                <q-icon name="info"/>
                                <q-tooltip class="text-body2">
                                    <ul class="q-px-lg q-py-none">
                                        <li>Minimum of 2 characters</li>
                                        <li>Maximum of 13 characters</li>
                                        <li>First 12 characters can be “a-z” or “1-5" or “.”</li>
                                        <li>13th character can only be “a-j” or “1-5”</li>
                                        <li>Last character can not be “.”</li>
                                    </ul>
                                </q-tooltip>
                            </template>
                        </q-input>
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.proposer"
                            outlined
                            dense
                            hide-bottom-space
                            lazy-rules
                            readonly
                            bg-color="white"
                            label="Proposer"
                            maxlength="12"
                            :rules="[value => !!value || 'Field is required']"
                        />
                    </div>
                </div>
            </q-expansion-item>
        </q-card>
        <q-card flat class="q-mt-xs proposal-success__card--background">
            <q-expansion-item switch-toggle-side default-opened>
                <template #header><span class="text-h6 text-weight-regular">Requested approvals</span></template>
                <div class="q-pa-md">
                    <ProposalAuthorization
                        v-for="(item, index) in formData.requested"
                        :key="index"
                        v-model:actor="item.actor"
                        v-model:permission="item.permission"
                        @remove="formData.requested.splice(index, 1)"
                    />
                    <q-btn
                        outline
                        padding="sm md"
                        color="white"
                        text-color="primary"
                        label="Add"
                        @click="formData.requested.push({actor: '', permission: ''})"
                    />
                </div>
                <q-separator class="q-my-md"/>
                <div class="q-pb-md">
                    <q-item v-if="blockProducers.length" v-ripple tag="label">
                        <q-item-section side top>
                            <q-checkbox v-model="areBlockProducersApproving"/>
                        </q-item-section>
                        <q-item-section><span class="text-body1">All block producers need approvals</span></q-item-section>
                    </q-item>
                </div>
            </q-expansion-item>
        </q-card>
        <q-card flat class="q-mt-xs proposal-success__card--background">
            <q-expansion-item switch-toggle-side>
                <template #header><span class="text-h6 text-weight-regular">Advanced transaction settings</span></template>
                <div class="row q-col-gutter-md q-pa-md">
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.trx.max_net_usage_words"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="max_net_usage_words"
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.trx.max_cpu_usage_ms"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="max_cpu_usage_ms"
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.trx.delay_sec"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="delay_sec"
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="context_free_actions_input"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="context_free_actions"
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="transaction_extensions_input"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="transaction_extensions"
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.trx.expiration"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="expiration"
                            :rules="[value => !!value || 'Field is required', value => !isNaN(new Date(value).getTime()) || 'Invalid date', value => new Date(value) > new Date() || 'Date must be greater than today']"
                            @update:model-value="onExpiration"
                        >
                            <template #prepend>
                                <q-icon class="cursor-pointer" name="event" size="20px">
                                    <q-popup-proxy cover="cover" transition-show="scale" transition-hide="scale">
                                        <q-date
                                            v-model="formData.trx.expiration"
                                            mask="YYYY-MM-DDTHH:mm:ss"
                                            :options="(date) => date >= '2022/07/05'"
                                            @update:model-value="onExpiration"
                                        >
                                            <div class="row items-center justify-end">
                                                <div class="col">
                                                    <q-input
                                                        v-model="amountOfDaysToExpire"
                                                        outlined
                                                        dense
                                                        hide-bottom-space
                                                        bg-color="white"
                                                        type="number"
                                                        min="1"
                                                        label="Amount of days to expire"
                                                        @update:model-value="onAmountOfDaysToExpire"
                                                    />
                                                </div>
                                                <q-btn
                                                    v-close-popup
                                                    flat
                                                    label="Close"
                                                    color="primary"
                                                />
                                            </div>
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                            <template #append>
                                <q-icon class="cursor-pointer" name="access_time" size="20px">
                                    <q-popup-proxy cover="cover" transition-show="scale" transition-hide="scale">
                                        <q-time v-model="formData.trx.expiration" mask="YYYY-MM-DDTHH:mm:ss" @update:model-value="onExpiration">
                                            <div class="row items-center justify-end">
                                                <q-btn
                                                    v-close-popup
                                                    flat
                                                    label="Close"
                                                    color="primary"
                                                />
                                            </div>
                                        </q-time>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.trx.ref_block_num"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="ref_block_num"
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-input
                            v-model="formData.trx.ref_block_prefix"
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            label="ref_block_prefix"
                        />
                    </div>
                </div>
            </q-expansion-item>
        </q-card>
        <ProposalAction
            v-for="(action, index) in formData.trx.actions"
            :key="action.renderKey"
            v-model="formData.trx.actions[index]"
            @remove="formData.trx.actions.splice(index, 1)"
        />
        <q-card class="q-my-md">
            <q-tabs v-model="actionsTab">
                <q-tab name="one" label="One action"/>
                <q-tab name="batch" label="Transfer in batch"/>
            </q-tabs>
            <q-separator/>
            <q-tab-panels v-model="actionsTab">
                <q-tab-panel name="one">
                    <div class="row justify-center items-center q-py-lg">
                        <q-btn
                            outline
                            padding="sm md"
                            color="white"
                            text-color="primary"
                            label="Add action"
                            @click="onAddAction"
                        />
                    </div>
                </q-tab-panel>
                <q-tab-panel name="batch">
                    <ProposalUploadCSV @actions="onUploadCSV"/>
                </q-tab-panel>
            </q-tab-panels>
        </q-card>
    </q-form>
</q-page>
</template>

<style lang="sass" >
.proposal-success
    &__card
        &--background
            background: '#E8E2F7'

</style>
