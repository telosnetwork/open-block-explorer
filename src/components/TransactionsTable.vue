<script lang="ts">
import { Action, PaginationSettings, TransactionTableRow } from 'src/types';
import { defineComponent } from 'vue';
import DateField from 'src/components/DateField.vue';
import AccountFormatter from 'src/components/Transaction/AccountFormat.vue';
import ActionFormatter from 'src/components/Transaction/ActionFormat.vue';
import DataFormatter from 'src/components/Transaction/DataFormat.vue';

export default defineComponent({
  name: 'TransactionsTable',
  components: {
    DateField,
    AccountFormatter,
    ActionFormatter,
    DataFormatter
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
  watch: {
    async account() {
      await this.loadTableData();
    }
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
        tableData = (await this.$api.getTransaction(this.account)).actions;
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
              transaction: { id: tx.trx_id, type: 'transaction' },
              timestamp: tx['@timestamp'],
              action: tx,
              data: { data: tx.act.data, name: tx.act.name }
            } as TransactionTableRow)
        );
      }
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
            AccountFormatter(:account="props.value.id" :type="props.value.type")
        template( v-slot:body-cell-timestamp="props")
          q-td( :props="props" )
            DateField( :timestamp="props.value", :showAge='true' )
        template( v-slot:body-cell-action="props")
          q-td( :props="props" )
            .row.justify-left.text-weight-light
              ActionFormatter(:action="props.value")
        template( v-slot:body-cell-data="props")
          q-td( :props="props"  )
            DataFormatter(:actionData="props.value.data" :actionName="props.value.name ")
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
  background: var(--q-tertiary-gradient)
  border-radius: 3px
  flex-grow: 1
  display: flex
  .memo-card-title
    padding: 0.5rem
    background: var(--q-tertiary-gradient)
    font-weight: bold
    flex-shrink: 0
    display: flex
    justify-content: center
    align-items: center
  .memo-card-memo
    padding: 0.5rem
</style>
