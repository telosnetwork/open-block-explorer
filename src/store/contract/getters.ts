import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { ContractStateInterface } from './state';

export const getters: GetterTree<ContractStateInterface, StateInterface> = {
  getCreatorAddress({ creator }): string {
    return creator;
  }
};
