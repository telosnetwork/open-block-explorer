/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Checksum160,
  Checksum256,
  Float64,
  Name,
  NameType,
  UInt128,
  UInt64
} from '@greymass/eosio';

import { AccountDetails, Action } from './Actions';

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
  scope: string | TableIndexType;
  /** Lower lookup bound. */
  key_type: string;
}

export type ApiClient = {
  getAccount: (address: string) => Promise<AccountDetails>;
  getCreator: (address: string) => Promise<any>;
  getTransactions: (address?: string) => Promise<Action[]>;
  getTransaction: (address: string) => Promise<Action[]>;
};
