<script lang="ts">
import { Action, PaginationSettings, TransactionTableRow } from 'src/types';
import { defineComponent, PropType } from 'vue';
import DateField from 'src/components/DateField.vue';
import AccountFormat from 'src/components/Transaction/AccountFormat.vue';
import ActionFormat from 'src/components/Transaction/ActionFormat.vue';
import DataFormat from 'src/components/Transaction/DataFormat.vue';

const FIVE_SECONDS = 5000;

export default defineComponent({
  name: 'TransactionsTable',
  components: {
    DateField,
    AccountFormat,
    ActionFormat,
    DataFormat
  },
  props: {
    account: {
      type: String || null,
      required: false,
      default: null
    },
    actions: {
      type: Object as PropType<Action[]>,
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
      filteredRows: [] as TransactionTableRow[],
      expanded: [],
      loading: false,
      paginationSettings: {
        sortBy: 'timestamp',
        descending: true,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10000
      } as PaginationSettings,
      fromDateFilter: '',
      toDateFilter: new Date().toLocaleString(),
      actionsFilter: '',
      tokenFilter: '',
      interval: null,
      showAge: localStorage.getItem('showAge') === 'true'
    };
  },
  async mounted() {
    await this.loadTableData();
    this.interval = window.setInterval(() => {
      //only automatically refresh data on first page, disable on page navigation
      if (this.account == null && this.paginationSettings.page === 1)
        void this.loadTableData();
    }, FIVE_SECONDS);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  watch: {
    async account() {
      await this.loadTableData();
    },
    async actions() {
      await this.loadTableData();
    },
    filter() {
      void this.filterRows();
    },
    showAge(val) {
      localStorage.setItem('showAge', val);
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
      return this.rows.length >= this.paginationSettings.rowsPerPage;
    },
    noData(): boolean {
      return this.rows.length === 0;
    },
    hasActions(): boolean {
      return this.actions != null;
    },
    filter() {
      return {
        actions: this.actionsFilter,
        toDate: this.toDateFilter,
        fromDate: this.fromDateFilter,
        token: this.tokenFilter
      };
    }
  },
  methods: {
    async loadTableData(): Promise<void> {
      let tableData: Action[];
      if (this.isTransaction) {
        tableData = (await this.$api.getTransaction(this.account)).actions;
      } else if (this.hasActions) {
        tableData = this.actions;
      } else {
        tableData =
          this.account == null
            ? await this.$api.getTransactions(
                this.paginationSettings.page,
                this.paginationSettings.rowsPerPage
              )
            : await this.$api.getTransactions(
                this.paginationSettings.page,
                this.paginationSettings.rowsPerPage,
                this.account
              );
      }
      if (tableData) {
        this.rows = tableData.map(
          (tx) =>
            ({
              name: tx.trx_id,
              transaction: { id: tx.trx_id, type: 'transaction' },
              timestamp: tx['@timestamp'],
              action: tx,
              data: this.hasActions
                ? { data: tx.data, name: tx.account }
                : { data: tx.act.data, name: tx.act.name }
            } as TransactionTableRow)
        );
      }
      void this.filterRows();
    },
    async onRequest(props: {
      pagination: {
        page: number;
        rowsPerPage: number;
        sortBy: string;
        descending: boolean;
      };
    }) {
      this.loading = true;
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      this.paginationSettings.page = page;
      this.paginationSettings.rowsPerPage = rowsPerPage;
      this.paginationSettings.sortBy = sortBy;
      this.paginationSettings.descending = descending;
      await this.loadTableData();
      this.loading = false;
    },
    checkIsMultiLine(data: string): boolean {
      return data.length > 0 && data.split('\n').length > 1;
    },
    updateExpanded(newExpanded: string[]) {
      if (newExpanded.length > 1) {
        newExpanded.shift();
      }
    },
    filterRows() {
      this.filteredRows = this.rows.filter((row) =>
        row.action.act.name.includes(this.actionsFilter)
      );
      this.filteredRows = this.filteredRows.filter((row) =>
        JSON.stringify(row.data).includes(this.tokenFilter.toUpperCase())
      );
      if (!!this.fromDateFilter && !!this.toDateFilter) {
        this.filteredRows = this.filteredRows.filter((item) => {
          return (
            new Date(item.timestamp).getTime() >=
              new Date(this.fromDateFilter).getTime() &&
            new Date(item.timestamp).getTime() <=
              new Date(this.toDateFilter).getTime()
          );
        });
      }
    }
  }
});
</script>

<template lang="pug">
div.row.col-12.q-mt-xs.justify-center.text-left
  div.row.col-11
    div.row.col-12.q-mt-lg
      div.col-auto
          p.panel-title {{ tableTitle }}
      q-space
      div.col-auto.row.flex.filter-buttons
        q-btn-dropdown.q-ml-xs.q-mr-xs.col.button-primary(
          color="primary"
          label="Search")
          .q-pa-md.dropdown-filter
            .row
              q-input(filled dense v-model='actionsFilter' label="Search")
        q-btn-dropdown.q-ml-xs.q-mr-xs.col.button-primary(
          persistent
          color="primary"
          label="Date")
          .q-pa-md.dropdown-filter
            .row
              q-input(filled dense v-model='fromDateFilter' label="From")
                template(v-slot:prepend)
                  q-icon.cursor-pointer(name='event')
                    q-popup-proxy(cover='' transition-show='scale' transition-hide='scale')
                      q-date(v-model='fromDateFilter' mask='YYYY-MM-DD HH:mm')
                        .row.items-center.justify-end
                          q-btn(v-close-popup='' label='Close' color='primary' flat)
                template(v-slot:append)
                  q-icon.cursor-pointer(name='access_time')
                    q-popup-proxy(cover transition-show='scale' transition-hide='scale')
                      q-time(v-model='fromDateFilter' mask='YYYY-MM-DD HH:mm' format24h)
                        .row.items-center.justify-end
                          q-btn(v-close-popup='' label='Close' color='primary' flat)
            .row.justify-center.full-width.q-py-xs
              q-icon(name="arrow_downward")
            .row
              q-input(filled dense v-model='toDateFilter' label="To")
                template(v-slot:prepend)
                  q-icon.cursor-pointer(name='event')
                    q-popup-proxy(cover transition-show='scale' transition-hide='scale')
                      q-date(v-model='toDateFilter' mask='YYYY-MM-DD HH:mm')
                        .row.items-center.justify-end
                          q-btn(v-close-popup='' label='Close' color='primary' flat)
                template(v-slot:append)
                  q-icon.cursor-pointer(name='access_time')
                    q-popup-proxy(cover='' transition-show='scale' transition-hide='scale')
                      q-time(v-model='toDateFilter' mask='YYYY-MM-DD HH:mm' format24h)
                        .row.items-center.justify-end
                          q-btn(v-close-popup='' label='Close' color='primary' flat)
        q-btn-dropdown.q-ml-xs.q-mr-xs.col.button-primary(
          color="primary"
          label="Token")
          .q-pa-md.dropdown-filter
            .row
              q-input(filled dense v-model='tokenFilter' label="Token")
    q-separator.row.col-12.q-mt-md.separator
    div.row.col-12.table-container
      q-table.q-mt-lg.row.fixed-layout(
        :rows="filteredRows"
        :columns="columns"
        :row-key="row => row.name + row.action.action_ordinal"
        flat
        :bordered="false"
        :square="true"
        :loading="loading"
        table-header-class="table-header"
        v-model:pagination="paginationSettings"
        v-model:expanded="expanded"
        :hide-pagination="noData"
        @update:expanded='updateExpanded'
        @request='onRequest'
        :rows-per-page-options='[ 10, 20, 50, 100, 200]'
        )
        template(v-slot:top="props")
          .col
            p.panel-title {{ tableTitle }}
          q-space
          .col
            q-toggle(v-model="showAge" left-label label="Show Age")
        template( v-slot:body-cell-transaction="props")
          q-td( :props="props" )
            AccountFormat(:account="props.value.id" :type="props.value.type")
        template( v-slot:body-cell-timestamp="props")
          q-td( :props="props" )
            DateField( :timestamp="props.value", :showAge='showAge' )
        template( v-slot:body-cell-action="props")
          q-td( :props="props" )
            .row.justify-left.text-weight-light
              ActionFormat(:action="props.value")
        template( v-slot:body-cell-data="props")
          q-td( :props="props"  )
            DataFormat(:actionData="props.value.data" :actionName="props.value.name ")
        template( v-slot:pagination="scope")
          div.row.col-12.q-mt-md.q-mb-xl()
          div.col-1(align="left")
            q-btn.q-ml-xs.q-mr-xs.col.button-primary(
              :disable="scope.isFirstPage"
              @click="scope.prevPage") PREV
          q-space
          div.col-1(align="right")
            q-btn.q-ml-xs.q-mr-xs.col.button-primary(
              :disable="scope.isLastPage || ! hasPages"
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
  background: var(--q-color-tertiary-gradient)
  border-radius: 3px
  flex-grow: 1
  display: flex
  .memo-card-title
    padding: 0.5rem
    background: var(--q-color-tertiary-gradient)
    font-weight: bold
    flex-shrink: 0
    display: flex
    justify-content: center
    align-items: center
  .memo-card-memo
    padding: 0.5rem

.dropdown-filter
  max-width: 300px
</style>
