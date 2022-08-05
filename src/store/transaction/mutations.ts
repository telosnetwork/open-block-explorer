import { MutationTree } from 'vuex';
import { TransactionStateInterface } from './state';
import { ActionData } from 'src/types';

export const mutations: MutationTree<TransactionStateInterface> = {
  setTransaction(state: TransactionStateInterface, transaction: ActionData) {
    state.transaction = transaction;
    state.executed = transaction ? transaction.executed || false : false;
    if (transaction && transaction.actions && transaction.actions.length > 0) {
      const action = transaction.actions[0];
      state.blockNum = action.block_num;
      state.timestamp = action.timestamp;
      state.cpuUsage = action.cpu_usage_us;
      state.netUsage = action.net_usage_words * 2;
      state.actionCount = transaction.actions.length;
      state.irreversable = transaction.lib > action.block_num;
      state.actions = transaction.actions;
      state.transactionFound = true;
    } else {
      state.transactionFound = false;
    }
  },
  setTransactionId(state: TransactionStateInterface, transactionId: string) {
    state.transactionId = transactionId;
  },
  setTimestamp(state: TransactionStateInterface, timestamp: string) {
    state.timestamp = timestamp;
  },
  setBlockNum(state: TransactionStateInterface, blockNum: number) {
    state.blockNum = blockNum;
  },
  setExecuted(state: TransactionStateInterface, executed: boolean) {
    state.executed = executed;
  },
  setCpuUsage(state: TransactionStateInterface, cpuUsage: number) {
    state.cpuUsage = cpuUsage;
  },
  setNetUsage(state: TransactionStateInterface, netUsage: number) {
    state.netUsage = netUsage;
  },
  setActionCount(state: TransactionStateInterface, actionCount: number) {
    state.actionCount = actionCount;
  },
  setIrreversable(state: TransactionStateInterface, irreversable: boolean) {
    state.irreversable = irreversable;
  },
  setTransactionFounde(state: TransactionStateInterface, found: boolean) {
    state.transactionFound = found;
  }
};
