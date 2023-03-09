/**
 * Reference for Hyperion endpoints:
 * https://rpc1.us.telos.net/v2/docs/static/index.html#/ (main net)
 * https://testnet.telos.net/v2/docs/static/index.html#/ (testnet)
 */

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
    ABI,
} from 'src/types';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
import { AccountCreatorInfo, HyperionTransactionFilter } from 'src/types/Api';
import { GetActionsResponse } from 'src/types/Actions';

const chain: Chain = getChain();
const hyperion = axios.create({ baseURL: chain.getHyperionEndpoint() });
const controller = new AbortController();
export const DEFAULT_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjciIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSI5IiByPSI4IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSI4IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=';

const name = chain.getName();

const url =
  `https://raw.githubusercontent.com/telosnetwork/token-list/main/tokens.${name}.json`;

const tokenListPromise = fetch(url)
    .then(response => response.text())
    .then((fileContent: string) => JSON.parse(fileContent) as { account: string }[])
    .then(originals => originals.map(token => token as unknown as Token))
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
    },
);

export const getHyperionAccountData = async function (
    address: string,
): Promise<AccountDetails> {
    const response = await hyperion.get('v2/state/get_account', {
        params: { account: address },
    });
    return response.data as AccountDetails;
};

export const getCreator = async function (address: string): Promise<AccountCreatorInfo> {
    const response = await hyperion.get('v2/history/get_creator', {
        params: { account: address },
    });
    return response.data as AccountCreatorInfo;
};

export const getTokens = async function (address?: string): Promise<Token[]> {
    if (address) {
        const response = await hyperion.get('v2/state/get_tokens', {
            params: { account: address },
        });
        const tokens = await tokenListPromise;
        const balances = (response.data as {tokens:Token[]}).tokens;
        return balances.map((token:Token) => {
            const tk = tokens.find((t:Token) => t.symbol === token.symbol) as Token;
            if (tk && tk.logo) {
                token.logo = tk?.logo;
            } else {
                token.logo = DEFAULT_ICON;
            }
            return token;
        });
    } else {
        return await tokenListPromise;
    }
};

export const getTransactions = async function (
    filter: HyperionTransactionFilter,
): Promise<GetActionsResponse> {
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

    return await hyperion.get<ActionData>('v2/history/get_actions', {
        params,
    });
};

export const getTransaction = async function (
    address?: string,
): Promise<ActionData> {
    const response = await hyperion.get<ActionData>(
        'v2/history/get_transaction',
        {
            params: { id: address },
        },
    );
    return response.data;
};

export const getTransactionV1 = async function (
    id?: string,
): Promise<Transaction> {
    const response = await hyperion.post<Transaction>(
        'v1/history/get_transaction',
        {
            id: id,
        },
    );
    return response.data;
};

export const getChildren = async function (
    address?: string,
): Promise<Action[]> {
    const response = await hyperion.get<ActionData>('v2/history/get_actions', {
        params: {
            limit: 100,
            account: address,
            filter: 'eosio:newaccount',
            skip: 0,
        },
    });
    return response.data.actions;
};

export const getPermissionLinks = async function (
    address?: string,
): Promise<PermissionLinks[]> {
    const response = await hyperion.get<PermissionLinksData>(
        'v2/state/get_links',
        {
            params: {
                account: address,
            },
        },
    );
    return response.data.links;
};

export const getTableByScope = async function (
    data: unknown,
): Promise<TableByScope[]> {
    const response = await hyperion.post('v1/chain/get_table_by_scope', data);
    return (response.data as {rows:TableByScope[]}).rows;
};

export const getBlock = async function (block: string): Promise<Block> {
    controller.abort();
    const response = await hyperion.post('v1/chain/get_block', {
        block_num_or_id: block,
        signal: controller.signal,
    });
    return response.data as Block;
};

export const getActions = async function (
    account: string,
    filter: string,
    limit?: number,
    skip?: number,
): Promise<Get_actions> {
    controller.abort();
    const response = await hyperion.get('v2/history/get_actions', {
        params: {
            account,
            filter,
            limit,
            skip,
        },
    });
    return response.data as Get_actions;
};

export const getInfo = async function (): Promise<ChainInfo> {
    controller.abort();
    const response = await hyperion.get('v1/chain/get_info');
    return response.data as ChainInfo;
};

export const getSchedule = async function (): Promise<ProducerSchedule> {
    controller.abort();
    const response = await hyperion.get('v1/chain/get_producer_schedule');
    return response.data as ProducerSchedule;
};

export const getProposals = async function ({
    proposer,
    proposal,
    requested,
    provided,
    executed,
    limit,
    skip,
}: GetProposalsProps): Promise<GetProposals> {
    const response = await hyperion.get('v2/state/get_proposals', {
        params: {
            proposer,
            proposal,
            requested,
            provided,
            executed,
            limit,
            skip,
        },
    });
    return response.data as GetProposals;
};

export const getProducers = async function (): Promise<GetProducers> {
    const response = await hyperion.post('v1/chain/get_producers', {
        json: true,
        limit: 10000,
    });
    return response.data as GetProducers;
};

export const getABI = async function (account: string): Promise<ABI> {
    const response = await hyperion.post('v1/chain/get_abi', {
        account_name: account,
    });
    return response.data as ABI;
};

export const getHyperionKeyAccounts = async function (
    key: string,
): Promise<{ account_names: string[] }> {
    const response = await hyperion.get('v2/state/get_key_accounts', {
        params: { public_key: key },
    });
    return response.data as { account_names: string[] };
};

export const getProducerSchedule = async function (): Promise<{
  active: { producers: { producer_name: string }[] };
}> {
    const response = await hyperion.get('v1/chain/get_producer_schedule');
    return response.data as { active: { producers: { producer_name: string }[] } };
};
