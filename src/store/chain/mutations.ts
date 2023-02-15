import { Token, BP, Producer } from 'src/types';
import { MutationTree } from 'vuex';
import { ChainStateInterface } from 'src/store/chain/state';

export const mutations: MutationTree<ChainStateInterface> = {
    setToken(state: ChainStateInterface, token: Token) {
        state.token = token;
    },
    setSymbol(state: ChainStateInterface, symbol: string) {
        state.token.symbol = symbol;
    },
    setPrecision(state: ChainStateInterface, precision: number) {
        state.token.precision = precision;
    },
    setBpList(state: ChainStateInterface, bpList: BP[]) {
        state.bpList = bpList;
    },
    setHead_block_num(state: ChainStateInterface, hbn: number) {
        state.head_block_num = hbn;
    },
    setLIB(state: ChainStateInterface, lib: number) {
        state.last_irreversible_block_num = lib;
    },
    setHead_block_producer(state: ChainStateInterface, hbp: string) {
        state.head_block_producer = hbp;
    },
    setProducerSchedule(state: ChainStateInterface, schedule: string[]) {
        state.producerSchedule = schedule;
    },
    setProducers(state: ChainStateInterface, bpList: Producer[]) {
        state.producers = bpList;
    },
    setRamPrice(state: ChainStateInterface, price: string) {
        state.ram_price = price;
    },
};
