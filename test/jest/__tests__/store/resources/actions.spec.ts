/* eslint-disable */
import { DelegatedResources, ResourcesStateInterface } from 'src/store/resources/state';
import { ref } from 'vue';

// mocking function fetch
global.fetch = jest.fn((input: RequestInfo | URL) =>
    Promise.resolve({
        text: () => {
            if (input.toString() === 'https://raw.githubusercontent.com/telosnetwork/token-list/main/telosmain.json') {
                return `{
                    "tokens": [
                        {
                            "name": "Telos",
                            "logo_sm": "https://raw.githubusercontent.com/Viterbo/token-list/master/logos/telos.png",
                            "logo_lg": "https://raw.githubusercontent.com/Viterbo/token-list/master/logos/telos.png",
                            "symbol": "TLOS",
                            "account": "eosio.token"
                        },
                        {
                            "name": "pTokens BTC",
                            "logo_sm": "https://raw.githubusercontent.com/Viterbo/token-list/master/logos/pbtc.png",
                            "logo_lg": "https://raw.githubusercontent.com/Viterbo/token-list/master/logos/pbtc-lg.png",
                            "symbol": "PBTC",
                            "account": "btc.ptokens"
                        }
                    ]
                }`;
            } else {
                return `[
                    {
                      "name": "Telos",
                      "symbol": "TLOS",
                      "contract": "eosio.token",
                      "precision": 4,
                      "logo": "https://raw.githubusercontent.com/Viterbo/token-list/master/logos/telos.png"
                    },
                    {
                      "name": "Qubicles",
                      "symbol": "QBE",
                      "contract": "qubicletoken",
                      "precision": 4,
                      "logo": "https://raw.githubusercontent.com/Viterbo/token-list/master/logos/qbe.png"
                    }
                ]
                `;
            }
        },
    } as unknown as Response),
);

// mocking localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem:jest.fn(),
}
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

// mocking @greymass/eosio
jest.mock('@greymass/eosio', () => ({
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
}));

// mocking internal implementations
jest.mock('src/config/ConfigManager', () => ({
    getChain: () => ({
        getChainId: () => 'chainId',
        getSymbol: () => 'TLOS',
        getSystemToken: () => ({ symbol: 'TLOS', contract: 'eosio.token', precision: 4 }),
        getRPCEndpoint: () => ({ protocol: 'https', host: 'host', port: 443 }),
        getHyperionEndpoint: () => '',
        getFuelRPCEndpoint: () => ({ protocol: 'https', host: 'host', port: 443 }),
    }),
}));

const delbandResponse: {rows: DelegatedResources[]} = {rows: []};
const getTableRows = jest.fn().mockImplementation((s: GetTableRowsParams) => {
    if (s.table === 'delband' && s.code === 'eosio') {
        return Promise.resolve(delbandResponse);
    }   
});

// mocking src/api
jest.mock('src/api', () => ({
    // mocking static functions from
    api: { getTableRows },
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
}));


// Aquí importamos las acciones a probar desde el archivo actions.ts
import { actions } from 'src/store/resources/actions';
import { User } from 'universal-authenticator-library';
import { StateInterface } from 'src/store';

import { GetTableRowsParams } from 'src/types';

describe('Store - Resources Actions', () => {
    let commit: jest.Mock;
    let dispatch: jest.Mock;
    let state: ResourcesStateInterface;
    let rootState: StateInterface;
    let users: User[] = [];
    let accountName = 'accountName'; // logged account
    let data = {};

    const setDelbandResponse = (accountList: string[]) => {
        delbandResponse.rows = [];
        accountList.forEach(account => {
            delbandResponse.rows.push({
                from: accountName,
                to: account,
                net_weight: '1.0000 TLOS',
                cpu_weight: '1.0000 TLOS',
            });
        });
    }

    beforeEach(() => {
        users = [{
            name: 'John Doe',
            getAccountName: jest.fn().mockResolvedValue('john.doe'),
        } as unknown as User];

        // We create a mock function for commit
        commit = jest.fn();
        dispatch = jest.fn();
        getTableRows.mockClear();
        // authenticator = newAuthenticatorMock();
        // Creamos un estado simulado
        state = {
            currentAccount: '',
            toOthers: [],
            fromOthers: null,
            selfStaked: null,
            loading: [],
            forceUpdate: false,
        } as ResourcesStateInterface;

        rootState = {
            account: {
                accountName,
                data,
            }
        } as unknown as StateInterface;

    });

    describe('updateSelfStaked()', () => {

        test('when executed it always brings up to 200 resoults for the given account', async () => {
            // authenticator = newAuthenticatorMock(true);
            data = ref(null);
            setDelbandResponse([accountName]);
            
            // call the action login
            await (actions as { updateDelegatedToOthers: (a:any, b:string) => void }).updateDelegatedToOthers(
                { commit, dispatch, state, rootState },
                accountName,
            );

            // Verify the loading state
            expect(commit).toHaveBeenCalledWith('setLoading', 'updateDelegatedToOthers');

            // Verify the api call to get the delegated resources
            const paramsdelband = {
                code: 'eosio',
                limit: '200',
                scope: accountName,
                table: 'delband',
            } as GetTableRowsParams;
            expect(getTableRows).toHaveBeenCalledWith(paramsdelband);
            
            // Verify the final commits
            expect(commit).toHaveBeenCalledWith('setCurrentAccount', accountName);
            expect(commit).toHaveBeenCalledWith('setDelegatedToOthers', delbandResponse.rows);

            // Verify the loading state
            expect(commit).toHaveBeenCalledWith('unsetLoading', 'updateDelegatedToOthers');

        });
    });

    describe('updateResources()', () => {

        test('when we don\'t have account data', async () => {
            // authenticator = newAuthenticatorMock(true);
            data = ref(null);

            // call the action login
            await (actions as { updateResources: (a:any, b:boolean) => void }).updateResources(
                { commit, dispatch, state, rootState },
                false,
            );

            // Verify the loading and forceUpdate states
            expect(commit).toHaveBeenCalledWith('setLoading', 'updateResources');
            expect(commit).toHaveBeenCalledWith('setForceUpdate', false);

            // Verify dispatch calls
            expect(dispatch).toHaveBeenCalledWith('updateSelfStaked', accountName);
            expect(dispatch).toHaveBeenCalledWith('updateDelegatedToOthers', accountName);

            // Verify the final commits
            expect(commit).toHaveBeenCalledWith('setCurrentAccount', accountName);

            // Verify the loading and forceUpdate states
            expect(commit).toHaveBeenCalledWith('setForceUpdate', false);
            expect(commit).toHaveBeenCalledWith('unsetLoading', 'updateResources');
        });

        test('when we have account data', async () => {
            // authenticator = newAuthenticatorMock(true);
            data = ref({});

            // call the action login
            await (actions as { updateResources: (a:any, b:boolean) => void }).updateResources(
                { commit, dispatch, state, rootState },
                false,
            );

            // Verify the loading and forceUpdate states
            expect(commit).toHaveBeenCalledWith('setLoading', 'updateResources');
            expect(commit).toHaveBeenCalledWith('setForceUpdate', false);

            // Verify dispatch calls
            expect(dispatch).toHaveBeenCalledWith('updateSelfStaked', accountName);
            expect(dispatch).toHaveBeenCalledWith('updateDelegatedToOthers', accountName);

            // Verify the final commits
            expect(commit).toHaveBeenCalledWith('setCurrentAccount', accountName);

            // Verify the loading and forceUpdate states
            expect(commit).toHaveBeenCalledWith('setForceUpdate', false);
            expect(commit).toHaveBeenCalledWith('unsetLoading', 'updateResources');
        });

    });

    describe('updateSelfStaked()', () => {

        test('when current account is not the given account', async () => {
            // authenticator = newAuthenticatorMock(true);
            let anotheraccount = 'anotheraccount';
            rootState.account.data = {  // logged account data
                self_delegated_bandwidth: {
                    cpu_weight: ref(1),
                    net_weight: ref(1),
                },
                net_weight: ref(10000),
                cpu_weight: ref(10000),
            } as any;
            setDelbandResponse([accountName]);
            
            // call the action login
            await (actions as { updateSelfStaked: (a:any, b:string) => void }).updateSelfStaked(
                { commit, dispatch, state, rootState },
                anotheraccount,
            );

            // Verify the loading state
            expect(commit).toHaveBeenCalledWith('setLoading', 'updateSelfStaked');

            // Verify the api call to get the account data
            expect(dispatch).toHaveBeenCalledWith('account/loadAccountData', anotheraccount, { root: true });

            // Verify the final commits
            expect(commit).toHaveBeenCalledWith('setDelegatedFromOthers', {
                from: 'not-available',
                to: anotheraccount,
                net_weight: '0.0000 TLOS',
                cpu_weight: '0.0000 TLOS',
            });
            expect(commit).toHaveBeenCalledWith('setSelfStaked', {
                from: anotheraccount,
                to: anotheraccount,
                net_weight: '1.0000 TLOS',
                cpu_weight: '1.0000 TLOS',
            });

            // Verify the loading state
            expect(commit).toHaveBeenCalledWith('unsetLoading', 'updateSelfStaked');

        });

    });
    
});
