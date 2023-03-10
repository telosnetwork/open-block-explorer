/* eslint-disable */
import { AntelopeStore, useAntelopeStore } from 'src/store/antelope.store';
import { DelegatedResources, ResourcesStateInterface } from 'src/store/resources/state';
import { Ref, ref } from 'vue';
import { DispatchOptions } from 'vuex';


const testDelegatedResources: DelegatedResources = {
    from: 'from',
    to: 'to',
    net_weight: 'net_weight',
    cpu_weight: 'cpu_weight',
}

const testString: string = 'test';

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
            'resources/getDelegatedToOthers': [testDelegatedResources],
            'resources/getDelegatedFromOthers': ref({} as DelegatedResources),
            'resources/getSelfStaked': ({} as DelegatedResources),
            'resources/getLoading': [testString],
            'resources/isLoading': (funcname: string) => [funcname].includes(testString),
        },
        dispatch: (t: string, p?: unknown, o?: DispatchOptions): Promise<unknown> => Promise.resolve(),
    }),
}));

describe('AntilopeStore', () => {
    let store: AntelopeStore;

    beforeEach(() => {
        store = useAntelopeStore();
    });

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
                    'resources/getDelegatedToOthers': ref([testDelegatedResources]),
                    'resources/getDelegatedFromOthers': ref({} as DelegatedResources),
                    'resources/getSelfStaked': ({} as DelegatedResources),
                    'resources/getLoading': ref([testString]),
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
                const result = store.resources.getDelegatedToOthers();
                const expected = [testDelegatedResources];
                expect(result).toEqual(expected);
            });
        });

        describe('resources.getDelegatedFromOthers()', () => {
            it('should return the same as getter: resources/getDelegatedFromOthers', () => {
                const result = store.resources.getDelegatedFromOthers();
                const expected = ref({} as DelegatedResources);
                expect(result).toEqual(expected);
            });
        });

        describe('resources.getSelfStaked()', () => {
            it('should return the same as getter: resources/getSelfStaked', () => {
                const result = store.resources.getSelfStaked();
                const expected = {} as DelegatedResources;
                expect(result).toEqual(expected);
            });
        });

        describe('resources.getLoading()', () => {
            it('should return the same as getter: resources/getLoading', () => {
                const result = store.resources.getLoading();
                const expected = [testString];
                expect(result).toEqual(expected);
            });
        });

        describe('resources.isLoading()', () => {
            it('should return the same as getter: resources/isLoading', () => {
                const result = store.resources.isLoading(testString);
                const expected = true;
                expect(result).toEqual(expected);
            });
        });

        describe('resources.updateResources()', () => {
            it('should dispatch: resources/updateResources', () => {
                const result = store.resources.updateResources();
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.updateSelfStaked()', () => {
            it('should dispatch: resources/updateSelfStaked', () => {
                const result = store.resources.updateSelfStaked(testString);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.updateDelegatedToOthers()', () => {
            it('should dispatch: resources/updateDelegatedToOthers', () => {
                const result = store.resources.updateDelegatedToOthers(testString);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.delegateResources()', () => {
            it('should dispatch: resources/delegateResources', () => {
                const result = store.resources.delegateResources(testDelegatedResources);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

        describe('resources.undelegateResources()', () => {
            it('should dispatch: resources/undelegateResources', () => {
                const result = store.resources.undelegateResources(testDelegatedResources);
                const expected = Promise.resolve();
                expect(result).toEqual(expected);
            });
        });

    });

});
