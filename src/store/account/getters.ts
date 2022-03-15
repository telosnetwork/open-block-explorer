import { AppAccount } from 'src/types';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AccountStateInterface } from './state';

export const getters: GetterTree<AccountStateInterface, StateInterface> = {
  getAccount({ appAccount }): AppAccount {
    return appAccount;
  },
  isAuthenticated({ appAccount }): boolean {
    return appAccount.isAuthenticated;
  }
};
