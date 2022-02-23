export interface ChainStateInterface {
  token: {
    symbol: string;
    precision: number;
  };
}

function state(): ChainStateInterface {
  return {
    token: {
      symbol: '',
      precision: 0
    }
  };
}

export default state;
