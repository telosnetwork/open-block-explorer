/**
 * Reference for Hyperion endpoints:
 * https://rpc1.us.telos.net/v2/docs/static/index.html#/ (main net)
 * https://testnet.telos.net/v2/docs/static/index.html#/ (testnet)
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { ActionData, Action, AccountDetails, Token, Userres } from 'src/types';

const hyperion = axios.create({ baseURL: process.env.HYPERION_ENDPOINT });

export const getAccount = async function (
  address: string
): Promise<AccountDetails> {
  const response = await hyperion.get('v2/state/get_account', {
    params: { account: address }
  });
  return response.data;
};

export const getCreator = async function (address: string): Promise<any> {
  const response = await hyperion.get('v2/history/get_creator', {
    params: { account: address }
  });
  return response.data;
};

export const getTokens = async function (address: string): Promise<Token[]> {
  const response = await hyperion.get('v2/state/get_tokens', {
    params: { account: address }
  });
  return response.data.tokens;
};

export const getTransactions = async function (
  address?: string
): Promise<Action[]> {
  const response = await hyperion.get<ActionData>('v2/history/get_actions', {
    params: { limit: 100, account: address, 'act.name': '!onblock' }
  });
  return response.data.actions;
};

export const getTransaction = async function (
  address?: string
): Promise<Action[]> {
  const response = await hyperion.get<ActionData>(
    'v2/history/get_transaction',
    {
      params: { id: address }
    }
  );
  return response.data.actions;
};

export const getTableByScope = async function (
  account: string
): Promise<Userres[]> {
  const response = await hyperion.post('v1/chain/get_table_by_scope', {
    code: 'eosio',
    limit: 5,
    lower_bound: account,
    table: 'userres',
    upper_bound: account.padEnd(12, 'z')
  });
  return response.data.rows;
};
