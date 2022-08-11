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
        template(#header)
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
      )
        template(#header)
          span.text-h6.text-weight-regular Requested approvals

        div.q-pa-md
          ProposalAuthorization(
            v-for="(item, index) in formData.requested"
            :key="index"
            v-model:actor="item.actor"
            v-model:permission="item.permission"
            @remove="formData.requested.splice(index, 1)"
          )
          q-btn(outline padding="sm md" color="white" text-color="primary" label="Add" @click="formData.requested.push({})")

        q-separator.q-my-md
        div.q-pb-md
          q-item(tag="label" v-ripple v-if="blockProducers.length")
            q-item-section(side top)
              q-checkbox(v-model="areBlockProducersApproving")
            q-item-section
              span.text-body1 All block producers need approvals

    q-card(flat :style="{background: '#E8E2F7'}").q-mt-xs
      q-expansion-item(
        switch-toggle-side
      )
        template(#header)
          span.text-h6.text-weight-regular Advanced transaction settings
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
              label="expiration"
              v-model="formData.trx.expiration"
              @update:model-value="onExpiration"
              :rules="[value => !!value || 'Field is required', value => !isNaN(new Date(value).getTime()) || 'Invalid date', value => new Date(value) > new Date() || 'Date must be greater than today']")
              template(#prepend)
                q-icon(name="event" class="cursor-pointer" size="20px")
                  q-popup-proxy(cover transition-show="scale" transition-hide="scale")
                    q-date(v-model="formData.trx.expiration" @update:model-value="onExpiration" mask="YYYY-MM-DDTHH:mm:ss" :options="(date) => date >= '2022/07/05'")
                      div.row.items-center.justify-end
                        div.col
                          q-input(
                            outlined
                            dense
                            hide-bottom-space
                            bg-color="white"
                            type="number"
                            min="1"
                            v-model="amountOfDaysToExpire"
                            @update:model-value="onAmountOfDaysToExpire"
                            label="Amount of days to expire"
                          )
                        q-btn(v-close-popup label="Close" color="primary" flat)
              template(#append)
                q-icon(name="access_time" class="cursor-pointer" size="20px")
                  q-popup-proxy(cover transition-show="scale" transition-hide="scale")
                    q-time(v-model="formData.trx.expiration" @update:model-value="onExpiration" mask="YYYY-MM-DDTHH:mm:ss")
                      div.row.items-center.justify-end
                        q-btn(v-close-popup label="Close" color="primary" flat)

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

    ProposalAction(
      v-for="(_, index) in formData.trx.actions"
      v-model="formData.trx.actions[index]"
      @remove="formData.trx.actions.splice(index, 1)"
    )

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
import ProposalAuthorization from 'components/ProposalAuthorization.vue';
import ProposalAction from 'components/ProposalAction.vue';
import { Authorization, ProposalForm, Error } from 'src/types';
import { api } from 'src/api';
import { useAuthenticator } from 'src/composables/useAuthenticator';
import { randomEosioName } from 'src/utils/handleEosioName';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'ProposalNew',
  components: {
    ProposalSuccess,
    ProposalAuthorization,
    ProposalAction
  },
  setup() {
    const router = useRouter();
    const { account, isAuthenticated, getUser } = useAuthenticator();
    const $q = useQuasar();

    const amountOfDaysToExpire = ref(7);
    const blockProducers = ref<Authorization[]>([]);
    const areBlockProducersApproving = ref(false);

    const success = reactive({
      proposalName: '',
      transactionId: '',
      showModal: false
    });

    const formData: ProposalForm = reactive({
      proposer: '',
      proposal_name: '',
      requested: [
        {
          actor: '',
          permission: ''
        }
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
        context_free_actions: '',
        transaction_extensions: '',
        actions: []
      }
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
            permission: 'active'
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
            color: 'white'
          }
        ]
      });
    }

    async function onSubmit() {
      const data = JSON.parse(JSON.stringify(formData)) as ProposalForm;

      if (areBlockProducersApproving.value) {
        data.requested = data.requested.concat(
          JSON.parse(JSON.stringify(blockProducers.value))
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

      data.trx.transaction_extensions = data.trx.transaction_extensions
        ? (data.trx.transaction_extensions as string).split(',')
        : [];

      data.trx.context_free_actions = data.trx.context_free_actions
        ? (data.trx.context_free_actions as string).split(',')
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
            item.data
          );

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
        handleError(
          error?.cause?.json?.error?.what || 'Unable to create a proposal'
        );
      }
    }

    function onAddAction() {
      formData.trx.actions.push({
        account: '',
        name: '',
        authorization: [
          {
            actor: '',
            permission: ''
          }
        ],
        data: {}
      });
    }

    function onAmountOfDaysToExpire(days: number) {
      if (days) {
        formData.trx.expiration = moment()
          .add(days, 'days')
          .format('YYYY-MM-DDTHH:mm:ss');
      }
    }

    function onExpiration(value: string) {
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

    return {
      onSubmit,
      onAddAction,
      amountOfDaysToExpire,
      onAmountOfDaysToExpire,
      onExpiration,
      formData,
      areBlockProducersApproving,
      blockProducers,
      success
    };
  }
});
</script>
