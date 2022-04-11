export interface ActionData {
  actions: Action[];
  cached: boolean;
  lib: number;
  query_time_ms: number;
  total: {
    value: number;
    relation: string;
  };
}

export interface Action {
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
}

interface AccountRamDelta {
  account: string;
  delta: number;
}

export interface Account {
  account: string;
  authorization: Authorization[];
  data: unknown;
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
    rex_info: null | { vote_stake: string };
    subjective_cpu_bill_limit: Resource;
    total_resources: {
      owner: string;
      net_weight: string;
      cpu_weight: string;
      ram_bytes: number;
    };
    voter_info: null | { staked: number };
  };
  actions: Action[];
  links: string[];
  query_time_ms: number;
  tokens: Token[];
  total_actions: number;
};
export interface Token {
  symbol: string;
  precision: number;
  amount: number;
  contract: string;
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

export interface Permission {
  parent: string;
  perm_name: string;
  required_auth: RequiredAuth;
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
export interface Userres {
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
  transactions: string[];
  id: string;
  block_num: number;
  ref_block_prefix: number;
}
