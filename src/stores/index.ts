import { store } from 'quasar/wrappers';



import { ContractStateInterface } from 'src/stores/contract';
import { ChainStateInterface } from 'src/stores/chain';
import { AccountStateInterface } from 'src/stores/account';
import { TransactionStateInterface } from 'src/stores/transaction';
import { ResourcesStateInterface } from 'src/stores/resources';
import { createPinia } from 'pinia';

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

export default store(() => createPinia());
