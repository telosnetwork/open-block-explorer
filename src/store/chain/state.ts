export interface ChainStateInterface {
  token: {
    symbol: string;
    precision: number;
  };
}

export function state(): ChainStateInterface {
  return {
    token: {
      symbol: '',
      precision: 0
    }
  };
}
