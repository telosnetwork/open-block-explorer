/* eslint-disable */
import { AntelopeStore, useAntelopeStore } from 'src/store/antelope.store';
import { DelegatedResources, ResourcesStateInterface } from 'src/store/resources/state';
import { Ref, ref } from 'vue';
import { DispatchOptions } from 'vuex';


// this is the content of the file we want to test
/*

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

*/

// dummie DelegatedResources
const dummieDelegatedResources: DelegatedResources = {
    from: 'from',
    to: 'to',
    net_weight: 'net_weight',
    cpu_weight: 'cpu_weight',
}

// dummie string
const dummieString: string = 'dummie';


// mocking useStore from src/store
jest.mock('src/store', () => ({
    useStore: () => ({
        state: {
            resources: {
                delegatedToOthers: [] as DelegatedResources[],
                delegatedFromOthers: {},
                selfStaked: {},
                loading: [] as string[],
            },
        },
        getters: {
            'resources/getDelegatedToOthers': [dummieDelegatedResources],
            'resources/getDelegatedFromOthers': ref({} as DelegatedResources),
            'resources/getSelfStaked': ({} as DelegatedResources),
            'resources/getLoading': [dummieString],
            'resources/isLoading': (funcname: string) => [funcname].includes(dummieString),
        },
        dispatch: (t: string, p?: unknown, o?: DispatchOptions): Promise<unknown> => Promise.resolve(),
    }),
}));

// this is the test file
describe('AntilopeStore', () => {
    describe('useAntelopeStore()', () => {
        
        it('should return the correct type', () => {
            const store = {
                state: {
                    resources: {
                        delegatedToOthers: [] as DelegatedResources[],
                        delegatedFromOthers: {},
                        selfStaked: {},
                        loading: [] as string[],
                    },
                },
                getters: {
                    'resources/getDelegatedToOthers': ref([dummieDelegatedResources]),
                    'resources/getDelegatedFromOthers': ref({} as DelegatedResources),
                    'resources/getSelfStaked': ({} as DelegatedResources),
                    'resources/getLoading': ref([dummieString]),
                    'resources/isLoading': ref(false),
                },
                dispatch: (t: string, p?: unknown, o?: DispatchOptions): Promise<unknown> => Promise.resolve(),
            };
            const result = useAntelopeStore();
            const expected = {
                resources: {
                    getDelegatedToOthers: (): DelegatedResources[] => [],
                    getDelegatedFromOthers: (): Ref<DelegatedResources> => ref({} as DelegatedResources),
                    getSelfStaked: (): DelegatedResources => ({} as DelegatedResources),
                    getLoading: (): string[] => [],
                    isLoading: (funcname: string) => false,
                    updateResources: (force?: boolean) => Promise.resolve(),
                    updateSelfStaked: (account: string) => Promise.resolve(),
                    updateDelegatedToOthers: (account: string) => Promise.resolve(),
                    delegateResources: (order: DelegatedResources) => Promise.resolve(),
                    undelegateResources: (order: DelegatedResources) => Promise.resolve(),
                },
                state: {
                    resources: {
                        delegatedToOthers: [] as DelegatedResources[],
                        delegatedFromOthers: {},
                        selfStaked: {},
                        loading: [] as string[],
                    },
                },
                dispatch: (t: string, p?: unknown, o?: DispatchOptions): Promise<unknown> => Promise.resolve(),
            }
            const resultToJSON = JSON.stringify(result);
            const expectedToJSON = JSON.stringify(expected);
            expect(resultToJSON).toEqual(expectedToJSON);
        });
    });

    describe('AntelopeStore.resources API', () => {

        describe('resources.getDelegatedToOthers()', () => {
            it('should return the same as getter: resources/getDelegatedToOthers', () => {
                const store = useAntelopeStore();
                const result = store.resources.getDelegatedToOthers();
                const expected = [dummieDelegatedResources];
                expect(result).toEqual(expected);
            });
        });

        describe('resources.getDelegatedFromOthers()', () => {
            it('should return the same as getter: resources/getDelegatedFromOthers', () => {
                const store = useAntelopeStore();
                const result = store.resources.getDelegatedFromOthers();
                const expected = ref({} as DelegatedResources);
                expect(result).toEqual(expected);
            });
        });

        describe('resources.getSelfStaked()', () => {
            it('should return the same as getter: resources/getSelfStaked', () => {
                const store = useAntelopeStore();
                const result = store.resources.getSelfStaked();
                const expected = {} as DelegatedResources;
                expect(result).toEqual(expected);
            });
        });

        describe('resources.getLoading()', () => {
            it('should return the same as getter: resources/getLoading', () => {
                const store = useAntelopeStore();
                const result = store.resources.getLoading();
                const expected = [dummieString];
                expect(result).toEqual(expected);
            });
        });

        describe('resources.isLoading()', () => {
            it('should return the same as getter: resources/isLoading', () => {
                const store = useAntelopeStore();
                const result = store.resources.isLoading(dummieString);
                const expected = true;
                expect(result).toEqual(expected);
            });
        });

        describe('resources.updateResources()', () => {
            it('should dispatch: resources/updateResources', () => {
                const store = useAntelopeStore();
                const result = store.resources.updateResources();
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.updateSelfStaked()', () => {
            it('should dispatch: resources/updateSelfStaked', () => {
                const store = useAntelopeStore();
                const result = store.resources.updateSelfStaked(dummieString);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.updateDelegatedToOthers()', () => {
            it('should dispatch: resources/updateDelegatedToOthers', () => {
                const store = useAntelopeStore();
                const result = store.resources.updateDelegatedToOthers(dummieString);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.delegateResources()', () => {
            it('should dispatch: resources/delegateResources', () => {
                const store = useAntelopeStore();
                const result = store.resources.delegateResources(dummieDelegatedResources);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.undelegateResources()', () => {
            it('should dispatch: resources/undelegateResources', () => {
                const store = useAntelopeStore();
                const result = store.resources.undelegateResources(dummieDelegatedResources);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

    });

});
