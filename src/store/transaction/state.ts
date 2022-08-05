import { ActionData, Action } from 'src/types';

export interface TransactionStateInterface {
  transaction: ActionData;
  transactionId: string;
  blockNum: number;
  timestamp: string;
  executed: boolean;
  cpuUsage: number;
  netUsage: number;
  actionCount: number;
  irreversable: boolean;
  actions: Action[];
  transactionFound: boolean;
}

export function state(): TransactionStateInterface {
  return {
    transaction: {} as ActionData,
    transactionId: '',
    blockNum: 0,
    timestamp: '',
    executed: false,
    cpuUsage: 0,
    netUsage: 0,
    actionCount: 0,
    irreversable: false,
    actions: [] as Action[],
    transactionFound: true
  };
}
