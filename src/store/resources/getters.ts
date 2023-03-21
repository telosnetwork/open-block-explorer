import { GetterTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { DelegatedResources, ResourcesStateInterface } from 'src/store/resources/state';
import { Ref } from 'vue';


export const getters: GetterTree<ResourcesStateInterface, StateInterface> = {
    // get list of delegates resources to other accounts
    getDelegatedToOthers(store: ResourcesStateInterface): DelegatedResources[] {
        return store.toOthers ?? [];
    },

    // get list of delegates resources to other accounts
    getDelegatedToOthersAggregated(store: ResourcesStateInterface): number {
        return store.toOthersAggregated ?? 0;
    },

    // get list of delegates resources from other accounts
    getDelegatedFromOthers(store: ResourcesStateInterface): DelegatedResources | null {
        return store.fromOthers;
    },

    // get list of self staked resources
    getSelfStaked(store: ResourcesStateInterface): DelegatedResources | null {
        return store.selfStaked;
    },

    getLoading(store: ResourcesStateInterface): string[] {
        return store.loading;
    },

    // is loading function name
    isLoading(store: ResourcesStateInterface): (name: string) => boolean {
        return (name: string) => store.loading.includes(name);
    },


};

// include all getters in the interface as collable full-typed functions
export interface ResourcesGetters {
    getDelegatedToOthers: () => DelegatedResources[];
    getDelegatedFromOthers: () => Ref<DelegatedResources | null>;
    getDelegatedToOthersAggregated: () => number;
    getSelfStaked: () => DelegatedResources | null;
    getLoading: () => string[];
    isLoading: (name: string) => boolean;
}
