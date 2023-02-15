import { GetterTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { TransactionStateInterface } from 'src/store/transaction/state';
import { ActionData } from 'src/types';

export const getters: GetterTree<TransactionStateInterface, StateInterface> = {
    getTransaction({ transaction }): ActionData {
        return transaction;
    },
    getTransactionId({ transactionId }): string {
        return transactionId;
    },
};
