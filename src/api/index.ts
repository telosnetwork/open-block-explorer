/**
 * Add another endpoint resource:
 *  - add a unique file in src/api/
 *  - for new method,  export and import here, add to api export
 *  - for existing method enpoint, export from service file and update the import statement here
 */
import {
    getHyperionAccountData,
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
    getInfo,
    getSchedule,
    getProposals,
    getProducers,
    getABI,
    getProducerSchedule,
} from './hyperion'; //  e.g. './new-service' method name stays the same

import {
    getAccount,
    getKeyAccounts,
    getTableRows,
    getTokenBalances,
    deserializeActionData,
    serializeActionData,
} from './eosio_core';

import { getApy } from './telosApi';

export const api = {
    getAccount,
    getKeyAccounts,
    getHyperionAccountData,
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
    getInfo,
    getSchedule,
    getProposals,
    getProducers,
    getABI,
    deserializeActionData,
    serializeActionData,
    getProducerSchedule,
    getApy,
};
