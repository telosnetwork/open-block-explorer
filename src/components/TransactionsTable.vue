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
            flat
            :bordered="false"
            :square="true"
            table-header-class="table-header"
            v-model:pagination="paginationSettings")
          template( v-slot:body-cell-data="props")
            q-td( :props="props" )
              div(v-html="props.value")
          template( v-slot:pagination="scope" )
            div.row.col-12.q-mt-md.q-mb-xl()
            div.col-1(align="left")
              q-btn.q-ml-xs.q-mr-xs.col.button-primary(
                :disable="scope.isFirstPage"
                @click="scope.prevPage") PREV
            q-space
            div.col-1(align="right")
              q-btn.q-ml-xs.q-mr-xs.col.button-primary(
                :disable="scope.isLastPage"
                @click="scope.nextPage") NEXT
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { PaginationSettings, TransactionTableRow } from 'src/types';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'TransactionsTable',
  props: {
    account: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      columns: [
        {
          name: 'transaction',
          required: true,
          label: 'TRANSACTION',
          align: 'left',
          field: 'transaction',
          sortable: true
        },
        {
          name: 'timestamp',
          required: true,
          align: 'left',
          label: 'TIMESTAMP',
          field: 'timestamp',
          sortable: true
        },
        {
          name: 'action',
          required: true,
          align: 'left',
          label: 'ACTION',
          field: 'action',
          sortable: true
        },
        {
          name: 'data',
          required: true,
          align: 'left',
          label: 'DATA',
          field: 'data'
        }
      ],
      rows: [] as TransactionTableRow[],
      paginationSettings: {
        sortBy: 'timestamp',
        descending: true,
        page: 1,
        rowsPerPage: 10
      } as PaginationSettings
    };
  },
  async mounted() {
    await this.loadTransactions();
  },
  methods: {
    async loadTransactions(): Promise<void> {
      const recentTransactions = await this.$api.getTransactions(this.account);
      this.rows = recentTransactions.map(
        (tx) =>
          ({
            transaction: tx.trx_id,
            timestamp: tx['@timestamp'],
            action: tx.act.name,
            data: this.formatData(tx.act.data)
          } as TransactionTableRow)
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatData(data: any): string {
      const accountRegEx = /^(account|to|from|owner)$/;
      const formattedData = [];
      for (let key in data) {
        if (accountRegEx.exec(key)) {
          data[key] = `<a href="/account/${data[key]}">${data[key]}</a>`;
        }
        if (data[key] instanceof Object) {
          if (Array.isArray(data[key])) {
            const keyValArray = [];
            for (let i = 0; i < data[key].length; i++) {
              keyValArray.push(this.formatData(data[key][i]));
            }
            data[key] = keyValArray.join('\n');
          } else {
            data[key] = this.formatData(data[key]);
          }
        }
        formattedData.push(`<br><b>${key}</b>: ${data[key]}`);
      }
      return formattedData.join('\n');
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
