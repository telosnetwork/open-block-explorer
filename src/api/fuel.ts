<<<<<<< HEAD
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Most of this code was taken and addapted from https://gist.github.com/aaroncox/d74a73b3d9fbc20836c32ea9deda5d70
=======
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
// Most of this code was taken and addapted from https://gist.github.com/aaroncox/d74a73b3d9fbc20836c32ea9deda5d70
import axios from 'axios';
>>>>>>> Refactored the code and added some unit tests
import {
  SignTransactionConfig,
  SignTransactionResponse,
  User
} from 'universal-authenticator-library';
import {
  AnyTransaction,
  APIClient,
  Name,
  NameType,
  PackedTransaction,
  PermissionLevel,
  Serializer,
  Signature,
  SignedTransaction,
  Transaction
} from '@greymass/eosio';
import { getChain } from 'src/config/ConfigManager';
<<<<<<< HEAD
import { Dialog } from 'quasar';

// The maximum fee per transaction this script is willing to accept
const maxFee = 0.05;
=======

// The maximum fee per transaction this script is willing to accept
const maxFee = 0.005;
>>>>>>> Refactored the code and added some unit tests

// expire time in millisec
const expireSeconds = 3600;

const chain = getChain();
const client = new APIClient({
  url: chain.getHyperionEndpoint()
});

const fuelrpc = chain.getFuelRPCEndpoint();
const resourceProviderEndpoint = `${fuelrpc.protocol}://${fuelrpc.host}:${fuelrpc.port}/v1/resource_provider/request_transaction`;

// Auxiliar interfaces
interface ResourceProviderResponse {
  code: number;
  data: ResponseData;
}

<<<<<<< HEAD
interface CostsType {
  ram: string;
  cpu: string;
  net: string;
}

=======
>>>>>>> Refactored the code and added some unit tests
interface ResponseData {
  request: [string, SignedTransaction];
  signatures: Signature[];
  version: number;
<<<<<<< HEAD
  costs?: CostsType;
=======
  costs?: { ram: string };
>>>>>>> Refactored the code and added some unit tests
}

interface SignedTransactionResponse extends SignTransactionResponse {
  transaction: { signatures: Signature[] };
}

// Wrapper for the user to intersect the signTransaction call
export class FuelUserWrapper extends User {
  constructor(private user: User) {
    super();
  }

  async signTransaction(
    originalTransaction: AnyTransaction,
    originalconfig?: SignTransactionConfig
  ): Promise<SignTransactionResponse> {
    try {
      // Retrieve transaction headers
      const info = await client.v1.chain.get_info();
      const header = info.getTransactionHeader(expireSeconds);

      // collect all contract abis
      const abi_promises = originalTransaction.actions.map((a) =>
        client.v1.chain.get_abi(a.account)
      );
      const responses = await Promise.all(abi_promises);
      const abis = responses.map((x) => x.abi);
      const abis_and_names = originalTransaction.actions.map((x, i) => ({
        contract: x.account,
        abi: abis[i]
      }));

      // create complete well formed transaction
      const transaction = Transaction.from(
        {
          ...header,
          actions: originalTransaction.actions
        },
        abis_and_names
      );

      // Pack the transaction for transport
      const packedTransaction = PackedTransaction.from({
        signatures: [],
        packed_context_free_data: '',
        packed_trx: Serializer.encode({ object: transaction })
      });

      const signer = PermissionLevel.from({
        actor: (await this.user.getAccountName()) as NameType,
        permission: this.requestPermission
      });

      // Submit the transaction to the resource provider endpoint
<<<<<<< HEAD
      const cosigned = await fetch(resourceProviderEndpoint, {
        body: JSON.stringify({
          signer,
          packedTransaction
        }),
        method: 'POST'
      });

      // Interpret the resulting JSON
      const rpResponse =
        (await cosigned.json()) as unknown as ResourceProviderResponse;
=======
      const cosigned = await axios.post(
        resourceProviderEndpoint,
        JSON.stringify({
          signer,
          packedTransaction
        }),
        { method: 'POST' }
      );

      // Interpret the resulting JSON
      const rpResponse = cosigned.data as ResourceProviderResponse;
>>>>>>> Refactored the code and added some unit tests

      switch (rpResponse.code) {
        case 402: {
          // Resource Provider provided signature in exchange for a fee
<<<<<<< HEAD
          // is ok to treat them with the same logic of code = 200?
          // Yes acording to this: https://gist.github.com/aaroncox/d74a73b3d9fbc20836c32ea9deda5d70#file-fuel-core-presign-js-L128-L159
          // Aron rightly suggests that we should show and confirm the fee costs for this service:
          // https://github.com/telosnetwork/open-block-explorer/pull/477#discussion_r1053417964
=======
          // TODO: is ok to treat them with the same logic of code = 200?
          // Yes acording to this: https://gist.github.com/aaroncox/d74a73b3d9fbc20836c32ea9deda5d70#file-fuel-core-presign-js-L128-L159
>>>>>>> Refactored the code and added some unit tests
        }
        case 200: {
          // Resource Provider provided signature for free

          const { data } = rpResponse;
          const [, returnedTransaction] = data.request;
          const modifiedTransaction: SignedTransaction = returnedTransaction;

          // Ensure the modifed transaction is what the application expects
          // These validation methods will throw an exception if invalid data exists
<<<<<<< HEAD
          const fees: string | null = validateTransaction(
=======
          validateTransaction(
>>>>>>> Refactored the code and added some unit tests
            signer,
            modifiedTransaction,
            transaction,
            data.costs
          );

<<<<<<< HEAD
          // validate with the user whether to use the service at all
          try {
            await confirmWithUser(this.user, fees);
          } catch (e) {
            // The user refuseed to use the service
            break;
          }

          modifiedTransaction.signatures = [...data.signatures];
=======
          modifiedTransaction.signatures = [...data.signatures];

>>>>>>> Refactored the code and added some unit tests
          // Sign the modified transaction
          const locallySigned: SignedTransactionResponse =
            (await this.user.signTransaction(
              modifiedTransaction,
              Object.assign({ broadcast: false }, originalconfig)
            )) as SignedTransactionResponse;

          // When using CleosAuthenticator the transaction returns empty
          if (!locallySigned.transaction.signatures) {
            return Promise.reject(
              'The transaction was not broadcasted because no signatures were obtained'
            );
          }

          // Merge signatures from the user and the cosigned responsetab
          modifiedTransaction.signatures = [
            ...locallySigned.transaction.signatures,
            ...data.signatures
          ];

          // Broadcast the signed transaction to the blockchain
          const pushResponse = await client.v1.chain.push_transaction(
            modifiedTransaction
          );

          // we compose the final response
          const finalResponse: SignTransactionResponse = {
            wasBroadcast: true,
            transactionId: pushResponse.transaction_id,
            status: pushResponse.processed.receipt.status,
            transaction: modifiedTransaction
          };

          return Promise.resolve(finalResponse);
        }
        case 400: {
          // Resource Provider refused to sign the transaction, aborting
          break;
        }
        default:
          throw (
            'Code ' +
<<<<<<< HEAD
            (+rpResponse.code).toString() +
=======
            rpResponse.code.toString() +
>>>>>>> Refactored the code and added some unit tests
            ' not expected from resource provider endpoint: ' +
            resourceProviderEndpoint
          );
      }

      // If we got here it means the resource provider will not participate in this transaction
      return this.user.signTransaction(originalTransaction, originalconfig);
    } catch (e) {
<<<<<<< HEAD
=======
      console.info('ERROR:', e);
      // console.error('ERROR: ', e);
>>>>>>> Refactored the code and added some unit tests
      throw e;
    }
  }

  // since this is a wrapper is also wraps the posible requestPermission hidden property
  get requestPermission() {
    return (
      (this.user as unknown as { requestPermission: string })
        .requestPermission || 'active'
    );
  }

  // These functions are just proxies
  signArbitrary = async (
    publicKey: string,
    data: string,
    helpText: string
  ): Promise<string> => this.user.signArbitrary(publicKey, data, helpText);
  verifyKeyOwnership = async (challenge: string): Promise<boolean> =>
    this.user.verifyKeyOwnership(challenge);
  getAccountName = async (): Promise<string> => this.user.getAccountName();
  getChainId = async (): Promise<string> => this.user.getChainId();
  getKeys = async (): Promise<string[]> => this.user.getKeys();
}

<<<<<<< HEAD
// Auxiliar functions to validate with the user the use of the service
interface Preference {
  remember?: boolean;
  approve?: boolean;
}
export default class GreymassFuelService {
  static preferences: { [account: string]: Preference } = {};
  static globals: Record<string, (s: string) => string> = null;
  static save() {
    localStorage.setItem(
      'fuel_preferences',
      JSON.stringify(GreymassFuelService.preferences)
    );
  }
  static load() {
    try {
      GreymassFuelService.preferences = GreymassFuelService.preferences || {};
      const str = localStorage.getItem('fuel_preferences');
      if (str) {
        GreymassFuelService.preferences = JSON.parse(str);
      }
    } catch (e) {
      console.error('ERROR: ', e);
    }
  }

  static setPreferences(account: string, p: Preference) {
    GreymassFuelService.preferences[account] = {
      ...GreymassFuelService.preferences[account],
      ...p
    };
    if (GreymassFuelService.preferences[account].remember) {
      GreymassFuelService.save();
    }
  }
  static setGlobals(g: Record<string, (s: string) => string>) {
    GreymassFuelService.globals = g;
  }
}

async function confirmWithUser(user: User, fees: string | null) {
  const username = await user.getAccountName();
  let mymodel: string[] = [];
  mymodel = [];

  return new Promise<void>((resolve, reject) => {
    // Try and see if the user already answer (remembered)
    if (
      GreymassFuelService.preferences[username] &&
      GreymassFuelService.preferences[username].remember
    ) {
      // ok, the user did. What's the answer?
      if (GreymassFuelService.preferences[username].approve) {
        resolve();
      } else {
        reject();
      }
      return;
    }

    const handler = function (approve: boolean) {
      GreymassFuelService.setPreferences(username, { approve });
      if (approve) resolve();
      else reject();
    };

    // this are the normal texts for random wallet.
    const cancel: string | boolean = 'Reject';
    const ok = 'Confirm';
    let message =
      "Your account doesn't have sufficient resources (CPU, NET, or RAM) to pay for your next transaction. " +
      'Don\'t worry! Telos has partnered with Greymass to proceed with your transaction using "Greymass Fuel", allowing you to continue for free.<br/><br/>' +
      'We recommend powering up your account with at least 0.5 TLOS in CPU and NET each and purchasing RAM, as this service is not supported on all dAPPs in our ecosystem. Please <a src="https://wallet.telos.net/" target="_blank">click here</a> to proceed and power up your account';

    // If the wallet is Greymass Anchor is not possible to avoid Fuel service (it is incorporated)
    try {
      if (typeof fees == 'string') {
        message =
          "Your account doesn't have sufficient resources (CPU, NET, or RAM) to pay for your next transaction and it can not be processed without fees. " +
          'Telos has partnered with Greymass to proceed with your transaction using "Greymass Fuel", reducing cost significantly.<br/><br/>' +
          'Please confirm fees below to proceed.<br/><br/>' +
          `<div><center><h5><b>${fees}</b></h5></center><div><br/>` +
          'We recommend powering up your account with at least 0.5 TLOS in CPU and NET each and purchasing RAM, as this service is not supported on all dAPPs in our ecosystem. Please <a src="https://wallet.telos.net/" target="_blank">click here</a> to proceed and power up your account';
      }
    } catch (e) {}

    Dialog.create({
      title: 'Resource Warning!',
      message,
      html: true,
      cancel,
      ok,
      persistent: true,
      options: {
        type: 'checkbox',
        model: mymodel,
        isValid: (model: string | string[]) => {
          GreymassFuelService.setPreferences(username, {
            remember: model.length == 1
          });
          return true;
        },
        items: [
          { label: 'Remember my decision', value: 'remember', color: 'primary' }
        ]
      }
    })
      // all answers should save the preferences
      .onOk(() => handler(true))
      .onCancel(() => handler(false));
  });
}

=======
>>>>>>> Refactored the code and added some unit tests
// Auxiliar functions to validate modified transaction returned by the resourse provider

// Validate the transaction
function validateTransaction(
  signer: PermissionLevel,
  modifiedTransaction: Transaction,
  transaction: Transaction,
<<<<<<< HEAD
  costs: CostsType | null = null
): string | null {
=======
  costs: { ram: string } | null = null
) {
>>>>>>> Refactored the code and added some unit tests
  // Ensure the first action is the `greymassnoop:noop`
  validateNoop(modifiedTransaction);

  // Ensure the actions within the transaction match what was provided
<<<<<<< HEAD
  return validateActions(signer, modifiedTransaction, transaction, costs);
=======
  validateActions(signer, modifiedTransaction, transaction, costs);
>>>>>>> Refactored the code and added some unit tests
}

// Validate the actions of the modified transaction vs the original transaction
function validateActions(
  signer: PermissionLevel,
  modifiedTransaction: Transaction,
  transaction: Transaction,
<<<<<<< HEAD
  costs: CostsType | null
): string | null {
=======
  costs: { ram: string } | null
) {
>>>>>>> Refactored the code and added some unit tests
  // Determine how many actions we expect to have been added to the transaction based on the costs
  const expectedNewActions = determineExpectedActionsLength(costs);

  // Ensure the proper number of actions was returned
  validateActionsLength(expectedNewActions, modifiedTransaction, transaction);

  // Ensure the appended actions were expected
<<<<<<< HEAD
  return validateActionsContent(
=======
  validateActionsContent(
>>>>>>> Refactored the code and added some unit tests
    signer,
    expectedNewActions,
    modifiedTransaction,
    transaction
  );
}

// Validate the number of actions is the number expected
<<<<<<< HEAD
function determineExpectedActionsLength(costs: CostsType | null) {
=======
function determineExpectedActionsLength(costs: { ram: string } | null) {
>>>>>>> Refactored the code and added some unit tests
  // By default, 1 new action is appended (noop)
  let expectedNewActions = 1;

  // If there are costs associated with this transaction, 1 new actions is added (the fee)
  if (costs) {
    expectedNewActions += 1;
    // If there is a RAM cost associated with this transaction, 1 new actio is added (the ram purchase)
    if (costs.ram !== '0.0000 TLOS') {
      expectedNewActions += 1;
    }
  }

  return expectedNewActions;
}

// Validate the contents of each action
function validateActionsContent(
  signer: PermissionLevel,
  expectedNewActions: number,
  modifiedTransaction: Transaction,
  transaction: Transaction
<<<<<<< HEAD
): string | null {
=======
) {
>>>>>>> Refactored the code and added some unit tests
  // Make sure the originally requested actions are still intact and unmodified
  validateActionsOriginalContent(
    expectedNewActions,
    modifiedTransaction,
    transaction
  );

  // If a fee has been added, ensure the fee is set properly
  if (expectedNewActions > 1) {
<<<<<<< HEAD
    let totalFee: null | number = null;
    totalFee = validateActionsFeeContent(signer, modifiedTransaction);
=======
    validateActionsFeeContent(signer, modifiedTransaction);
>>>>>>> Refactored the code and added some unit tests
    // If a ram purchase has been added, ensure the purchase was set properly
    if (expectedNewActions > 2) {
      validateActionsRamContent(signer, modifiedTransaction);
    }
<<<<<<< HEAD
    return `${new Number(totalFee).toFixed(4)} TLOS`;
  } else {
    return null;
=======
>>>>>>> Refactored the code and added some unit tests
  }
}

interface AuxTransactionData {
  [key: string]: string;
}

function descerialize(data: unknown): AuxTransactionData {
  return data as AuxTransactionData;
}

// Ensure the transaction fee transfer is valid
function validateActionsFeeContent(
  signer: PermissionLevel,
  modifiedTransaction: Transaction
<<<<<<< HEAD
): number {
=======
) {
>>>>>>> Refactored the code and added some unit tests
  const feeAction = modifiedTransaction.actions[1];
  const data = descerialize(feeAction.data);
  const amount = parseFloat(data.quantity?.split(' ')[0]);
  if (amount > maxFee) {
    throw new Error(`Fee of ${amount} exceeds the maximum fee of ${maxFee}.`);
  }
  if (
    feeAction.account.toString() !== 'eosio.token' ||
    feeAction.name.toString() !== 'transfer' ||
    data.to.toString() !== 'fuel.gm'
  ) {
    throw new Error('Fee action was deemed invalid.');
  }
<<<<<<< HEAD
  return amount;
=======
>>>>>>> Refactored the code and added some unit tests
}

// Ensure the RAM purchasing action is valid
function validateActionsRamContent(
  signer: PermissionLevel,
  modifiedTransaction: Transaction
<<<<<<< HEAD
): number {
  const ramAction = modifiedTransaction.actions[2];
  const data = descerialize(ramAction.data);
  const amount = parseFloat(data.quant?.split(' ')[0]);
=======
) {
  const ramAction = modifiedTransaction.actions[2];
  const data = descerialize(ramAction.data);
>>>>>>> Refactored the code and added some unit tests

  if (
    ramAction.account.toString() !== 'eosio' ||
    !['buyram', 'buyrambytes'].includes(String(ramAction.name)) ||
    data.payer.toString() !== 'greymassfuel' ||
    data.receiver.toString() !== signer.actor.toString()
  ) {
    throw new Error('RAM action was deemed invalid.');
  }
<<<<<<< HEAD
  return amount;
=======
>>>>>>> Refactored the code and added some unit tests
}

// Make sure the actions returned in the API response match what was submitted
function validateActionsOriginalContent(
  expectedNewActions: number,
  modifiedTransaction: Transaction,
  transaction: Transaction
) {
  for (const [i] of modifiedTransaction.actions.entries()) {
    // Skip the expected new actions
    if (i < expectedNewActions) continue;
    // Compare each action to the originally generated actions
    const original = transaction.actions[i - expectedNewActions];
    const action = modifiedTransaction.actions[i];
    const matchesAccount =
      action.account.toString() === original.account.toString();
    const matchesAction = action.name.toString() === original.name.toString();
    const matchesLength =
      action.authorization.length === original.authorization.length;
    const matchesActor =
      action.authorization[0].actor.toString() ===
      original.authorization[0].actor.toString();
    const matchesPermission =
      action.authorization[0].permission.toString() ===
      original.authorization[0].permission.toString();
    const matchesData = action.data.toString() === original.data.toString();
    if (
      !action ||
      !matchesAccount ||
      !matchesAction ||
      !matchesLength ||
      !matchesActor ||
      !matchesPermission ||
      !matchesData
    ) {
      const { account, name } = original;
      throw new Error(
        `Transaction returned by API has non-matching action at index ${i} (${account.toString()}:${name.toString()})`
      );
    }
  }
}

// Ensure no unexpected actions were appended in the response
function validateActionsLength(
  expectedNewActions: number,
  modifiedTransaction: Transaction,
  transaction: Transaction
) {
  if (
    modifiedTransaction.actions.length !==
    transaction.actions.length + expectedNewActions
  ) {
    throw new Error('Transaction returned contains additional actions.');
  }
}

const expectedCosignerContract = Name.from('greymassnoop');
const expectedCosignerAction = Name.from('noop');
const expectedCosignerAccountName = Name.from('greymassfuel');
const expectedCosignerAccountPermission = Name.from('cosign');

// Make sure the first action is the greymassnoop:noop and properly defined
function validateNoop(modifiedTransaction: Transaction) {
  const [firstAction] = modifiedTransaction.actions;
  const [firstAuthorization] = firstAction.authorization;
  if (
    firstAction.account.toString() !== expectedCosignerContract.toString() ||
    firstAction.name.toString() !== expectedCosignerAction.toString() ||
    firstAuthorization.actor.toString() !==
      expectedCosignerAccountName.toString() ||
    firstAuthorization.permission.toString() !==
      expectedCosignerAccountPermission.toString() ||
<<<<<<< HEAD
    (JSON.stringify(firstAction.data) !== '""' &&
      JSON.stringify(firstAction.data) !== '{}')
=======
    JSON.stringify(firstAction.data) !== '{}'
>>>>>>> Refactored the code and added some unit tests
  ) {
    throw new Error(
      `First action within transaction response is not valid noop (${expectedCosignerContract.toString()}:${expectedCosignerAction.toString()} signed by ${expectedCosignerAccountName.toString()}:${expectedCosignerAccountPermission.toString()}).`
    );
  }
}
