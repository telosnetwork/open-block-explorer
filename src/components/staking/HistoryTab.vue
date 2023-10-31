<script lang="ts">
import { defineComponent, computed } from 'vue';
import { Action } from 'src/types';
import { getRexHistoryAsset, formatDate } from 'src/utils/string-utils';
import { useAccountStore } from 'src/stores/account';

export default defineComponent({
    name: 'HistoryTab',
    components: {},
    setup() {
        const accountStore = useAccountStore();
        const rexActions = computed((): Action[] => accountStore.rexActions);

        return {
            accountStore,
            rexActions,
            formatDate,
            getRexHistoryAsset,
        };
    },
});
</script>

<template>

<div class="q-pt-lg">
    <div class="container-refund q-pa-md">
        <div
            v-for="action in rexActions"
            :key="action.act.data.id"
            class="row full-width"
        >
            <div class="col-xs-12 col-sm-6">
                <div class="row q-pa-sm">
                    <div class="col-6">{{action.act.name}}</div>
                    <div class="col-6 text-weight-bold">{{ getRexHistoryAsset(action.act.data)}}</div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6">
                <div class="row q-pa-sm">
                    <div class="col-6"></div>
                    <div class="col-6 text-weight-bold">{{formatDate(action.timestamp, false)}}</div>
                </div>
            </div>
            <q-separator color="grey-8"/>
        </div>
        <div v-if="rexActions.length === 0" class="row full-width">
            <div class="col-12">
                <div class="row q-pa-sm">No REX transaction history</div>
            </div>
        </div>
    </div>
</div>

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
