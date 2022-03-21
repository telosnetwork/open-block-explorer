import { Module } from 'vuex';
import { StateInterface } from '../index';
import { state, AccountStateInterface } from './state';
import { getters } from './getters';
import { mutations } from './mutations';
import { actions } from './actions';

export const account: Module<AccountStateInterface, StateInterface> = {
  namespaced: true,
  getters,
  mutations,
  actions,
  state
};
