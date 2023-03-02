<!-- eslint-disable @typescript-eslint/no-unsafe-assignment -->
<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import ContractTables from 'src/components/contract/ContractTables.vue';
import ContractActions from 'src/components/contract/ContractActions.vue';
import JsonViewer from 'vue-json-viewer';
import { useStore } from 'src/store';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: 'ContractTabs',
    setup() {
        const store = useStore();
        const route = useRoute();
        const router = useRouter();
        const tab = ref<string>((route.query['tab1'] as string) || 'tables');
        const abi = computed(() => store.state.account.abi);

        watch([tab], () => {
            let query = { ...route.query };
            query['tab1'] = tab.value;
            void router.push({
                path: router.currentRoute.value.path,
                query: query,
            });
        });

        return { tab, abi };
    },
    components: {
        ContractTables,
        ContractActions,
        JsonViewer,
    },
});
</script>

<template>

<div class="row">
    <div class="col-12 q-py-md">
        <div class="text-h5">Contract Details</div>
    </div>
    <div class="col-12">
        <q-tabs
            v-model="tab"
            no-caps
            align="left"
            :breakpoint="0"
        >
            <q-tab name="tables" label="Tables"/>
            <q-tab name="actions" label="Actions"/>
            <q-tab name="abi" label="ABI"/>
        </q-tabs>
        <q-tab-panels v-model="tab" class="col-12">
            <q-tab-panel name="tables">
                <ContractTables/>
            </q-tab-panel>
            <q-tab-panel name="actions">
                <ContractActions/>
            </q-tab-panel>
            <q-tab-panel name="abi">
                <q-card flat class="card--light-bg">
                    <q-card-section>
                        <JsonViewer
                            :value="abi"
                            :expand-depth="5"
                            preview-mode="preview-mode"
                            boxed="boxed"
                            copyable="copyable"
                            sort="sort"
                        />
                    </q-card-section>
                </q-card>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</div></template>

<style lang="sass"></style>
