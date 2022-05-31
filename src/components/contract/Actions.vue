<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Actions',
  setup() {
    const tables = ref<string>('abihash');
    const options = ['abihash', 'other'];
    const scope = ref<string>('eosio');
    const lower = ref<string>('');
    const upper = ref<string>('');
    const limit = ref<string>('20');
    return { tables, options, scope, lower, upper, limit };
  }
});
</script>

<template lang="pug">
q-card(
  flat
  style="background: #f4f0fb"
)
  q-card-section.q-pl-md(style="background: #eae2f7")
    div.q-pb-sm.text-subtitle2.text-bold Select table
    .row.justify-content.full-width
      .col-xs-8.col-sm-10
        q-select(outlined dense v-model="tables" :options="options" color="primary" style="background: #ffffff")
      .col-xs-4.col-sm-2.q-pl-md
        q-btn.full-width( unelevated color="primary" label="Refresh" size="15px")

  q-card-section.q-pt-none
    .row.q-py-md.q-col-gutter-md
      .col-xs-6.col-sm-3
        .text-bold.q-pb-sm Scope
        q-input(outlined dense v-model="scope" style="background: #ffffff")
      .col-xs-6.col-sm-3
        .text-bold.q-pb-sm Lower Bound
        q-input(outlined v-model="lower" dense style="background: #ffffff")
      .col-xs-6.col-sm-3
        .text-bold.q-pb-sm Upper Bound
        q-input(outlined v-model="upper" dense style="background: #ffffff")
      .col-xs-6.col-sm-3
        .text-bold.q-pb-sm Limit
        q-input(outlined v-model="limit" dense style="background: #ffffff")

</template>

<style lang="sass"></style>
