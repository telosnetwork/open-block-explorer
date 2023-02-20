import { Token, BP, Producer } from 'src/types';
export interface ChainStateInterface {
  token: Token;
  bpList: BP[];
  producers: Producer[];
  head_block_num: number;
  last_irreversible_block_num: number;
  head_block_producer: string;
  producerSchedule: string[];
  ram_price: string;
}

export function state(): ChainStateInterface {
    return {
        token: {
            symbol: '',
            precision: 0,
            amount: 0,
            contract: '',
        },
        bpList: [],
        producers: [],
        head_block_num: 0,
        last_irreversible_block_num: 0,
        head_block_producer: '',
        producerSchedule: [],
        ram_price: '0',
    };
}
