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
                radius: 30,
                backgroundColor: ['F1A12A', '4369E8', 'E72AC7', 'E8DA16', '98D4EB', '79CD6C', 'EDB7C0', 'F0C146', 'D9644A', '32A985', 'A78DDD', '423FEC', 'AFE39C', '8448E5', 'C9388F', '42D3F3'],
                backgroundType: ['gradientLinear', 'solid'],
                backgroundRotation: [10, 350],
                translateY: -10,
                mouth: ['cute', 'drip', 'faceMask', 'kissHeart', 'lilSmile', 'plain', 'shout', 'shy', 'smileLol', 'smileTeeth', 'tongueOut', 'wideSmile', 'pissed'],
            });
            
            const botAvatar = () => createAvatar(bottts, {
                seed: account,
                radius: 30,
                rotate: 9,
                scale: 122,
                size: 96,
                backgroundColor: ['b6e304', 'd1d4f9', 'ffdfbf', 'ffd5dc', 'c0aede'],
                backgroundType: ['gradientLinear', 'solid'],
                backgroundRotation: [0,360],
                translateX: -5,
                translateY: 5,
                clip: true,
                randomizeIds: false,
                baseColor: ['4369E8', 'E72AC7', 'E8DA16', '98D4EB', '79CD6C', 'EDB7C0', 'F0C146', 'D9644A', '32A985', 'A78DDD', '423FEC', 'AFE39C', '8448E5', 'C9388F', '42D3F3'],
                eyes: ['bulging', 'dizzy', 'eva', 'frame1', 'frame2', 'glow', 'happy', 'hearts', 'robocop', 'round', 'roundFrame01', 'roundFrame02', 'sensor', 'shade01'],
                face: ['round01', 'round02', 'square01', 'square02', 'square03', 'square04'],
                mouth: ['bite', 'diagram', 'grill01', 'grill02', 'grill03', 'smile01', 'smile02', 'square01', 'square02'],
                mouthProbability: 80,
                sides: ['antenna01', 'antenna02', 'cables01', 'cables02', 'round', 'square', 'squareAssymetric'],
                sidesProbability: 83,
                texture: ['grunge01', 'grunge02', 'circuits', 'dots', 'dirty02'],
                textureProbability: 36,
                top: ['antenna', 'antennaCrooked', 'bulb01', 'glowingBulb01', 'glowingBulb2', 'horns', 'lights', 'pyramid', 'radar'],
                topProbability: 69,
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
