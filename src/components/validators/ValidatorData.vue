<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import ValidatorDataTable from './ValidatorDataTable.vue';
import { api } from 'src/api';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { GetTableRowsParams } from 'src/types';
import WalletModal from 'src/components/WalletModal.vue';
import { useRoute } from 'vue-router';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();
const symbol = chain.getSymbol();

export default defineComponent({
  name: 'Validator',
  components: {
    ValidatorDataTable,
    ViewTransaction,
    WalletModal
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const query = route.query;
    const account = computed(() => store.state.account.accountName);
    const balance = computed(
      () => store.state.account.data?.account?.core_liquid_balance || 0
    );
    const lastUpdated = ref<string>('');
    const producerVotes = ref<string[]>([]);
    const currentVote = computed(() => {
      let votes = store.state.account.vote;
      if (query['vote']) {
        return votes.concat(query['vote'] as string);
      }
      return votes;
    });
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
    const showWalletModal = ref<boolean>(false);
    const payrate = ref(0);
    const top21pay24h = ref(0);
    const supply = ref(0);
    const voters = ref(0);
    const amount_voted = ref(0);
    const votesProgress = computed(() => {
      return amount_voted.value / supply.value || 0;
    });

    async function getVotes() {
      if (account.value && account.value !== '') {
        const data = await api.getAccount(account.value);
        store.commit('account/setAccountData', data);
        const voterInfo = data.account.voter_info;
        if (!voterInfo) return;
        producerVotes.value = voterInfo?.producers;
        lastWeight.value = parseFloat(voterInfo.last_vote_weight).toFixed(2);
        lastStaked.value = voterInfo.last_stake;
        stakedAmount.value = voterInfo.staked;
      }
    }
    function assetToAmount(asset: string, decimals = -1): number {
      try {
        let qty: string = asset.split(' ')[0];
        let val: number = parseFloat(qty);
        if (decimals > -1) qty = val.toFixed(decimals);
        return val;
      } catch (error) {
        return 0;
      }
    }
    async function getVotingStatistics() {
      await updateVoteAmount();
      await updateSupply();
      await updatePayRate();
    }

    async function updatePayRate() {
      const paramsPayrate = {
        code: 'eosio',
        scope: 'eosio',
        table: 'payrate'
      } as GetTableRowsParams;
      payrate.value = (
        (await api.getTableRows(paramsPayrate)) as {
          rows: { bpay_rate: number }[];
        }
      ).rows[0].bpay_rate;
      top21pay24h.value = ((payrate.value / 100000) * supply.value) / 365 / 21;
    }

    async function updateSupply() {
      const paramsSupply = {
        code: 'eosio.token',
        scope: chain.getSymbol(),
        table: 'stat'
      } as GetTableRowsParams;
      supply.value = assetToAmount(
        (
          (await api.getTableRows(paramsSupply)) as {
            rows: { supply: string }[];
          }
        ).rows[0].supply
      );
    }

    async function updateVoteAmount() {
      const request = {
        code: 'eosio',
        lower_bound: 'eosio',
        table: 'voters'
      };
      voters.value = (await api.getTableByScope(request))[0].count;
      const totalStakeParams = {
        code: 'eosio',
        scope: 'eosio',
        table: 'global'
      } as GetTableRowsParams;
      amount_voted.value =
        (
          (await api.getTableRows(totalStakeParams)) as {
            rows: { total_activated_stake: number }[];
          }
        ).rows[0].total_activated_stake / 10000;
    }

    function toggleView() {
      showCpu.value = !showCpu.value;
    }
    async function sendVoteTransaction() {
      if (accountValid.value) {
        await store.dispatch('account/sendVoteTransaction');
        openTransaction.value = true;
      } else {
        showWalletModal.value = true;
      }
    }

    onMounted(async () => {
      await getVotes();
      await getVotingStatistics();
    });

    return {
      account,
      lastUpdated,
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
      transactionError,
      payrate,
      top21pay24h,
      supply,
      voters,
      amount_voted,
      votesProgress,
      balance,
      showWalletModal
    };
  }
});
</script>

<template lang="pug">
div
  .q-pa-md
    .row.q-col-gutter-md.q-pt-md
      .col-md-8.col-sm-12.col-xs-12
        q-card(flat).card-gradient
          q-card-section
            .row.q-pa-md.text-h5.text-weight-light Voting Statistics
            .row.q-pa-md.q-col-gutter-md
              .col-12
                q-linear-progress.gradient-color(size="120px" rounded :value="votesProgress" class="q-mt-sm")
              //- When we have a way to determine total accounts
              //- .col-6
              //-   q-linear-progress.gradient-color(size="120px" rounded :value="0.1" class="q-mt-sm" )
            .row.q-pa-md.q-col-gutter-md
              .col-12
                .row
                  .col-6.text-uppercase.text-weight-light.text-grey-4 Total votes
                  .col-6
                    .float-right.text-uppercase.text-weight-light.text-grey-4 Total Supply
                .row
                  .col-6 {{ amount_voted.toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}
                  .col-6
                    .float-right {{ supply.toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}
              //- When we have a way to determine total accounts
              //- .col-6
              //-   .row
              //-     .col-6 Voting Accounts
              //-     .col-6
              //-       .float-right Total Accounts
              //-   .row
              //-     .col-6 {{ voters.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2,}) }}
              //-     .col-6
              //-       .float-right 323,3232,32
      .col-md-4.col-sm-12.col-xs-12(v-if="accountValid")
        q-card(flat).full-height.card-gradient
          q-card-section.card-gradient
            .row.full-width.justify-center.text-h6.q-py-md.text-weight-light.text-grey-4 {{ `YOUR AVAILABLE ${symbol}` }}
            .row.full-width.justify-center.text-h5 {{ balance }}
            .row.full-width.justify-center.text-h6.q-py-md.text-weight-light.text-grey-4 {{account}}
          q-separator(color="primary" size="2px")
          q-card-section
            .row.full-width.justify-center.subtitle2.q-py-md.text-weight-light.text-grey-4.q-pt-lg SELECTED {{currentVote.length}} BLOCK PRODUCERS
            .row.full-width.justify-center
              q-btn.full-width.q-pa-sm(label="Vote for Block Producers" color="primary" @click="sendVoteTransaction")
      .col-md-4.col-sm-12.col-xs-12(v-else)
        q-card(flat).full-height.card-gradient
          q-card-section.full-height
            .column.justify-center.full-height
              .row
                .col-12.subtitle2.q-pb-md.text-weight-light.text-grey-4.q-pt-lg.text-center SELECTED {{currentVote.length}} BLOCK PRODUCERS
                .col-12
                  q-btn.full-width.q-pa-sm(label="Vote for Block Producers" color="primary" @click="sendVoteTransaction")
  ValidatorDataTable(
    ref="ValidatorDataTable"
    :producerVotes='producerVotes'
    :lastWeight='lastWeight'
    :lastStaked='lastStaked'
    :stakedAmount='stakedAmount'
    :lastUpdated='lastUpdated'
    @get-votes='getVotes'
    :top21pay24h = 'top21pay24h'
  )
  ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")
  WalletModal( v-model='showWalletModal' :changeRoute='false')
</template>

<style lang="sass" scoped>
.card-gradient
  background: var(--q-color-primary-gradient)
  color: white
</style>
