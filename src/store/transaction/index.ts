import { Module } from 'vuex';
import { StateInterface } from '../index';
import { state, TransactionStateInterface } from './state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

export const transaction: Module<TransactionStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
};
