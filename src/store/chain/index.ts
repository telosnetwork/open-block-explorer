import { Module } from 'vuex';
import { StateInterface } from '../index';
import { state, ChainStateInterface } from './state';
import { getters } from './getters';
import { mutations } from './mutations';
import { actions } from './actions';

export const chain: Module<ChainStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
};
