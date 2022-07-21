/**
 * Reference for Hyperion endpoints:
 * https://rpc1.us.telos.net/v2/docs/static/index.html#/ (main net)
 * https://testnet.telos.net/v2/docs/static/index.html#/ (testnet)
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {
  ActionData,
  Action,
  AccountDetails,
  Token,
  Transaction,
  PermissionLinksData,
  PermissionLinks,
  TableByScope,
  Block,
  Get_actions,
  ChainInfo,
  ProducerSchedule,
  GetProposalsProps,
  GetProposals,
  GetProducers,
  ABI
} from 'src/types';

const hyperion = axios.create({ baseURL: process.env.HYPERION_ENDPOINT });
const controller = new AbortController();

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
): Promise<ActionData> {
  const response = await hyperion.get<ActionData>(
    'v2/history/get_transaction',
    {
      params: { id: address }
    }
  );
  return response.data;
};

export const getTransactionV1 = async function (
  id?: string
): Promise<Transaction> {
  const response = await hyperion.post<Transaction>(
    'v1/history/get_transaction',
    {
      id: id
    }
  );
  return response.data;
};

export const getChildren = async function (
  address?: string
): Promise<Action[]> {
  const response = await hyperion.get<ActionData>('v2/history/get_actions', {
    params: {
      limit: 100,
      account: address,
      filter: 'eosio:newaccount',
      skip: 0
    }
  });
  return response.data.actions;
};

export const getPermissionLinks = async function (
  address?: string
): Promise<PermissionLinks[]> {
  const response = await hyperion.get<PermissionLinksData>(
    'v2/state/get_links',
    {
      params: {
        account: address
      }
    }
  );
  return response.data.links;
};

export const getTableByScope = async function (
  data: unknown
): Promise<TableByScope[]> {
  const response = await hyperion.post('v1/chain/get_table_by_scope', data);
  return response.data.rows;
};

export const getBlock = async function (block: string): Promise<Block> {
  controller.abort();
  const response = await hyperion.post('v1/chain/get_block', {
    block_num_or_id: block,
    signal: controller.signal
  });
  return response.data;
};

export const getActions = async function (
  account: string,
  filter: string,
  limit?: number,
  skip?: number
): Promise<Get_actions> {
  controller.abort();
  const response = await hyperion.get('v2/history/get_actions', {
    params: {
      account,
      filter,
      limit,
      skip
    }
  });
  return response.data;
};

export const getInfo = async function (): Promise<ChainInfo> {
  controller.abort();
  const response = await hyperion.get('v1/chain/get_info');
  return response.data;
};

export const getSchedule = async function (): Promise<ProducerSchedule> {
  controller.abort();
  const response = await hyperion.get('v1/chain/get_producer_schedule');
  return response.data;
};

export const getProposals = async function ({
  proposer,
  proposal,
  requested,
  provided,
  executed,
  limit,
  skip
}: GetProposalsProps): Promise<GetProposals> {
  const response = await hyperion.get('v2/state/get_proposals', {
    params: {
      proposer,
      proposal,
      requested,
      provided,
      executed,
      limit,
      skip
    }
  });
  return response.data;
};

export const getProducers = async function (): Promise<GetProducers> {
  const response = await hyperion.post('v1/chain/get_producers', {
    json: true,
    limit: 10000
  });
  return response.data;
};

export const getABI = async function (account: string): Promise<ABI> {
  const response = await hyperion.post('v1/chain/get_abi', {
    account_name: account
  });

  return response.data;
};

export const getKeyAccounts = async function (
  key: string
): Promise<{ account_names: string[] }> {
  const response = await hyperion.get('v2/state/get_key_accounts', {
    params: { public_key: key }
  });

  return response.data;
};
