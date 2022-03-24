import { Authorization } from 'src/types';
import { User } from 'universal-authenticator-library';

export interface AccountStateInterface {
  loading: unknown;
  accountName: string;
  autoLogin: unknown;
  isAuthenticated: boolean;
  linkedAccounts: Array<unknown>;
  data: unknown;
  authorization: Authorization[];
  user: User;
}

export function state(): AccountStateInterface {
  return {
    loading: false,
    accountName: '',
    autoLogin: null,
    isAuthenticated: false,
    linkedAccounts: [],
    data: {},
    authorization: [],
    user: null
  };
}
