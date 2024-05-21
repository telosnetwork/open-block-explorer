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
    get: jest.fn().mockImplementation(url => Promise.resolve({ data: tokenList })),
}));

const mockHyperion: AxiosInstance = {
    interceptors: {
        request: {
            use: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosRequestConfig>,
        response: {
            use: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosResponse<unknown>>,
    },
    get: jest.fn().mockImplementation((url) => {
        if(url === 'v2/state/get_tokens') {
            return Promise.resolve({ data: userTokens });
        }
    }),
} as unknown as AxiosInstance;


import {
    getTokens,
    DEFAULT_ICON,
} from 'src/api/hyperion';
import { Token } from 'src/types';


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

    afterAll(() => {
        jest.unmock('axios');
    });
});
