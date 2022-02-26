import { Module } from 'vuex';
import { StateInterface } from '../index';
import { state, ChainStateInterface } from './state';
import { getters } from './getters';
import { mutations } from './mutations';

export const chain: Module<ChainStateInterface, StateInterface> = {
  namespaced: true,
  getters,
  mutations,
  state
};
