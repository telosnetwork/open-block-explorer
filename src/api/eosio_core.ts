/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* see https://github.com/greymass/eosio-core/blob/master/test/api.ts for documentation */
import {
  ABIDef,
  ABISerializable,
  API,
  Action,
  ActionType,
  APIClient,
  Serializer
} from '@greymass/eosio';
import { ActionData, GetTableRowsParams } from 'src/types';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';

const chain: Chain = getChain();

const eosioCore = new APIClient({
  url: chain.getHyperionEndpoint()
});

export const getAccount = async function (
  address: string
): Promise<API.v1.AccountObject> {
  return await eosioCore.v1.chain.get_account(address);
};

export const getTokenBalances = async function (
  address: string
): Promise<unknown> {
  return await eosioCore.v1.chain.get_currency_balance('eosio.token', address);
};

export const getTableRows = async function (
  tableInput: GetTableRowsParams
): Promise<unknown> {
  return await eosioCore.v1.chain.get_table_rows(tableInput);
};

export const deserializeActionData = async function (
  data: ActionType
): Promise<ABISerializable> {
  const { abi } = await eosioCore.v1.chain.get_abi(data.account);
  if (!abi) {
    throw new Error(`No ABI for ${String(data.account)}`);
  }
  const action = Action.from(data, abi);
  // eslint-disable-next-line
  return Serializer.objectify(action.decodeData(abi));
};

export const deserializeActionDataFromAbi = function (
  data: ActionType,
  abi: ABIDef
): ABISerializable {
  if (!abi) {
    throw new Error(`No ABI for ${String(data.account)}`);
  }
  const action = Action.from(data, abi);
  // eslint-disable-next-line
  return Serializer.objectify(action.decodeData(abi));
};

export const serializeActionData = async function (
  account: string,
  name: string,
  data: unknown
): Promise<unknown> {
  const { abi } = await eosioCore.v1.chain.get_abi(account);
  if (!abi) {
    throw new Error(`No ABI for ${account}`);
  }

  const { hexString } = Serializer.encode({ object: data, abi, type: name });
  return hexString;
};
