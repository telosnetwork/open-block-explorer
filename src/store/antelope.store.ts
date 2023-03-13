/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { StateInterface, useStore } from 'src/store';
import { ResourcesAPI } from 'src/store/resources';
import { DelegatedResources } from 'src/store/resources/state';
import { Ref } from 'vue';
import { DispatchOptions } from 'vuex';

export interface AntelopeStore {
    resources: ResourcesAPI;
    state: StateInterface;
    dispatch: (t: string, p?: unknown, o?: DispatchOptions) => Promise<unknown>;
}

export function useAntelopeStore(): AntelopeStore {
    const store = useStore();
    const state = store.state;
    return {
        resources: {
            getDelegatedToOthers: (): DelegatedResources[] => store.getters['resources/getDelegatedToOthers'],
            getDelegatedFromOthers: ():Ref<DelegatedResources> => store.getters['resources/getDelegatedFromOthers'],
            getSelfStaked: ():DelegatedResources => store.getters['resources/getSelfStaked'],
            getLoading: ():string[] => store.getters['resources/getLoading'],
            isLoading: (funcname: string) => store.getters['resources/isLoading'](funcname),

            // actions
            updateResources: (force?:boolean) => store.dispatch('resources/updateResources', force),
            updateSelfStaked: (account: string) => store.dispatch('resources/updateSelfStaked', account),
            updateDelegatedToOthers: (account: string) => store.dispatch('resources/updateDelegatedToOthers', account),
            delegateResources: (order: DelegatedResources) => store.dispatch('resources/delegateResources', order),
            undelegateResources: (order: DelegatedResources) => store.dispatch('resources/undelegateResources', order),
        },
        state,
        dispatch: (t: string, p?: unknown, o?: DispatchOptions): Promise<unknown> => store.dispatch(t, p, o),
    };
}
