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
  data: {
    account: string;
    name: string;
    authorization: Authorization[];
    data: {
      activity: Activity[];
    };
  };
  name: string;
}

interface Authorization {
  actor: string;
  permission: string;
}

interface Activity {
  game: string;
  account: string;
  timestamp: string;
  check_balance_limit: string;
}
