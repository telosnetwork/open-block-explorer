import { AccountDetails } from 'src/types';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AccountStateInterface } from './state';

export const getters: GetterTree<AccountStateInterface, StateInterface> = {
  account(state): AccountStateInterface {
    return state;
  },
  isAuthenticated(state): boolean {
    return state.isAuthenticated;
  },
  accountName(state): string {
    return state.accountName;
  },
  getAccountData(state): AccountDetails {
    return state.data;
  }
};
