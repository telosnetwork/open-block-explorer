<template lang="pug">
div.row.col-12.q-mt-xs.justify-center.text-left
    div.row.col-11
        div.row.col-12.q-mt-lg
            div.col-3
                p.table-title Latest Transactions
            q-space
            div.col-3.row.flex
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Actions
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Date
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Token
        q-separator.row.col-12.q-mt-md.separator
        q-table.q-mt-lg.col-12.row(
            :rows="rows"
            :columns="columns"
            row-key="name"
            hide-bottom
            flat
            :bordered="false"
            :square="true"
            table-header-class="table-header")
        div.row.col-12.q-mt-md.q-mb-xl
          div.col-1(align="left")
            q-btn.q-ml-xs.q-mr-xs.col.button-primary PREV
          q-space
          div.col-1(align="right")
            q-btn.q-ml-xs.q-mr-xs.col.button-primary NEXT
</template>
<script lang="ts">
import { TransactionTableRow } from 'src/types';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'TransactionsTable',
  props: {
    account: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      columns: [
        {
          name: 'TRANSACTION',
          required: true,
          label: 'TRANSACTION',
          align: 'left',
          field: 'transaction',
          sortable: true
        },
        {
          name: 'TIMESTAMP',
          required: true,
          align: 'left',
          label: 'TIMESTAMP',
          field: 'timestamp',
          sortable: true
        },
        {
          name: 'ACTION',
          required: true,
          align: 'left',
          label: 'ACTION',
          field: 'action',
          sortable: true
        },
        {
          name: 'DATA',
          required: true,
          align: 'left',
          label: 'DATA',
          field: 'data'
        }
      ],
      rows: [] as TransactionTableRow[]
    };
  },
  async mounted() {
    await this.loadTransactions();
  },
  methods: {
    async loadTransactions(): Promise<void> {
      const recentTransactions = await this.$api.getTransactions();
      debugger;
      this.rows = recentTransactions.map(
        (tx) =>
          ({
            transaction: tx.trx_id,
            timestamp: tx['@timestamp'],
            action: tx.act.name,
            data: JSON.stringify(tx.act.data, null, 2)
          } as TransactionTableRow)
      );
    }
  }
});
</script>
<style lang="sass" scoped>
body
    height:1000px
.table-header
    color: #000000 !important
    opacity: 0.5
.table-title
    font-family: Actor, sans-serif
    font-style: normal
    font-weight: normal
    font-size: 22.75px
    line-height: 27px
</style>
