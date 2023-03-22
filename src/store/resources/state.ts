// Note: This resources Vuex.Store solution is part of a final refactored code requested in this issue https://github.com/telosnetwork/telos-wallet/issues/99

export interface DelegatedResources {
    from: string
    to: string
    net_weight: string
    cpu_weight: string
}

export interface ResourcesStateInterface {
    currentAccount: string;
    toOthers: DelegatedResources[];
    toOthersAggregated: number;
    fromOthers: DelegatedResources | null;
    selfStaked: DelegatedResources | null;
    loading: string[];
    forceUpdate: boolean;
}

export function state(): ResourcesStateInterface {
    return {
        currentAccount: '',
        toOthers: [],
        toOthersAggregated: 0,
        fromOthers: null,
        selfStaked: null,
        loading: [],
        forceUpdate: false,
    };
}
