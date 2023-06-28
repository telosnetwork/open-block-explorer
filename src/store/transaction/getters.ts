import { GetterTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { TransactionStateInterface } from 'src/store/transaction/state';
import { Transaction } from 'src/types/zj_tpyes/Transaction';

export const getters: GetterTree<TransactionStateInterface, StateInterface> = {
    getTransaction({ transaction }): Transaction {
        return transaction;
    },
    getTransactionId({ transactionId }): string {
        return transactionId;
    },
};
