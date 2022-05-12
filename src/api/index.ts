/**
 * Add another endpoint resource:
 *  - add a unique file in src/api/
 *  - for new method,  export and import here, add to api export
 *  - for existing method enpoint, export from service file and update the import statement here
 */
import {
  getAccount,
  getCreator,
  getTokens,
  getTransactions,
  getTransaction,
  getTransactionV1,
  getChildren,
  getPermissionLinks,
  getTableByScope,
  getBlock,
  getActions,
  getProposals,
  getProducers
} from './hyperion'; //  e.g. './new-service' method name stays the same
import { getTableRows, getTokenBalances } from './eosio_core';

export const api = {
  getAccount,
  getCreator,
  getTokens,
  getTransactions,
  getTransaction,
  getChildren,
  getTableRows,
  getTokenBalances,
  getTransactionV1,
  getPermissionLinks,
  getTableByScope,
  getBlock,
  getActions,
  getProposals,
  getProducers
};
