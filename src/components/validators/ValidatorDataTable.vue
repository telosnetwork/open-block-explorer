<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { Producer } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

const MAX_VOTE_PRODUCERS = 30;

export default defineComponent({
  name: 'ValidatorDataTable',
  props: {
    top21pay24h: { type: Number, required: true },
  },
  setup(props) {
    const store = useStore();
    const symbol = chain.getSystemToken().symbol;
    const account = computed(() => store.state.account.accountName);
    const previousVote = computed(() =>
      store.state.account.data.voter_info
        ? store.state.account.data.voter_info.producers.map((vote) =>
            vote.toString(),
          )
        : [],
    );
    const producers = computed(() =>
      [...store.state.chain.producers].map((val) => val.owner),
    );
    const currentVote = computed(() => {
      let votes = store.state.account.vote;
      votes.forEach((vote, index) => {
        if (!producers.value.includes(vote)) {
          votes.splice(index, 1);
        }
      });
      return votes;
    });
    const selection = ref<string[]>([]);
    const HeadProducer = computed(
      (): string => store.state.chain.head_block_producer,
    );
    const producerRows = computed(
      (): Producer[] => store.state.chain.producers || [],
    );
    const producerPay = computed(() => props.top21pay24h);
    const bpTop21 = computed(() => store.state.chain.producerSchedule);

    const maxSelected = computed(
      () => currentVote.value.length === MAX_VOTE_PRODUCERS,
    );

    const pagination = ref({
      rowsPerPage: 21,
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
      val.forEach((vote, index) => {
        if (!producers.value.includes(vote)) {
          val.splice(index, 1);
        }
      });
      store.commit('account/setVote', val);
    }

    function isTop21(val: string): boolean {
      return bpTop21.value.includes(val);
    }

    return {
      producerRows,
      account,
      previousVote,
      HeadProducer,
      selection,
      maxSelected,
      currentVote,
      pagination,
      producerPay,
      symbol,
      updateVote,
      removeVote,
      isTop21,
      getLink,
      getFlag,
    };
  },
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
                .row.items-center.full-height {{ ((producerRows.indexOf(bp) + 1) < 22 ? producerPay : (producerRows.indexOf(bp) + 1) < 43 ? producerPay / 2 : 0 ).toFixed(0)  + ` ${symbol}` }}
              .col-1.select-box.q-py-md
                .row.full-selection.justify-center
                  q-checkbox(v-model="currentVote" :val="bp.owner" @update:model-value="(val)=> updateVote(val)" :disable='!currentVote.includes(bp.owner) && currentVote.length >= 30')
                .row.full-selection.justify-center
                  q-badge(v-if='previousVote.includes(bp.owner)' color='green' label="VOTED")
</template>

<style lang="sass" scoped>
.producer-card
  background: var(--q-color-producer-card-background)
.select-box
  background: var(--q-color-select-box-background)
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
    color: black
</style>
