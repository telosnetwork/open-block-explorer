import { MutationTree } from 'vuex';
import { ProfilesStateInterface } from 'src/store/profiles/state';
import { Profile } from 'src/types/Profile';

export const mutations: MutationTree<ProfilesStateInterface> = {

    setProfile(state: ProfilesStateInterface, profile: Profile) {
        state.profiles.set(profile.account, profile);
    },

    //TODO: updateProfile

};
