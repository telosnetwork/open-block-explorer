import { Authenticator } from 'universal-authenticator-library';
import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AccountStateInterface } from './state';

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
  }
};
