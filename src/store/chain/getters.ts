import { BaseToken } from 'src/types';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { ChainStateInterface } from './state';

export const getters: GetterTree<ChainStateInterface, StateInterface> = {
  getToken({ token }): BaseToken {
    return token;
  }
};
