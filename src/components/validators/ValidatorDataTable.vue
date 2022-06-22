<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  PropType,
  onMounted,
  watch
} from 'vue';
import moment from 'moment';
import { useStore } from 'src/store';
import { ual } from 'src/boot/ualapi';
import { BP } from 'src/types';

const MAX_VOTE_PRODUCERS = 30;

export default defineComponent({
  name: 'ValidatorDataTable',
  props: {
    producerVotes: { type: Array as PropType<string[]>, required: true },
    producerData: { type: Array, required: true },
    lastWeight: { type: String, required: true },
    lastStaked: { type: Number, required: true },
    stakedAmount: { type: Number, required: true },
    lastUpdated: { type: String, required: true }
  },
  setup(props) {
    const store = useStore();
    const account = computed(() => store.state.account.accountName);
    const currentVote = computed(() => store.state.account.vote);
    const selection = ref<string[]>([]);
    const HeadProducer = computed(
      (): string => store.state.chain.head_block_producer
    );
    const producerRows = computed((): BP[] => store.state.chain.bpList);
    const lastWeight = computed(() => Number(props.lastWeight));
    const lastUpdated = computed(() => props.lastUpdated);
    const stakedAmount = computed(() => props.stakedAmount);
    const tableHeader = computed(() => {
      const localTime = moment
        .utc(lastUpdated.value)
        .local()
        .format('YYYY-MM-DD HH:mm');
      return `Validators (${localTime})`;
    });

    const maxSelected = computed(
      () => currentVote.value.length === MAX_VOTE_PRODUCERS
    );
    const projectedVoteWeight = computed(() => {
      if (currentVote.value.length === 0) {
        return 0;
      }
      const percentVoted = currentVote.value.length / MAX_VOTE_PRODUCERS;
      const voteWeight =
        (Math.sin(Math.PI * percentVoted - Math.PI / 2.0) + 1) / 2.0;
      return voteWeight * stakedAmount.value;
    });
    const weightChange = computed(() => {
      //const difference = (projectedVoteWeight.value - lastWeight.value)
      const difference = 12;
      const symbol = difference > 0 ? '+' : '';
      const percentage =
        Number(lastWeight.value) > 0.001
          ? ((projectedVoteWeight.value / lastWeight.value) * 100).toFixed(2)
          : (projectedVoteWeight.value * 100).toFixed(2);
      return `${symbol}${difference} (${percentage}%)`;
    });

    const pagination = ref({
      rowsPerPage: 21
    });
    function removeVote(index: string) {
      currentVote.value.splice(Number(index), 1);
    }
    function getLink(domain: string, username: string) {
      return `https://${domain}/${username}`;
    }

    function getFlag(alpha2: number) {
      if (alpha2) {
        return `flag-icon-${alpha2}`;
      }
      return '';
    }

    function areEqualArrays(firstArray: [], secondArray: []) {
      if (
        !Array.isArray(firstArray) ||
        !Array.isArray(secondArray) ||
        firstArray.length !== secondArray.length
      ) {
        return false;
      }
      var tempFirstArray = firstArray.concat().sort();
      var tempSecondArray = secondArray.concat().sort();
      for (var i = 0; i < tempFirstArray.length; i++) {
        if (tempFirstArray[i] !== tempSecondArray[i]) {
          return false;
        }
      }
      return true;
    }

    function updateVote(val: string[]) {
      store.commit('account/setVote', val);
    }

    async function sendVoteTransaction() {
      await store.dispatch('account/sendVoteTransaction');
    }

    onMounted(() => {
      // void checkHeader();
      // void resetVotes();
      console.log(producerRows.value);
      console.log(account.value);
    });
    return {
      producerRows,
      account,
      HeadProducer,
      removeVote,
      selection,
      maxSelected,
      projectedVoteWeight,
      weightChange,
      tableHeader,
      getLink,
      getFlag,
      currentVote,
      pagination,
      updateVote
    };
  }
});
</script>

<template lang="pug">
.q-pa-md
  div.bp-list(style="overflow-x: scroll; width: 100%;")
    .row.q-col-gutter-sm
      .col-12(style="min-width: 1000px;")
        q-card(flat)
          .q-card-section.q-pa-md.text-subtitle1.text-weight-light
            .row
              .col-1 Rank
              .col-3  BP
              .col-2.offset-3  Rank
              .col-2  Votes
      .col-12( v-for='(bp,i) in producerRows' style="min-width: 1000px;")
        q-card.producer-card(flat)
          .q-card-section
            .row
              .col-1.q-py-md
                .row.items-center.full-height.text-h6.q-px-md {{producerRows.indexOf(bp) + 1}}
              .col-3.q-py-md
                .text-uppercase.text-h6 {{ bp.owner }}
                .text-body2 {{ bp.org?.location?.name ? bp.org.location.name : 'unknown' }}
              .col-2.q-py-md.offset-3
                .row.items-center.full-height
                  q-chip(v-if="HeadProducer === bp.owner " square color="primary" text-color="white" label="Producing")
                  q-chip(v-else outline square color="primary" text-color="white" label="Top 21")
              .col-2.q-py-md
                .row.items-center.full-height {{ (bp.total_votes / 10000).toFixed(0) }}
              .col-1.select-box.q-py-md
                .row.full-selection.justify-center
                  q-checkbox(v-model="currentVote" :val="bp.owner" @update:model-value="(val)=> updateVote(val)")

</template>

<style lang="sass" scoped>
.testnet-indicator
  font-size: 12px
  margin-right: .5rem
.flag-column
  text-align: center
.producer-card
  background: #f5f4fe
.voting-stats
  display: flex
  justify-content: space-between
  min-height: 2rem
  margin-top: 1rem
  margin-bottom: 1rem
  line-height: 2rem
  padding-left: 1rem
  span
    margin-left: .25rem
    &.full-selection
      margin-left: .25rem
      font-weight: 600
.count-field
  display: inline-block
  margin-right: 2rem

.select
  border-radius: 5px 0px 0px 5px
  background: $primary
.middle-cell
  border-radius: 0px
  background: $primary
.select-box
  background: #e0dffb
</style>
