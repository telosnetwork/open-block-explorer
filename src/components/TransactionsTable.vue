<script lang="ts">
import { Action, PaginationSettings, TransactionTableRow } from 'src/types';
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  toRefs,
  watch
} from 'vue';
import DateField from 'src/components/DateField.vue';
import AccountFormat from 'src/components/Transaction/AccountFormat.vue';
import ActionFormat from 'src/components/Transaction/ActionFormat.vue';
import DataFormat from 'src/components/Transaction/DataFormat.vue';
import { api } from 'src/api';

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
  setup(props) {
    const { account, actions } = toRefs(props);
    const columns = [
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
    ];
    const rows = ref<TransactionTableRow[]>([]);
    const filteredRows = ref<TransactionTableRow[]>([]);
    const expanded = ref<boolean[]>([]);
    const loading = ref<boolean>(false);
    const paginationSettings = ref<PaginationSettings>({
      sortBy: 'timestamp',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10000
    });
    const fromDateFilter = ref('');
    const toDateFilter = ref<string>(new Date().toLocaleString());
    const actionsFilter = ref('');
    const tokenFilter = ref('');
    const interval = ref<number>(null);
    const showAge = ref<boolean>(localStorage.getItem('showAge') === 'true');

    const isTransaction = computed(
      () => account.value != null && account.value.length > 12
    );
    const tableTitle = computed(() =>
      isTransaction.value ? 'Actions' : 'Latest Transactions'
    );

    const hasPages = computed(
      () => rows.value.length >= paginationSettings.value.rowsPerPage
    );
    const noData = computed(() => rows.value.length === 0);
    const hasActions = computed(() => actions.value != null);
    const filter = computed(() => {
      return {
        actions: actionsFilter.value,
        toDate: toDateFilter.value,
        fromDate: fromDateFilter.value,
        token: tokenFilter.value
      };
    });

    const loadTableData = async (): Promise<void> => {
      let tableData: Action[];
      if (isTransaction.value) {
        tableData = (await api.getTransaction(account.value)).actions;
      } else if (hasActions.value) {
        tableData = actions.value;
      } else {
        tableData =
          account.value == null
            ? await api.getTransactions(
                paginationSettings.value.page,
                paginationSettings.value.rowsPerPage
              )
            : await api.getTransactions(
                paginationSettings.value.page,
                paginationSettings.value.rowsPerPage,
                account.value
              );
      }
      if (tableData) {
        rows.value = tableData.map(
          (tx) =>
            ({
              name: tx.trx_id,
              transaction: { id: tx.trx_id, type: 'transaction' },
              timestamp: tx['@timestamp'],
              action: tx,
              data: hasActions.value
                ? { data: tx.data, name: tx.account }
                : { data: tx.act.data, name: tx.act.name }
            } as TransactionTableRow)
        );
      }
      void filterRows();
    };

    const onRequest = async (props: {
      pagination: {
        page: number;
        rowsPerPage: number;
        sortBy: string;
        descending: boolean;
      };
    }) => {
      loading.value = true;
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      paginationSettings.value.page = page;
      paginationSettings.value.rowsPerPage = rowsPerPage;
      paginationSettings.value.sortBy = sortBy;
      paginationSettings.value.descending = descending;
      await loadTableData();
      loading.value = false;
    };

    const checkIsMultiLine = (data: string): boolean => {
      return data.length > 0 && data.split('\n').length > 1;
    };

    const updateExpanded = (newExpanded: string[]) => {
      if (newExpanded.length > 1) {
        newExpanded.shift();
      }
    };

    const filterRows = () => {
      filteredRows.value = rows.value.filter((row) =>
        row.action.act.name.includes(actionsFilter.value)
      );
      filteredRows.value = filteredRows.value.filter((row) =>
        JSON.stringify(row.data).includes(tokenFilter.value.toUpperCase())
      );
      if (!!fromDateFilter.value && !!toDateFilter.value) {
        filteredRows.value = filteredRows.value.filter((item) => {
          return (
            new Date(item.timestamp).getTime() >=
              new Date(fromDateFilter.value).getTime() &&
            new Date(item.timestamp).getTime() <=
              new Date(toDateFilter.value).getTime()
          );
        });
      }
    };

    onMounted(async () => {
      await loadTableData();
      interval.value = window.setInterval(() => {
        //only automatically refresh data on first page, disable on page navigation
        if (account.value == null && paginationSettings.value.page === 1)
          void loadTableData();
      }, FIVE_SECONDS);
    });
    onBeforeUnmount(() => {
      clearInterval(interval.value);
    });
    watch([account, actions], () => {
      void loadTableData();
    });
    watch(filter, () => {
      void filterRows();
    });
    watch(showAge, (val) => {
      localStorage.setItem('showAge', val ? 'true' : 'false');
    });

    return {
      columns,
      rows,
      filteredRows,
      expanded,
      loading,
      paginationSettings,
      fromDateFilter,
      toDateFilter,
      actionsFilter,
      tokenFilter,
      interval,
      showAge,
      tableTitle,
      hasPages,
      noData,
      hasActions,
      filter,
      onRequest,
      loadTableData,
      checkIsMultiLine,
      updateExpanded,
      filterRows
    };
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
            q-toggle(v-model="showAge" left-label label="Show timestamp as relative")
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
