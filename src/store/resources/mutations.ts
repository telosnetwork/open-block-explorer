import { MutationTree } from 'vuex';
import { DelegatedResources, ResourcesStateInterface } from 'src/store/resources/state';

export const mutations: MutationTree<ResourcesStateInterface> = {

    setCurrentAccount(state: ResourcesStateInterface, account: string) {
        state.currentAccount = account;
    },

    setDelegatedFromOthers(state: ResourcesStateInterface, delegated) {
        state.fromOthers = delegated as DelegatedResources;
    },

    setDelegatedToOthers(state: ResourcesStateInterface, delegated) {
        state.toOthers = delegated as DelegatedResources[];
    },

    setDelegatedToOthersAggregated(state: ResourcesStateInterface, aggregated) {
        state.toOthersAggregated = aggregated as number;
    },

    setSelfStaked(state: ResourcesStateInterface, delegated) {
        state.selfStaked = delegated as DelegatedResources;
    },

    setLoading(state: ResourcesStateInterface, label: string) {
        // add label to loading array but only if it's not already there
        if (!state.loading.includes(label)) {
            state.loading.push(label);
        }
    },

    unsetLoading(state: ResourcesStateInterface, label: string) {
        // remove label from loading array
        state.loading = state.loading.filter(l => l !== label);
    },

    setForceUpdate(state: ResourcesStateInterface, forceUpdate: boolean) {
        state.forceUpdate = forceUpdate;
    },


};
