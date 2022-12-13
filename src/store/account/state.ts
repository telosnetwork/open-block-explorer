import { Authorization, AccountDetails, Action, Rexbal, ABI } from 'src/types';
import { getChain } from 'src/config/ConfigManager';
import { User } from 'universal-authenticator-library';
import { FixedNumber } from 'ethers';

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
  tlosRexRatio: FixedNumber;
  rexfund: number;
  authenticatorName: string;
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
    data: {
      account: {
        account_name: '',
        core_liquid_balance: '0.0000'
      },
      tokens: [],
      actions: []
    } as AccountDetails,
    authorization: [],
    rexActions: [],
    TransactionId: '',
    TransactionError: '',
    rexbal: {} as Rexbal,
    vote: [],
    abi: { abi: null } as ABI,
    coreRexBalance: `0.0000 ${chain.getSymbol()}`,
    maturingRex: `0.0000 ${chain.getSymbol()}`,
    maturedRex: `0.0000 ${chain.getSymbol()}`,
    savingsRex: `0.0000 ${chain.getSymbol()}`,
    tlosRexRatio: FixedNumber.from(1),
    rexfund: 0,
    authenticatorName: null
  };
}
