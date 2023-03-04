<script lang="ts">
import {
    Action,
    PaginationSettings,
    TransactionTableRow,
    Token,
} from 'src/types';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    PropType,
    ref,
    toRefs,
    watch,
} from 'vue';
import DateField from 'src/components/DateField.vue';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';
import ActionFormat from 'src/components/transaction/ActionFormat.vue';
import DataFormat from 'src/components/transaction/DataFormat.vue';
import AccountSearch from 'src/components/AccountSearch.vue';
import TokenSearch from 'src/components/TokenSearch.vue';
import { api } from 'src/api';
import { useRoute, useRouter } from 'vue-router';
// QBtnDropdown, QPopupProxy, QTable are actually used on the html code
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QBtnDropdown, QPopupProxy, QTable } from 'quasar';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
const chain: Chain = getChain();

const TWO_SECONDS = 2000;

export default defineComponent({
    name: 'TransactionsTable',
    components: {
        DateField,
        AccountFormat,
        ActionFormat,
        DataFormat,
        AccountSearch,
        TokenSearch,
    },
    props: {
        account: {
            type: String || null,
            required: false,
            default: null,
        },
        actions: {
            type: Object as PropType<Action[]>,
            required: false,
            default: null,
        },
        showTransferLabel: {
            // show/hide send/receive label for transfers
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const pagination = computed(
            () => (route.query['page'] as string) || '1,10',
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
                sortable: true,
            },
            {
                name: 'timestamp',
                required: true,
                align: 'left',
                label: 'TIMESTAMP',
                field: 'timestamp',
                sortable: true,
            },
            {
                name: 'action',
                required: true,
                align: 'left',
                label: 'ACTION',
                field: 'action',
                sortable: true,
            },
            {
                name: 'data',
                required: true,
                align: 'left',
                label: 'DATA',
                field: 'data',
            },
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
            await onPaginationChange({ pagination: paginationSettings.value });
        };
        const changePagination = async (page: number, size: number) => {
            paginationSettings.value.page = page;
            paginationSettings.value.rowsPerPage = size;
            await onPaginationChange({ pagination: paginationSettings.value });
        };
        const paginationSettings = ref<PaginationSettings>({
            sortBy: 'timestamp',
            descending: true,
            page: 1,
            rowsPerPage: pageSizeOptions[0],
            rowsNumber: 10000,
        });

        const enableLiveTransactions = ref<boolean>(true);
        const currentFirstAction = ref<number>(0);

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
            () => account.value !== null && account.value.length > 12,
        );
        const tableTitle = computed(() =>
            isTransaction.value ? 'Actions' : 'Latest Transactions',
        );

        const lastPage = computed(() => {
            const rowsPerPage = paginationSettings.value.rowsPerPage;
            const rowsNumber = paginationSettings.value.rowsNumber;
            return Math.ceil(rowsNumber / rowsPerPage);
        });

        const hasActions = computed(() => actions.value !== null);
        const clearFilters = (): void => {
            accountsModel.value = '';
            actionsModel.value = '';
            tokenModel.value = null;
            fromDateModel.value = '';
            toDateModel.value = now;
        };
        const filter = computed(() => (
            accountsDisplay.value +
            actionsDisplay.value +
            dateDisplay.value +
            tokenDisplay.value
        ));

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
                    before = new Date(toDateModel.value).toISOString();
                }
                if (fromDateModel.value !== '') {
                    after = new Date(fromDateModel.value).toISOString();
                }
                const sort = paginationSettings.value.descending ? 'desc' : 'asc';

                let extras: {[key:string]:string} | null = tokenModel.value ? { 'act.account': tokenModel.value.contract } : null;
                if (actionsModel.value) {
                    extras = extras ? {
                        ...extras,
                        'act.name': actionsModel.value,
                    } : {
                        'act.name': actionsModel.value,
                    };
                }

                if (page > 1 && currentFirstAction.value === 0) {
                    currentFirstAction.value = rows.value[0]?.action.global_sequence;
                }

                if (currentFirstAction.value > 0) {
                    extras = extras ? {
                        ...extras,
                        'global_sequence': '0-' + currentFirstAction.value.toString(),
                    } : {
                        'global_sequence': '0-' + currentFirstAction.value.toString(),
                    };
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
                    extras,
                });
            }

            if (tableData) {
                if (tokenModel.value) {
                    tableData = tableData.filter(
                        item => (item.act.data as {quantity?:string}).quantity?.includes(tokenModel.value.symbol),
                    );

                    // take only the first aginationSettings.value.rowsPerPage items
                    tableData = tableData.slice(0, paginationSettings.value.rowsPerPage);
                }

                rows.value = tableData.map(item => ({
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
                                    name: item.account,
                                }
                                : { data: item.act.data as unknown, name: item.act.name },
                        },
                    ],
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
                    page: `${page},${rowsPerPage}`,
                },
            });
        };

        const applyPagination = async (
            page: string | number,
            size: string | number,
        ) => {
            if (page) {
                paginationSettings.value.page = Number(page);
            }
            if (size) {
                paginationSettings.value.rowsPerPage = Number(size);
            }
            await onRequest({
                pagination: paginationSettings.value,
            });
        };

        const checkIsMultiLine = (data: string): boolean => data.length > 0 && data.split('\n').length > 1;

        const setLiveTransactionInterval = () => {
            currentFirstAction.value = 0;
            clearInterval(interval.value);
            interval.value = window.setInterval(() => {
                void loadTableData();
            }, TWO_SECONDS);
        };

        const clearLiveTransactionInterval = () => {
            clearInterval(interval.value);
        };

        onBeforeUnmount(() => {
            clearLiveTransactionInterval();
        });

        watch([account, actions], () => {
            void loadTableData();
        });

        watch(filter, async () => {
            if (paginationSettings.value.page !== 1) {
                await changePagination(1, paginationSettings.value.rowsPerPage);
            } else {
                enableLiveTransactions.value = false;
                await loadTableData();
            }
        });

        watch(showAge, (val) => {
            localStorage.setItem('showAge', val ? 'true' : 'false');
        });

        const updateLiveTransactionState = async () => {
            if (enableLiveTransactions.value) {
                clearFilters();
                if (paginationSettings.value.page !== 1){
                    await changePagination(1, paginationSettings.value.rowsPerPage);
                }
                setLiveTransactionInterval();
            }else {
                clearLiveTransactionInterval();
            }
        };

        watch(enableLiveTransactions, () => {
            void updateLiveTransactionState();
        });

        onMounted(() => {
            void updateLiveTransactionState();
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
                // automatically disable live transactions on navigation from front page
                if (page !== 1) {
                    enableLiveTransactions.value = false;
                }
                await applyPagination(page, size);
            },
            { immediate: true },
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
            clearFilters,
            enableLiveTransactions,
            QBtnDropdown,
            QPopupProxy,
            QTable,
        };
    },
});
</script>

<template>

<div class="row col-12 q-mt-xs justify-center text-left trx-table container-max-width">
    <div class="row trx-table--main-container">
        <div class="row col-12 q-mt-lg">
            <!-- Left column-->
            <div class="col-auto q-mr-xl justify-start trx-table--topleft-col">
                <div class="row flex-grow-1">
                    <div class="col">
                        <!-- -- Title ---->
                        <p class="text-no-wrap trx-table--title">{{ tableTitle }}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <q-toggle
                            v-model="showAge"
                            class="text-no-wrap"
                            left-label
                            label="Show timestamp as relative"
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <q-toggle
                            v-model="enableLiveTransactions"
                            class="text-no-wrap"
                            left-label
                            label="Live transactions"
                        />
                    </div>
                </div>
            </div>
            <!-- Right column-->
            <div class="col trx-table--topright-col">
                <div class="row justify-end">
                    <!-- -- Filters    ---->
                    <div class="col-auto row flex trx-table--filter-buttons">
                        <q-btn
                            v-if="filter !== ''"
                            dense
                            flat
                            round
                            icon="close"
                            color="primary"
                            @click="clearFilters"
                        ><span class="q-pr-sm">clear filters</span></q-btn>
                        <q-btn-dropdown
                            v-if="showAccountFilter"
                            ref="accounts_dropdown"
                            class="q-ml-xs q-mr-xs button-primary q-btn--no-text-transform"
                            no-caps
                            :color="accountsDisplay === '' ? 'primary': 'secondary'"
                            :label="accountsDisplay === '' ? 'Accounts' : accountsDisplay"
                            @click="accountsModel = ''"
                        >
                            <div class="q-pa-md dropdown-filter">
                                <div class="row">
                                    <AccountSearch v-model="accountsModel" @update:model-value="($refs.accounts_dropdown as QBtnDropdown).toggle()"/>
                                </div>
                            </div>
                        </q-btn-dropdown>
                        <q-btn-dropdown
                            ref="actions_dropdown"
                            class="q-ml-xs q-mr-xs button-primary q-btn--no-text-transform"
                            :color="actionsDisplay === '' ? 'primary': 'secondary'"
                            :label="actionsDisplay === '' ? 'Actions' : actionsDisplay"
                        >
                            <div class="q-pa-md dropdown-filter">
                                <div class="row">
                                    <q-input
                                        v-model="auxModel"
                                        filled
                                        dense
                                        label="actions"
                                        placeholder="transfer, sellrex, etc."
                                        @blur="actionsModel = auxModel; ($refs.actions_dropdown as QBtnDropdown).toggle()"
                                        @keyup.enter="actionsModel = auxModel; ($refs.actions_dropdown as QBtnDropdown).toggle()"
                                    >
                                        <template v-slot:prepend>
                                            <q-icon class="cursor-pointer" name="search"/>
                                        </template>
                                        <template v-slot:append>
                                            <q-btn size="sm" color="primary" @click="actionsModel = auxModel; ($refs.actions_dropdown as QBtnDropdown).toggle()">OK</q-btn>
                                        </template>
                                    </q-input>
                                </div>
                            </div>
                        </q-btn-dropdown>
                        <q-btn-dropdown class="q-ml-xs q-mr-xs button-primary q-btn--no-text-transform" :color="dateDisplay === '' ? 'primary': 'secondary'" :label="dateDisplay === '' ? 'Date' : dateDisplay">
                            <div class="q-pa-md dropdown-filter">
                                <div class="row">
                                    <q-input
                                        v-model="fromDateModel"
                                        filled
                                        dense
                                        label="From"
                                    >
                                        <template v-slot:prepend>
                                            <q-icon class="cursor-pointer" name="event">
                                                <q-popup-proxy cover="" transition-show="scale" transition-hide="scale">
                                                    <q-date v-model="fromDateModel" mask="YYYY-MM-DD HH:mm">
                                                        <div class="row items-center justify-end">
                                                            <q-btn
                                                                v-close-popup
                                                                label="Close"
                                                                color="primary"
                                                                flat
                                                            />
                                                        </div>
                                                    </q-date>
                                                </q-popup-proxy>
                                            </q-icon>
                                        </template>
                                        <template v-slot:append>
                                            <q-icon class="cursor-pointer" name="access_time">
                                                <q-popup-proxy cover="cover" transition-show="scale" transition-hide="scale">
                                                    <q-time v-model="fromDateModel" mask="YYYY-MM-DD HH:mm" format24h>
                                                        <div class="row items-center justify-end">
                                                            <q-btn
                                                                v-close-popup
                                                                label="Close"
                                                                color="primary"
                                                                flat
                                                            />
                                                        </div>
                                                    </q-time>
                                                </q-popup-proxy>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                </div>
                                <div class="row justify-center full-width q-py-xs">
                                    <q-icon name="arrow_downward"/>
                                </div>
                                <div class="row">
                                    <q-input
                                        v-model="toDateModel"
                                        filled
                                        dense
                                        label="To"
                                    >
                                        <template v-slot:prepend>
                                            <q-icon class="cursor-pointer" name="event">
                                                <q-popup-proxy cover="cover" transition-show="scale" transition-hide="scale">
                                                    <q-date v-model="toDateModel" mask="YYYY-MM-DD HH:mm">
                                                        <div class="row items-center justify-end">
                                                            <q-btn
                                                                v-close-popup
                                                                label="Close"
                                                                color="primary"
                                                                flat
                                                            />
                                                        </div>
                                                    </q-date>
                                                </q-popup-proxy>
                                            </q-icon>
                                        </template>
                                        <template v-slot:append>
                                            <q-icon class="cursor-pointer" name="access_time">
                                                <q-popup-proxy cover="" transition-show="scale" transition-hide="scale">
                                                    <q-time v-model="toDateModel" mask="YYYY-MM-DD HH:mm" format24h>
                                                        <div class="row items-center justify-end">
                                                            <q-btn
                                                                v-close-popup
                                                                label="Close"
                                                                color="primary"
                                                                flat
                                                            />
                                                        </div>
                                                    </q-time>
                                                </q-popup-proxy>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                </div>
                            </div>
                        </q-btn-dropdown>
                        <q-btn-dropdown
                            v-if="showTokenFilter"
                            ref="token_dropdown"
                            class="q-ml-xs q-mr-xs button-primary q-btn--no-text-transform"
                            :color="!tokenDisplay ? 'primary': 'secondary'"
                            :label="!tokenDisplay ? 'Token' : tokenDisplay"
                        >
                            <div class="q-pa-md dropdown-filter">
                                <div class="row">
                                    <TokenSearch v-model="tokenModel" @update:model-value="($refs.token_dropdown as QBtnDropdown).toggle()"/>
                                </div>
                            </div>
                        </q-btn-dropdown>
                    </div>
                </div>
            </div>
        </div>
        <q-separator class="row col-12 q-mt-md separator"/>
        <div class="row col-12 table-container">
            <q-table
                ref="main_table"
                v-model:pagination="paginationSettings"
                class="q-mt-lg row trx-table--fixed-layout"
                flat
                table-header-class="table-header"
                hide-pagination
                :rows="filteredRows"
                :columns="columns"
                :row-key="row => row.name + row.action.action_ordinal +row.transaction.id"
                :bordered="false"
                :square="true"
                :loading="loading"
                :rows-per-page-options="pageSizeOptions"
                :dense="$q.screen.width < 1024"
                @request="onPaginationChange"
            >
                <template v-slot:header="props">
                    <q-tr :props="props">
                        <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
                    </q-tr>
                </template>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td>
                            <AccountFormat :account="props.row.transaction.id" :type="props.row.transaction.type"/>
                        </q-td>
                        <q-td>
                            <DateField :timestamp="props.row.timestamp" :showAge="showAge"/>
                        </q-td>
                        <q-td>
                            <div
                                v-for="action in props.row.actions"
                                :key="action.action.action_ordinal"
                                class="row justify-left text-weight-light"
                            >
                                <div class="col-auto">
                                    <div class="q-pt-xs">
                                        <ActionFormat :action="action.action" :showTransferLabel="showTransferLabel" :account="account"/>
                                    </div>
                                </div>
                            </div>
                        </q-td>
                        <q-td>
                            <DataFormat
                                v-if="props.row.actions.length === 1"
                                :actionData="props.row.data.data"
                                :actionName="props.row.data.name "
                                :use-color="false"
                            />
                        </q-td>
                    </q-tr>
                    <q-tr
                        v-for="action in props.row.actions"
                        v-show="props.expand"
                        :key="action.action.action_ordinal"
                        class="expanded-row"
                        :props="props"
                    >
                        <q-td auto-width/>
                        <q-td>
                            <AccountFormat :account="props.row.transaction.id" :type="props.row.transaction.type"/>
                        </q-td>
                        <q-td>
                            <DateField :timestamp="action.timestamp" :showAge="showAge"/>
                        </q-td>
                        <q-td>
                            <div class="row justify-left text-weight-light">
                                <ActionFormat :action="action.action"/>
                            </div>
                        </q-td>
                        <q-td>
                            <DataFormat :actionData="action.data.data" :actionName="action.data.name " :use-color="false"/>
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
        <div class="row col-12 items-center justify-end q-mt-md q-mb-sm">
            <!-- records per page selector-->
            <q-space/>
            <div class="col-auto"><small>Rows per page: &nbsp; {{ paginationSettings.rowsPerPage }}</small>
                <!-- dropdown button to select number of rows per page-->
                <q-icon :name="showPagesSizes ? 'expand_more' : 'expand_less'" size="sm" @click="switchPageSelector">
                    <q-popup-proxy ref="page_size_selector" transition-show="scale" transition-hide="scale">
                        <q-list>
                            <q-item v-for="size in pageSizeOptions" :key="size" class="cursor-pointer">
                                <q-item-section @click="changePageSize(size); ($refs.page_size_selector as QPopupProxy).hide()">{{ size }}</q-item-section>
                            </q-item>
                        </q-list>
                    </q-popup-proxy>
                </q-icon>
            </div>
            <div class="col-auto q-ml-lg">
                <div class="row items-baseline">
                    <div class="col-auto q-mr-xs"><small class="q-mr-sm">page <b>{{ paginationSettings.page }}</b></small></div>
                    <div class="col-auto q-mr-xs">
                        <q-btn
                            class="q-ml-xs q-mr-xs col button-primary"
                            size="sm"
                            :disable="paginationSettings.page === 1"
                            @click="($refs.main_table as QTable).prevPage()"
                        >PREV</q-btn>
                    </div>
                    <div class="col-auto q-mr-xs">
                        <q-btn
                            class="q-ml-xs q-mr-xs col button-primary"
                            size="sm"
                            :disable="paginationSettings.page === lastPage"
                            @click="($refs.main_table as QTable).nextPage()"
                        >NEXT</q-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style lang="sass">
$medium:920px

.trx-table
  margin-top: 1rem
  margin-bottom: 1rem
  padding-bottom: .5rem
  background-color:#ffffff
  background: #FFFFFF
  box-shadow: 0px 9px 14px rgba(138, 101, 212, 0.1), 0px 1px 4px rgba(37, 42, 97, 0.3)
  border-radius: 10px

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
      height: 3.25rem
      vertical-align: items-center
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

.table-container
    overflow-x: scroll

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
