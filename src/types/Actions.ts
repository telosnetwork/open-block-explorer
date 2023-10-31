import { API } from '@greymass/eosio';

export interface ActionData {
  actions: Action[];
  cached: boolean;
  executed: boolean;
  lib: number;
  query_time_ms: number;
  total: {
    value: number;
    relation: string;
  };
}

export interface GetActionsResponse {
    data: {
        actions: Action[],
        total: {
            value: number
        }
    },
}

export interface Action<T = unknown> {
  '@timestamp': string;
  account_ram_deltas: AccountRamDelta[];
  act: Account;
  action_ordinal: number;
  block_num: number;
  cpu_usage_us: number;
  creator_action_ordinal: number;
  global_sequence: number;
  net_usage_words: number;
  notified: string[];
  producer: string;
  signatures: string[];
  timestamp: string;
  trx_id: string;
  receipts: Receipt[];
  account: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: T;
  name: string;
}

interface AccountRamDelta {
  account: string;
  delta: number;
}

export interface Account {
  account: string;
  authorization: Authorization[];
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  data: any;
  name: string;
}

export interface Authorization {
  actor: string;
  permission: string;
}

interface Resource {
  used: number;
  available: number;
  max: number;
}

export type AccountDetails = {
  account: {
    account_name: string;
    core_liquid_balance: string;
    cpu_limit: Resource;
    cpu_weight: number;
    created: string;
    net_limit: Resource;
    net_weight: number;
    permissions: Permission[];
    privileged: boolean;
    ram_quota: number;
    ram_usage: number;
    refund_request: Refund;
    rex_info: null | {
      matured_rex: string;
      vote_stake: string;
      rex_balance: string;
      rex_maturities: Maturities[];
    };
    subjective_cpu_bill_limit: Resource;
    total_resources: {
      owner: string;
      net_weight: string;
      cpu_weight: string;
      ram_bytes: number;
    };
    voter_info: {
      owner: string;
      proxy: string;
      producers: string[];
      staked: number;
      last_stake: number;
      last_vote_weight: string;
      proxied_vote_weight: number;
      is_proxy: number;
    };
    self_delegated_bandwidth: { net_weight: string; cpu_weight: string };
  };
  actions: Action[];
  links: string[];
  query_time_ms: number;
  tokens: Token[];
  total_actions: number;
};
export interface Token {
  name?: string;
  symbol: string;
  precision: number;
  amount?: number;
  contract: string;
  logo?: string;
}
interface Key {
  key: string;
  weight: number;
}

interface ActorPermission {
  permission: { actor: string; permission: 'eosio.code' };
  weight: number;
}
interface RequiredAuth {
  accounts: ActorPermission[];
  keys: Key[];
  threshold: number;
  waits: [];
}

export interface Permission extends API.v1.AccountPermission {
  children: Permission[];
  permission_links: PermissionLinks[];
}

export interface NewAccountData {
  active: RequiredAuth;
  creator: string;
  newact: string;
  owner: RequiredAuth;
  name: string;
}

export interface PermissionLinksData {
  cached: boolean;
  links: PermissionLinks[];
  query_time_ms: number;
  total: {
    value: number;
    relation: string;
  };
}

export interface PermissionLinks {
  account: string;
  action: string;
  block_num: number;
  code: string;
  permission: string;
  timestamp: string;
}

export interface TransferData {
  from: string;
  to: string;
  amount: number;
  symbol: string;
  memo: string;
  quantity: number;
}

export interface Refund {
  cpu_amount: string;
  net_amount: string;
  owner: string;
  request_time: string;
}
export interface TableByScope {
  code: string;
  scope: string;
  table: string;
  payer: string;
  count: number;
}

export interface Block {
  timestamp: string;
  producer: string;
  confirmed: number;
  previous: string;
  transaction_mroot: string;
  action_mroot: string;
  schedule_version: number;
  new_producers: null | string;
  producer_signature: string;
  transactions: {
    cpu_usage_us: number;
    net_usage_words: number;
    status: string;
    trx: {
      id: string;
      transaction: {
        actions: Action[];
      };
    };
  }[];
  id: string;
  block_num: number;
  ref_block_prefix: number;
}

export interface Receipt {
  auth_sequence: Auth_sequence[];
  global_sequence: string;
  receiver: string;
  recv_sequence: string;
}

export interface Auth_sequence {
  account: string;
  sequence: string;
}

interface Maturities {
  first: string;
  second: number;
}
export interface Get_actions {
  actions: Action[];
  cached: boolean;
}
export interface Error {
  cause?: {
    json?: {
      error?: {
        what?: string;
      };
    };
  };
}
