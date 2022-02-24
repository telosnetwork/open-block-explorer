export interface ContractStateInterface {
  address: string;
  creator: string;
}

export function state(): ContractStateInterface {
  return {
    address: '',
    creator: ''
  };
}
