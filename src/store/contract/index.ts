import { Module } from 'vuex';
import { StateInterface } from 'src/store/index';
import { state, ContractStateInterface } from 'src/store/contract/state';
import { actions } from 'src/store/contract/actions';
import { getters } from 'src/store/contract/getters';
import { mutations } from 'src/store/contract/mutations';

export const contract: Module<ContractStateInterface, StateInterface> = {
    namespaced: true,
    actions,
    getters,
    mutations,
    state,
};
