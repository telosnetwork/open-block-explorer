export interface GetProducers {
  rows: Producer[];
}

export interface Producer {
  owner: string;
  is_active: number;
  total_votes: number;
  location: string;
  name: string;
}
