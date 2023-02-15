import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { TransactionStateInterface } from './state';
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
