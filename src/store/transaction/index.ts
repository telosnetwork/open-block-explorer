import { Module } from 'vuex';
import { StateInterface } from 'src/store/index';
import { state, TransactionStateInterface } from 'src/store/transaction/state';
import { actions } from 'src/store/transaction/actions';
import { getters } from 'src/store/transaction/getters';
import { mutations } from 'src/store/transaction/mutations';

export const transaction: Module<TransactionStateInterface, StateInterface> = {
    namespaced: true,
    actions,
    getters,
    mutations,
    state,
};
