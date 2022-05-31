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
