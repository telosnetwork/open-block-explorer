/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AnyTransaction } from '@greymass/eosio';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { FuelUserWrapper } from 'src/api/fuel';
import {
  SignTransactionConfig,
  SignTransactionResponse,
  User
} from 'universal-authenticator-library';

installQuasarPlugin();

// mocking @greymass/eosio
jest.mock('@greymass/eosio', () => ({
  // mocking static functions from
  Transaction: {
    from: (a: { actions: unknown[] }) => ({ actions: a.actions })
  },
  PackedTransaction: {
    from: () => ({})
  },
  PermissionLevel: {
    from: (a: { actor: string }) => ({
      actor: { toString: () => a.actor }
    })
  },
  Name: {
    from: (s: string) => ({ toString: () => s })
  },
  Serializer: {
    encode: () => ''
  },
  // mocking the constructor of APIClient
  APIClient: jest.fn().mockImplementation(() => {
    return {
      v1: {
        chain: {
          get_info: () => ({
            getTransactionHeader: (s: number) => transactionHeaders
          }),
          get_abi: () => Promise.resolve({ abi: 'abi' }),
          push_transaction: () => ({
            transaction_id: 'transaction_id',
            processed: { receipt: { status: 'status' } }
          })
        }
      }
    };
  })
}));

// mocking axios and the call to resource provider
//jest.mock('axios', () => ({
//  post: () => {
//    return {
//      data: {
//        data: {
//          signatures: [
//            'SIG_K1_KdocT11N4hFoCozoY3mHf1baa5iK3gL5YksdNraGK3CdP6YjGA5CiMC4z7DNP5orh7tyv4QbU3nLNkkMg2oqPBMyJwaLnr'
//          ],
//          request: [
//            '',
//            {
//              signatures: [] as string[],
//              actions: [noopAction, originalAction]
//            }
//          ]
//        },
//        code: rpResponseCode
//      }
//    };
//  }
//}));
// we need to change the code returned each time so we declare it as variable
let rpResponseCode = Number(0);

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        data: {
          signatures: [
            'SIG_K1_KdocT11N4hFoCozoY3mHf1baa5iK3gL5YksdNraGK3CdP6YjGA5CiMC4z7DNP5orh7tyv4QbU3nLNkkMg2oqPBMyJwaLnr'
          ],
          request: [
            '',
            {
              signatures: [] as string[],
              actions: [noopAction, originalAction]
            }
          ]
        },
        code: rpResponseCode
      })
  } as Response)
);

/*


*/

// mocking internal implementatios
jest.mock('src/config/ConfigManager', () => ({
  getChain: () => ({
    getHyperionEndpoint: () => '',
    getFuelRPCEndpoint: () => ({ protocol: 'https', host: 'host', port: 443 })
  })
}));

// UserStub simulates a AnchorUser or CleosUser
class UserStub extends User {
  constructor() {
    super();
  }

  async signTransaction(
    trx: AnyTransaction,
    _conf?: SignTransactionConfig
  ): Promise<SignTransactionResponse> {
    return Promise.resolve({
      transaction: { ...trx, signatures: ['local-signature'] }
    } as SignTransactionResponse);
  }

  signArbitrary = async (
    publicKey: string,
    data: string,
    helpText: string
  ): Promise<string> => Promise.resolve('');
  verifyKeyOwnership = async (challenge: string): Promise<boolean> =>
    Promise.resolve(false);
  getAccountName = async (): Promise<string> => Promise.resolve('');
  getChainId = async (): Promise<string> => Promise.resolve('');
  getKeys = async (): Promise<string[]> => Promise.resolve(['']);
}

// The authority used to sign the test transaction
const signer = {
  actor: 'actor.stub',
  permission: 'active'
};

const transactionHeaders = {
  context_free_actions: [] as never[],
  delay_sec: 123,
  expiration: new Date(new Date().getTime() + 30000),
  max_cpu_usage_ms: 99,
  max_net_usage_words: 0,
  ref_block_num: 0,
  ref_block_prefix: 0,
  transaction_extensions: [] as never[]
};

const originalAction = {
  account: 'eosio.token',
  name: 'transfer',
  authorization: [
    {
      actor: signer.actor,
      permission: signer.permission
    }
  ],
  data: {
    from: signer.actor,
    to: 'caleosblocks',
    quantity: '0.0001 TLOS',
    memo: ''
  } as unknown
};

const noopAction = {
  account: 'greymassnoop',
  name: 'noop',
  authorization: [
    {
      actor: 'greymassfuel',
      permission: 'cosign'
    }
  ],
  data: {} as unknown
};

const configData = {
  blocksBehind: 5,
  expireSeconds: 3600
};

const getWrapper = () => {
  return new FuelUserWrapper(new UserStub());
};

const getOriginalTransaction = () => ({
  ...transactionHeaders,
  actions: [originalAction]
});

describe('FuelUserWrapper (Greymass Fuel)', () => {
  let wrapper: FuelUserWrapper;

  beforeEach(() => {
    wrapper = getWrapper();
  });

  describe('FuelUserWrapper.signTransaction function', () => {
    describe('When reciving code 400 from resource provider', () => {
      it('should not change the original transaction', async () => {
        rpResponseCode = Number(400);
        const trx = getOriginalTransaction();
        const response = await wrapper.signTransaction(trx, configData);
        const response_actions_json = JSON.stringify(
          response.transaction.actions
        );
        const trx_actions_json = JSON.stringify(trx.actions);
        expect(response_actions_json).toEqual(trx_actions_json);
      });
    });
    describe('When reciving code 200 from resource provider', () => {
      it('should take the signature and modified trx, sign it and broadcast', async () => {
        rpResponseCode = Number(200);
        const trx = getOriginalTransaction();
        const response = await wrapper.signTransaction(trx, configData);
        const response_actions_json = JSON.stringify(
          response.transaction.actions
        );
        const expected_actions = [
          noopAction,
          ...trx.actions.map((x) => ({ ...x }))
        ];
        const expected_actions_json = JSON.stringify(expected_actions);
        expect(response_actions_json).toEqual(expected_actions_json);
      });
    });
    describe('When reciving code 402 from resource provider', () => {
      it('should take the signature and modified trx, sign it and broadcast', async () => {
        rpResponseCode = Number(200);
        const trx = getOriginalTransaction();
        const response = await wrapper.signTransaction(trx, configData);
        const response_actions_json = JSON.stringify(
          response.transaction.actions
        );
        const expected_actions = [
          noopAction,
          ...trx.actions.map((x) => ({ ...x }))
        ];
        const expected_actions_json = JSON.stringify(expected_actions);
        expect(response_actions_json).toEqual(expected_actions_json);
      });
    });
  });
});
