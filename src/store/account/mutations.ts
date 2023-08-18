import { MutationTree } from 'vuex';
import { AccountStateInterface } from 'src/store/account/state';
import { Action, Rexbal, ABI } from 'src/types';
import { User } from 'universal-authenticator-library';
import { markRaw } from 'vue';

import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { formatCurrency } from 'src/utils/string-utils';

const symbol = getChain().getSystemToken().symbol;

export const mutations: MutationTree<AccountStateInterface> = {
    setUser(state: AccountStateInterface, user: User) {
        state.user = user ? markRaw(user) : user;
    },
    setAccountName(state: AccountStateInterface, accountName: string) {
        state.accountName = accountName;
    },
    setAutoLogin(state: AccountStateInterface, status: string) {
        state.autoLogin = status;
    },
    setAccountData(
        state: AccountStateInterface,
        AccountData: API.v1.AccountObject,
    ) {
        state.data = AccountData;
        state.vote =
      AccountData?.voter_info?.producers.map(vote => vote.toString()) || [];
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
    },
    ) {
        state.rexbal = params.rexbal;
        state.coreRexBalance = formatCurrency(params.coreBalance, 4, symbol);
        state.maturedRex = formatCurrency(params.maturedRex, 4, symbol);
        state.maturingRex = formatCurrency(params.maturingRex, 4, symbol);
        state.savingsRex = formatCurrency(params.savingsRex, 4, symbol);
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
    setChainId(state: AccountStateInterface, id: string) {
        state.chainId = id;
    },
};
