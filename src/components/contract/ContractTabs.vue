<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import Tables from './Tables.vue';
import Actions from './Actions.vue';
import JsonViewer from 'vue-json-viewer';
import { useStore } from 'src/store';
/* eslint-disable */

export default defineComponent({
  name: 'ContractTabs',
  setup() {
    const store = useStore();
    const tab = ref<string>('tables');
    const abi = computed(() => store.state.account.abi);
    return { tab, abi };
  },
  components: { Tables, Actions, JsonViewer }
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
        Tables
      q-tab-panel(name="actions")
        Actions
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
