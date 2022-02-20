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

interface Account {
  account: string;
  authorization: Authorization[];
  data: unknown;
  name: string;
}

interface Authorization {
  actor: string;
  permission: string;
}
