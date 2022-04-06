<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Action,
  PaginationSettings,
  TransactionTableRow,
  TransferData
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
              action: this.formatAction(tx),
              data: this.formatData(tx.act.data, tx.act.name).replace(
                '<br>',
                ''
              )
            } as TransactionTableRow)
        );
      }
    },
    formatAccount(
      name: string,
      type: 'account' | 'transaction' | 'block'
    ): string {
      return `<a href="/${type}/${name}" class="hover-dec">${
        type === 'transaction' ? name.slice(0, 8) : name
      }</a>`;
    },
    formatAction(tx: Action): string {
      let divClass = '';
      let divContent = '';
      if (tx.act.name === 'transfer') {
        const data = tx.act.data as TransferData;
        if (data.from === this.account) {
          divContent = 'SEND';
          divClass = 'action-transfer';
        } else if (data.to === this.account) {
          divContent = 'RECEIVE';
          divClass = 'action-transfer';
        } else {
          divContent = 'TRANSFER';
          divClass = 'action-transfer';
        }
      } else {
        const accountString = this.formatAccount(tx.act.account, 'account');
        divContent = `${accountString}&nbsp; → &nbsp;${tx.act.name}`;
        divClass = 'action-general';
      }
      return `<div class="action ${divClass}">${divContent}</div>`;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatData(data: any, actionName: string): string {
      if (actionName === 'transfer') {
        const transferData = data as TransferData;
        transferData.from = this.formatAccount(transferData.from, 'account');
        transferData.to = this.formatAccount(transferData.to, 'account');
        return `
        <div class="row">
          <div class="col-12">
            <span class="text-bold">${transferData.from}</span>&nbsp; → &nbsp;
            <span class="text-bold">${transferData.to}</span>&nbsp; ${transferData.quantity}
          </div>
          <div class="memo-card">
            <div class="memo-card-title">
              MEMO
            </div>
            <div class="memo-card-memo">
              ${transferData.memo}
            </div>
          </div>
        </div>
        `;
      } else return this.formatGeneralData(data);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatGeneralData(data: any) {
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
              keyValArray.push(this.formatGeneralData(data[key][i]));
            }
            data[key] = keyValArray.join('\n');
          } else {
            data[key] = this.formatGeneralData(data[key]);
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
        div.row.col-12.table-container
          q-table.q-mt-lg.row.fixed-layout(
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
                div(v-html="props.value").row.justify-left
            template( v-slot:body-cell-data="props")
              q-td( :props="props"  )
                div(v-html="props.value" :class="{'row-expanded': props.expand  }")
                //- q-icon.expand-icon(v-if="checkIsMultiLine(props.value)" @click="props.expand = !props.expand" :name="props.expand ? 'expand_less' : 'expand_more'" size='.75rem')
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

.table-container
  overflow-x: auto

.fixed-layout
  .q-table
    min-width: 1000px
    table-layout: fixed
    tbody td
      vertical-align: text-top
    tbody td:first-child
      word-break: break-all
    th:first-child
      width: 12%
    th:nth-child(2)
      width: 15%
    th:nth-child(3)
      width: 25%
    th:nth-child(4)
      width: 48%

.q-table--no-wrap td
  word-break: break-all
  white-space: unset

.q-table td div
  // max-height: 22px
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

.action
  // margin: 0.5rem 0
  padding: 0 0.5rem
  &.action-transfer
    background: rgba(196, 196, 196, 0.3)
    font-weight: bold
  &.action-general
    border: 0.1rem solid rgba(196, 196, 196, 0.3)

.memo-card
  background: #8A65D41A

  flex-grow: 1
  display: flex
  .memo-card-title
    padding: 0.5rem
    background: #8A65D41A
    font-weight: bold
    flex-shrink: 0
    display: flex
    justify-content: center
    align-items: center
  .memo-card-memo
    padding: 0.5rem

// @media screen and (max-width: $medium) // screen < $medium
//   .fixed-layout
//     .q-table
//       table-layout: fixed
//       tbody td:first-child
//         word-break: break-all
//       th:first-child
//         width: 25%
//       th:nth-child(2)
//         width: 25%
//       th:nth-child(3)
//         width: 25%
//       th:nth-child(4)
//         width: 25%
//   .filter-buttons
//     width: 100% !important
</style>
