export interface GetProducers {
  rows: {
    owner: string;
    is_active: number;
  }[];
}
