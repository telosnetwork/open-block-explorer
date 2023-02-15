import { Module } from 'vuex';
import { StateInterface } from 'src/store/index';
import { state, AccountStateInterface } from 'src/store/account/state';
import { getters } from 'src/store/account/getters';
import { mutations } from 'src/store/account/mutations';
import { actions } from 'src/store/account/actions';

export const account: Module<AccountStateInterface, StateInterface> = {
    namespaced: true,
    getters,
    mutations,
    actions,
    state,
};
