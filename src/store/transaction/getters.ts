import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { TransactionStateInterface } from './state';
import { ActionData } from 'src/types';

export const getters: GetterTree<TransactionStateInterface, StateInterface> = {
  getTransaction({ transaction }): ActionData {
    return transaction;
  },
  getTransactionId({ transactionId }): string {
    return transactionId;
  }
};
