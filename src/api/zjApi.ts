import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { TransactionFilter, ZjResponse, Transaction } from 'src/types/zj_tpyes/ZjActionData';


// const endpoint = 'http://10.101.20.11:801/zjchain/';
const endpoint= process.env.DEBUGGING ?  'http://127.0.0.1:8000/zjchain/' :'http://10.101.20.11:801/zjchain/';


const zjAxios = axios.create({ baseURL: endpoint });

export const getTransactions = async function (
    filter: TransactionFilter,
): Promise<AxiosResponse<ZjResponse<Transaction>>> {
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
    aux = { page, ...aux };
    const params: AxiosRequestConfig = aux as AxiosRequestConfig;

    return await zjAxios.get<ZjResponse<Transaction>>('transactions_list/', {
        params,
    });
};

export const getTransaction = async function (
    address?: string,
): Promise<Transaction> {
    const response = await zjAxios.get<ZjResponse<Transaction>>(
        'get_transaction',
        {
            params: { id: address },
        },
    );
    return response.data.data;
};

export const zjApi = {
    getTransactions,
    getTransaction,
};
