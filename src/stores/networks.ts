/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable */
//FIXME: remove eslint-disable

import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { createNetwork } from 'src/config/NetworkFactory';
import { Chain } from 'src/types/Chain';
export interface NetworksStateInterface {
    networks: Chain[],
    currentNetworkName: any,
    preferredNetworkName: any,
}
const CHAIN_LOCAL_STORAGE = 'selectedChainName';
const PREFERRED_CHAIN_LOCAL_STORAGE = 'preferredChainName';
const SUPPORTED_NETWORKS = process.env.SUPPORTED_NETWORKS.split(' ');

export const useNetworksStore = defineStore('networks', {
    state: (): NetworksStateInterface => ({
        networks: [] as Chain[],
        currentNetworkName: useStorage(CHAIN_LOCAL_STORAGE, ''),
        preferredNetworkName: useStorage(PREFERRED_CHAIN_LOCAL_STORAGE, ''),
    }),
    getters: {
        getTestnets(state): Chain[] {
            return state.networks.filter((chain: Chain) => chain.isTestnet() === true) as Chain[];
        },
        getMainnets(state): Chain[] {
            return state.networks.filter((chain: Chain) => chain.isTestnet() === false) as Chain[];
        },
        getCurrentNetwork(state): Chain {
            return state.networks.find((chain: Chain) => chain.getName() === this.currentNetworkName);
        },
    },
    actions: {
        async setupNetworks() {
            const supportedNetworks: Chain[] = [];
            await SUPPORTED_NETWORKS.forEach((networkName: string) => supportedNetworks.push(createNetwork(networkName)));
            this.networks = supportedNetworks;

            let isCurrentNetworkUpdated = false;
            if (this.currentNetworkName) {
                // checks if current network is supported
                const isCurrentNetworkUpdated = this.updateCurrentNetwork(this.currentNetworkName);
                if (!isCurrentNetworkUpdated) {
                    // if network is not supported, we remove it
                    this.currentNetworkName = '';
                }
            }

            if (this.preferredNetworkName) {
                // If there is a preferred network and it is supported, we default to it
                const preferredNetwork = this.networks.find((chain: Chain) => chain.getName() === this.preferredNetworkName);
                if (preferredNetwork) {
                    if (!isCurrentNetworkUpdated) {
                        // currentNetwork wasn't supported, but preferred network is
                        // we'll update the current network with the preferred one
                        this.updateCurrentNetwork(this.preferredNetworkName)
                        isCurrentNetworkUpdated = true;
                    }
                } else {
                    this.preferredNetworkName = ''
                }
            }
        },
        updateCurrentNetwork(name: string): boolean {
            const currentNetwork = this.networks.find((chain: Chain) => chain.getName() === name);
            if (currentNetwork) {
                this.currentNetworkName = currentNetwork.getName();
                return true;
            }
            return false;
        },
        updatePreferredNetwork(name: string) {
            const preferredNetwork = this.networks.find((chain: Chain) => chain.getName() === name);
            if (preferredNetwork) {
                this.preferredNetworkName = preferredNetwork.getName();
                return true;
            }
            return false;
        },
        isNetworkSupported(name: string): boolean {
            return !!this.networks.find((chain: Chain) => chain.getName() === name);
        },
    },
});

/**
 * SUPPORTED_NETWORKS defines all networks we want to show
 * if length > 1, we enable the multichain selector
 * initial state loads all networks
 */
