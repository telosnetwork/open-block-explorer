import { MutationTree } from 'vuex';
import { ContractStateInterface } from 'src/store/contract/state';

export const mutations: MutationTree<ContractStateInterface> = {
    setContract(state: ContractStateInterface, contractAddress: string) {
        state.address = contractAddress;
    },
    setCreator(state: ContractStateInterface, creatorAddress: string) {
        state.creator = creatorAddress;
    },
};
