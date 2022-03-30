import { Authorization, AccountDetails } from 'src/types';

export interface AccountStateInterface {
  loading: unknown;
  accountName: string;
  autoLogin: unknown;
  isAuthenticated: boolean;
  linkedAccounts: Array<unknown>;
  data: AccountDetails;
  authorization: Authorization[];
}

export function state(): AccountStateInterface {
  return {
    loading: false,
    accountName: '',
    autoLogin: null,
    isAuthenticated: false,
    linkedAccounts: [],
    data: {} as AccountDetails,
    authorization: []
  };
}
