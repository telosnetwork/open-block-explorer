import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { BootFileParams } from '@quasar/app-webpack';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import boot, { resetUalState } from 'src/boot/ual';

// auxiliar types
interface ChainType {
    chainId: string;
    rpcEndpoint: {
        protocol: string;
        host: string;
        port: number;
    };
    rpcEndpoints?: {
        protocol: string;
        host: string;
        port: number;
    }[];
    hyperionEndpoint: string;
    fuelRPCEndpoint: {
        protocol: string;
        host: string;
        port: number;
    };
    symbol: string;
}

interface UalType {
    chains: ChainType[]
}

// We need to define this object befor including boot/ual.ts because it accesses it through the getChain object
const mockChain: ChainType = {
    chainId: 'chainId',
    rpcEndpoint: { protocol: 'https', host: 'rpcEndpoint', port: 443 },
    hyperionEndpoint: 'HyperionEndpoint',
    fuelRPCEndpoint: { protocol: 'https', host: 'fuelRPCEndpoint', port: 443 },
    symbol: 'KOYN',
};

installQuasarPlugin();

// mocking ual-anchor
jest.mock('ual-anchor', () => ({
    // mocking the constructor of Anchor
    Anchor:jest.fn().mockImplementation(() => ({})),
}));

// mocking @telosnetwork/ual-cleos
jest.mock('@telosnetwork/ual-cleos', () => ({
    // mocking the constructor of Anchor
    CleosAuthenticator: jest.fn().mockImplementation(() => ({})),
}));

const KoyChain = {
    chainId: 'KoyChain.chainId',
    rpcEndpoint: { protocol: 'https', host: 'koychain.host', port: 443 },
    hyperionEndpoint: 'https://koychain.hyperion.endpoint',
    fuelRPCEndpoint: { protocol: 'https', host: 'koychain.fuel.host', port: 443 },
    symbol: 'KOYN',
};

const TestnetChain = {
    chainId: 'TestnetChain.chainId',
    rpcEndpoint: { protocol: 'https', host: 'testnet.host', port: 443 },
    hyperionEndpoint: 'https://testnet.hyperion.endpoint',
    fuelRPCEndpoint: { protocol: 'https', host: 'testnet.fuel.host', port: 443 },
    symbol: 'KOYN',
};

// mocking internal implementations
jest.mock('src/config/ConfigManager', () => ({
    getChain: () => ({
        getChainId: () => mockChain.chainId,
        getSymbol: () => mockChain.symbol,
        getRPCEndpoint: () => mockChain.rpcEndpoint,
        getHyperionEndpoint: () => mockChain.hyperionEndpoint,
        getFuelRPCEndpoint: () => mockChain.fuelRPCEndpoint,
    }),
}));

const wrapper = {
    app: { config: { globalProperties: { $ual: null as UalType } } },
};

const updateWrapper = () => boot(wrapper as unknown as BootFileParams<ChainType>);
const setChain = (chain: ChainType) => {
    mockChain.chainId = chain.chainId;
    mockChain.rpcEndpoint = chain.rpcEndpoint;
    mockChain.hyperionEndpoint = chain.hyperionEndpoint;
    mockChain.fuelRPCEndpoint = chain.fuelRPCEndpoint;
    mockChain.symbol = chain.symbol;
};


describe('When booting ual', () => {

    beforeEach(() => {
        resetUalState();
    });

    describe('using Koy chain', () => {
        it('should set the $ual properties pointing to Koy network', () => {
            setChain(KoyChain);
            void updateWrapper();
            expect(wrapper.app.config.globalProperties.$ual).toBeDefined();

            // assert that wrapper.app.config.globalProperties.$ual.chains is an array of length 1
            expect(wrapper.app.config.globalProperties.$ual.chains).toHaveLength(1);

            // assert the chain is KoyChain
            const chain:ChainType = wrapper.app.config.globalProperties.$ual.chains[0];
            expect(chain.chainId).toEqual(KoyChain.chainId);

            expect(chain.rpcEndpoints).toHaveLength(1);

            expect(chain.rpcEndpoints[0].protocol).toEqual(KoyChain.rpcEndpoint.protocol);
            expect(chain.rpcEndpoints[0].host).toEqual(KoyChain.rpcEndpoint.host);
            expect(chain.rpcEndpoints[0].port).toEqual(KoyChain.rpcEndpoint.port);
        });
    });

    describe('using Testnet chain', () => {
        it('should set the $ual properties pointing to Testnet network', () => {
            setChain(TestnetChain);
            void updateWrapper();
            expect(wrapper.app.config.globalProperties.$ual).toBeDefined();

            // assert that wrapper.app.config.globalProperties.$ual.chains is an array of length 1
            expect(wrapper.app.config.globalProperties.$ual.chains).toHaveLength(1);

            // assert the chain is TestnetChain
            const chain = wrapper.app.config.globalProperties.$ual.chains[0];
            expect(chain.chainId).toEqual(TestnetChain.chainId);

            expect(chain.rpcEndpoints).toHaveLength(1);

            expect(chain.rpcEndpoints[0].protocol).toEqual(TestnetChain.rpcEndpoint.protocol);
            expect(chain.rpcEndpoints[0].host).toEqual(TestnetChain.rpcEndpoint.host);
            expect(chain.rpcEndpoints[0].port).toEqual(TestnetChain.rpcEndpoint.port);
        });
    });
});

