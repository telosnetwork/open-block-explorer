import { Module } from 'vuex';
import { StateInterface } from 'src/store/index';
import { state, ProfilesStateInterface } from 'src/store/profiles/state';
import { getters, ProfilesGetters } from 'src/store/profiles/getters';
import { mutations } from 'src/store/profiles/mutations';
import { actions, ProfilesActions } from 'src/store/profiles/actions';

export const profiles: Module<ProfilesStateInterface, StateInterface> = {
    namespaced: true,
    actions,
    getters,
    mutations,
    state,
};

export interface ProfilesAPI extends ProfilesGetters, ProfilesActions {}

