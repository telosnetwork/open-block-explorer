import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { ContractStateInterface } from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const contractModule: Module<ContractStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
};

export default contractModule;
