import { AppAccount, Authorization } from 'src/types';

export interface AccountStateInterface {
  appAccount: AppAccount;
}

export function state(): AccountStateInterface {
  return {
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
