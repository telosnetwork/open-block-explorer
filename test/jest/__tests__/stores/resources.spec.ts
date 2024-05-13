import { createTestingPinia } from '@pinia/testing';
import { API } from '@wharfkit/session';
import axios from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { getTableRows } from 'src/api/eosio_core';
import { useNetworksStore } from 'src/stores/networks';
import { DelegatedResources, useResourceStore } from 'src/stores/resources';
import { GetTableRowsParams } from 'src/types';
import { ref } from 'vue';

jest.spyOn(axios, 'create');

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const transactionHeaders = {
    context_free_actions: [] as never[],
    delay_sec: 123,
    expiration: new Date(new Date().getTime() + 30000),
    max_cpu_usage_ms: 99,
    max_net_usage_words: 0,
    ref_block_num: 0,
    ref_block_prefix: 0,
    transaction_extensions: [] as never[],
};

jest.mock('@wharfkit/session', () => ({
    // mocking static functions from
    Name: {
        from: (s: string) => ({ toString: () => s }),
    },
    // mocking the constructor of APIClient
    APIClient: jest.fn().mockImplementation(() => ({
        v1: {
            chain: {
                get_info: () => ({
                    getTransactionHeader: () => transactionHeaders,
                }),
                get_abi: () => Promise.resolve({ abi: 'abi' }),
                push_transaction: () => ({
                    transaction_id: 'transaction_id',
                    processed: { receipt: { status: 'status' } },
                }),
            },
        },
    })),
    UInt64: {
        from: (i: number) => Number(i),
    },
}));

jest.mock('src/stores/networks', () => ({
    useNetworksStore: jest.fn().mockImplementation(() => ({
        getCurrentNetwork: {
            getName: () => 'Telos',
            getSystemToken: () => ({ symbol: 'TLOS', contract: 'eosio.token', precision: 4 }),
            getApiEndpoint: () => '',
            getHyperionEndpoint: () => '',
        },
    })),
}));

const delbandResponse: { rows: DelegatedResources[] } = { rows: [] };

jest.mock('src/api/eosio_core', () => ({
    getTableRows: jest.fn((s: GetTableRowsParams) => {
        if (s.table === 'delband' && s.code === 'eosio') {
            return Promise.resolve(delbandResponse);
        }
    }),
}));

// ------------------------------------
// data for getters
const accountName = 'accountName';
const accountDataMock = {
    self_delegated_bandwidth: {
        cpu_weight: ref(1),
        net_weight: ref(1),
    },
    net_weight: ref(10000),
    cpu_weight: ref(10000),
} as unknown as API.v1.AccountObject;

const AccountGetters = {
    accountName,
    data: accountDataMock,
};
// actions for account store
const loadAccountData = jest.fn();
const AccountActions = {
    loadAccountData,
};

const AccountStore = { ...AccountGetters, ...AccountActions };
jest.mock('src/stores/account', () => ({
    useAccountStore: jest.fn().mockImplementation(() => AccountStore),
}));
// ------------------------------------

describe('Store - Resources Actions', () => {
    let setLoading: jest.SpyInstance;
    let setCurrentAccount: jest.SpyInstance;
    let setDelegatedToOthers: jest.SpyInstance;
    let setDelegatedFromOthers: jest.SpyInstance;
    let setForceUpdate: jest.SpyInstance;
    let unsetLoading: jest.SpyInstance;
    let setSelfStaked: jest.SpyInstance;
    let updateSelfStaked: jest.SpyInstance;
    let updateDelegatedToOthers: jest.SpyInstance;

    const setDelbandResponse = (accountList: string[]) => {
        delbandResponse.rows = [];
        accountList.forEach((account) => {
            delbandResponse.rows.push({
                from: accountName,
                to: account,
                net_weight: '1.0000 TLOS',
                cpu_weight: '1.0000 TLOS',
            });
        });
    };

    beforeEach(() => {
        const mockPinia = createTestingPinia();
        setActivePinia(createPinia());
        useNetworksStore(mockPinia);
    });

    describe('updateDelegatedToOthers()', () => {
        test('when executed it always brings up to 200 results for the given account', async () => {
            const resourceStore = useResourceStore();

            setLoading = jest.spyOn(resourceStore, 'setLoading');
            setCurrentAccount = jest.spyOn(resourceStore, 'setCurrentAccount');
            unsetLoading = jest.spyOn(resourceStore, 'unsetLoading');
            setDelegatedToOthers = jest.spyOn(resourceStore, 'setDelegatedToOthers');

            setDelbandResponse([accountName]);

            // call the action login
            await resourceStore.updateDelegatedToOthers(accountName);
            // Verify the loading state
            expect(setLoading).toHaveBeenCalledWith('updateDelegatedToOthers');

            // Verify the api call to get the delegated resources
            const paramsdelband = {
                code: 'eosio',
                limit: '200',
                scope: accountName,
                table: 'delband',
            } as GetTableRowsParams;

            expect(getTableRows).toHaveBeenCalledWith(paramsdelband);

            // Verify the final commits
            expect(setCurrentAccount).toHaveBeenCalledWith(accountName);
            expect(setDelegatedToOthers).toHaveBeenCalledWith(delbandResponse.rows);

            // Verify the loading state
            expect(unsetLoading).toHaveBeenCalledWith('updateDelegatedToOthers');
        });
    });

    describe('updateResources()', () => {
        test('when the account is the same, we have its data and we don\'t force', async () => {
            const resourceStore = useResourceStore();

            setLoading = jest.spyOn(resourceStore, 'setLoading');
            setCurrentAccount = jest.spyOn(resourceStore, 'setCurrentAccount');
            unsetLoading = jest.spyOn(resourceStore, 'unsetLoading');
            setForceUpdate = jest.spyOn(resourceStore, 'setForceUpdate');
            updateSelfStaked = jest.spyOn(resourceStore, 'updateSelfStaked');
            updateDelegatedToOthers = jest.spyOn(resourceStore, 'updateDelegatedToOthers');

            await resourceStore.updateResources({
                account: accountName,
                force: false,
            });

            // Verify the loading and forceUpdate states
            expect(setLoading).toHaveBeenCalledWith('updateResources');
            expect(setForceUpdate).toHaveBeenCalledWith(false);

            // Verify the loading and forceUpdate states
            expect(setForceUpdate).toHaveBeenCalledWith(false);

            expect(unsetLoading).toHaveBeenCalledWith('updateResources');
            expect(resourceStore.currentAccount).toEqual(accountName);
        });

        test('when the account is the same, we have its data and we force', async () => {
            const resourceStore = useResourceStore();

            setLoading = jest.spyOn(resourceStore, 'setLoading');
            setCurrentAccount = jest.spyOn(resourceStore, 'setCurrentAccount');
            unsetLoading = jest.spyOn(resourceStore, 'unsetLoading');
            setForceUpdate = jest.spyOn(resourceStore, 'setForceUpdate');
            updateSelfStaked = jest.spyOn(resourceStore, 'updateSelfStaked');
            updateDelegatedToOthers = jest.spyOn(resourceStore, 'updateDelegatedToOthers');

            await resourceStore.updateResources({
                account: accountName,
                force: true,
            });

            // Verify the loading and forceUpdate states
            expect(setLoading).toHaveBeenCalledWith('updateResources');
            expect(setForceUpdate).toHaveBeenCalledWith(false);

            expect(updateSelfStaked).toHaveBeenCalledWith(accountName);
            expect(updateDelegatedToOthers).toHaveBeenCalledWith(accountName);

            // Verify the final commits
            expect(setCurrentAccount).toHaveBeenCalledWith(accountName);

            // Verify the loading and forceUpdate states
            expect(setForceUpdate).toHaveBeenCalledWith(false);

            expect(unsetLoading).toHaveBeenCalledWith('updateResources');
            expect(resourceStore.currentAccount).toEqual(accountName);
        });

        test('when we request data from a different account', async () => {
            const resourceStore = useResourceStore();
            const newAccount = 'newAccount';

            setLoading = jest.spyOn(resourceStore, 'setLoading');
            setCurrentAccount = jest.spyOn(resourceStore, 'setCurrentAccount');
            setDelegatedToOthers = jest.spyOn(resourceStore, 'setDelegatedToOthers');
            unsetLoading = jest.spyOn(resourceStore, 'unsetLoading');
            setForceUpdate = jest.spyOn(resourceStore, 'setForceUpdate');
            updateSelfStaked = jest.spyOn(resourceStore, 'updateSelfStaked');
            updateDelegatedToOthers = jest.spyOn(resourceStore, 'updateDelegatedToOthers');

            // call the action login
            await resourceStore.updateResources({
                account: newAccount,
                force: false,
            });

            // Verify the loading and forceUpdate states
            expect(setLoading).toHaveBeenCalledWith('updateResources');
            expect(setForceUpdate).toHaveBeenCalledWith(false);

            // Verify dispatch calls
            expect(updateSelfStaked).toHaveBeenCalledWith(newAccount);
            expect(updateDelegatedToOthers).toHaveBeenCalledWith(newAccount);

            // Verify the final commits
            expect(setCurrentAccount).toHaveBeenCalledWith(newAccount);

            // Verify the loading and forceUpdate states
            expect(setForceUpdate).toHaveBeenCalledWith(false);
            expect(unsetLoading).toHaveBeenCalledWith('updateResources');
        });
    });

    describe('updateSelfStaked()', () => {
        test('when current account is not the given account', async () => {
            const resourceStore = useResourceStore();

            setLoading = jest.spyOn(resourceStore, 'setLoading');
            setDelegatedFromOthers = jest.spyOn(resourceStore, 'setDelegatedFromOthers');
            setSelfStaked = jest.spyOn(resourceStore, 'setSelfStaked');
            unsetLoading = jest.spyOn(resourceStore, 'unsetLoading');

            const anotheraccount = 'anotheraccount';

            setDelbandResponse([accountName]);

            // call the action login
            await resourceStore.updateSelfStaked(anotheraccount);

            // Verify the loading state
            expect(setLoading).toHaveBeenCalledWith('updateSelfStaked');

            // Verify the final commits
            expect(setDelegatedFromOthers).toHaveBeenCalledWith({
                from: 'not-available',
                to: anotheraccount,
                net_weight: '0.0000 TLOS',
                cpu_weight: '0.0000 TLOS',
            });
            expect(setSelfStaked).toHaveBeenCalledWith({
                from: anotheraccount,
                to: anotheraccount,
                net_weight: '1.0000 TLOS',
                cpu_weight: '1.0000 TLOS',
            });

            // Verify the loading state
            expect(unsetLoading).toHaveBeenCalledWith('updateSelfStaked');
        });
    });
});
