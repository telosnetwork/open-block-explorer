<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Account,
  Action,
  PaginationSettings,
  TransactionTableRow
} from 'src/types';
import { defineComponent } from 'vue';
import DateField from 'src/components/DateField.vue';
export default defineComponent({
  name: 'TransactionsTable',
  components: {
    DateField
  },
  props: {
    account: {
      type: String,
      required: false,
      default: null
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
      expanded: [],
      paginationSettings: {
        sortBy: 'timestamp',
        descending: true,
        page: 1,
        rowsPerPage: 10
      } as PaginationSettings
    };
  },
  async mounted() {
    await this.loadTableData();
  },
  computed: {
    isTransaction(): boolean {
      return this.account != null && this.account.length > 12;
    },
    tableTitle(): string {
      return this.isTransaction ? 'Actions' : 'Latest Transactions';
    },
    hasPages(): boolean {
      return this.rows.length > this.paginationSettings.rowsPerPage;
    }
  },
  methods: {
    async loadTableData(): Promise<void> {
      let tableData: Action[];
      if (this.isTransaction) {
        tableData = await this.$api.getTransaction(this.account);
      } else {
        tableData =
          this.account == null
            ? await this.$api.getTransactions()
            : await this.$api.getTransactions(this.account);
      }
      if (tableData) {
        this.rows = tableData.map(
          (tx) =>
            ({
              name: tx.trx_id,
              transaction: this.formatAccount(tx.trx_id, 'transaction'),
              timestamp: tx['@timestamp'],
              action: this.formatAction(tx.act),
              data: this.formatData(tx.act.data).replace('<br>', '')
            } as TransactionTableRow)
        );
      }
    },
    formatAccount(
      name: string,
      type: 'account' | 'transaction' | 'block'
    ): string {
      return `<a href="/${type}/${name}" class="hover-dec">${name}</a>`;
    },
    formatAction(txAct: Account): string {
      const accountString = this.formatAccount(txAct.account, 'account');
      return `${accountString}&nbsp; → &nbsp;${txAct.name}`;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatData(data: any): string {
      const accountRegEx = /^(account|to|from|owner|account_name|voter)$/;
      const formattedData = [];
      for (let key in data) {
        if (accountRegEx.exec(key)) {
          data[key] = this.formatAccount(data[key], 'account');
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
    },
    checkIsMultiLine(data: string): boolean {
      return data.length > 0 && data.split('\n').length > 1;
    },
    updateExpanded(newExpanded: string[]) {
      if (newExpanded.length > 1) {
        newExpanded.shift();
      }
    }
  }
});
</script>

<template lang="pug">
div.row.col-12.q-mt-xs.justify-center.text-left
    div.row.col-11
        div.row.col-12.q-mt-lg
            div.col-3
                p.panel-title {{ tableTitle }} 
            q-space
            div.col-3.row.flex.filter-buttons.temp-hide
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Actions
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Date
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Token
        q-separator.row.col-12.q-mt-md.separator
        q-table.q-mt-lg.col-12.row.fixed-layout(
            :rows="rows"
            :columns="columns"
            row-key="name"
            flat
            :bordered="false"
            :square="true"
            table-header-class="table-header"
            v-model:pagination="paginationSettings"
            v-model:expanded="expanded"
            :hide-pagination="!hasPages"
            @update:expanded='updateExpanded'
            )
          template( v-slot:body-cell-transaction="props")
            q-td( :props="props" )
              div(v-html="props.value")
          template( v-slot:body-cell-timestamp="props")
            q-td( :props="props" )
              DateField( :timestamp="props.value", showAge=true )
          template( v-slot:body-cell-action="props")
            q-td( :props="props" )
              div(v-html="props.value")
          template( v-slot:body-cell-data="props")
            q-td( :props="props"  )
              div(v-html="props.value" :class="{'row-expanded': props.expand  }")
              q-icon.expand-icon(v-if="checkIsMultiLine(props.value)" @click="props.expand = !props.expand" :name="props.expand ? 'expand_less' : 'expand_more'" size='.75rem')
          template( v-slot:pagination="scope")
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

<style lang="sass">
$medium:750px

.fixed-layout
  .q-table
    table-layout: fixed
    tbody td:first-child
      word-break: break-all
    th:first-child
      width: 35%
    th:nth-child(2)
      width: 15%
    th:nth-child(3)
      width: 20%
    th:nth-child(4)
      width: 25%

.q-table--no-wrap td
  word-break: break-all
  white-space: unset

.q-table td div
  max-height: 22px
  overflow-y: clip
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1)

  &.row-expanded
    max-height: 1000px
    transition: max-height 2s ease-out

.expand-icon
  padding-left: 2rem
  cursor: pointer

body
    height:1000px

.table-header
    color: #000000 !important
    opacity: 0.5

.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline

@media screen and (max-width: $medium) // screen < $medium
  .fixed-layout
    .q-table
      table-layout: fixed
      tbody td:first-child
        word-break: break-all
      th:first-child
        width: 25%
      th:nth-child(2)
        width: 25%
      th:nth-child(3)
        width: 25%
      th:nth-child(4)
        width: 25%
  .filter-buttons
    width: 100% !important
</style>
