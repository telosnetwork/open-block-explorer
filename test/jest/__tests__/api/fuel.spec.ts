import { AnyTransaction } from '@greymass/eosio';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { FuelUserWrapper } from 'src/api/fuel';
import { SignTransactionResponse, User } from 'universal-authenticator-library';
import { QDialogOptions } from 'quasar';
// eslint-disable-next-line no-restricted-imports
import rp_response_file from './rp_response.json';

installQuasarPlugin();

// mocking localStorage
// https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/
const localStorageMock = (function () {
    let store: { [key: string]: unknown } = {};

    return {
        getItem(key: string) {
            return store[key];
        },

        setItem(key: string, value: unknown) {
            store[key] = value;
        },

        clear() {
            store = {};
        },

        removeItem(key: string) {
            delete store[key];
        },

        getAll() {
            return store;
        },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// mocking quasar dialog
const createDialog = jest.fn();
jest.mock('quasar', () => ({
    // mocking static functions create
    Dialog: {
        create: (options: QDialogOptions) => createDialog(options),
    },
}));

// mocking @greymass/eosio
jest.mock('@greymass/eosio', () => ({
    // mocking static functions from
    Transaction: {
        from: (a: { actions: unknown[] }) => ({ actions: a.actions }),
    },
    PackedTransaction: {
        from: () => ({}),
    },
    PermissionLevel: {
        from: (a: { actor: string }) => ({
            actor: { toString: () => a.actor },
        }),
    },
    Name: {
        from: (s: string) => ({ toString: () => s }),
    },
    Serializer: {
        encode: () => '',
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

let rpResponseCode = Number(0);

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () =>
            Promise.resolve({
                data: {
                    signatures: [
                        'SIG_K1_KdocT11N4hFoCozoY3mHf1baa5iK3gL5YksdNraGK3CdP6YjGA5CiMC4z7DNP5orh7tyv4QbU3nLNkkMg2oqPBMyJwaLnr',
                    ],
                    request: [
                        '',
                        {
                            signatures: [] as string[],
                            actions: [noopAction, originalAction],
                        },
                    ],
                },
                code: rpResponseCode,
            }),
    } as Response),
);

// mocking internal implementations
jest.mock('src/config/ConfigManager', () => ({
    getChain: () => ({
        getChainId: () => 'chainId',
        getSymbol: () => 'TLOS',
        getRPCEndpoint: () => ({ protocol: 'https', host: 'host', port: 443 }),
        getHyperionEndpoint: () => '',
        getFuelRPCEndpoint: () => ({ protocol: 'https', host: 'host', port: 443 }),
    }),
}));

// UserStub simulates a AnchorUser or CleosUser
class UserStub extends User {
    constructor() {
        super();
    }

    async signTransaction(
        trx: AnyTransaction,
    ): Promise<SignTransactionResponse> {
        return Promise.resolve({
            transaction: { ...trx, signatures: ['local-signature'] },
        } as SignTransactionResponse);
    }

  signArbitrary = async (): Promise<string> => Promise.resolve('');
  verifyKeyOwnership = async (): Promise<boolean> =>
      Promise.resolve(false);
  getAccountName = async (): Promise<string> =>
      Promise.resolve(signer.actor.toString());
  getChainId = async (): Promise<string> => Promise.resolve('');
  getKeys = async (): Promise<string[]> => Promise.resolve(['']);
}

// The authority used to sign the test transaction
const signer = {
    actor: 'actor.stub',
    permission: 'active',
};

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

const originalAction = {
    account: 'eosio.token',
    name: 'transfer',
    authorization: [
        {
            actor: signer.actor,
            permission: signer.permission,
        },
    ],
    data: {
        from: signer.actor,
        to: 'caleosblocks',
        quantity: '0.0001 TLOS',
        memo: '',
    } as unknown,
};

const noopAction = {
    account: 'greymassnoop',
    name: 'noop',
    authorization: [
        {
            actor: 'greymassfuel',
            permission: 'cosign',
        },
    ],
    data: {} as unknown,
};

const configData = {
    blocksBehind: 5,
    expireSeconds: 3600,
};

const getWrapper = () => new FuelUserWrapper(new UserStub());

const getOriginalTransaction = () => ({
    ...transactionHeaders,
    actions: [originalAction],
});

describe('FuelUserWrapper (Greymass Fuel)', () => {
    let wrapper: FuelUserWrapper;

    beforeEach(() => {
        createDialog.mockReset();
        localStorageMock.clear();
        wrapper = getWrapper();
    });

    describe('FuelUserWrapper.signTransaction function', () => {
        describe('When reciving code 400 from resource provider', () => {
            it('should not change the original transaction', async () => {
                rpResponseCode = Number(400);
                const trx = getOriginalTransaction();
                const response = await wrapper.signTransaction(trx, configData);
                const response_actions_json = JSON.stringify(
                    (response.transaction as {actions:[]}).actions,
                );
                const trx_actions_json = JSON.stringify(trx.actions);
                expect(response_actions_json).toEqual(trx_actions_json);
            });
        });
        describe('When reciving code 200 from resource provider', () => {
            describe('and the user approves the use of Fuel', () => {
                it('should take the signature and modified trx, sign it and broadcast', async () => {
                    rpResponseCode = Number(200);
                    const trx = getOriginalTransaction();

                    createDialog.mockImplementationOnce(() => ({
                        onOk: jest.fn((resolve: (payload?: unknown) => void) => {
                            resolve(); // the user approves
                            return { onCancel: jest.fn() };
                        }),
                    }));

                    const response = await wrapper.signTransaction(trx, configData);
                    const response_actions_json = JSON.stringify(
                        (response.transaction as {actions:[]}).actions,
                    );
                    const expected_actions = [
                        noopAction,
                        ...trx.actions.map(x => ({ ...x })),
                    ];
                    const expected_actions_json = JSON.stringify(expected_actions);
                    expect(response_actions_json).toEqual(expected_actions_json);
                });
            });

            describe('but the user refuses to use the service', () => {
                it('should not change the original transaction', async () => {
                    rpResponseCode = Number(200);
                    const trx = getOriginalTransaction();

                    createDialog.mockImplementationOnce(() => ({
                        onOk: jest.fn(() => ({
                            onCancel: jest.fn((reject: (payload?: unknown) => void) => {
                                reject(); // the user rejects to use the service
                            }),
                        })),
                    }));

                    const response = await wrapper.signTransaction(trx, configData);
                    const response_actions_json = JSON.stringify(
                        (response.transaction as {actions:[]}).actions,
                    );
                    const trx_actions_json = JSON.stringify(trx.actions);
                    expect(response_actions_json).toEqual(trx_actions_json);
                });
            });
        });
        describe('When reciving code 402 from resource provider', () => {
            describe('and the user approves to pay the fee', () => {
                it('should show the fee to the user and push three aditional actions before the original', async () => {
                    rpResponseCode = Number(402);
                    const trx = getOriginalTransaction();

                    // setting the resource provider response for a complete coverage: cpu, net and ram
                    const json = rp_response_file.json;
                    global.fetch = jest.fn(() =>
                        Promise.resolve({
                            json: () => Promise.resolve(json),
                        } as Response),
                    );

                    // check if the fee is being displayed correctly
                    createDialog.mockImplementationOnce((options: QDialogOptions) => {
                        expect(options.message.indexOf(' TLOS')).toBeGreaterThan(0);
                        const fees = json.data.fee;
                        const feesFromMessage = options.message
                            .match(/<b>(\d+\.\d+\sTLOS)<\/b>/g)[0]
                            .replace(/<\/?b>/g, '');
                        expect(feesFromMessage).toEqual(fees);
                        return {
                            onOk: jest.fn((resolve: (payload?: unknown) => void) => {
                                resolve(); // the user approves
                                return { onCancel: jest.fn() };
                            }),
                        };
                    });

                    const response = await wrapper.signTransaction(trx, configData);

                    const response_actions_json = JSON.stringify(
                        (response.transaction as {actions:[]}).actions,
                    );
                    const rp_response_trx = rp_response_file.json.data.request[1];
                    if (typeof rp_response_trx === 'string') {
                        throw new Error('rp_response_trx is a string');
                    }
                    const expected_actions = [
                        rp_response_trx.actions[0],
                        rp_response_trx.actions[1],
                        rp_response_trx.actions[2],
                        ...trx.actions.map(x => ({ ...x })),
                    ];
                    const expected_actions_json = JSON.stringify(expected_actions);

                    expect(response_actions_json).toEqual(expected_actions_json);
                });
            });
            describe('but the user refuses to pay the fee', () => {
                it('should not change the original transaction', async () => {
                    rpResponseCode = Number(402);
                    const trx = getOriginalTransaction();

                    createDialog.mockImplementationOnce(() => ({
                        onOk: jest.fn(() => ({
                            onCancel: jest.fn((reject: (payload?: unknown) => void) => {
                                reject(); // the user rejects to use the service
                            }),
                        })),
                    }));

                    const response = await wrapper.signTransaction(trx, configData);
                    const response_actions_json = JSON.stringify(
                        (response.transaction as {actions:[]}).actions,
                    );
                    const trx_actions_json = JSON.stringify(trx.actions);
                    expect(response_actions_json).toEqual(trx_actions_json);
                });
            });
        });
    });
});
