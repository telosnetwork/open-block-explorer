

export interface Transaction {
    shard_id: number;
    pool_index: number;
    height: number;
    prehash: string;
    hash: string;
    version: number;
    vss: number;
    elect_height: number;
    bitmap: string;
    timestamp: string;
    timeblock_height: number;
    bls_agg_sign_x: string;
    bls_agg_sign_y: string;
    commit_bitmap: string;
    gid: string;
    from_field: string;
    from_pubkey: string;
    from_sign: string;
    to: string;
    amount: number;
    gas_limit: number;
    gas_used: number;
    gas_price: number;
    balance: number;
    to_add: number;
    type: number;
    attrs: string;
    status: number;
    tx_hash: string;
    call_contract_step: number;
    storages: string;
    transfers: string;
    date: number;
}



export interface ZjResponse<Model> {
    status: number;
    msg: string;
    total: {
        value: number
    }
    dataList: Model[];
    data: Model;
}

export interface TransactionFilter {
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

export interface TransactionTableRow {
    name: string;
    transaction: { id: string; type: string };
    timestamp: string;
    type: number;
    data: string;
}
