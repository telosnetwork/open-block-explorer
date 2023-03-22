import { Authorization, Action, Rexbal, ABI } from 'src/types';
import { getChain } from 'src/config/ConfigManager';
import { User } from 'universal-authenticator-library';
import { API, UInt64 } from '@greymass/eosio';

const chain = getChain();

export interface AccountStateInterface {
  loading: unknown;
  accountName: string;
  accountPermission: string;
  user: User;
  autoLogin: unknown;
  isAuthenticated: boolean;
  linkedAccounts: Array<unknown>;
  data: API.v1.AccountObject;
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
  rexfund: number;
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
            account_name: '',
            /** Highest block number on the chain */
            // head_block_num: UInt32;
            // /** Highest block unix timestamp. */
            // head_block_time: TimePoint;
            // /** Indicator of if this is a privileged system account */
            // privileged: boolean;
            // /** Last update to accounts contract as unix timestamp. */
            // last_code_update: TimePoint;
            // /** Account created as unix timestamp. */
            // created: TimePoint;
            /** Account core token balance */
            core_liquid_balance: UInt64.from(0),
            // ram_quota: Int64;
            // net_weight: Int64;
            // cpu_weight: Int64;
            // net_limit: AccountResourceLimit;
            // cpu_limit: AccountResourceLimit;
            // ram_usage: UInt64;
            // permissions: AccountPermission[];
            // total_resources: AccountTotalResources;
            // self_delegated_bandwidth?: AccountSelfDelegatedBandwidth;
            // refund_request?: AccountRefundRequest;
            // voter_info?: AccountVoterInfo;
            // rex_info?: AccountRexInfo;
            // getPermission(permission: NameType): AccountPermission;
        } as unknown as API.v1.AccountObject,

        authorization: [],
        rexActions: [],
        TransactionId: '',
        TransactionError: '',
        rexbal: {} as Rexbal,
        vote: [],
        abi: { abi: null } as ABI,
        coreRexBalance: `0 ${chain.getSystemToken().symbol}`,
        maturingRex: `0 ${chain.getSystemToken().symbol}`,
        maturedRex: `0 ${chain.getSystemToken().symbol}`,
        savingsRex: `0 ${chain.getSystemToken().symbol}`,
        tlosRexRatio: 1,
        rexfund: 0,
    };
}
