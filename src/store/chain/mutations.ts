import { BaseToken } from 'src/types';
import { MutationTree } from 'vuex';
import { ChainStateInterface } from './state';

export const mutations: MutationTree<ChainStateInterface> = {
  setToken(state: ChainStateInterface, token: BaseToken) {
    state.token = token;
  },
  setSymbol(state: ChainStateInterface, symbol: string) {
    state.token.symbol = symbol;
  },
  setPrecision(state: ChainStateInterface, precision: number) {
    state.token.precision = precision;
  }
};
