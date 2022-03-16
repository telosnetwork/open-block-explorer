import { MutationTree } from 'vuex';
import { AccountStateInterface } from './state';

export const mutations: MutationTree<AccountStateInterface> = {
  setLoadingWallet(state: AccountStateInterface, wallet: unknown) {
    state.loading = wallet;
  },
  setAccountName(state: AccountStateInterface, accountName: string) {
    state.accountName = accountName;
  },
  setAutoLogin(state: AccountStateInterface, status: unknown) {
    state.autoLogin = status;
  }
};
