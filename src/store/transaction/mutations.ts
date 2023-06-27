import { MutationTree } from 'vuex';
import { TransactionStateInterface } from 'src/store/transaction/state';
import { Transaction } from 'src/types/zj_tpyes/ZjActionData';

export const mutations: MutationTree<TransactionStateInterface> = {
    setTransaction(state: TransactionStateInterface, transaction: Transaction) {
        if (transaction && transaction.tx_hash.length > 0) {
            state.transaction = transaction;
            state.executed = false;
            state.blockNum = transaction.hash.slice(0, 6);
            state.timestamp = transaction.timestamp;
            state.transactionFound = true;
        } else {
            state.transactionFound = false;
        }
    },
    setTransactionId(state: TransactionStateInterface, transactionId: string) {
        state.transactionId = transactionId;
    },
};
