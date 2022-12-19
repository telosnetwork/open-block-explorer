/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Most of this code was taken and addapted from https://gist.github.com/aaroncox/d74a73b3d9fbc20836c32ea9deda5d70
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
import { AnchorUser } from 'ual-anchor';
import { getChain } from 'src/config/ConfigManager';
import { Dialog } from 'quasar';

// The maximum fee per transaction this script is willing to accept
const maxFee = 0.005;

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

interface ResponseData {
  request: [string, SignedTransaction];
  signatures: Signature[];
  version: number;
  costs?: { ram: string };
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

      switch (rpResponse.code) {
        case 402: {
          // Resource Provider provided signature in exchange for a fee
          // TODO: is ok to treat them with the same logic of code = 200?
          // Yes acording to this: https://gist.github.com/aaroncox/d74a73b3d9fbc20836c32ea9deda5d70#file-fuel-core-presign-js-L128-L159
        }
        case 200: {
          // Resource Provider provided signature for free

          // validate with the user whether to use the service at all
          try {
            await confirmWithUser(this.user);
          } catch (e) {
            // TODO: need localization
            // The user refuseed to use the service
            console.info('Skip Fuel');
            break;
          }

          console.info('Continue with Greymass Fuel !!');

          const { data } = rpResponse;
          const [, returnedTransaction] = data.request;
          const modifiedTransaction: SignedTransaction = returnedTransaction;

          // Ensure the modifed transaction is what the application expects
          // These validation methods will throw an exception if invalid data exists
          validateTransaction(
            signer,
            modifiedTransaction,
            transaction,
            data.costs
          );

          modifiedTransaction.signatures = [...data.signatures];
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
            rpResponse.code.toString() +
            ' not expected from resource provider endpoint: ' +
            resourceProviderEndpoint
          );
      }

      // If we got here it means the resource provider will not participate in this transaction
      return this.user.signTransaction(originalTransaction, originalconfig);
    } catch (e) {
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

async function confirmWithUser(user: User) {
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
    let cancel: string | boolean = 'Reject';
    let ok = 'Approve';
    let message =
      "It seems you don't have enought resources to pay for your next transaction. " +
      "But, don't worry. You can continue using Greymass Fuel services for free. Do you accept to use this service?";

    // If the wallet is Greymass Anchor is not possible to avoid Fuel service (it is incorporated)
    try {
      if (user instanceof AnchorUser) {
        cancel = false;
        ok = 'Continue';
        message =
          "It seems you don't have enought resources to pay for your next transaction. " +
          "But, don't worry. Graymass Anchor wallet incorporates Fuel service for you to connitue for free.";
      }
    } catch (e) {}

    Dialog.create({
      title: "You don't have enought resources!",
      message,
      cancel,
      ok,
      persistent: true,
      options: {
        type: 'checkbox',
        model: mymodel,
        // inline: true
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

// Auxiliar functions to validate modified transaction returned by the resourse provider

// Validate the transaction
function validateTransaction(
  signer: PermissionLevel,
  modifiedTransaction: Transaction,
  transaction: Transaction,
  costs: { ram: string } | null = null
) {
  // Ensure the first action is the `greymassnoop:noop`
  validateNoop(modifiedTransaction);

  // Ensure the actions within the transaction match what was provided
  validateActions(signer, modifiedTransaction, transaction, costs);
}

// Validate the actions of the modified transaction vs the original transaction
function validateActions(
  signer: PermissionLevel,
  modifiedTransaction: Transaction,
  transaction: Transaction,
  costs: { ram: string } | null
) {
  // Determine how many actions we expect to have been added to the transaction based on the costs
  const expectedNewActions = determineExpectedActionsLength(costs);

  // Ensure the proper number of actions was returned
  validateActionsLength(expectedNewActions, modifiedTransaction, transaction);

  // Ensure the appended actions were expected
  validateActionsContent(
    signer,
    expectedNewActions,
    modifiedTransaction,
    transaction
  );
}

// Validate the number of actions is the number expected
function determineExpectedActionsLength(costs: { ram: string } | null) {
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
) {
  // Make sure the originally requested actions are still intact and unmodified
  validateActionsOriginalContent(
    expectedNewActions,
    modifiedTransaction,
    transaction
  );

  // If a fee has been added, ensure the fee is set properly
  if (expectedNewActions > 1) {
    validateActionsFeeContent(signer, modifiedTransaction);
    // If a ram purchase has been added, ensure the purchase was set properly
    if (expectedNewActions > 2) {
      validateActionsRamContent(signer, modifiedTransaction);
    }
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
) {
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
}

// Ensure the RAM purchasing action is valid
function validateActionsRamContent(
  signer: PermissionLevel,
  modifiedTransaction: Transaction
) {
  const ramAction = modifiedTransaction.actions[2];
  const data = descerialize(ramAction.data);

  if (
    ramAction.account.toString() !== 'eosio' ||
    !['buyram', 'buyrambytes'].includes(String(ramAction.name)) ||
    data.payer.toString() !== 'greymassfuel' ||
    data.receiver.toString() !== signer.actor.toString()
  ) {
    throw new Error('RAM action was deemed invalid.');
  }
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
    (JSON.stringify(firstAction.data) !== '""' &&
      JSON.stringify(firstAction.data) !== '{}')
  ) {
    // console.log('firstAction.data', firstAction.data);
    // console.log('JSON.stringify(firstAction.data)', JSON.stringify(firstAction.data));
    throw new Error(
      `First action within transaction response is not valid noop (${expectedCosignerContract.toString()}:${expectedCosignerAction.toString()} signed by ${expectedCosignerAccountName.toString()}:${expectedCosignerAccountPermission.toString()}).`
    );
  }
}
