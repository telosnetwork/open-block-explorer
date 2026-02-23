export interface GetProducers {
  rows: Producer[];
}

export interface Producer {
  owner: string;
  is_active: number;
  total_votes: number;
  location: string;
  name: string;
  self_staked_boost: number;
  is_self_staking: boolean;
  self_staked_amount: number;
  num_producers_voted: number;
}
