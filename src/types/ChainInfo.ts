export interface ChainInfo {
  block_cpu_limit: number;
  block_net_limit: number;
  chain_id: string;
  fork_db_head_block_id: string;
  fork_db_head_block_num: number;
  head_block_id: string;
  head_block_num: number;
  head_block_producer: string;
  head_block_time: string;
  last_irreversible_block_id: string;
  last_irreversible_block_num: number;
  last_irreversible_block_time: string;
  server_full_version_string: string;
  server_version: string;
  server_version_string: string;
  virtual_block_cpu_limit: number;
  virtual_block_net_limit: number;
}
