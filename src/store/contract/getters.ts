import { GetterTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { ContractStateInterface } from 'src/store/contract/state';

export const getters: GetterTree<ContractStateInterface, StateInterface> = {
    getCreatorAddress({ creator }): string {
        return creator;
    },
};
