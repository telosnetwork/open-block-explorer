export interface ContractStateInterface {
  address: string;
  creator: string;
}

function state(): ContractStateInterface {
  return {
    address: '',
    creator: ''
  };
}

export default state;
