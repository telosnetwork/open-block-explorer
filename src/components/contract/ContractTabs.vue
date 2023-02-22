<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import ContractTables from 'src/components/contract/ContractTables.vue';
import ContractActions from 'src/components/contract/ContractActions.vue';
import JsonViewer from 'vue-json-viewer';
import { useStore } from 'src/store';
import { useRoute, useRouter } from 'vue-router';
/* eslint-disable */

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
        query: query
      });
    });

    return { tab, abi };
  },
  components: { ContractTables, ContractActions, JsonViewer }
});
</script>

<template lang="pug">
.row
  .col-12.q-py-md
    .text-h5 Contract Details
  .col-12
    q-tabs(v-model="tab" no-caps align="left" :breakpoint="0")
      q-tab( name="tables" label="Tables" )
      q-tab( name="actions" label="Actions" )
      q-tab( name="abi" label="ABI" )
    q-tab-panels(v-model="tab").col-12
      q-tab-panel(name="tables")
        ContractTables
      q-tab-panel(name="actions")
        ContractActions
      q-tab-panel(name="abi")
        q-card(
          flat
          style="background: #f4f0fb"
        )
          q-card-section
            JsonViewer(
              :value="abi"
              :expand-depth=5
              preview-mode
              boxed
              copyable
              sort
            )
</template>

<style lang="sass"></style>
