import { Token } from 'src/types';
import { GetterTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { ChainStateInterface } from 'src/store/chain/state';

export const getters: GetterTree<ChainStateInterface, StateInterface> = {
    getToken({ token }): Token {
        return token;
    },
};
