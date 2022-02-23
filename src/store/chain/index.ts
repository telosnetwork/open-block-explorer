import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { ChainStateInterface } from './state';
import getters from './getters';
import mutations from './mutations';

const contractModule: Module<ChainStateInterface, StateInterface> = {
  namespaced: true,
  getters,
  mutations,
  state
};

export default contractModule;
