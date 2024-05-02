import { route } from 'quasar/wrappers';
import routes from 'src/router/routes';
import { StateInterface } from 'src/stores';
import { useNetworksStore } from 'src/stores/networks';
import { createRouter, createWebHistory } from 'vue-router';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route<StateInterface>(function (/* { store, ssrContext } */) {
    const networksStore = useNetworksStore();
    const createHistory = createWebHistory;

    const Router = createRouter({
        routes,

        // Leave this as is and make changes in quasar.conf.js instead!
        // quasar.conf.js -> build -> vueRouterMode
        // quasar.conf.js -> build -> publicPath
        history: createHistory(process.env.VUE_ROUTER_BASE),
    });

    const updateNetwork = (name: string) => {
        const isUpdated = networksStore.updateCurrentNetwork(name);

        if (!isUpdated) {
            console.error(`Network ${name} is not supported`);
        }
    };

    /* Global router guard intention
    * When dealing with multiple chains, we need to make sure user is properly redirected.
    * Here are the scenarios:
    *
    * When user specifies a network, but the network is not supported
    *   they should be redirected to the network selection page (Home)
    *
    * When user specified a network and it is supported
    * and its path is the '/' (Home)
    *   the current network must be updated (in case it's different from currentChainName)
    *   and they should be redirected to /network
    *
    * When user specified a network and it is supported
    * and its path is not '/' (Home)
    *   the current network must be updated (in case it's different from currentChainName)
    *   and the path should not be changed
    *
    * When network is not specified, but currentNetworkName is
    * and its path is the '/' (Home)
    *   we redirect the user to /network
    *   with currentNetworkName as network
    *
    * When network is not specified, but currentNetworkName is
    * and its path is not '/' (Home)
    *   we redirect the user to same path
    *   with currentNetworkName as network
    *
    * When network is not specified, but preferredNetworkName is
    * and its path is the '/' (Home)
    *   we update currentNetworkName
    *   we redirect the user to /network
    *   with currentNetworkName as network
    *
    * When network is not specified, but preferredNetworkName is
    * and its path is not '/' (Home)
    *   we update currentNetworkName
    *   we redirect the user to same path
    *   with currentNetworkName as network
    *
    * When network is not specified, and neither preferredNetworkName and currentNetworkName are
    *  we redirect the user to '/' (Home), where preferredNetworkName is selected
    *
    * note: validity of currentChainName and preferredChainName have already
    * been guarateed on networkStore.setupNetworks()
    */

    Router.beforeEach((to, from) => {
        if(networksStore.networks.length > 1) {
            // Route only needs to be handled in case of multiple networks
            if(
                to.meta.needsNetwork === true &&
                networksStore.preferredNetworkName === ''
            ) {
                // Preferred network needs to be defined
                // Either network was not specified or it is not supported
                return;
            }

            if (to.query.network) {
                // if network is specified
                const toNetwork = Array.isArray(to.query.network) ? to.query.network[0] : to.query.network;
                const isNetworkSupported = networksStore.isNetworkSupported(toNetwork);

                if (isNetworkSupported) {
                    if (toNetwork !== networksStore.currentNetworkName) {
                        // We'll update the current network when the specified network is supported
                        updateNetwork(toNetwork);
                    }

                    if (to.path === '/') {
                        // When path is not specified
                        // Redirects to the network main page
                        return ({
                            path: 'network',
                            query: to.query,
                        });
                    } else {
                        // The network is valid and we don't need to redirect
                        // We'll allow the original path
                        return;
                    }
                } else {
                    // redirects to manually select the chain
                    return ({
                        path: '/',
                        meta: {
                            needsNetwork: true,
                        },
                    });
                }

            } else {
                if (networksStore.currentNetworkName && networksStore.currentNetworkName !== '') {
                    const path = to.path === '/' ? 'network' : to.path;
                    return ({
                        path,
                        query: {
                            network: String(networksStore.currentNetworkName),
                        },
                    });
                }
                if (networksStore.preferredNetworkName && networksStore.preferredNetworkName !== '') {
                    updateNetwork(networksStore.preferredNetworkName);
                    const path = to.path === '/' ? 'network' : to.path;
                    return ({
                        path,
                        query: {
                            network: String(networksStore.preferredNetworkName),
                        },
                        meta: {
                            needsNetwork: false,
                        },
                    });
                }

                return ({
                    path: '/',
                    meta: {
                        needsNetwork: true,
                    },
                });
            }
        }
    });

    Router.afterEach((to, from) => {
        if(networksStore.networks.length > 1) {
            if(to.meta.needsNetwork && networksStore.preferredNetworkName !== '') {
                to.meta.needsNetwork = false;
            }
        }
    });

    return Router;
});

