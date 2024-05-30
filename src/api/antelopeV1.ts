/* see https://github.com/greymass/eosio-core/blob/master/test/api.ts for documentation */
import {
    ABIDef,
    ABISerializable,
    Action,
    ActionType,
    API,
    APIClient,
    Asset,
    Name,
    PublicKey,
    Serializer,
} from '@wharfkit/session';
import axios from 'axios';
import { addInterceptors } from 'src/api/axiosInterceptors';
import { useNetworksStore } from 'src/stores/networks';
import {
    GetProducers,
    GetTableRowsParams,
} from 'src/types';

const networksStore = useNetworksStore();
const eosioAxios = axios.create({ baseURL: networksStore.getCurrentNetwork.getV1Endpoint() });
addInterceptors(eosioAxios);

const eosio = new APIClient({ url: networksStore.getCurrentNetwork.getV1Endpoint() });

export const getAccount = async function (
    address: string,
): Promise<API.v1.AccountObject> {
    try {
        return await eosio.v1.chain.get_account(address);
    } catch (e) {
        console.error('Error on v1/chain/get_account', e);
    }
};

export const getAccountsByPublicKey = async function (
    key: PublicKey,
): Promise<{ account_names: Name[] }> {
    try {
        return await eosio.v1.history.get_key_accounts(key);
    } catch(e) {
        console.error('Error on v1/history/get_key_accounts', e);
    }

};

export const getTokenBalances = async function (
    address: string,
): Promise<Asset[]> {
    const { contract } = networksStore.getCurrentNetwork.getSystemToken();
    try {
        return await eosio.v1.chain.get_currency_balance(contract, address);
    } catch(e) {
        console.error('Error on v1/chain/get_currency_balance', e);
    }
};

export const getTableRows = async function (
    tableInput: GetTableRowsParams,
): Promise<API.v1.GetTableRowsResponse> {
    try {
        return await eosio.v1.chain.get_table_rows(tableInput);
    } catch(e) {
        console.error('Error on v1/chain/get_table_rows', e);
    }
};

export const getTableByScope = async function (
    data: API.v1.GetTableByScopeParams,
): Promise<API.v1.GetTableByScopeResponse> {
    try {
        return await eosio.v1.chain.get_table_by_scope(data);
    } catch(e) {
        console.error('Error on v1/chain/get_table_by_scope', e);
    }
};

export const getTransactionV1 = async function (
    id?: string,
): Promise<API.v1.GetTransactionResponse> {
    try {
        return await eosio.v1.history.get_transaction(id);
    } catch(e) {
        console.error('Error on v1/history/get_transaction', e);
    }
};

export const getBlock = async function (
    block: string,
):Promise<API.v1.GetBlockResponse> {
    try {
        return await eosio.v1.chain.get_block(block);
    } catch(e) {
        console.error('Error on v1/chain/get_block', e);
    }
};

export const getInfo = async function ():
Promise<API.v1.GetInfoResponse> {
    try {
        return await eosio.v1.chain.get_info();
    } catch(e) {
        console.error('Error on v1/chain/get_info', e);
    }
};

export const getProducerSchedule = async function ():
Promise<API.v1.GetProducerScheduleResponse> {
    try {
        return await eosio.v1.chain.get_producer_schedule();
    } catch(e) {
        console.error('Error on v1/chain/get_producer_schedule', e);
    }
};

export const getProducers = async function ():
Promise<GetProducers> {
    try {
        const response = await eosioAxios.post('v1/chain/get_producers', {
            json: true,
            limit: 10000,
        });
        return response.data as GetProducers;
    } catch(e) {
        console.error('Error on v1/chain/get_producers', e);
    }
};

export const getABI = async function (
    account: string,
): Promise<API.v1.GetAbiResponse> {
    try {
        return await eosio.v1.chain.get_abi(account);
    } catch(e) {
        console.error('Error on v1/chain/get_abi', e);
    }
};


/** non API */

export const deserializeActionData = async function (
    data: ActionType,
): Promise<ABISerializable> {
    const abi = await getABI(String(data.account));
    if (!abi) {
        throw new Error(`No ABI for ${String(data.account)}`);
    }
    const action = Action.from(data, abi as unknown as ABIDef);
    return Serializer.objectify(action.decodeData(abi as unknown as ABIDef)) as ABISerializable;
};

export const deserializeActionDataFromAbi = function (
    data: ActionType,
    abi: ABIDef,
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
    data: unknown,
): Promise<unknown> {
    const abi = await getABI(account) as ABIDef;
    if (!abi) {
        throw new Error(`No ABI for ${account}`);
    }

    const { hexString } = Serializer.encode({ object: data, abi, type: name });
    return hexString;
};
