import { Module } from 'vuex';
import { StateInterface } from 'src/store/index';
import { state, ResourcesStateInterface } from 'src/store/resources/state';
import { getters, ResourcesGetters } from 'src/store/resources/getters';
import { mutations } from 'src/store/resources/mutations';
import { actions, ResourcesActions } from 'src/store/resources/actions';

export const resources: Module<ResourcesStateInterface, StateInterface> = {
    namespaced: true,
    actions,
    getters,
    mutations,
    state,
};

// merge all getters and actions into one interface ResourcesAPI
export interface ResourcesAPI extends ResourcesGetters, ResourcesActions {}

