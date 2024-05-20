/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Checksum160,
    Checksum256,
    Float64,
    Name,
    NameType,
    UInt128,
    UInt64,
    UInt32Type,
    API,
    PublicKey,
    ActionType,
    ABISerializable,
} from '@wharfkit/session';
import {
    AccountDetails,
    Action,
    Token,
    PermissionLinks,
    TableByScope,
    Block,
    ActionData,
    Get_actions,
    Transaction,
    ABI,
    ChainInfo,
    ProducerSchedule,
    GetProposals,
    GetProducers,
    GetActionsResponse,
    GetProposalsProps,
} from 'src/types';

export type AccountCreatorInfo = {
  creator: string;
  timestamp: string;
  trx_id: string;
}

export type TableIndexType =
  | Name
  | UInt64
  | UInt128
  | Float64
  | Checksum256
  | Checksum160;

export interface HyperionTransactionFilter {
  page?: number; // the page variable sustitutes the skip
  skip?: number;
  limit?: number;
  account?: string;
  notified?: string;
  sort?: 'desc' | 'asc';
  after?: string;
  before?: string;
  extras?: { [key: string]: string };
}

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
  getAccount: (address: string) => Promise<API.v1.AccountObject>;
  getKeyAccounts: (key: PublicKey) => Promise<{ account_names: Name[] }>;
  getHyperionAccountData: (address: string) => Promise<AccountDetails>;
  getCreator: (address: string) => Promise<any>;
  getTokens: (address: string) => Promise<Token[]>;
  getTransactions: (filter: HyperionTransactionFilter) => Promise<GetActionsResponse>;
  getTransaction: (address: string) => Promise<ActionData>;
  getChildren: (address: string) => Promise<Action[]>;
  getTableRows: (tableInput: GetTableRowsParams) => Promise<unknown>;
  getTokenBalances: (address: string) => Promise<unknown>;
  getTransactionV1: (id: string) => Promise<Transaction>;
  getPermissionLinks: (address: string) => Promise<PermissionLinks[]>;
  getTableByScope: (data: unknown) => Promise<TableByScope[]>;
  getBlock: (block: string) => Promise<Block>;
  getActions: (address: string, filter: string) => Promise<Get_actions>;
  getInfo: () => Promise<ChainInfo>;
  getSchedule: () => Promise<ProducerSchedule>;
  getProposals: ({ proposer, proposal, requested, provided, executed, limit, skip }: GetProposalsProps) => Promise<GetProposals>;
  getProducers: () => Promise<GetProducers>;
  getABI: (account: string) => Promise<ABI>;
  deserializeActionData: (data: ActionType) => Promise<ABISerializable>;
  serializeActionData: (account: string, name: string, data: unknown) => Promise<unknown>;
  getProducerSchedule: () =>  Promise<{
    active: { producers: { producer_name: string }[] };
  }>;
  getApy: () => Promise<string>;
};
