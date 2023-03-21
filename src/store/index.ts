import { store } from 'quasar/wrappers';
import { InjectionKey } from 'vue';
import {
    createStore,
    Store as VuexStore,
    useStore as vuexUseStore,
} from 'vuex';

import { contract } from 'src/store/contract';
import { ContractStateInterface } from 'src/store/contract/state';
import { chain } from 'src/store/chain';
import { ChainStateInterface } from 'src/store/chain/state';
import { account } from 'src/store/account';
import { AccountStateInterface } from 'src/store/account/state';
import { transaction } from 'src/store/transaction';
import { TransactionStateInterface } from 'src/store/transaction/state';
import { resources } from 'src/store/resources';
import { ResourcesStateInterface } from 'src/store/resources/state';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StateInterface {
    // Define your own store structure, using submodules if needed
    contract: ContractStateInterface;
    chain: ChainStateInterface;
    account: AccountStateInterface;
    transaction: TransactionStateInterface;
    resources: ResourcesStateInterface;
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: VuexStore<StateInterface>;
    }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> =
    Symbol('vuex-key');

export default store(function () {
    const Store = createStore<StateInterface>({
        modules: {
            contract,
            chain,
            account,
            transaction,
            resources,
        },

        // enable strict mode (adds overhead!)
        // for dev mode and --debug builds only
        strict: !!process.env.DEBUGGING,
    });
    return Store;
});

export function useStore() {
    return vuexUseStore(storeKey);
}
