import { route } from 'quasar/wrappers';
import { createRouter, createWebHistory } from 'vue-router';
import { StateInterface } from 'src/store';
import routes from 'src/router/routes';
import ConfigManager from 'src/config/ConfigManager';
import { computed, reactive } from 'vue';

const configMgr = ConfigManager.get();

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const routeData = reactive({ network: '' });

export default route<StateInterface>(function (/* { store, ssrContext } */) {
    const createHistory = createWebHistory;
    const Router = createRouter({
        routes,

        // Leave this as is and make changes in quasar.conf.js instead!
        // quasar.conf.js -> build -> vueRouterMode
        // quasar.conf.js -> build -> publicPath
        history: createHistory(process.env.VUE_ROUTER_BASE),
    });

    Router.beforeEach((to, from) => {
        const chains = configMgr.getAllChains();
        const selectedChainOnStore = localStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE);
        console.log(to);
        if (!to.query.network) { // if doesn't have network param
            console.log('if doesn\'t have network param');
            if (selectedChainOnStore) { // if has a chain selected on sotre
                console.log('if has a chain selected on sotre');
                routeData.network = selectedChainOnStore;
                return ({
                    ...to,
                    query: {
                        ...to.query,
                        network: selectedChainOnStore,
                    },
                });
            } else { // if doesn't have chain selected on store, attempt to get telos, if not find, get the first one
                const chain = chains.filter(chain => chain.getName() === 'telos')[0] ?? chains[0];
                configMgr.setCurrentChain(chain);
                routeData.network = selectedChainOnStore;
                return ({
                    ...to,
                    query: {
                        ...to.query,
                        network: chain.getName(),
                    },
                });
            }
        } else if (chains.filter(chain => chain.getName() === to.query.network).length === 0) { // check if the network is not part of the system
            const chain = chains.filter(chain => chain.getName() === 'telos')[0] ?? chains[0]; // attempt to get telos network or the first one
            configMgr.setCurrentChain(chain);
            routeData.network = chain.getName();
            return ({
                ...to,
                query: {
                    ...to.query,
                    network: chain.getName(),
                },
            });
        } else if ((from.query.network && from.query.network !== to.query.network) || selectedChainOnStore !== to.query.network) { // if i'm changing from network
            console.log('changing network');
            console.log(selectedChainOnStore);
            console.log(from);
            const chain = chains.filter(chain => chain.getName() === to.query.network)[0];
            routeData.network = chain.getName();
            configMgr.setCurrentChain(chain);
        } else {
            console.log('else');
        }

    });

    return Router;
});

export function useRouteDataNetwork() {
    return computed(() => routeData.network);
}
