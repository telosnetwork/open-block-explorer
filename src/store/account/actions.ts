import { Authenticator, User } from 'universal-authenticator-library';
import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AccountStateInterface } from './state';
import { api } from 'src/api/index';
import { GetTableRowsParams } from 'src/types';
import { TableIndexType } from 'src/types/Api';

export const actions: ActionTree<AccountStateInterface, StateInterface> = {
  async login({ commit }, { account, authenticator }) {
    commit(
      'setLoadingWallet',
      (authenticator as Authenticator).getStyle().text
    );
    await (authenticator as Authenticator).init();
    if (!account) {
      const requestAccount = await (
        authenticator as Authenticator
      ).shouldRequestAccountName();
      if (requestAccount) {
        commit('setRequestAccount', true);
        return;
      }
    }
    const users = await (authenticator as Authenticator).login();
    if (users.length) {
      const account = users[0];
      const accountName = await account.getAccountName();
      commit('setAccountName', accountName);
      localStorage.setItem(
        'autoLogin',
        (authenticator as Authenticator).constructor.name
      );
      localStorage.setItem('account', accountName);
      localStorage.setItem('returning', 'true');
      commit('setLoadingWallet');
    }
  },
  async updateRexData({ commit }, { account, authenticator }) {
    const params = {
      code: 'eosio',
      json: true,
      limit: '1',
      key_type: '',
      lower_bound: account as TableIndexType,
      scope: 'eosio',
      table: 'rexfund',
      upper_bound: account as TableIndexType
    } as GetTableRowsParams;
    const paramsrexbal = {
      code: 'eosio',
      json: true,
      limit: '1',
      key_type: '',
      lower_bound: account as TableIndexType,
      scope: 'eosio',
      table: 'rexbal',
      upper_bound: account as TableIndexType
    } as GetTableRowsParams;
    const transaction = await api.getTableRows(paramsrexbal);
    console.log(transaction);
    commit(
      'setLoadingWallet',
      (authenticator as Authenticator).getStyle().text
    );
    await (authenticator as Authenticator).init();
    if (!account) {
      const requestAccount = await (
        authenticator as Authenticator
      ).shouldRequestAccountName();
      if (requestAccount) {
        commit('setRequestAccount', true);
        return;
      }
    }
    const users = await (authenticator as Authenticator).login();
    if (users.length) {
      const account = users[0];
      const accountName = await account.getAccountName();
      commit('setAccountName', accountName);
      localStorage.setItem(
        'autoLogin',
        (authenticator as Authenticator).constructor.name
      );
      localStorage.setItem('account', accountName);
      localStorage.setItem('returning', 'true');
      commit('setLoadingWallet');
    }
  },
  async sendTransaction({}, { user, account, data, name }) {
    let transaction = null;
    const actions = [
      {
        account: account as string,
        name: name as string,
        authorization: [
          {
            actor: this.state.account.accountName,
            permission: 'active'
          }
        ],
        data: data as unknown
      }
    ];
    try {
      transaction = await (user as User).signTransaction(
        {
          actions
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      );
    } catch (e) {
      throw e;
    }
    return transaction;
  }
};
