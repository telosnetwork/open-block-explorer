<template lang="pug">
ProposalSuccess(
  v-model="success.showModal"
  :transactionId="success.transactionId"
  :proposalName="success.proposalName"
)

q-page(padding)
  q-form(@submit="onSubmit" greedy)
    div.row.justify-between.items-center.q-py-lg
      h1.text-h5.q-ma-none New Proposal Multisig Transaction
      div.row
        q-btn(outline padding="sm md" color="white" text-color="primary" label="Cancel" to="/proposal").q-mr-sm
        q-btn(unelevated padding="sm md" color="primary" label="Send proposal" type="submit")
    q-separator

    q-card(flat :style="{background: '#E8E2F7'}").q-mt-md
      q-expansion-item(
        switch-toggle-side
        default-opened
      )
        template(v-slot:header)
          span.text-h6.text-weight-regular Proposal Info
        div.row.q-col-gutter-md.q-pa-md
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              lazy-rules
              bg-color="white"
              v-model="formData.proposal_name"
              label="Proposal Name"
              maxlength="13"
              :rules="[value => !!value || 'Field is required']")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              lazy-rules
              readonly
              bg-color="white"
              v-model="formData.proposer"
              label="Proposer"
              maxlength="12"
              :rules="[value => !!value || 'Field is required']")

    q-card(flat :style="{background: '#E8E2F7'}").q-mt-xs
      q-expansion-item(
        switch-toggle-side
        default-opened
        v-model="requestedApprovalsExpansionItem.opened"
      )
        template(v-slot:header)
          span.text-h6.text-weight-regular Requested approvals
            span(v-if="requestedApprovalsExpansionItem.error").text-body2.text-red.q-ml-sm At least one requested approval

        q-item(tag="label" v-ripple v-if="blockProducers.length")
          q-item-section(side top)
            q-checkbox(v-model="areBlockProducersApproving")
          q-item-section
            span.text-body1 All block producers need approvals
        q-separator.q-my-md
        div.q-pa-md
          div.row.q-col-gutter-md.q-mb-md(v-for="(item, index) in formData.requested")
            div.col.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                bg-color="white"
                v-model="item.actor"
                label="Actor (e.g. eosio)"
                :rules="[value => !!value || 'Field is required']")
            div.col.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                bg-color="white"
                v-model="item.permission"
                label="Permission (e.g. active)"
                :rules="[value => !!value || 'Field is required']")
            div.col-sm-4
              q-btn(outline padding="sm md" color="white" text-color="primary" label="Remove" @click="formData.requested.splice(index, 1)")

          q-btn(outline padding="sm md" color="white" text-color="primary" label="Add" @click="formData.requested.push({})")

    q-card(flat :style="{background: '#E8E2F7'}").q-mt-xs
      q-expansion-item(
        switch-toggle-side
      )
        template(v-slot:header)
          span.text-h6.text-weight-regular Transaction Settings
        div.row.q-col-gutter-md.q-pa-md
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.max_net_usage_words"
              label="max_net_usage_words")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.max_cpu_usage_ms"
              label="max_cpu_usage_ms")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.delay_sec"
              label="delay_sec")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.context_free_actions"
              label="context_free_actions")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.transaction_extensions"
              label="transaction_extensions")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.expiration"
              label="expiration"
              mask="####-##-##T##:##:##")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.ref_block_num"
              label="ref_block_num")
          div.col-12.col-sm-6
            q-input(
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              v-model="formData.trx.ref_block_prefix"
              label="ref_block_prefix")

    q-card(v-for="(item, index) in formData.trx.actions").q-mt-md
      q-expansion-item(
        switch-toggle-side
        default-opened
      )
        template(v-slot:header)
          div.full-width.row.justify-between.items-center
            div.col.row.items-center(:style="{minHeight: '36px'}")
              div.col.row.items-center
                div.col-12.col-sm
                  span.text-h6.text-weight-regular(v-if="item.account && item.name") {{item.account}} - {{item.name}}
                  span.text-h6.text-weight-regular(v-else) Action {{index + 1}}
                div.col-12.col-sm
                  span.text-body2(v-if="item.dataAction.from && item.dataAction.to && item.dataAction.quantity") <b>{{item.dataAction.from}} → {{item.dataAction.to}}</b> {{item.dataAction.quantity}}
            div
              q-btn(outline padding="sm md" color="white" text-color="primary" label="Remove" :disabled="formData.trx.actions.length === 1" @click.stop="formData.trx.actions.splice(index, 1)")
        div.q-pa-md
          div.row.q-col-gutter-md.q-mb-md
            div.col-6.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                v-model="item.account"
                label="account"
                :rules="[value => !!value || 'Field is required']")
            div.col-6.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                v-model="item.name"
                label="Action"
                :rules="[value => !!value || 'Field is required']")

          div.row.q-col-gutter-md
            div.col-6.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                v-model="item.dataAction.from"
                label="From"
                maxlength="12"
                :rules="[value => !!value || 'Field is required']")
            div.col-6.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                v-model="item.dataAction.to"
                label="To"
                maxlength="12"
                :rules="[value => !!value || 'Field is required']")
            div.col-12.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                v-model="item.dataAction.quantity"
                label="Quantity"
                fill-mask="0"
                reverse-fill-mask
                mask="#.######## TLO\\S"
                :rules="[value => !!value || 'Field is required', value => Number(value.replace(' TLOS', '')) > 0 || 'Field must have a value greater than zero' ]")
            div.col-12
              q-input(
                outlined
                dense
                hide-bottom-space
                v-model="item.dataAction.memo"
                label="Memo (optional)").q-mt-xs

          p.text-body1.q-my-md.q-mb-none Authorization

          div.row.q-col-gutter-md.q-mb-md(v-for="(authorizationItem, authorizationIndex) in item.authorization")
            div.col.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                bg-color="white"
                v-model="authorizationItem.actor"
                label="Actor (e.g. eosio)"
                maxlength="12"
                :rules="[value => !!value || 'Field is required']")
            div.col.col-sm-4
              q-input(
                outlined
                dense
                hide-bottom-space
                lazy-rules
                bg-color="white"
                v-model="authorizationItem.permission"
                label="Permission (e.g. active)"
                :rules="[value => !!value || 'Field is required']")
            div.col-sm-4
              q-btn(outline padding="sm md" color="white" text-color="primary" label="Remove" :disable="item.authorization.length === 1" @click="item.authorization.splice(authorizationIndex, 1)")

          q-btn(outline padding="sm md" color="white" text-color="primary" label="Add" @click.stop="item.authorization.push({})")

    q-card.q-my-md.q-pa-xl
      div.row.justify-center.items-center
        q-btn(
          outline
          padding="sm md"
          color="white"
          text-color="primary"
          label="Add action"
          @click="onAddAction")
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
import ProposalSuccess from 'components/ProposalSuccess.vue';
import { Authorization, ProposalForm, Error } from 'src/types';
import { api } from 'src/api';
import { useAuthenticator } from 'src/composables/useAuthenticator';
import { serializeActionData } from 'src/utils/serializeActionData';
import { randomEosioName } from 'src/utils/handleEosioName';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'ProposalNew',
  components: {
    ProposalSuccess
  },
  setup() {
    const router = useRouter();
    const { account, isAuthenticated, getUser } = useAuthenticator();
    const $q = useQuasar();

    const blockProducers = ref<Authorization[]>([]);
    const areBlockProducersApproving = ref(false);
    const requestedApprovalsExpansionItem = reactive({
      opened: false,
      error: false
    });

    const success = reactive({
      proposalName: '',
      transactionId: '',
      showModal: false
    });

    const formData: ProposalForm = reactive({
      proposer: '',
      proposal_name: '',
      requested: [],
      trx: {
        expiration: moment().add(1, 'week').format('YYYY-MM-DDTHH:mm:ss'),
        ref_block_num: 0,
        ref_block_prefix: 0,
        max_net_usage_words: 0,
        max_cpu_usage_ms: 0,
        delay_sec: 0,
        context_free_actions: '',
        transaction_extensions: '',
        actions: [
          {
            account: 'eosio.token',
            name: 'transfer',
            authorization: [
              {
                actor: '',
                permission: ''
              }
            ],
            data: '',
            dataAction: {
              from: '',
              to: '',
              quantity: '',
              memo: ''
            }
          }
        ]
      }
    });

    onMounted(() => {
      formData.proposal_name = randomEosioName();
      formData.proposer = account.value;
      formData.trx.actions[0].dataAction.from = account.value;
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
            permission: 'active'
          });
        }
      }

      blockProducers.value = producersAccount;
    });

    async function onSubmit() {
      const data = JSON.parse(JSON.stringify(formData)) as ProposalForm;

      if (areBlockProducersApproving.value) {
        data.requested = data.requested.concat(
          JSON.parse(JSON.stringify(blockProducers.value))
        );
      }

      if (data.requested.length === 0) {
        requestedApprovalsExpansionItem.opened = true;
        requestedApprovalsExpansionItem.error = true;
        return;
      }

      data.trx.transaction_extensions = data.trx.transaction_extensions
        ? (data.trx.transaction_extensions as string).split(',')
        : [];

      data.trx.context_free_actions = data.trx.context_free_actions
        ? (data.trx.context_free_actions as string).split(',')
        : [];

      try {
        for (let i = 0; i < data.trx.actions.length; i++) {
          const item = data.trx.actions[i];

          const hexData = await serializeActionData({
            account: item.account,
            name: item.name,
            data: item.dataAction
          });

          delete data.trx.actions[i].dataAction;
          data.trx.actions[i].data = hexData;
        }

        const user = await getUser();
        const transaction = await user.signTransaction(
          {
            actions: [
              {
                account: 'eosio.msig',
                name: 'propose',
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

        success.showModal = true;
        success.transactionId = transaction.transactionId;
        success.proposalName = data.proposal_name;
      } catch (e) {
        const error = JSON.parse(JSON.stringify(e)) as Error;
        $q.notify({
          color: 'negative',
          message:
            error?.cause?.json?.error?.what || 'Unable to create a proposal',
          actions: [
            {
              label: 'Dismiss',
              color: 'white'
            }
          ]
        });
      }
    }

    function onAddAction() {
      formData.trx.actions.push({
        account: 'eosio.token',
        name: 'transfer',
        authorization: [
          {
            actor: '',
            permission: ''
          }
        ],
        dataAction: {
          from: '',
          to: '',
          quantity: '',
          memo: ''
        }
      });
    }

    return {
      onSubmit,
      onAddAction,
      formData,
      areBlockProducersApproving,
      blockProducers,
      success,
      requestedApprovalsExpansionItem
    };
  }
});
</script>
