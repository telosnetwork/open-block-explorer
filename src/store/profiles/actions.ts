import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { Profile } from 'src/types/Profile';
import { ProfilesStateInterface } from 'src/store/profiles/state';
import { createAvatar } from '@dicebear/core';
import { funEmoji } from '@dicebear/collection';
import { bottts } from '@dicebear/collection';
import { api } from 'src/api/index';


export const actions: ActionTree<ProfilesStateInterface, StateInterface> = {
    async fetchProfileByAccount({ commit }, account: string) {
        //TODO: fetch data from API
        try {
            const abi = await api.getABI(account);

            const avatar = () => createAvatar(funEmoji, {
                seed: account,
                rotate: 354,
                scale: 122,
                radius: 50,
                backgroundColor: ['F1A12A', '4369E8', 'E72AC7', 'E8DA16', '98D4EB', '79CD6C', 'EDB7C0', 'F0C146', 'D9644A', '32A985', 'A78DDD', '423FEC', 'AFE39C', '8448E5', 'C9388F', '42D3F3'],
                backgroundType: ['gradientLinear', 'solid'],
                backgroundRotation: [0, 350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320],
                translateY: -10,
            });

            const botAvatar = () => createAvatar(bottts, {
                seed: account,
                radius: 50,
                backgroundColor: ['F1A12A', '4369E8', 'E72AC7', 'E8DA16', '98D4EB', '79CD6C', 'EDB7C0', 'F0C146', 'D9644A', '32A985', 'A78DDD', '423FEC', 'AFE39C', '8448E5', 'C9388F', '42D3F3'],
                backgroundType: ['gradientLinear', 'solid'],
                backgroundRotation: [0, 350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320],
            });

            const profile = {
                account: account,
                avatar: abi.abi ? botAvatar().toString() : avatar().toString(),
            } as Profile;

            commit('setProfile', profile);

        } catch(e) {
            console.error(e);
        }
    },
};

export interface ProfilesActions {
    fetchProfileByAccount: (account: string) => void;
}
