<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';
import { Action } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

export default defineComponent({
  name: 'HistoryTab',
  components: {},
  setup() {
    const store = useStore();
    const symbol = getChain().getSystemToken().symbol;
    const rexActions = computed((): Action[] => store.state.account.rexActions);

    function formatDate(date: string): string {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        day: 'numeric'
      });
    }

    return {
      store,
      rexActions,
      formatDate,
      symbol
    };
  }
});
</script>

<template lang="pug">
.q-pt-lg
  .container-refund.q-pa-md
    .row.full-width(v-for="action in rexActions")
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-6 {{action.act.name}}
          .col-6.text-weight-bold {{action.act.data.amount ? `${action.act.data.amount} ${symbol}` : action.act.data.rex}}
      .col-xs-12.col-sm-6
        .row.q-pa-sm
          .col-6
          .col-6.text-weight-bold {{formatDate(action.timestamp)}}
      q-separator(color="grey-8" )

    .row.full-width(v-if="rexActions.length === 0")
      .col-12
        .row.q-pa-sm No REX transaction history

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
.container-refund
  border: 1px solid $grey-8
  border-radius: 13px
.grey-3
  color: $grey-3
</style>
