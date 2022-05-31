import { MutationTree } from 'vuex';
import { AccountStateInterface } from './state';
import { AccountDetails, Action, Rexbal, ABI } from 'src/types';

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
  },
  setTransaction(state: AccountStateInterface, TransactionId: string) {
    state.TransactionId = TransactionId;
  },
  setTransactionError(state: AccountStateInterface, TransactionError: unknown) {
    state.TransactionError = TransactionError;
  },
  setRexActions(state: AccountStateInterface, actions: Action[]) {
    state.rexActions = actions;
  },
  setRexbal(state: AccountStateInterface, rexbal: Rexbal) {
    state.rexbal = rexbal;
  },
  setABI(state: AccountStateInterface, abi: ABI) {
    state.abi = abi;
  }
};
