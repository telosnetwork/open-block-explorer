import { AppAccount } from 'src/types';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AccountStateInterface } from './state';

export const getters: GetterTree<AccountStateInterface, StateInterface> = {
  account({ appAccount }): AppAccount {
    return appAccount;
  },
  isAuthenticated({ appAccount }): boolean {
    return appAccount.isAuthenticated;
  },
  accountName({ appAccount }): string {
    return appAccount.name;
  }
};
