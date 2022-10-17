import { MutationTree } from 'vuex';
import { AccountStateInterface } from './state';
import { AccountDetails, Action, Rexbal, ABI } from 'src/types';
import { User } from 'universal-authenticator-library';
import { markRaw } from 'vue';

import { getChain } from 'src/config/ConfigManager';

const symbol = getChain().getSymbol();

export const mutations: MutationTree<AccountStateInterface> = {
  setLoadingWallet(state: AccountStateInterface, wallet: string) {
    state.loading = wallet;
  },
  setUser(state: AccountStateInterface, user: User) {
    state.user = user ? markRaw(user) : user;
  },
  setAccountName(state: AccountStateInterface, accountName: string) {
    state.accountName = accountName;
  },
  setAutoLogin(state: AccountStateInterface, status: string) {
    state.autoLogin = status;
  },
  setAccountData(state: AccountStateInterface, AccountData: AccountDetails) {
    state.data = AccountData;
    state.vote = AccountData.account?.voter_info?.producers || [];
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
  setRexbal(
    state: AccountStateInterface,
    params: {
      rexbal: Rexbal;
      coreBalance: number;
      maturingRex: number;
      savingsRex: number;
      maturedRex: number;
    }
  ) {
    state.rexbal = params.rexbal;
    state.coreRexBalance = `${params.coreBalance.toFixed(4)} ${symbol}`;
    state.maturedRex = `${params.maturedRex.toFixed(4)} ${symbol}`;
    state.maturingRex = `${params.maturingRex.toFixed(4)} ${symbol}`;
    state.savingsRex = `${params.savingsRex.toFixed(4)} ${symbol}`;
  },
  setVote(state: AccountStateInterface, vote: string[]) {
    state.vote = vote.sort();
  },
  setABI(state: AccountStateInterface, abi: ABI) {
    state.abi = abi;
  },
  setTlosRexRatio(state: AccountStateInterface, ratio: number) {
    state.tlosRexRatio = ratio;
  },
  setAccountPermission(state: AccountStateInterface, permission: string) {
    state.accountPermission = permission;
  },
  setIsAuthenticated(state: AccountStateInterface, authenticated: boolean) {
    state.isAuthenticated = authenticated;
  },
  setRexFund(state: AccountStateInterface, fund: number) {
    state.rexfund = fund;
  },
  setAuthenticatorName(state: AccountStateInterface, auth: string) {
    state.authenticatorName = auth;
  }
};
