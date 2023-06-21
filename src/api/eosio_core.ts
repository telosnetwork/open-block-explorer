/* see https://github.com/greymass/eosio-core/blob/master/test/api.ts for documentation */
import {
    ABIDef,
    ABISerializable,
    API,
    Action,
    ActionType,
    APIClient,
    Serializer,
    PublicKey,
    Name,
} from '@greymass/eosio';
import { GetTableRowsParams } from 'src/types';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';

class EosIoCore {
    static instance: EosIoCore;

    static getInstance(): EosIoCore {
        if (!this.instance || this.instance.chain.getName() !== getChain().getName()) {
            this.instance = new EosIoCore();
        }
        return this.instance;
    }

    chain: Chain;
    apiClient: APIClient;

    constructor() {
        this.chain = getChain();
        this.apiClient = new APIClient({
            url: this.chain.getHyperionEndpoint(),
        });
    }
}

export const getAccount = async function (
    address: string,
): Promise<API.v1.AccountObject> {
    const eosioCore = EosIoCore.getInstance().apiClient;
    return await eosioCore.v1.chain.get_account(address);
};

export const getKeyAccounts = async function (
    key: PublicKey,
): Promise<{ account_names: Name[] }> {
    const eosioCore = EosIoCore.getInstance().apiClient;
    const response = await eosioCore.v1.history.get_key_accounts(key);
    return response;
};

export const getTokenBalances = async function (
    address: string,
): Promise<unknown> {
    const eosioCore = EosIoCore.getInstance().apiClient;
    return await eosioCore.v1.chain.get_currency_balance('eosio.token', address);
};

export const getTableRows = async function (
    tableInput: GetTableRowsParams,
): Promise<unknown> {
    const eosioCore = EosIoCore.getInstance().apiClient;
    return await eosioCore.v1.chain.get_table_rows(tableInput);
};

export const deserializeActionData = async function (
    data: ActionType,
): Promise<ABISerializable> {
    const eosioCore = EosIoCore.getInstance().apiClient;
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
    const eosioCore = EosIoCore.getInstance().apiClient;
    const { abi } = await eosioCore.v1.chain.get_abi(account);
    if (!abi) {
        throw new Error(`No ABI for ${account}`);
    }

    const { hexString } = Serializer.encode({ object: data, abi, type: name });
    return hexString;
};
