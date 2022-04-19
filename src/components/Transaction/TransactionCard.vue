<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { copyToClipboard } from 'quasar';
import { useStore } from 'src/store';

export default defineComponent({
  name: 'TransactionsTable',
  setup() {
    const store = useStore();
    return {
      transaction: computed(() => store.state.transaction.transactionId),
      transactionData: computed(() => store.state.transaction.transaction),
      blockNum: computed(() => store.state.transaction.blockNum),
      timestamp: computed(() => store.state.transaction.timestamp),
      executed: computed(() => store.state.transaction.executed),
      irreversable: computed(() => store.state.transaction.irreversable),
      cpuUsage: computed(() => store.state.transaction.cpuUsage),
      netUsage: computed(() => store.state.transaction.netUsage),
      actionsTraces: ref<string>(''),
      actionNum: computed(() => store.state.transaction.actionCount)
    };
  },
  methods: {
    copy(value: string) {
      copyToClipboard(value)
        .then((): void => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            message: 'Copied to clipboard',
            timeout: 1000
          });
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-8',
            textColor: 'white',
            message: 'Could not copy',
            timeout: 1000
          });
        });
    },
    numberWithCommas(x: number) {
      if (!x) return 0;
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatDate(date: string): string {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });
    }
  }
});
</script>

<template lang="pug">
.row.full-width.justify-center
  .col-xs-12.col-md-8.col-lg-6
    q-card(flat class="transaction-card")
      .q-pa-md-md.q-pa-sm-sm.q-pa-xs-xs.q-pa-xl-lg
        q-card-section.q-pl-md
          div(class="text-h4 text-bold") Transaction
        
        q-card-section.q-pt-none
          .row.items-center
            .col-11.text-bold.ellipsis {{transaction}}
            .col-1
              q-btn.float-right( @click="copy(transaction)" flat round color="black" icon="content_copy" size='sm')
        //- q-card-section.q-pt-none
        //-   q-btn.button-primary( @click="copyTransactionId" flat label="MSIG Template")

        q-card-section
          .text-grey-7 SUMMARY
        q-separator(inset).card-separator
        q-card-section
          .row
            .col-xs-12.col-sm-6
              .text-body1.text-weight-medium.text-uppercase Block number
            .col-xs-12.col-sm-6.text-right.text-bold {{numberWithCommas(blockNum)}}
              q-btn( @click="copy(blockNum)" flat round color="black" icon="content_copy" size='sm')
        q-separator(inset).card-separator
        q-card-section
          .row
            .col-xs-12.col-sm-6
              .text-body1.text-weight-medium.text-uppercase Block time
            .col-xs-12.col-sm-6.text-right.text-bold {{formatDate(timestamp)}}
        q-separator(inset).card-separator
        q-card-section
          .row
            .col-xs-12.col-sm-6
              .text-body1.text-weight-medium.text-uppercase Status
            .col-xs-12.col-sm-6.text-right.text-bold 
              q-badge(transparent align="middle" color="purple-2" text-color="black").text-bold {{executed ? 'EXECUTED' : 'PENDING'}}
              q-badge.q-ml-sm( v-if="executed" transparent align="middle" color="deep-orange-2" text-color="black").text-bold {{'IRREVERSIBLE'}}
        q-separator(inset).card-separator
        q-card-section
          .row
            .col-xs-12.col-sm-6
              .text-body1.text-weight-medium.text-uppercase CPU usage
            .col-xs-12.col-sm-6.text-right.text-bold {{cpuUsage + ' μs'}}
        q-separator(inset).card-separator
        q-card-section
          .row
            .col-xs-12.col-sm-6
              .text-body1.text-weight-medium.text-uppercase Net usage
            .col-xs-12.col-sm-6.text-right.text-bold {{netUsage + ' Bytes'}}
        q-separator(inset).card-separator
        q-card-section
          .row
            .col-xs-12.col-sm-6
              .text-body1.text-weight-medium.text-uppercase Actions?Traces
            .col-xs-12.col-sm-6.text-right.text-bold {{actionNum+'/'+actionNum}}

</template>

<style lang="sass">

.transaction-card
  background-color:#ffffff
  background: #FFFFFF
  box-shadow: 0px 9px 14px rgba(138, 101, 212, 0.1), 0px 1px 4px rgba(37, 42, 97, 0.3)
  border-radius: 10px
.card-separator
    min-height: 2px
    background: rgba(138, 101, 212, 0.1)
    border-radius: 4px
</style>
