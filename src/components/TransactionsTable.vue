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
import { useRoute, useRouter } from 'vue-router';

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
    const route = useRoute();
    const router = useRouter();
    const pagination = computed(
      () => (route.query['page'] as string) || '1,10'
    );
    const pageSizeOptions = [10, 20, 50, 100, 200];
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
    const loading = ref<boolean>(false);
    const paginationSettings = ref<PaginationSettings>({
      sortBy: 'timestamp',
      descending: true,
      page: 1,
      rowsPerPage: pageSizeOptions[0],
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

    const hasPages = computed(() => {
      let count = 0;
      rows.value.forEach((element: TransactionTableRow) => {
        count += element.actions.length;
      });
      return count >= paginationSettings.value.rowsPerPage;
    });

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
        rows.value = tableData.map((item) => ({
          name: item.trx_id,
          transaction: { id: item.trx_id, type: 'transaction' },
          timestamp: item['@timestamp'] || item.timestamp,
          action: item,
          data: hasActions.value
            ? { data: item.data as unknown, name: item.account }
            : { data: item.act.data as unknown, name: item.act.name },
          actions: [
            {
              name: item.trx_id,
              transaction: { id: item.trx_id, type: 'transaction' },
              timestamp: item['@timestamp'],
              action: item,
              data: hasActions.value
                ? {
                    data: item.data as unknown,
                    name: item.account
                  }
                : { data: item.act.data as unknown, name: item.act.name }
            }
          ]
        }));
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onPaginationChange = async (props: {
      pagination: {
        page: number;
        rowsPerPage: number;
        sortBy: string;
        descending: boolean;
      };
    }) => {
      const { page, rowsPerPage } = props.pagination;

      // we need to change the URL to keep the pagination state by changing the route.query.page
      // with a string like 'page,rowsPerPage'
      await router.push({
        // taking care to preserve the current #hash anchor and the current query parameters
        hash: window.location.hash,
        query: {
          ...route.query,
          page: `${page},${rowsPerPage}`
        }
      });
    };

    const setPagination = async (
      page: string | number,
      size: string | number
    ) => {
      if (page) {
        paginationSettings.value.page = Number(page);
      }
      if (size) {
        paginationSettings.value.rowsPerPage = Number(size);
      }
      await onRequest({
        pagination: paginationSettings.value
      });
    };

    const checkIsMultiLine = (data: string): boolean => {
      return data.length > 0 && data.split('\n').length > 1;
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
    // create a watch for pagination and make sure it is called inmediately
    watch(
      () => pagination.value,
      async () => {
        let pageValue = pagination.value;
        let page = 1;
        let size = pageSizeOptions[0];

        // we also allow to pass a single number as the page number
        if (typeof pageValue === 'number') {
          page = pageValue;
        } else if (typeof pageValue === 'string') {
          // we also allow to pass a string of two numbers: 'page,rowsPerPage'
          const [p, s] = pageValue.split(',');
          page = Number(p);
          size = Number(s);
        }

        await setPagination(page, size);
      },
      { immediate: true }
    );

    return {
      columns,
      rows,
      filteredRows,
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
      filterRows,
      pageSizeOptions,
      setPagination,
      onPaginationChange
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
      div.col-auto.row.items-center.justify-end
        q-toggle(v-model="showAge" left-label label="Show timestamp as relative")
      div.col-auto.row.flex.filter-buttons
        q-btn-dropdown.q-ml-xs.q-mr-xs.col.button-primary(
          color="primary"
          label="Search")
          .q-pa-md.dropdown-filter
            .row
              q-input(filled dense v-model='actionsFilter' label="Search")
        q-btn-dropdown.q-ml-xs.q-mr-xs.col.button-primary(
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
        :row-key="row => row.name + row.action.action_ordinal +row.transaction.id"
        flat
        :bordered="false"
        :square="true"
        :loading="loading"
        table-header-class="table-header"
        v-model:pagination="paginationSettings"
        :hide-pagination="noData"
        @request='onPaginationChange'
        :rows-per-page-options='pageSizeOptions'
        )
        template(v-slot:header="props")
          q-tr(:props="props")
            q-th(
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            ) {{ col.label }}
        template( v-slot:body="props")
          q-tr(:props='props')
            q-td
              AccountFormat(:account="props.row.transaction.id" :type="props.row.transaction.type")
            q-td
              DateField( :timestamp="props.row.timestamp", :showAge='showAge' )
            q-td
              .row.justify-left.text-weight-light(v-for='action in props.row.actions')
                .col-auto
                  .q-pt-xs
                    ActionFormat(:action="action.action")
            q-td
              DataFormat(:actionData="props.row.data.data" :actionName="props.row.data.name " v-if='props.row.actions.length == 1')

          q-tr.expanded-row(v-show="props.expand" :props="props" v-for='action in props.row.actions')
            q-td(auto-width)
            q-td
              AccountFormat(:account="props.row.transaction.id" :type="props.row.transaction.type")
            q-td
              DateField( :timestamp="action.timestamp", :showAge='showAge' )
            q-td
              .row.justify-left.text-weight-light
                ActionFormat(:action="action.action")
            q-td
              DataFormat(:actionData="action.data.data" :actionName="action.data.name ")
        template( v-slot:pagination="scope")
          div.col(align="left")
            span.q-mr-sm page <b>{{ scope.pagination.page }}</b>
          q-space
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
    min-width: 1300px
    table-layout: fixed
    tbody td
      vertical-align: text-top
    tbody td:first-child
      word-break: break-all
    th:first-child
      width: 5%
    th:nth-child(2)
      width: 12%
    th:nth-child(3)
      width: 15%
    th:nth-child(4)
      width: 25%
    th:nth-child(5)
      width: 43%
    tbody tr
      td:first-child
        width: 5%
      td:nth-child(2)
        width: 12%
      td:nth-child(3)
        width: 15%
      td:nth-child(4)
        width: 25%
      td:nth-child(5)
        width: 43%

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

.dropdown-filter
  max-width: 300px

.expanded-row
  background: var(--q-color-producer-card-background)
</style>
