/**
 * Reference for Hyperion endpoints:
 * https://rpc1.us.telos.net/v2/docs/static/index.html#/ (main net)
 * https://testnet.telos.net/v2/docs/static/index.html#/ (testnet)
 */

import axios, { AxiosRequestConfig } from 'axios';
import { addInterceptors } from 'src/api/axiosInterceptors';
import { useNetworksStore } from 'src/stores/networks';
import {
    AccountDetails,
    Action,
    ActionData,
    Get_actions,
    GetActionsResponse,
    GetProposals,
    GetProposalsProps,
    PermissionLinks,
    PermissionLinksData,
    Token,
} from 'src/types';
import { AccountCreatorInfo, HyperionTransactionFilter } from 'src/types/Api';
import { Chain } from 'src/types/Chain';
const networksStore = useNetworksStore();
const chain: Chain = networksStore.getCurrentNetwork;

const hyperion = axios.create({ baseURL: chain.getHyperionEndpoint() });
addInterceptors(hyperion);
const name = chain.getName();

export const DEFAULT_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjciIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSI5IiByPSI4IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSI4IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=';

const url =
  `https://raw.githubusercontent.com/telosnetwork/token-list/main/tokens.${name}.json`;

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
    try {
        const tokens = await axios.get(url).then(response => response.data as Token[]);

        if (address) {
            const response = await hyperion.get('v2/state/get_tokens', {
                params: { account: address },
            });

            const balances = (response.data as {tokens:Token[]}).tokens;
            // return tokens;
            return balances.map((token:Token) => {
                const tk = tokens.find((t:Token) => t.symbol === token.symbol);
                if (tk && tk.logo) {
                    token.logo = tk?.logo;
                } else {
                    token.logo = DEFAULT_ICON;
                }
                return token;
            });
        } else {
            return tokens;
        }
    } catch(e) {
        console.error(e);
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

export const getActions = async function (
    account: string,
    filter: string,
    limit?: number,
    skip?: number,
): Promise<Get_actions> {
    const signal = new AbortController().signal;
    const response = await hyperion.get('v2/history/get_actions',
        {
            params: {
                account,
                filter,
                limit,
                skip,
            },
            signal,
        },
    );
    return response.data as Get_actions;
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

export const getHyperionKeyAccounts = async function (
    key: string,
): Promise<{ account_names: string[] }> {
    const response = await hyperion.get('v2/state/get_key_accounts', {
        params: { public_key: key },
    });
    return response.data as { account_names: string[] };
};


