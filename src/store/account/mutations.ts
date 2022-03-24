import { User } from 'universal-authenticator-library';
import { MutationTree } from 'vuex';
import { AccountStateInterface } from './state';

export const mutations: MutationTree<AccountStateInterface> = {
  setLoadingWallet(state: AccountStateInterface, wallet: string) {
    state.loading = wallet;
  },
  setAccountName(state: AccountStateInterface, accountName: string) {
    state.accountName = accountName;
  },
  setAutoLogin(state: AccountStateInterface, status: string) {
    state.autoLogin = status;
  },
  setUser(state: AccountStateInterface, user: User) {
    state.user = user;
  }
};
