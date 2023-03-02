import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { TransactionStateInterface } from 'src/store/transaction/state';
import { api } from 'src/api/index';

export const actions: ActionTree<TransactionStateInterface, StateInterface> = {
    async updateTransaction({ commit, state }) {
        const transaction = await api.getTransaction(state.transactionId);
        if (transaction) {
            commit('setTransaction', transaction);
        } else {
            commit('setTransactionFound', false);
        }
    },
    updateTransactionId({ commit }, transactionId) {
        commit('setTransactionId', transactionId);
    },
};
