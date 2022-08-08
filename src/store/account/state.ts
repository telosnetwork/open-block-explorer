import { Authorization, AccountDetails, Action, Rexbal, ABI } from 'src/types';
import { User } from 'universal-authenticator-library';

export interface AccountStateInterface {
  loading: unknown;
  accountName: string;
  user: User;
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
  coreRexBalance: string;
  maturingRex: string;
  maturedRex: string;
  savingsRex: string;
  tlosRexRatio: number;
}

export function state(): AccountStateInterface {
  return {
    loading: false,
    accountName: '',
    user: null,
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
    abi: { abi: null } as ABI,
    coreRexBalance: '0 TLOS',
    maturingRex: '0 TLOS',
    maturedRex: '0 TLOS',
    savingsRex: '0 TLOS',
    tlosRexRatio: 1
  };
}
