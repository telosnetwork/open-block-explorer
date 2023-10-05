import { route } from 'quasar/wrappers';
import { createRouter, createWebHistory } from 'vue-router';
import { StateInterface } from 'src/store';
import routes from 'src/router/routes';
import ConfigManager from 'src/config/ConfigManager';
import { ComputedRef, computed, reactive } from 'vue';

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

const updateSelectedChain = (chainName: string) => {
    const chains = configMgr.getAllChains();
    const chain = chains.filter(chain => chain.getName() === chainName)[0];
    routeData.network = chain.getName();
    configMgr.setCurrentChain(chain);
};

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
        const selectedChainOnStore = sessionStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE);
        const preferredChainName = configMgr.getPreferredChain();
        const isMultichain = process.env.SHOW_MULTICHAIN_SELECTOR === 'true';

        if(isMultichain) {
            if (to.path === '/') { // if attempting to go to home page
                if (to.query.network) { // if there is network param, proceed to network with the param
                    return ({
                        path: 'network',
                        query: to.query,
                    });
                } else if (selectedChainOnStore) { // if there is no network param and local storage has current network
                    return ({
                        path: 'network',
                        query: {
                            network: selectedChainOnStore,
                        },
                    });
                } else if (preferredChainName) { // if there is no network param and local storage has preferred network selected
                    updateSelectedChain(preferredChainName);
                    return ({
                        path: 'network',
                        query: {
                            network: preferredChainName,
                        },
                    });
                }
                // else, will proceed to home page
            } else {
                if (!to.query.network) { // if doesn't have network param
                    if (selectedChainOnStore) {
                        return ({
                            ...to,
                            query: {
                                ...to.query,
                                network: selectedChainOnStore,
                            },
                        });
                    } else if (preferredChainName) { // if has a preferred chain selected on sotre
                        updateSelectedChain(preferredChainName);
                        return ({
                            ...to,
                            query: {
                                ...to.query,
                                network: preferredChainName,
                            },
                        });
                    } else { // if doesn't have a preferred chain selected on store, go to home page (landing page)
                        return ({
                            path: '/',
                        });
                    }
                } else if (chains.filter(chain => chain.getName() === to.query.network).length === 0) { // check if the network is not part of the system
                    if (preferredChainName) { // if has a preferred chain selected on sotre
                        updateSelectedChain(preferredChainName);
                        return ({
                            ...to,
                            query: {
                                ...to.query,
                                network: preferredChainName,
                            },
                        });
                    } else { // if doesn't have a preferred chain selected on store, go to home page (landing page)
                        return ({
                            path: '/',
                        });
                    }
                } else if ((from.query.network && from.query.network !== to.query.network) || selectedChainOnStore !== to.query.network) { // if i'm changing from network
                    updateSelectedChain(Array.isArray(to.query.network) ? to.query.network[0] : to.query.network);
                    setTimeout(() => location.reload(), 500);
                }
            }
        }
    });

    return Router;
});

export function useRouteDataNetwork(): ComputedRef<string> {
    return computed(() => routeData.network);
}
