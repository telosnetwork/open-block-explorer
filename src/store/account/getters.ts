import { API } from '@greymass/eosio';
import { User } from 'universal-authenticator-library';
import { GetterTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { AccountStateInterface } from 'src/store/account/state';

export const getters: GetterTree<AccountStateInterface, StateInterface> = {
    account(state): AccountStateInterface {
        return state;
    },
    isAuthenticated(state): boolean {
        return state.isAuthenticated;
    },
    accountName(state): string {
        return state.accountName;
    },
    getAccountData(state): API.v1.AccountObject {
        return state.data;
    },
    getUser(state): User {
        return state.user;
    },
};
