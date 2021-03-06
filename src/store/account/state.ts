import { Authorization, AccountDetails, Action, Rexbal, ABI } from 'src/types';

export interface AccountStateInterface {
  loading: unknown;
  accountName: string;
  autoLogin: unknown;
  isAuthenticated: boolean;
  linkedAccounts: Array<unknown>;
  data: AccountDetails;
  authorization: Authorization[];
  rexActions: Action[];
  TransactionId: string;
  TransactionError: unknown;
  rexbal: Rexbal;
  vote: string[];
  abi: ABI;
}

export function state(): AccountStateInterface {
  return {
    loading: false,
    accountName: '',
    autoLogin: null,
    isAuthenticated: false,
    linkedAccounts: [],
    data: {} as AccountDetails,
    authorization: [],
    rexActions: [],
    TransactionId: '',
    TransactionError: '',
    rexbal: {} as Rexbal,
    vote: [],
    abi: { abi: null } as ABI
  };
}
