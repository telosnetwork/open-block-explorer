import { MutationTree } from 'vuex';
import { ContractStateInterface } from './state';

const mutations: MutationTree<ContractStateInterface> = {
  setContract(state: ContractStateInterface, contractAddress: string) {
    state.address = contractAddress;
  },
  setCreator(state: ContractStateInterface, creatorAddress: string) {
    state.creator = creatorAddress;
  }
};

export default mutations;
