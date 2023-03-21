import { StateInterface, useStore } from 'src/store';
import { ResourcesAPI } from 'src/store/resources';
import { DelegatedResources } from 'src/store/resources/state';
import { Ref } from 'vue';
import { CommitOptions, DispatchOptions } from 'vuex';

interface GettersInterface {
    'resources/getDelegatedToOthers': DelegatedResources[];
    'resources/getDelegatedFromOthers': Ref<DelegatedResources | null>;
    'resources/getDelegatedToOthersAggregated': number;
    'resources/getSelfStaked': DelegatedResources | null;
    'resources/getLoading': string[];
    'resources/isLoading': (name: string) => boolean;
}

export interface AntelopeStore {
    resources: ResourcesAPI;
    state: StateInterface;
    dispatch: (t: string, p?: unknown, o?: DispatchOptions) => Promise<unknown>;
    commit: (type: string, payload?: unknown, options?: CommitOptions) => void;
}

export function useAntelopeStore(): AntelopeStore {
    const store = useStore();
    const state = store.state;
    const getters = store.getters as GettersInterface;
    return {
        resources: {
            getDelegatedToOthers: (): DelegatedResources[] => getters['resources/getDelegatedToOthers'],
            getDelegatedFromOthers: ():Ref<DelegatedResources> => getters['resources/getDelegatedFromOthers'],
            getSelfStaked: ():DelegatedResources => getters['resources/getSelfStaked'],
            getDelegatedToOthersAggregated: ():number => getters['resources/getDelegatedToOthersAggregated'],
            getLoading: ():string[] => getters['resources/getLoading'],
            isLoading: (funcname: string) => getters['resources/isLoading'](funcname),

            // actions
            updateResources: (payload: {account?: string, force?:boolean}) => store.dispatch('resources/updateResources', payload),
            updateSelfStaked: (account: string) => store.dispatch('resources/updateSelfStaked', account),
            updateDelegatedToOthers: (account: string) => store.dispatch('resources/updateDelegatedToOthers', account),
            delegateResources: (order: DelegatedResources) => store.dispatch('resources/delegateResources', order),
            undelegateResources: (order: DelegatedResources) => store.dispatch('resources/undelegateResources', order),
        },
        state,
        dispatch: ((type: string, payload?: unknown, options?: DispatchOptions): Promise<unknown> =>
            store.dispatch(type, payload, options)),
        commit: ((type: string, payload?: unknown, options?: CommitOptions): void =>
            store.commit(type, payload, options)),
    };
}
