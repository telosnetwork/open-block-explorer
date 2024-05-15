import { defineStore } from 'pinia';
import { Action, ActionData } from 'src/types';
import { api } from 'src/api';

export interface TransactionStateInterface {
    transaction: ActionData;
    transactionId: string;
    blockNum: number;
    timestamp: string;
    executed: boolean;
    cpuUsage: number;
    netUsage: number;
    actionCount: number;
    irreversable: boolean;
    actions: Action[];
    transactionFound: boolean;
}



export const useTransactionStore = defineStore('transaction', {
    state: (): TransactionStateInterface => ({
        transaction: {} as ActionData,
        transactionId: '',
        blockNum: 0,
        timestamp: '',
        executed: false,
        cpuUsage: 0,
        netUsage: 0,
        actionCount: 0,
        irreversable: false,
        actions: [] as Action[],
        transactionFound: true,
    }),
    getters: {
        getTransaction({ transaction }): ActionData {
            return transaction;
        },
        getTransactionId({ transactionId }): string {
            return transactionId;
        },
    },
    actions: {
        setTransaction(transaction: ActionData) {
            if ((transaction?.actions?.length || 0) > 0) {
                this.transaction = transaction;
                this.executed = transaction.executed || false;
                const action = transaction.actions[0];
                this.blockNum = action.block_num;
                this.timestamp = action.timestamp;
                this.cpuUsage = action.cpu_usage_us;
                this.netUsage = action.net_usage_words * 8;
                this.actionCount = transaction.actions.length;
                this.irreversable = transaction.lib > action.block_num;
                this.actions = transaction.actions;
                this.transactionFound = true;
            } else {
                this.transactionFound = false;
            }
        },
        setTransactionId(transactionId: string) {
            this.transactionId = transactionId;
        },
        setTimestamp(timestamp: string) {
            this.timestamp = timestamp;
        },
        setBlockNum(blockNum: number) {
            this.blockNum = blockNum;
        },
        setExecuted(executed: boolean) {
            this.executed = executed;
        },
        setCpuUsage(cpuUsage: number) {
            this.cpuUsage = cpuUsage;
        },
        setNetUsage(netUsage: number) {
            this.netUsage = netUsage;
        },
        setActionCount(actionCount: number) {
            this.actionCount = actionCount;
        },
        setIrreversable(irreversable: boolean) {
            this.irreversable = irreversable;
        },
        setTransactionFound(found: boolean) {
            this.transactionFound = found;
        },
        async updateTransaction() {
            const transaction = await api.getTransaction(this.transactionId);
            if (transaction) {
                this.setTransaction(transaction);
            } else {
                this.setTransactionFound(false);
            }
        },
        updateTransactionId(transactionId: string) {
            this.setTransactionId(transactionId);
        },
    },
});

