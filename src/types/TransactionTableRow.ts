import { Action } from 'src/types';

export interface TransactionTableActionRow {
  name: string;
  transaction: { id: string; type: string };
  timestamp: string;
  action: Action;
  data: { data: unknown | Action['data']; name: string };
}
export interface TransactionTableRow {
  name: string;
  transaction: { id: string; type: string };
  timestamp: string;
  action: Action;
  data: { data: unknown | Action['data']; name: string };
  actions: TransactionTableActionRow[];
}
