import { Transaction } from 'src/types/zj_tpyes/Transaction';

export interface Block {
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
    tx_size: number;
    date: number;
    gas_used_sum:number;
    transactions:Transaction[];
}
