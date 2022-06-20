<script lang="ts">
import { defineComponent, computed, ref, PropType, onMounted } from 'vue';
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
    const currentVote = ref<string[]>([]);
    const selection = ref<string[]>([]);
    const HeadProducer = computed(
      (): string => store.state.chain.head_block_producer
    );
    const producerRows = computed((): BP[] => store.state.chain.bpList);
    const producerVotes = computed(() => props.producerVotes);
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
    const producerColumns = [
      {
        name: 'selected',
        label: '',
        align: 'left',
        sortable: false,
        headerClasses: 'selected-column'
      },
      {
        name: 'number',
        label: '#',
        field: (row: any) => producerRows.value.indexOf(row) + 1,
        align: 'left',
        sortable: true
      },
      {
        name: 'owner',
        label: 'Block Producer',
        field: 'owner',
        align: 'left',
        sortable: true
      },
      {
        name: 'country',
        label: 'Country',
        field: (row: { location: string }) => row.location,
        align: 'center',
        sortable: true
      },
      {
        name: 'social',
        label: 'Links',
        field: (row: { org: string }) => row.org,
        align: 'center'
      },
      {
        name: 'votes',
        label: 'Total Votes',
        field: (row: { total_votes: number }) =>
          (row.total_votes / 10000).toFixed(0),
        align: 'right',
        sortable: true,
        sort: (a: string, b: string, rowA: any, rowB: any) =>
          parseInt(a, 10) - parseInt(b, 10)
      },
      {
        name: 'sslVerified',
        label: 'SSL',
        field: (row: { sslVerified: boolean }) => row.sslVerified === true,
        align: 'left',
        sortable: true
      },
      {
        name: 'apiVerified',
        label: 'API',
        field: (row: { apiVerified: boolean }) => row.apiVerified === true,
        align: 'left',
        sortable: true
      },
      {
        name: 'sslVerifiedTestNet',
        label: 'SSL*',
        field: (row: { sslVerifiedTestNet: boolean }) =>
          row.sslVerifiedTestNet === true,
        align: 'left',
        sortable: true
      },
      {
        name: 'apiVerifiedTestNet',
        label: 'API*',
        field: (row: { apiVerifiedTestNet: boolean }) =>
          row.apiVerifiedTestNet === true,
        align: 'left',
        sortable: true
      },
      {
        name: 'lifetimeProducedBlocks',
        label: 'LPB',
        field: 'lifetime_produced_blocks',
        align: 'center',
        sortable: true,
        sort: (a: string, b: string, rowA: any, rowB: any) =>
          parseInt(a, 10) - parseInt(b, 10)
      },
      {
        name: 'lifetimeMissedBlocks',
        label: 'LMB',
        field: 'lifetime_missed_blocks',
        align: 'center',
        sortable: true,
        sort: (a: string, b: string, rowA: any, rowB: any) =>
          parseInt(a, 10) - parseInt(b, 10)
      },
      {
        name: 'missedBlocksPer',
        label: 'LMB(%)',
        field: (row: {
          lifetime_produced_blocks: number;
          lifetime_missed_blocks: number;
        }) =>
          row.lifetime_produced_blocks === 0
            ? row.lifetime_missed_blocks === 0
              ? 'N/A'
              : 100
            : (
                (row.lifetime_missed_blocks / row.lifetime_produced_blocks) *
                100
              ).toFixed(3),
        align: 'left',
        sortable: true,
        sort: (a: string, b: string, rowA: any, rowB: any) =>
          parseFloat(a) - parseFloat(b)
      }
    ];

    function removeVote(index: string) {
      currentVote.value.splice(Number(index), 1);
    }
    function getLink(domain: string, username: string) {
      return `https://${domain}/${username}`;
    }

    function getCountry(): string {
      return 'SA';
    }

    function getFlag(alpha2: number) {
      if (alpha2) {
        return `flag-icon-${alpha2}`;
      }
      return '';
    }

    function checkHeader() {
      const checkHeader = document.getElementsByClassName('selected-column')[0];
      checkHeader.setAttribute('style', 'height: 48px;');
      if (!account.value) {
        checkHeader.setAttribute('style', 'display: none;');
      } else {
        checkHeader.setAttribute('style', 'display: block;');
      }
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

    function resetVotes() {
      currentVote.value = producerVotes.value;
    }
    async function sendVoteTransaction() {
      currentVote.value.sort();
      const voteActions = [
        {
          account: 'eosio',
          name: 'voteproducer',
          data: {
            voter: account.value,
            proxy: '',
            producers: [...currentVote.value]
          }
        }
      ];
      try {
        const authenticators =
          ual().getAuthenticators().availableAuthenticators;
        const user = (await authenticators[0].login())[0];
        await user.signTransaction(voteActions);
        //this.$emit('get-votes');
      } catch (e) {
        console.error(e);
      }
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
      producerColumns
    };
  }
  // watch: {
  //   producerVotes(val) {
  //     this.$emit('vote-changed', false);
  //     if (this.currentVote.length === 0) {
  //       this.currentVote = [...val];
  //     }
  //   },
  //   currentVote(val) {
  //     if (val.length > MAX_VOTE_PRODUCERS) {
  //       this.currentVote.pop();
  //       alert('You can only vote for 30 validators.');
  //       return;
  //     }
  //     if (this.areEqualArrays(val, this.producerVotes)) {
  //       this.$emit('vote-changed', false);
  //     } else {
  //       this.$emit('vote-changed', true);
  //     }
  //   },
  //   account() {
  //     this.checkHeader();
  //   }
  // }
});
</script>

<template lang="pug">
.q-pa-md
  //- .row.items-start.q-gutter-md(v-if='account')
  //-   q-card( v-for='(prod,i) in currentVote').producer-card
  //-     .q-card-section {{ prod }}
  //-         q-icon(
  //-           name="fas fa-times"
  //-           size="xs"
  //-           color='primary'
  //-           @click='removeVote(prod)'
  //-         )
  //- q-card.voting-stats(v-if='account')
  //-   .count-field Selected Validators:
  //-     span( :class="{'full-selection' : maxSelected }") {{ currentVote.length }} of 30
  //-   .count-field Projected Vote Weight:
  //-     span( :class="{'full-selection' : maxSelected }")  {{ projectedVoteWeight }}
  //-   .count-field Last Vote Weight:
  //-     span  {{ lastWeight }}
  //-   .count-field Vote Weight Change:
  //-     span  {{ weightChange }}
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
                  q-checkbox(v-model="selection" :val="bp.owner")



  //- q-table(
  //-   title= 'tableHeader'
  //-   :rows="producerRows"
  //-   flat
  //-   :columns="producerColumns"
  //-   row-key="owner"
  //-   :pagination= "{rowsPerPage:0}"
  //-   :hide-pagination="true"
  //-   class="bp-table"
  //- )
  //-   template( v-slot:top-right class='testnet-indicator') * = testnet, LPB = lifetime produced blocks, LMB = lifetime missed blocks
  //-   template(v-slot:body="props").q-pa-lg
  //-     q-tr( slot="body" slot-scope="props" :props="props" class="table-row q-py-ms")
  //-       q-td.q-py-lg( key="selected" v-if='account' class="table-column")
  //-         .q-py-md.select 
  //-           q-checkbox(  v-model='currentVote' :val='props.cols[2].value' )
  //-       q-td( key="number" class='vote-indicator' auto-width)
  //-         .q-py-md.middle-cell.full-width.full-height {{props.cols[1].value}}
  //-       q-td( key="owner" ) {{props.cols[2].value }}
  //-       q-td( key="country" ).flag-column
  //-         span(:class='getFlag(props.cols[3].value)').flag-icon
  //-       q-td(v-if='props.cols[4].value' key="social" align="center").no-decoration
  //-         a(v-if="props.cols[4].value.website" :href="props.cols[4].value.website")
  //-           q-icon(
  //-             name="fas fa-globe"
  //-             size="xs"
  //-             color='primary'
  //-           )
  //-         a(v-if="props.cols[4].value.social.twitter" :href="getLink('twitter.com',props.cols[4].value.social.twitter)")
  //-           q-icon(
  //-             name="fab fa-twitter"
  //-             size="xs"
  //-             color='primary'
  //-           )
  //-         a(v-if="props.cols[4].value.social.github" :href="getLink('github.com',props.cols[4].value.social.github)")
  //-           q-icon(
  //-             name="fab fa-github"
  //-             size="xs"
  //-             color='primary'
  //-           )
  //-         a(v-if="props.cols[4].value.social.telegram" :href="getLink('t.me',props.cols[4].value.social.telegram)")
  //-           q-icon(
  //-             name="fab fa-telegram"
  //-             size="xs"
  //-             color='primary'
  //-           )
  //-       q-td(v-else key="social-none")
  //-       q-td( key="votes" align="right") {{props.cols[5].value }}
  //-       q-td( key="sslVerified" align='left')
  //-         q-icon(
  //-           v-if="props.cols[6].value === true"
  //-           name="fas fa-check"
  //-           size="xs"
  //-           color='green'
  //-         )
  //-         q-icon(
  //-           v-else
  //-           name="fas fa-times"
  //-           size="xs"
  //-           color='red'
  //-         )
  //-       q-td( key="apiVerified" align='left')
  //-         q-icon(
  //-           v-if="props.cols[7].value === true"
  //-           name="fas fa-check"
  //-           size="xs"
  //-           color='green'
  //-         )
  //-         q-icon(
  //-           v-else
  //-           name="fas fa-times"
  //-           size="xs"
  //-           color='red'
  //-         )
  //-       q-td( key="sslVerifiedTestNet" align='left')
  //-         q-icon(
  //-           v-if="props.cols[8].value === true"
  //-           name="fas fa-check"
  //-           size="xs"
  //-           color='green'
  //-         )
  //-         q-icon(
  //-           v-else
  //-           name="fas fa-times"
  //-           size="xs"
  //-           color='red'
  //-         )
  //-       q-td( key="apiVerifiedTestNet" align='left')
  //-         q-icon(
  //-           v-if="props.cols[9].value === true"
  //-           name="fas fa-check"
  //-           size="xs"
  //-           color='green'
  //-         )
  //-         q-icon(
  //-           v-else
  //-           name="fas fa-times"
  //-           size="xs"
  //-           color='red'
  //-         )
  //-       q-td( key="lifetimeProducedBlocks" align='right' ) {{props.cols[10].value }}
  //-       q-td( key="lifetimeMissedBlocks" align='right') {{props.cols[11].value }}
  //-       q-td( key='missedBlocksPer' align='left') {{props.cols[12].value }}
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
