/* eslint-disable jest/no-commented-out-tests */
import { describe, jest } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';

const tokenList:Token[] = [
    {
        'name': 'Koyn',
        'symbol': 'KOYN',
        'contract': 'koyn.token',
        'precision': 4,
        'logo': 'https://raw.githubusercontent.com/KoyNetwork/token-list/master/logos/koyn.png',
    },
];

const userTokens = {
    account: 'someaccount',
    tokens: [
        {
            symbol: 'KOYN',
            precision: 4,
            amount: 308099.4234,
            contract: 'token.koyn',
        }
    ],
};

installQuasarPlugin();

global.fetch = jest.fn(() =>
    Promise.resolve({
        text: () => JSON.stringify(tokenList),
    } as unknown as Response),
);

// mocking internal chain implementation
jest.mock('src/config/ConfigManager', () => ({
    getChain: () => ({
        getName: () => 'Koyn',
        getSymbol: () => 'KOYN',
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
}));

const mockHyperion: AxiosInstance = {
    get: () => Promise.resolve({
        data: userTokens,
    }),
    interceptors: {
        request: {
            use: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosRequestConfig>,
        response: {
            use: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosResponse<unknown>>,
    },
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
