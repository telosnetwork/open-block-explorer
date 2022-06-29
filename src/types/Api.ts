/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Checksum160,
  Checksum256,
  Float64,
  Name,
  NameType,
  UInt128,
  UInt64,
  UInt32Type
} from '@greymass/eosio';
import { Transaction } from './Transaction';
import {
  AccountDetails,
  Action,
  Token,
  PermissionLinks,
  TableByScope,
  Block,
  ActionData,
  Get_actions
} from './Actions';

export type TableIndexType =
  | Name
  | UInt64
  | UInt128
  | Float64
  | Checksum256
  | Checksum160;

export interface GetTableRowsParams {
  /** The name of the smart contract that controls the provided table. */
  code: NameType;
  /** Name of the table to query. */
  table: NameType;
  /** The account to which this data belongs, if omitted will be set to be same as `code`. */
  scope?: string | TableIndexType;
  /** Lower lookup bound. */
  lower_bound?: TableIndexType;
  /** Upper lookup bound. */
  upper_bound?: TableIndexType;
  /** How many rows to fetch, defaults to 10 if unset. */
  limit?: UInt32Type;
  /** Whether to iterate records in reverse order. */
  reverse?: boolean;
  /** Position of the index used, defaults to primary. */
  index_position?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'fourth'
    | 'fifth'
    | 'sixth'
    | 'seventh'
    | 'eighth'
    | 'ninth'
    | 'tenth';
  /**
   * Whether node should try to decode row data using code abi.
   * Determined automatically based the `type` param if omitted.
   */
  json?: boolean;
  /**
   * Set to true to populate the ram_payers array in the response.
   */
  show_payer?: boolean;
}

export type ApiClient = {
  getAccount: (address: string) => Promise<AccountDetails>;
  getCreator: (address: string) => Promise<any>;
  getTokens: (address: string) => Promise<Token[]>;
  getTransactions: (address?: string) => Promise<Action[]>;
  getTransaction: (address: string) => Promise<ActionData>;
  getTransactionV1: (id: string) => Promise<Transaction>;
  getChildren: (address: string) => Promise<Action[]>;
  getPermissionLinks: (address: string) => Promise<PermissionLinks[]>;
  getTableByScope: (data: unknown) => Promise<TableByScope[]>;
  getBlock: (block: string) => Promise<Block>;
  getActions: (address: string, filter: string) => Promise<Get_actions>;
};
