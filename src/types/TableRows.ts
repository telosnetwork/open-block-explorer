export interface Rexbal {
  version: number;
  owner: string;
  vote_stake: string;
  rex_balance: string;
  matured_rex: number;
  rex_maturities: Maturities[];
}

interface Maturities {
  first: string;
  second: number;
}

export interface RexbalRows {
  rows: Rexbal[];
}

export interface GenericTable {
  rows: unknown[];
}

export interface Producer {
  owner: string;
  total_votes: string;
  producer_key: string;
  is_active: number;
  unreg_reason: '';
  url: string;
  unpaid_blocks: number;
  lifetime_produced_blocks: number;
  missed_blocks_per_rotation: number;
  lifetime_missed_blocks: number;
  last_claim_time: string;
  location: number;
  kick_reason_id: number;
  kick_reason: string;
  times_kicked: number;
  kick_penalty_hours: number;
  last_time_kicked: number;
}

export interface ProducerRows {
  rows: Producer[];
}

export interface RexPoolRows {
  rows: RexPool[];
}

export interface RexPool {
  loan_num: number;
  namebid_proceeds: string;
  total_lendable: string;
  total_lent: string;
  total_rent: string;
  total_rex: string;
  total_unlent: string;
  version: number;
}
