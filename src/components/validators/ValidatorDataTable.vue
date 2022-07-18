<script lang="ts">
import { defineComponent, computed, ref, PropType } from 'vue';
import moment from 'moment';
import { useStore } from 'src/store';
import { Producer } from 'src/types';
import { useRoute } from 'vue-router';

const MAX_VOTE_PRODUCERS = 30;

export default defineComponent({
  name: 'ValidatorDataTable',
  props: {
    producerVotes: { type: Array as PropType<string[]>, required: true },
    lastWeight: { type: String, required: true },
    lastStaked: { type: Number, required: true },
    stakedAmount: { type: Number, required: true },
    lastUpdated: { type: String, required: true },
    top21pay24h: { type: Number, required: true }
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const query = route.query;
    const account = computed(() => store.state.account.accountName);
    const currentVote = computed(() => {
      let votes = store.state.account.vote;
      if (query['vote']) {
        return votes.concat(query['vote'] as string);
      }
      return votes;
    });
    const selection = ref<string[]>([]);
    const HeadProducer = computed(
      (): string => store.state.chain.head_block_producer
    );
    const producerRows = computed(
      (): Producer[] => store.state.chain.producers || []
    );
    const lastWeight = computed(() => Number(props.lastWeight));
    const lastUpdated = computed(() => props.lastUpdated);
    const stakedAmount = computed(() => props.stakedAmount);
    const producerPay = computed(() => props.top21pay24h);
    const bpTop21 = computed(() => store.state.chain.producerSchedule);
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

    function updateVote(val: string[]) {
      store.commit('account/setVote', val);
    }

    function isTop21(val: string): boolean {
      return bpTop21.value.includes(val);
    }

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
      updateVote,
      producerPay,
      isTop21
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
              .col-2.offset-1  Rank
              .col-2  Votes
              .col-2  Reward 24h
      .col-12( v-for='(bp,i) in producerRows' style="min-width: 1000px;")
        q-card.producer-card(flat)
          .q-card-section
            .row
              .col-1.q-py-md
                .row.items-center.full-height.text-h6.q-px-md {{producerRows.indexOf(bp) + 1}}
              .col-3.q-py-md
                a(:href=" '/account/' + bp.owner" class="hover-dec")
                  .text-uppercase.text-h6.text-black {{ bp.name|| bp.owner }}
                .text-body2 {{ bp.location }}
              .col-2.q-py-md.offset-1
                .row.items-center.full-height
                  q-chip(v-if="HeadProducer === bp.owner " square color="primary" text-color="white" label="Producing")
                  q-chip(v-else-if="(producerRows.indexOf(bp) + 1) < 22" outline square color="primary" text-color="white" label="Top 21")
                  q-chip(v-else-if="(producerRows.indexOf(bp) + 1) < 43" outline square color="primary" text-color="white" label="Standby")
                  q-chip(v-else outline square color="primary" text-color="white" label="Unpaid Standby")
              .col-2.q-py-md
                .row.items-center.full-height {{ (bp.total_votes / 10000).toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}
              .col-2.q-py-md
                .row.items-center.full-height {{ ((producerRows.indexOf(bp) + 1) < 22 ? producerPay : (producerRows.indexOf(bp) + 1) < 43 ? producerPay / 2 : 0 ).toFixed(0)  + ' TLOS' }}
              .col-1.select-box.q-py-md
                .row.full-selection.justify-center
                  q-checkbox(v-model="currentVote" :val="bp.owner" @update:model-value="(val)=> updateVote(val)")

</template>

<style lang="sass" scoped>
.producer-card
  background: $purple-light-1
.select-box
  background: $purple-light-2
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
    color: black
</style>
