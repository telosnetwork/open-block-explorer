import { Module } from 'vuex';
import { StateInterface } from 'src/store/index';
import { state, ChainStateInterface } from 'src/store/chain/state';
import { getters } from 'src/store/chain/getters';
import { mutations } from 'src/store/chain/mutations';
import { actions } from 'src/store/chain/actions';

export const chain: Module<ChainStateInterface, StateInterface> = {
    namespaced: true,
    actions,
    getters,
    mutations,
    state,
};
