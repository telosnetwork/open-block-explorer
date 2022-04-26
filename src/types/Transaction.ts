export interface Transaction {
  id: string;
  trx: {
    receipt: {
      status: string;
      cpu_usage_us: number;
      net_usage_words: number;
    };
    trx: {
      expiration: string;
      ref_block_num: number;
      ref_block_prefix: number;
      max_net_usage_words: number;
      max_cpu_usage_ms: number;
      delay_sec: number;
    };
  };
  block_time: string;
  block_num: number;
  last_irreversible_block: number;
}
