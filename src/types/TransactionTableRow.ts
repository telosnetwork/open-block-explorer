import { Action } from 'src/types';
export interface TransactionTableRow {
  name: string;
  transaction: { id: string; type: string };
  timestamp: string;
  action: Action;
  data: { data: unknown; name: string };
}
