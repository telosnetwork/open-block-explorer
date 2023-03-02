<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { Action, TreeNode } from 'src/types';
import ActionFormat from 'src/components/transaction/ActionFormat.vue';
import DataFormat from 'src/components/transaction/DataFormat.vue';

export default defineComponent({
    name: 'TraceTree',
    components: { ActionFormat, DataFormat },
    setup() {
        const store = useStore();
        const account = computed((): string => store.state.account.accountName);
        function getTree(actions: Action[]): TreeNode[] {
            let array = [] as TreeNode[];
            for (let action of actions) {
                let act = action.act;
                let obj = {} as TreeNode;
                let children = [] as TreeNode[];
                if ((action?.notified ?? []).length > 1) {
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
                        notifications: action.notified,
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
                    notifications: action.notified,
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
            account,
        };
    },
});
</script>

<template>

<div class="row full-width justify-center">
    <div class="col-xs-12 q-pa-md q-gutter-sm">
        <q-tree :nodes="getTree(actions)" node-key="label" default-expand-all>
            <template v-slot:default-header="prop">
                <div class="row items-center">
                    <div class="text-weight-bold text-primary">{{ prop.node.label }}</div>
                </div>
            </template>
            <template v-slot:header-trace="prop">
                <div class="row items-center full-width bordered q-col-gutter-sm" @click.stop>
                    <div class="col-xs-12 col-md-3">
                        <div class="text-weight-bold">{{ prop.node.account }}</div>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <div class="row justify-left text-weight-light">
                            <ActionFormat :action="prop.node.action"/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <div v-for="authorization in prop.node.authorization" :key="authorization.account">
                            <div class="text-weight-bold">{{ authorization.actor }}</div>
                            <div class="text-weight-light">@{{ authorization.permission }}</div>
                        </div>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <div class="row justify-left text-weight-light">
                            <DataFormat :actionData="prop.node.data" :actionName="prop.node.name " :use-color="true"/>
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:header-notification="prop">
                <div class="row items-center full-width bordered q-col-gutter-sm">
                    <div class="col-xs-12 col-md-3">
                        <div v-for="notification in prop.node.notifications" :key="notification" class="row">
                            <q-icon name="notifications" color="primary"/>
                            <div class="text-weight-bold">{{ notification }}</div>
                        </div>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <div class="row justify-left text-weight-light">
                            <ActionFormat :action="prop.node.action"/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <div v-for="authorization in prop.node.authorization" :key="authorization.account">
                            <div class="text-weight-bold">{{ authorization.actor }}</div>
                            <div class="text-weight-light">@{{ authorization.permission }}</div>
                        </div>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <DataFormat :actionData="prop.node.data" :actionName="prop.node.name " :use-color="true"/>
                    </div>
                </div>
            </template>
        </q-tree>
    </div>
</div>


</template>

<style scoped lang="sass"></style>
