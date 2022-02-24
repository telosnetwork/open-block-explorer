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

interface Authorization {
  actor: string;
  permission: string;
}

interface Resource {
  used: number;
  available: number;
  max: number;
}

export interface AccountDetails {
  account: {
    account_name: string;
    core_liquid_balance: string;
    cpu_limit: Resource;
    cpu_weight: number;
    created: string;
    net_limit: Resource;
    net_weight: number;
    privileged: boolean;
    ram_quota: number;
    ram_usage: number;
    refund_request: null | string;
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
}

export interface BaseToken {
  symbol: string;
  precision: number;
}
export type Token = BaseToken & {
  amount: number;
  contract: string;
};
