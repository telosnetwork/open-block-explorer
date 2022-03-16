import { AppAccount, Authorization } from 'src/types';

export interface AccountStateInterface {
  loading: unknown;
  accountName: string;
  autoLogin: unknown;
  appAccount: AppAccount;
}

export function state(): AccountStateInterface {
  return {
    loading: false,
    accountName: '',
    autoLogin: null,
    appAccount: {
      account: '',
      name: '',
      isAuthenticated: false,
      linkedAccounts: [],
      data: {},
      authorization: [] as Authorization[]
    }
  };
}
