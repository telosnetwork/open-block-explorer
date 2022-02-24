import { Module } from 'vuex';
import { StateInterface } from '../index';
import { state, ContractStateInterface } from './state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

export const contract: Module<ContractStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
};
