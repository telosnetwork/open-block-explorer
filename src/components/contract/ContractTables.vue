<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'src/store';
import { api } from 'src/api/index';
import { GetTableRowsParams, GenericTable } from 'src/types';
import { TableIndexType } from 'src/types/Api';
import { PaginationSettings } from 'src/types';
/* eslint-disable */
export default defineComponent({
    name: 'ContractTables',
    setup() {
        const store = useStore();
        const options = computed(() =>
            store.state.account.abi.abi.tables.map((table) => {
                return table.name;
            })
        );
        const account = computed(() => store.state.account.abi.account_name);
        const table = ref(options.value[0]);
        const scope = ref<string>(store.state.account.abi.account_name);
        const lower = ref<string>(null);
        const upper = ref<string>(null);
        const limit = ref<string>('20');
        const pagination = ref({
            sortBy: 'timestamp',
            descending: true,
            page: 1,
            rowsPerPage: Number(limit.value) || 10
        } as PaginationSettings);

        const rows = ref([]);
        const isMoreRows = computed(() => rows.value.length >= Number(limit.value));
        const canShowMore = computed(
            () => Number(limit.value) >= rows.value.length
        );
        async function getRows() {
            const params = {
                code: account.value,
                limit: limit.value,
                lower_bound: lower.value as unknown as TableIndexType,
                scope: scope.value,
                table: table.value,
                json: true,
                key_type: 'i64',
                upper_bound: upper.value as unknown as TableIndexType
            } as GetTableRowsParams;
            let data = ((await api.getTableRows(params)) as GenericTable).rows;
            data = data.map((row) => formatData(row));
            rows.value = data;
        }
        async function updateRows(val: string) {
            const params = {
                code: account.value,
                limit: limit.value,
                lower_bound: lower.value as unknown as TableIndexType,
                scope: scope.value,
                table: val,
                json: true,
                key_type: 'i64',
                upper_bound: upper.value as unknown as TableIndexType
            } as GetTableRowsParams;
            let data = ((await api.getTableRows(params)) as GenericTable).rows;
            data = data.map((row) => formatData(row));
            rows.value = data;
        }
        onMounted(async () => {
            await getRows();
        });

        async function showMore() {
            limit.value = (Number(limit.value) + Number(limit.value)).toString();
            await getRows();
        }

        function formatData(data: any): any {
            var dict: any = {};
            for (let key in data) {
                if (data[key] instanceof Object) {
                    dict[key] = JSON.stringify(data[key]);
                } else {
                    dict[key] = data[key];
                }
            }
            return dict;
        }

        return {
            table,
            options,
            scope,
            lower,
            upper,
            limit,
            rows,
            getRows,
            pagination,
            updateRows,
            showMore,
            canShowMore,
            isMoreRows
        };
    }
});
</script>

<template>

<q-card class="card--light-bg" flat>
  <q-card-section class="q-pl-md section--light-bg">
    <div class="q-pb-sm text-subtitle2 text-bold">Select table</div>
    <div class="row justify-content full-width">
      <div class="col-10">
        <q-select outlined @update:model-value="updateRows" dense v-model="table" :options="options" color="primary" ></q-select>
      </div>
      <div class="col-2 q-pl-md">
        <q-btn class="full-width" unelevated color="primary" label="Refresh" size="15px" @click="getRows"></q-btn>
      </div>
    </div>
  </q-card-section>
  <q-card-section class="q-pt-none">
    <div class="row q-py-md q-col-gutter-md">
      <div class="col-xs-6 col-sm-3">
        <div class="text-bold q-pb-sm">Scope</div>
        <q-input outlined @keydown.enter.prevent="getRows" @blur="getRows" dense v-model="scope"></q-input>
      </div>
      <div class="col-xs-6 col-sm-3">
        <div class="text-bold q-pb-sm">Lower Bound</div>
        <q-input outlined @keydown.enter.prevent="getRows" @blur="getRows" v-model="lower" dense ></q-input>
      </div>
      <div class="col-xs-6 col-sm-3">
        <div class="text-bold q-pb-sm">Upper Bound</div>
        <q-input outlined @keydown.enter.prevent="getRows" @blur="getRows" v-model="upper" dense ></q-input>
      </div>
      <div class="col-xs-6 col-sm-3">
        <div class="text-bold q-pb-sm">Limit</div>
        <q-input outlined @keydown.enter.prevent="getRows" @blur="getRows" v-model="limit" dense ></q-input>
      </div>
    </div>
  </q-card-section>
  <q-card-section class="q-pt-none">
    <q-table :rows="rows" :row-key="rows[0] ? rows[0][0] : ''" :rows-per-page-options="[0]">
      <template v-slot:bottom>
        <div class="row full-width justify-center q-py-md q-px-xl" v-if="canShowMore">
          <q-btn class="q-ml-xs q-mr-xs col button-primary" v-if="isMoreRows" @click="showMore">Show more</q-btn>
        </div>
      </template>
    </q-table>
  </q-card-section>
</q-card>

</template>
