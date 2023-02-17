<!-- eslint-disable vue/return-in-computed-property -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable prettier/prettier -->
<script lang="ts">
import {
  Action,
  PaginationSettings,
  TransactionTableRow,
  Token
} from 'src/types';
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
import HeaderSearch from 'src/components/HeaderSearch.vue';
import AccountSearch from 'src/components/AccountSearch.vue';
import TokenSearch from 'src/components/TokenSearch.vue';
import { api } from 'src/api';
import { useRoute, useRouter } from 'vue-router';
import { QBtnDropdown } from 'quasar';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
const chain: Chain = getChain();

const FIVE_SECONDS = 5000;

export default defineComponent({
  name: 'TransactionsTable',
  components: {
    DateField,
    AccountFormat,
    ActionFormat,
    DataFormat,
    HeaderSearch,
    AccountSearch,
    TokenSearch
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
    const showPagesSizes = ref<boolean>(false);
    const switchPageSelector = () => {
      showPagesSizes.value = !showPagesSizes.value;
    };
    const changePageSize = async (size: number) => {
      paginationSettings.value.rowsPerPage = size;
      await onPaginationChange({ pagination: paginationSettings.value});
    };
    const changePagination = async (page: number, size: number) => {
      paginationSettings.value.page = page;
      paginationSettings.value.rowsPerPage = size;
      await onPaginationChange({ pagination: paginationSettings.value});
    };
    const paginationSettings = ref<PaginationSettings>({
      sortBy: 'timestamp',
      descending: true,
      page: 1,
      rowsPerPage: pageSizeOptions[0],
      rowsNumber: 10000
    });

    const userWantLiveTransactions = ref<boolean>(true);
    const enableLiveTransactions = computed(() => {
      return (
        filter.value === '' &&
        paginationSettings.value.page === 1
      );
    });

    // actions filter
    const auxModel = ref('');
    const actionsModel = ref('');
    const actionsDisplay = computed(() => {
      if (actionsModel.value) {
        const list = actionsModel.value.split(',');
        return list.length > 1 ? list[0] + '...' : list[0];
      }
      return '';
    });

    // accounts filter
    const showAccountFilter = ref<boolean>(chain.getFiltersSupported('notified'));
    const accountsModel = ref('');
    const accountsDisplay = computed(() => {
      if (accountsModel.value) {
        const list = accountsModel.value.split(',');
        return list.length > 1 ? list[0] + '...' : list[0];
      }
      return '';
    });

    // token filter
    const showTokenFilter = ref(false);
    const tokenModel = ref(null as Token | null);
    const tokenDisplay = computed(() => {
      if (tokenModel.value) {
        return tokenModel.value?.symbol ?? '';
      }
      return '';
    });
    void api.getTokens().then((tokens) => {
      if (tokens.length > 0) {
        showTokenFilter.value = true;
      }
    });

    // date filter
    const now = new Date().toISOString();
    const fromDateModel = ref('');
    const toDateModel = ref<string>(now);
    const dateDisplay = computed(() => {
      try {
        if (fromDateModel.value !== '' || toDateModel.value !== now) {
          if (fromDateModel.value === '') {
            return 'Until ' + toDateModel.value.split('T')[0];
          } else if (toDateModel.value === now) {
            return 'Since ' + fromDateModel.value.split('T')[0];
          } else {
            return (
              fromDateModel.value.split('T')[0] +
              ' - ' +
              toDateModel.value.split('T')[0]
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
      return '';
    });

    const interval = ref<number>(null);
    const showAge = ref<boolean>(localStorage.getItem('showAge') === 'true');

    const isTransaction = computed(
      () => account.value != null && account.value.length > 12
    );
    const tableTitle = computed(() =>
      isTransaction.value ? 'Actions' : 'Latest Transactions'
    );

    const lastPage = computed(() => {
      const rowsPerPage = paginationSettings.value.rowsPerPage;
      const rowsNumber = paginationSettings.value.rowsNumber;
      return Math.ceil(rowsNumber / rowsPerPage);
    });

    const noData = computed(() => rows.value.length === 0);
    const hasActions = computed(() => actions.value != null);
    const clearFilters = (): void => {
      accountsModel.value = '';
      actionsModel.value = '';
      tokenModel.value = null;
      fromDateModel.value = '';
      toDateModel.value = now;
    };
    const filter = computed(() => {
      return (
        accountsDisplay.value +
        actionsDisplay.value +
        dateDisplay.value +
        tokenDisplay.value
      );
    });

    const filterRows = () => {
      filteredRows.value = rows.value;
    };

    const loadTableData = async (): Promise<void> => {
      let tableData: Action[];
      if (isTransaction.value) {
        tableData = (await api.getTransaction(account.value)).actions;
      } else if (hasActions.value) {
        tableData = actions.value;
      } else {
        const page = paginationSettings.value.page;
        let limit = paginationSettings.value.rowsPerPage;

        let notified = accountsModel.value ?? '';
        let after = '';
        let before = '';
        if (toDateModel.value !== now) {
          before = toDateModel.value;
        }
        if (fromDateModel.value !== '') {
          after = fromDateModel.value;
        }
        const sort = paginationSettings.value.descending ? 'desc' : 'asc';

        let extras: {[key:string]:string} | null = tokenModel.value ? {'act.account': tokenModel.value.contract} : null;
        if (actionsModel.value) {
          extras = extras ? {...extras, 'act.name': actionsModel.value} : {'act.name': actionsModel.value};
        }

        // if token is selected, we need to get all transactions and filter them
        // so we eventually will need more than the current page size
        if (tokenModel.value) {
          limit = 100;
        }

        tableData = await api.getTransactions({
          page,
          limit,
          account: account.value,
          notified,
          before,
          after,
          sort,
          extras
        });
      }
      if (tableData) {
        if (tokenModel.value) {
          tableData = tableData.filter((item) => {
            return (item.act.data as {quantity?:string}).quantity?.includes(tokenModel.value.symbol);
          });

          // take only the first aginationSettings.value.rowsPerPage items
          tableData = tableData.slice(0, paginationSettings.value.rowsPerPage);
        }

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
    const toggleDropdown = (dropdown: QBtnDropdown) => {
      dropdown.toggle();
    };
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

    const applyPagination = async (
      page: string | number,
      size: string | number
    ) => {
      if (page) {
        paginationSettings.value.page = Number(page);
      }
      if (size) {
        paginationSettings.value.rowsPerPage = Number(size);
      }
      // try to restore live transactions
      userWantLiveTransactions.value = enableLiveTransactions.value;
      await onRequest({
        pagination: paginationSettings.value
      });
    };

    const checkIsMultiLine = (data: string): boolean => {
      return data.length > 0 && data.split('\n').length > 1;
    };

    onMounted(() => {
      interval.value = window.setInterval(() => {
        if (userWantLiveTransactions.value && enableLiveTransactions.value)
          void loadTableData();
      }, FIVE_SECONDS);
    });
    onBeforeUnmount(() => {
      clearInterval(interval.value);
    });
    watch([account, actions], () => {
      void loadTableData();
    });
    watch(filter, async () => {
      if (paginationSettings.value.page !== 1) {
        await changePagination(1,paginationSettings.value.rowsPerPage);
      } else {
        await loadTableData();
      }

      userWantLiveTransactions.value =
        filter.value === '' &&
        paginationSettings.value.page === 1;

    });
    watch(showAge, (val) => {
      localStorage.setItem('showAge', val ? 'true' : 'false');
    });
    watch(enableLiveTransactions, (val) => {
      if (!val) {
        userWantLiveTransactions.value = false;
      }
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

        await applyPagination(page, size);
      },
      { immediate: true }
    );

    return {
      columns,
      rows,
      filteredRows,
      loading,
      showPagesSizes,
      paginationSettings,
      fromDateModel,
      toDateModel,
      dateDisplay,
      actionsDisplay,
      actionsModel,
      auxModel,
      accountsDisplay,
      accountsModel,
      showAccountFilter,
      tokenDisplay,
      tokenModel,
      showTokenFilter,
      interval,
      showAge,
      tableTitle,
      lastPage,
      noData,
      hasActions,
      filter,
      onRequest,
      loadTableData,
      checkIsMultiLine,
      filterRows,
      pageSizeOptions,
      changePageSize,
      switchPageSelector,
      applyPagination,
      changePagination,
      onPaginationChange,
      toggleDropdown,
      clearFilters,
      enableLiveTransactions,
      userWantLiveTransactions
    };
  }
});
</script>

<template lang="pug">
div.row.col-12.q-mt-xs.justify-center.text-left
  div.row.trx-table--main-container
    div.row.col-12.q-mt-lg
      // Left column
      div.col-auto.q-mr-xl.justify-start.trx-table--topleft-col
        div.row.flex-grow-1
          div.col
            // -- Title --
            p.text-no-wrap.trx-table--title {{ tableTitle }}
        div.row
          div.col
            q-toggle.text-no-wrap(v-model="showAge" left-label label="Show timestamp as relative")
        div.row
          div.col
            q-toggle.text-no-wrap(
              v-model="userWantLiveTransactions"
              left-label
              label="Live transactions"
              :disable="!enableLiveTransactions"
            )
      // Right column
      div.col.trx-table--topright-col
        div.row.justify-end
          // -- Filters  --
          div.col-auto.row.flex.trx-table--filter-buttons
            q-btn(
              v-if="filter !== ''"
              dense
              flat
              round
              icon="close"
              color="primary"
              @click="clearFilters"
            )
              span.q-pr-sm clear filters

            q-btn-dropdown.q-ml-xs.q-mr-xs.button-primary.q-btn--no-text-transform(
              v-if="showAccountFilter"
              no-caps
              ref="accounts_dropdown"
              :color="accountsDisplay === '' ? 'primary': 'secondary'"
              :label="accountsDisplay === '' ? 'Accounts' : accountsDisplay"
              @click="accountsModel = ''"
            )
              .q-pa-md.dropdown-filter
                .row
                  AccountSearch(v-model="accountsModel" @update:model-value="$refs.accounts_dropdown.toggle()")
            q-btn-dropdown.q-ml-xs.q-mr-xs.button-primary.q-btn--no-text-transform(
              ref="actions_dropdown"
              :color="actionsDisplay === '' ? 'primary': 'secondary'"
              :label="actionsDisplay === '' ? 'Actions' : actionsDisplay"
            )
              .q-pa-md.dropdown-filter
                .row
                  q-input(
                    filled dense v-model='auxModel'
                    label="actions"
                    placeholder="transfer, sellrex, etc."
                    @blur="actionsModel = auxModel; toggleDropdown($refs.actions_dropdown)"
                    @keyup.enter="actionsModel = auxModel; toggleDropdown($refs.actions_dropdown)"
                  )
                    template(v-slot:prepend)
                      q-icon.cursor-pointer(name='search')
                    template(v-slot:append)
                      q-btn(
                        size="sm"
                        color='primary'
                        @click="actionsModel = auxModel; toggleDropdown($refs.actions_dropdown)"
                      ) OK
            q-btn-dropdown.q-ml-xs.q-mr-xs.button-primary.q-btn--no-text-transform(
              :color="dateDisplay === '' ? 'primary': 'secondary'"
              :label="dateDisplay === '' ? 'Date' : dateDisplay"
            )
              .q-pa-md.dropdown-filter
                .row
                  q-input(filled dense v-model='fromDateModel' label="From")
                    template(v-slot:prepend)
                      q-icon.cursor-pointer(name='event')
                        q-popup-proxy(cover='' transition-show='scale' transition-hide='scale')
                          q-date(v-model='fromDateModel' mask='YYYY-MM-DD HH:mm')
                            .row.items-center.justify-end
                              q-btn(v-close-popup='' label='Close' color='primary' flat)
                    template(v-slot:append)
                      q-icon.cursor-pointer(name='access_time')
                        q-popup-proxy(cover transition-show='scale' transition-hide='scale')
                          q-time(v-model='fromDateModel' mask='YYYY-MM-DD HH:mm' format24h)
                            .row.items-center.justify-end
                              q-btn(v-close-popup='' label='Close' color='primary' flat)
                .row.justify-center.full-width.q-py-xs
                  q-icon(name="arrow_downward")
                .row
                  q-input(filled dense v-model='toDateModel' label="To")
                    template(v-slot:prepend)
                      q-icon.cursor-pointer(name='event')
                        q-popup-proxy(cover transition-show='scale' transition-hide='scale')
                          q-date(v-model='toDateModel' mask='YYYY-MM-DD HH:mm')
                            .row.items-center.justify-end
                              q-btn(v-close-popup='' label='Close' color='primary' flat)
                    template(v-slot:append)
                      q-icon.cursor-pointer(name='access_time')
                        q-popup-proxy(cover='' transition-show='scale' transition-hide='scale')
                          q-time(v-model='toDateModel' mask='YYYY-MM-DD HH:mm' format24h)
                            .row.items-center.justify-end
                              q-btn(v-close-popup='' label='Close' color='primary' flat)
            q-btn-dropdown.q-ml-xs.q-mr-xs.button-primary.q-btn--no-text-transform(
              v-if="showTokenFilter"
              ref="token_dropdown"
              :color="!tokenDisplay ? 'primary': 'secondary'"
              :label="!tokenDisplay ? 'Token' : tokenDisplay"
            )
              .q-pa-md.dropdown-filter
                .row
                  TokenSearch(v-model='tokenModel' @update:model-value="toggleDropdown($refs.token_dropdown)")

    q-separator.row.col-12.q-mt-md.separator
    div.row.col-12.table-container
      q-table.q-mt-lg.row.trx-table--fixed-layout(
        flat
        hide-pagination
        table-header-class="table-header"
        ref="main_table"
        v-model:pagination="paginationSettings"
        :rows="filteredRows"
        :columns="columns"
        :row-key="row => row.name + row.action.action_ordinal +row.transaction.id"
        :bordered="false"
        :square="true"
        :loading="loading"
        :hide-pagination="noData"
        :rows-per-page-options='pageSizeOptions'
        :dense="$q.screen.width < 1024"
        @request='onPaginationChange'
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
    div.row.col-12.items-center.justify-end.q-mt-md.q-mb-sm
      // records per page selector
      q-space
      div.col-auto
        small Rows per page: &nbsp; {{ paginationSettings.rowsPerPage }}
        // dropdown button to select number of rows per page
        q-icon(
          :name="showPagesSizes ? 'expand_more' : 'expand_less'"
          size="sm"
          @click="switchPageSelector"
        )
          q-popup-proxy(
            transition-show="scale"
            transition-hide="scale"
            ref="page_size_selector"
          )
            q-list
              q-item.cursor-pointer(
                v-for="size in pageSizeOptions"
                :key="size"
              )
                q-item-section(@click="changePageSize(size); $refs.page_size_selector.hide()") {{ size }}
      div.col-auto.q-ml-lg
        div.row.items-baseline
          div.col-auto.q-mr-xs
            small.q-mr-sm page <b>{{ paginationSettings.page }}</b>
          div.col-auto.q-mr-xs
            q-btn.q-ml-xs.q-mr-xs.col.button-primary(
              size="sm"
              :disable="paginationSettings.page === 1"
              @click="$refs.main_table.prevPage()") PREV
          div.col-auto.q-mr-xs
            q-btn.q-ml-xs.q-mr-xs.col.button-primary(
              size="sm"
              :disable="paginationSettings.page === lastPage"
              @click="$refs.main_table.nextPage()") NEXT



</template>

<style lang="sass">
$medium:920px

.table-container
  overflow-x: auto

.trx-table--title
  font-size: 22.75px
  font-style: normal
  font-weight: 400
  line-height: 27px

.trx-table--main-container
  width: 90%
.trx-table--filter-buttons
  gap: 10px 0px
.trx-table--fixed-layout
  .q-table
    table-layout: fixed
    tbody td
      vertical-align: text-top
    tbody td:first-child
      word-break: break-all
    th:nth-child(1)
      width: 15%
    th:nth-child(2)
      width: 17%
    th:nth-child(3)
      width: 27%
    th:nth-child(4)
      width: 41%

.q-table--no-wrap td
  word-break: break-all
  white-space: unset

.q-table__middle
  overflow-x: hidden

.q-table td div
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

.q-btn.q-btn--no-text-transform
  text-transform: none

@media screen and (max-width: $medium)
  .trx-table--topright-col
    justify-content: end
  .trx-table--topleft-col, .trx-table--topright-col
    display: flex
    padding-left: 16px
    padding-right: 16px
    min-width: 100% !important
  .trx-table--main-container
    width: 100%
  .trx-table--fixed-layout
    min-width: 620px
    .q-table
      table-layout: auto
      tbody td:first-child
        word-break: break-all
      th:nth-child(1)
        width: 12%
      th:nth-child(2)
        width: 17%
      th:nth-child(3)
        width: 17%
      th:nth-child(4)
        width: 54%

@media screen and (max-width: 665px)
  .trx-table--topleft-col, .trx-table--topright-col
    display: block
</style>
