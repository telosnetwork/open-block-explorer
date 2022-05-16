import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { ChainStateInterface } from './state';

export const actions: ActionTree<ChainStateInterface, StateInterface> = {
  async setBpList({ dispatch, commit }, contractAddress) {
    commit('setContract', contractAddress);
    await dispatch('getContractInfo', contractAddress);
  },
  getContractInfo({ commit }, contractAddress) {
    //await getContract  via api
    console.log(contractAddress); //unused var otherwise
    const response: { creator: string } = { creator: 'bob' }; //mock
    commit('setCreator', response.creator);
  }
};
