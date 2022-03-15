/* eslint-disable @typescript-eslint/no-unsafe-return */
import { AppAccount } from 'src/types';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AccountStateInterface } from './state';

export const getters: GetterTree<AccountStateInterface, StateInterface> = {
  getAccount({ appAccount }): AppAccount {
    return appAccount;
  }
};
