/**
 * Reference for Hyperion endpoints:
 * https://rpc1.us.telos.net/v2/docs/static/index.html#/ (main net)
 * https://testnet.telos.net/v2/docs/static/index.html#/ (testnet)
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from 'axios';
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
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
import { HyperionTransactionFilter } from 'src/types/Api';

const chain: Chain = getChain();
const hyperion = axios.create({ baseURL: chain.getHyperionEndpoint() });
const controller = new AbortController();

const url =
  'https://raw.githubusercontent.com/telosnetwork/token-list/main/telosmain.json';

const tokenListPromise = fetch(url)
  .then((response) => response.text())
  .then((fileContent) => JSON.parse(fileContent))
  .then((object) => object.tokens)
  .then((originals: any[]) =>
    originals.map(
      (token: { logo_sm: string }) =>
        ({
          ...token,
          logo: token.logo_sm,
          // currently, the token list is only for telos, so we can hardcode this for now
          chain: 'telos'
        } as unknown as Token)
    )
  )
  .then((list) => {
    console.log('Token list loaded', list);
    return list;
  })
  .catch((error) => {
    console.error(error);
    return [];
  });

const MAX_REQUESTS_COUNT = 5;
const INTERVAL_MS = 10;
let PENDING_REQUESTS = 0;

/**
 * Axios Request Interceptor
 */
hyperion.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
        PENDING_REQUESTS++;
        clearInterval(interval);
        resolve(config);
      }
    }, INTERVAL_MS);
  });
});

/**
 * Axios Response Interceptor
 */
hyperion.interceptors.response.use(
  function (response) {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
    return Promise.resolve(response);
  },
  function (error) {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
    return Promise.reject(error);
  }
);

export const getHyperionAccountData = async function (
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

export const getTokens = async function (address?: string): Promise<Token[]> {
  if (address) {
    const response = await hyperion.get('v2/state/get_tokens', {
      params: { account: address }
    });
    return response.data.tokens;
  } else {
    const tokenList = await tokenListPromise;
    return tokenList.filter((token: any) => {
      return token.chain === chain.getName();
    });
  }
};

export const getTransactions = async function (
  filter: HyperionTransactionFilter
): Promise<Action[]> {
  const account = filter.account || '';
  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const skip = Math.max(0, page - 1) * limit;
  const notified = filter.notified || '';
  const sort = filter.sort || 'desc';
  const after = filter.after || '';
  const before = filter.before || '';

  let aux = {};
  if (account) {
    aux = { account, ...aux };
  }
  if (limit) {
    aux = { limit, ...aux };
  }
  if (skip) {
    aux = { skip, ...aux };
  }
  if (notified) {
    aux = { notified, ...aux };
  }
  if (sort) {
    aux = { sort, ...aux };
  }
  if (after) {
    aux = { after, ...aux };
  }
  if (before) {
    aux = { before, ...aux };
  }
  if (filter.extras) {
    aux = { 'act.name': '!onblock', ...aux, ...filter.extras };
  }

  const params: AxiosRequestConfig = aux as AxiosRequestConfig;

  const response = await hyperion.get<ActionData>('v2/history/get_actions', {
    params
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

export const getHyperionKeyAccounts = async function (
  key: string
): Promise<{ account_names: string[] }> {
  const response = await hyperion.get('v2/state/get_key_accounts', {
    params: { public_key: key }
  });

  return response.data;
};

export const getProducerSchedule = async function (): Promise<{
  active: { producers: { producer_name: string }[] };
}> {
  const response = await hyperion.get('v1/chain/get_producer_schedule');

  return response.data;
};
