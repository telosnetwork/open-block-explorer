<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import BlockTable from 'src/components/BlockTable.vue';
import BlockCard from 'components/BlockCard.vue';
import { useStore } from 'src/store';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'src/api/index';
import { Action, Block } from 'src/types';

export default defineComponent({
  name: 'Block',
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const found = ref(true);
    const block = ref<Block>(null);
    const actions = ref<Action[]>([]);
    const tab = ref<string>((route.query['tab'] as string) || 'actions');
    onMounted(async () => {
      // api get block and set block
      block.value = await api.getBlock(route.params.block as string);
      block.value.transactions.forEach((tr) => {
        actions.value = actions.value.concat(tr.trx.transaction.actions);
      });
      console.log(actions.value);
      found.value = block.value ? true : false;
    });
    watch([tab], () => {
      void router.push({
        path: router.currentRoute.value.path,
        query: {
          tab: tab.value
        }
      });
    });
    return {
      tab,
      transaction: route.params.transaction,
      found,
      Actions: actions,
      block
    };
  },
  components: {
    BlockTable,
    BlockCard
  }
});
</script>

<template lang="pug">
.row
  .col-12.gradient-box.q-pb-lg
    BlockCard.q-pa-lg(v-if='found' :block='block')
    .q-pa-lg(v-else)
      .row.full-width.justify-center
        .col-xs-12.col-md-8.col-lg-6
          q-card(flat class="transaction-card")
            .q-pa-md-md.q-pa-sm-sm.q-pa-xs-xs.q-pa-xl-lg
              q-card-section.q-pl-md
                div(class="text-h4 text-bold") Block not found.
  .q-pt-lg
    //BlockTable(:actions='Actions')
    
</template>

<style scoped lang="sass">
.bg-blur
  background: rgba(255,255,255,0.2)
  backdrop-filter: blur(5px)
  border-radius: 5px
.full-vw
  width: 100vw
</style>
