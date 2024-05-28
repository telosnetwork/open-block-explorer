/**
 * Add another endpoint resource:
 *  - add a unique file in src/api/
 *  - for new method,  export and import here, add to api export
 *  - for existing method enpoint, export from service file and update the import statement here
 */
import {
    getActions,
    getChildren,
    getCreator,
    getHyperionAccountData,
    getPermissionLinks,
    getProposals,
    getTokens,
    getTransaction,
    getTransactions,
} from 'src/api/hyperion'; //  e.g. './new-service' method name stays the same

import {
    deserializeActionData,
    getABI,
    getAccount,
    getAccountsByPublicKey,
    getBlock,
    getInfo,
    getProducers,
    getProducerSchedule,
    getTableByScope,
    getTableRows,
    getTokenBalances,
    getTransactionV1,
    serializeActionData,
} from 'src/api/eosio_core';

import { getApy } from 'src/api/telosApi';

export const api = {
    getAccount,
    getAccountsByPublicKey,
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
    getProducerSchedule,
    getProposals,
    getProducers,
    getABI,
    deserializeActionData,
    serializeActionData,
    getApy,
};
