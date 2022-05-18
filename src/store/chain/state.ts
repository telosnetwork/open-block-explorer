import { Token, BP } from 'src/types';
export interface ChainStateInterface {
  token: Token;
  bpList: BP[];
}

export function state(): ChainStateInterface {
  return {
    token: {
      symbol: '',
      precision: 0,
      amount: 0,
      contract: ''
    },
    bpList: []
  };
}
