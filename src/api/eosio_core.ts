/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* see https://github.com/greymass/eosio-core/blob/master/test/api.ts for documentation */
import { APIClient } from '@greymass/eosio';
import { GetTableRowsParams } from 'src/types';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';

const chain: Chain = getChain();

const eosioCore = new APIClient({
  url: chain.getHyperionEndpoint()
});

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
