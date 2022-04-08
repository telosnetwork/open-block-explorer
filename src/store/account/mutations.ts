import { MutationTree } from 'vuex';
import { AccountStateInterface } from './state';
import { AccountDetails } from 'src/types';

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
  setAccountData(state: AccountStateInterface, AccountData: AccountDetails) {
    state.data = AccountData;
  }
};
