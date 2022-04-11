<script lang="ts">
import { defineComponent, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { ActionData, Transaction } from 'src/types';

export default defineComponent({
  name: 'TransactionsTable',
  props: {
    transactionId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return {
      transaction: props.transactionId,
      transactionData: ref<ActionData>(<ActionData>{}),
      transactionDataV1: ref<Transaction>(<Transaction>{}),
      blockNum: ref<number>(0),
      timestamp: ref<string>(''),
      executed: ref<boolean>(false),
      irreversable: ref<boolean>(false),
      cpuUsage: ref<number>(0),
      netUsage: ref<number>(0),
      actionsTraces: ref<string>(''),
      actionNum: ref<number>(0)
    };
  },
  async mounted() {
    this.transactionData = await this.loadTransactionData();
    this.transactionDataV1 = await this.loadTransactionDatav1();
    console.log(this.transactionDataV1);
    // if (this.transactionDataV1) {
    //   this.blockNum = this.transactionDataV1.block_num;
    //   this.timestamp = this.transactionDataV1.block_time;
    //   this.executed = this.transactionDataV1.trx.receipt.status === 'executed';
    //   this.cpuUsage = this.transactionDataV1.trx.receipt.cpu_usage_us;
    //   this.netUsage = this.transactionDataV1.trx.receipt.net_usage_words;
    //   this.irreversable =
    //     this.transactionDataV1.last_irreversible_block >
    //     this.transactionDataV1.block_num;
    // }
    if (this.transactionData) {
      this.blockNum = this.transactionData.actions[0].block_num;
      this.timestamp = this.transactionData.actions[0].timestamp;
      this.executed = this.transactionData.executed;
      this.cpuUsage = this.transactionData.actions[0].cpu_usage_us;
      this.netUsage = this.transactionData.actions[0].net_usage_words * 2;
      this.actionNum = this.transactionData.actions.length;
      this.irreversable =
        this.transactionData.lib > this.transactionData.actions[0].block_num;
    }
  },
  methods: {
    copyTransactionId() {
      copyToClipboard(this.transaction)
        .then((): void => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            message: 'Copied transactionId to clipboard',
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
    async loadTransactionData(): Promise<ActionData> {
      return await this.$api.getTransaction(this.transaction);
    },
    async loadTransactionDatav1(): Promise<Transaction> {
      return await this.$api.getTransactionV1(this.transaction);
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
              q-btn( @click="copyTransactionId" flat round color="black" icon="content_copy" size='sm')
        q-card-section.q-pt-none
          q-btn.button-primary( @click="copyTransactionId" flat label="MSIG Template")

        q-card-section
          .text-grey-7 SUMMARY
        q-separator(inset).card-separator
        q-card-section
          .row
            .col-xs-12.col-sm-6
              .text-body1.text-weight-medium.text-uppercase Block number
            .col-xs-12.col-sm-6.text-right.text-bold {{numberWithCommas(blockNum)}}
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
              .text-body1.text-weight-medium.text-uppercase Actions
            .col-xs-12.col-sm-6.text-right.text-bold {{actionNum}}

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
