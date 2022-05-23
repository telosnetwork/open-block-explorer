<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { Action, TreeNode } from 'src/types';
import ActionFormatter from 'src/components/Transaction/ActionFormat.vue';
import DataFormatter from 'src/components/Transaction/DataFormat.vue';

export default defineComponent({
  name: 'TransactionsTable',
  components: { ActionFormatter, DataFormatter },
  setup() {
    const store = useStore();
    const account = computed((): string => store.state.account.accountName);
    function getTree(actions: Action[]): TreeNode[] {
      var array = [] as TreeNode[];
      for (var action of actions) {
        var act = action.act;
        var obj = {} as TreeNode;
        var children = [] as TreeNode[];
        if (action.notified.length > 1) {
          children.push({
            label: action.global_sequence.toString(),
            body: 'notification',
            name: act.name,
            header: 'notification',
            account: act.account,
            authorization: act.authorization,
            data: act.data,
            action,
            children: [],
            notifications: action.notified
          });
        }
        obj = {
          label: action.global_sequence.toString() + 'notification',
          body: 'trace',
          name: act.name,
          header: 'trace',
          account: act.account,
          authorization: act.authorization,
          data: act.data,
          action,
          children: children,
          notifications: action.notified
        };
        array.push(obj);
      }
      return array;
    }

    return {
      transaction: computed(() => store.state.transaction.transactionId),
      transactionData: computed(() => store.state.transaction.transaction),
      blockNum: computed(() => store.state.transaction.blockNum),
      timestamp: computed(() => store.state.transaction.timestamp),
      executed: computed(() => store.state.transaction.executed),
      irreversable: computed(() => store.state.transaction.irreversable),
      cpuUsage: computed(() => store.state.transaction.cpuUsage),
      netUsage: computed(() => store.state.transaction.netUsage),
      actionsTraces: ref<string>(''),
      actionNum: computed(() => store.state.transaction.actionCount),
      actions: computed(() => store.state.transaction.actions),
      getTree,
      account
    };
  }
});
</script>

<template lang="pug">
.row.full-width.justify-center
  .col-xs-12.q-pa-md.q-gutter-sm
    q-tree(
      :nodes="getTree(actions)"
      node-key="label"
      default-expand-all)
    
      template(v-slot:default-header="prop")
        .row.items-center
          .text-weight-bold.text-primary {{ prop.node.label }}
      template(v-slot:header-trace="prop")
        .row.items-center.full-width.bordered.q-col-gutter-sm(@click.stop)
          .col-xs-12.col-md-3
            .text-weight-bold {{ prop.node.account }}
          .col-xs-12.col-md-3
            .row.justify-left.text-weight-light
              actionFormatter(:action="prop.node.action")
          .col-xs-12.col-md-3
            div(v-for="authorization in prop.node.authorization" :key="authorization.account")
              .text-weight-bold {{ authorization.actor }}
              .text-weight-light @{{ authorization.permission }}
          .col-xs-12.col-md-3
            .row.justify-left.text-weight-light
              dataFormatter(:actionData="prop.node.data" :actionName="prop.node.name ")

      template(v-slot:header-notification="prop")
        .row.items-center.full-width.bordered.q-col-gutter-sm
          .col-xs-12.col-md-3
            .row(v-for="notification in prop.node.notifications" :key="notification")
              q-icon(name="notifications" color="primary")
              .text-weight-bold {{ notification }}
          .col-xs-12.col-md-3
            .row.justify-left.text-weight-light
              actionFormatter(:action="prop.node.action")
          .col-xs-12.col-md-3
            div(v-for="authorization in prop.node.authorization" :key="authorization.account")
              .text-weight-bold {{ authorization.actor }}
              .text-weight-light @{{ authorization.permission }}
          .col-xs-12.col-md-3
            dataFormatter(:actionData="prop.node.data" :actionName="prop.node.name ")
    

</template>

<style scoped lang="sass"></style>
