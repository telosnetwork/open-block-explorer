<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import ValidatorDataTable from './ValidatorDataTable.vue';
import { api } from 'src/api';
import { useStore } from 'src/store';
import { BP } from 'src/types';
import ViewTransaction from 'src/components/ViewTransanction.vue';

export default defineComponent({
  name: 'Validator',
  components: {
    ValidatorDataTable,
    ViewTransaction
  },
  setup() {
    const store = useStore();
    const account = computed(() => store.state.account.accountName);
    const lastUpdated = ref<string>('');
    const producerData = computed((): BP[] => store.state.chain.bpList);
    const producerVotes = ref([]);
    const currentVote = computed(() => store.state.account.vote);
    const showCpu = ref<boolean>(false);
    const voteChanged = ref<boolean>(false);
    const resetFlag = ref<boolean>(false);
    const lastWeight = ref<string>('0');
    const lastStaked = ref<number>(0);
    const stakedAmount = ref<number>(0);
    const accountValid = computed(() => account.value && account.value !== '');
    const transactionId = ref<string>(store.state.account.TransactionId);
    const transactionError = ref<unknown>(store.state.account.TransactionError);
    const openTransaction = ref<boolean>(false);

    async function getVotes() {
      if (account.value && account.value !== '') {
        const data = await api.getAccount(account.value);
        store.commit('account/setAccountData', data);
        const voterInfo = data.account.voter_info;
        producerVotes.value = voterInfo.producers;
        lastWeight.value = parseFloat(voterInfo.last_vote_weight).toFixed(2);
        lastStaked.value = voterInfo.last_stake;
        stakedAmount.value = voterInfo.staked;
      }
    }
    function toggleView() {
      showCpu.value = !showCpu.value;
    }
    async function sendVoteTransaction() {
      await store.dispatch('account/sendVoteTransaction');
      openTransaction.value = true;
    }

    onMounted(async () => {
      await getVotes();
    });

    return {
      account,
      lastUpdated,
      producerData,
      producerVotes,
      showCpu,
      voteChanged,
      resetFlag,
      lastWeight,
      lastStaked,
      stakedAmount,
      currentVote,
      toggleView,
      getVotes,
      accountValid,
      sendVoteTransaction,
      openTransaction,
      transactionId,
      transactionError
    };
  }
});
</script>

<template lang="pug">
div
  //- q-btn.toggle(@click='toggleView' label='toggleLabel' color='primary')
  //- q-btn.toggle( v-if='account' @click='' :disable='!voteChanged' label='Vote' color='primary')
  //- q-btn.toggle( v-if='account' @click='' :disable='!voteChanged' label='Reset' color='primary')
  .q-pa-md
    .row.q-col-gutter-md
      div(:class="accountValid ? 'col-md-8 col-sm-12 col-xs-12' : 'col-12'")
        q-card(flat).full-height
          q-card-section.voting-card
            .row.q-pa-md.text-h6 Voting Statistics
            .row.q-pa-md.q-col-gutter-md
              .col-6
                q-linear-progress(size="120px" :value="0.9" color="gradient4"  class="q-mt-sm")
              .col-6
                q-linear-progress(size="120px" :value="0.1"  class="q-mt-sm" )
            .row.q-pa-md.q-col-gutter-md
              .col-6
                .row
                  .col-6 Total votes
                  .col-6
                    .float-right Total Supply
                .row
                  .col-6 323,3232,32
                  .col-6
                    .float-right 323,3232,32
              .col-6
                .row
                  .col-6 Total votes
                  .col-6
                    .float-right Total Supply
                .row
                  .col-6 323,3232,32
                  .col-6
                    .float-right 323,3232,32
      .col-md-4.col-sm-12.col-xs-12(v-if="accountValid").full-height
        q-card(flat)
          q-card-section.voting-card
            .row.full-width.justify-center.text-h6.q-py-md.text-weight-light.text-grey-4 YOUR AVAILABLE TLOS
            .row.full-width.justify-center.text-h5 2,545,5
            .row.full-width.justify-center.text-h6.q-py-md.text-weight-light.text-grey-4 {{account}}
          q-separator(color="primary" size="2px")
          q-card-section.voting-card
            .row.full-width.justify-center.subtitle2.q-py-md.text-weight-light.text-grey-4 SELECTED {{currentVote.length}} BLOCK PRODUCERS
            .row.full-width.justify-center.q-pb-sm
              q-btn.full-width.q-pa-sm(label="Vote for Block Producers" color="primary" @click="sendVoteTransaction")
  ValidatorDataTable(
    ref="ValidatorDataTable"
    :producerData='producerData'
    :producerVotes='producerVotes'
    :lastWeight='lastWeight'
    :lastStaked='lastStaked'
    :stakedAmount='stakedAmount'
    :lastUpdated='lastUpdated'
    @get-votes='getVotes'
  )
  ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")
</template>

<style lang="sass" scoped>
.toggle
  margin-top: 0.75rem
  margin-left: 1rem
.voting-card
  background: $gradient-2
  color: white
.q-linear-progress
    color: $gradient-4 !important
.my-progress
  background: $gradient-4 !important
</style>
