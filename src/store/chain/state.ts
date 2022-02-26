import { Token } from 'src/types';
export interface ChainStateInterface {
  token: Token;
}

export function state(): ChainStateInterface {
  return {
    token: {
      symbol: '',
      precision: 0,
      amount: 0,
      contract: ''
    }
  };
}
