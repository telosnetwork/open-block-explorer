import { Transaction } from 'src/types/zj_tpyes/ZjActionData';
import { Action } from '@greymass/eosio';

export interface TransactionStateInterface {
  transaction: Transaction;
  transactionId: string;
  blockNum: string;
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
        actionCount: 0,
        actions: [],
        blockNum: '',
        cpuUsage: 0,
        executed: false,
        irreversable: false,
        netUsage: 0,
        timestamp: '',
        transaction:{} as Transaction,
        transactionFound: false,
        transactionId: '',

    };
}
