import { GetterTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { Profile } from 'src/types/Profile';
import { ProfilesStateInterface } from 'src/store/profiles/state';


export const getters: GetterTree<ProfilesStateInterface, StateInterface> = {
    getProfileByAccount(store: ProfilesStateInterface): (account: string) => Profile {
        return (account: string) => store.profiles.get(account);
    },
};

export interface ProfilesGetters {
    getProfileByAccount: (account: string) => Profile | null;
}
