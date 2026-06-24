/* eslint-disable jest/no-commented-out-tests */
import { describe, jest } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';

const tokenList:Token[] = [
    {
        'name': 'Telos',
        'symbol': 'TLOS',
        'contract': 'eosio.token',
        'precision': 4,
        'logo': 'https://raw.githubusercontent.com/Viterbo/token-list/master/logos/telos.png',
    },
    {
        'name': 'Qubicles',
        'symbol': 'QBE',
        'contract': 'qubicletoken',
        'precision': 4,
        'logo': 'https://raw.githubusercontent.com/Viterbo/token-list/master/logos/qbe.png',
    },
    {
        'name': 'Beatitude',
        'symbol': 'HEART',
        'contract': 'revelation21',
        'precision': 4,
        'logo': 'https://raw.githubusercontent.com/Viterbo/token-list/master/logos/beatitude.png',
    },
    {
        'name': 'Cards & Tokens',
        'symbol': 'CNT',
        'contract': 'vapaeetokens',
        'precision': 4,
        'logo': 'https://raw.githubusercontent.com/Viterbo/token-list/master/logos/cnt.png',
    },
];

const userTokens = {
    account: 'someaccount',
    tokens: [
        {
            symbol: 'SQRL',
            precision: 4,
            amount: 308099.4234,
            contract: 'sqrlwalletio',
        },
        {
            symbol: 'KANDA',
            precision: 8,
            amount: 188906.66275791,
            contract: 'telokandaone',
        },
        {
            symbol: 'KOIN',
            precision: 4,
            amount: 9000,
            contract: 'koin4kontrak',
        },
        {
            symbol: 'SAND',
            precision: 8,
            amount: 2070.71906416,
            contract: 'sandiegocoin',
        },
        {
            symbol: 'CNT',
            precision: 4,
            amount: 3000,
            contract: 'vapaeetokens',
        },
        {
            symbol: 'TLSDRIC',
            precision: 8,
            amount: 617.35404469,
            contract: 'dricrly.tbn',
        },
        {
            symbol: 'OLIVE',
            precision: 4,
            amount: 174,
            contract: 'oliveaccount',
        },
    ],
};

const makeAction = (
    trxId: string,
    account: string,
    name: string,
    data: unknown,
    timestamp: string,
    globalSequence: number,
): Action => ({
    '@timestamp': timestamp,
    account_ram_deltas: [],
    act: {
        account,
        authorization: [],
        data,
        name,
    },
    action_ordinal: 1,
    block_num: 1,
    cpu_usage_us: 0,
    creator_action_ordinal: 0,
    global_sequence: globalSequence,
    net_usage_words: 0,
    notified: [],
    producer: '',
    signatures: [],
    timestamp,
    trx_id: trxId,
    receipts: [],
    account,
    authorization: [],
    data,
    name,
});

const accountAction = makeAction(
    'base-trx',
    'eosio.token',
    'transfer',
    { from: 'someaccount', to: 'otheraccount', quantity: '1.0000 TLOS' },
    '2026-06-24T15:00:00.000',
    1,
);

const incomingTransferAction = makeAction(
    'incoming-transfer-trx',
    'eosio.token',
    'transfer',
    { from: 'otheraccount', to: 'someaccount', quantity: '2.0000 TLOS' },
    '2026-06-24T14:50:00.000',
    2,
);

const issueToAccountAction = makeAction(
    'issue-trx',
    'vapaeetokens',
    'issue',
    { to: 'someaccount', quantity: '3.0000 CNT', memo: 'bridge mint' },
    '2026-06-24T15:10:00.000',
    3,
);

const issueToOtherAccountAction = makeAction(
    'issue-other-trx',
    'vapaeetokens',
    'issue',
    { to: 'otheraccount', quantity: '3.0000 CNT', memo: 'bridge mint' },
    '2026-06-24T15:20:00.000',
    4,
);

installQuasarPlugin();

// mocking internal chain implementation
jest.mock('src/config/ConfigManager', () => ({
    getChain: () => ({
        getName: () => 'telos',
        getSymbol: () => 'TLOS',
        getHyperionEndpoint: () => '',
        getFuelRPCEndpoint: () => ({ protocol: 'https', host: 'host', port: 443 }),
    }),
}));


// mocking AbortController
const abortFn = jest.fn();
global.AbortController = jest.fn(() => ({
    signal: {
        addEventListener: jest.fn(),
        aborted: false,
        onabort: jest.fn(),
        reason: '',
        throwIfAborted: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    },
    abort: abortFn,
}));

jest.mock('axios', () => ({
    create: () => mockHyperion,
    get: jest.fn().mockImplementation(() => Promise.resolve({ data: tokenList })),
}));

const getParam = (
    config: AxiosRequestConfig | undefined,
    key: string,
): string => {
    const params = config?.params as Record<string, string> | undefined;
    return params?.[key] || '';
};

const mockHyperion: AxiosInstance = {
    interceptors: {
        request: {
            use: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosRequestConfig>,
        response: {
            use: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosResponse<unknown>>,
    },
    get: jest.fn().mockImplementation((...args: unknown[]) => {
        const url = args[0] as string;
        const config = args[1] as AxiosRequestConfig | undefined;
        if(url === 'v2/state/get_tokens') {
            return Promise.resolve({ data: userTokens });
        }
        if(url === 'v2/history/get_actions') {
            if(getParam(config, 'account') === 'someaccount') {
                return Promise.resolve({
                    data: {
                        actions: [accountAction],
                        total: { value: 1 },
                    },
                });
            }
            if(getParam(config, 'transfer.to') === 'someaccount') {
                return Promise.resolve({
                    data: {
                        actions: [incomingTransferAction],
                        total: { value: 1 },
                    },
                });
            }
            if(getParam(config, 'act.account') === 'vapaeetokens' && getParam(config, 'act.name') === 'issue') {
                return Promise.resolve({
                    data: {
                        actions: [issueToAccountAction, issueToOtherAccountAction],
                        total: { value: 2 },
                    },
                });
            }
            return Promise.resolve({
                data: {
                    actions: [],
                    total: { value: 0 },
                },
            });
        }
    }),
} as unknown as AxiosInstance;


import {
    getTokens,
    DEFAULT_ICON,
    getAccountTransactions,
} from 'src/api/hyperion';
import { Action, Token } from 'src/types';


describe('Hyperion API', () => {
    describe('getTokens()', () => {
        it('getTokens() [No params] => list of all tokens (no balances)', async () => {
            const tokens = await getTokens();
            expect(tokens).toEqual(tokenList);
        });

        it('getTokens(account) tokens for account => list of user\'s tokens (no balances)', async () => {
            const tokens = await getTokens('someaccount');
            const userTokensWithLogos = userTokens.tokens.map((token: Token) => {
                const tokenInfo = tokenList.find((t:Token) => t.symbol === token.symbol);
                const aux = { ...token };
                if (tokenInfo) {
                    aux.logo = tokenInfo.logo;
                } else {
                    aux.logo = DEFAULT_ICON;
                }
                return aux;
            });

            expect(tokens).toEqual(userTokensWithLogos);
        });
    });

    describe('getAccountTransactions()', () => {
        it('includes incoming transfers and token issues where the account is only the action data recipient', async () => {
            const response = await getAccountTransactions({
                account: 'someaccount',
                limit: 10,
                sort: 'desc',
            });

            expect(response.data.actions.map(action => action.trx_id)).toEqual([
                'issue-trx',
                'base-trx',
                'incoming-transfer-trx',
            ]);
            expect(response.data.total.value).toBe(3);
        });
    });

    afterAll(() => {
        jest.unmock('axios');
    });
});
