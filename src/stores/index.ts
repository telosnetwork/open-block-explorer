import { store } from 'quasar/wrappers';



import { createPinia } from 'pinia';
import { AccountStateInterface } from 'src/stores/account';
import { ChainStateInterface } from 'src/stores/chain';
import { ContractStateInterface } from 'src/stores/contract';
import { NetworksStateInterface } from 'src/stores/networks';
import { ResourcesStateInterface } from 'src/stores/resources';
import { TransactionStateInterface } from 'src/stores/transaction';

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
    networks: NetworksStateInterface;
}

export default store(() => createPinia());
