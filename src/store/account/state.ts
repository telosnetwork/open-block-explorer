import { Authorization, AccountDetails, Action, Rexbal, ABI } from 'src/types';
import { getChain } from 'src/config/ConfigManager';
import { User } from 'universal-authenticator-library';

const chain = getChain();

export interface AccountStateInterface {
  loading: unknown;
  accountName: string;
  accountPermission: string;
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
    accountPermission: 'active',
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
    coreRexBalance: `0 ${chain.getSymbol()}`,
    maturingRex: `0 ${chain.getSymbol()}`,
    maturedRex: `0 ${chain.getSymbol()}`,
    savingsRex: `0 ${chain.getSymbol()}`,
    tlosRexRatio: 1
  };
}
