import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { DelegatedResources, ResourcesStateInterface } from 'src/store/resources/state';
import { GetTableRowsParams } from 'src/types';
import { api } from 'src/api';
import { getChain } from 'src/config/ConfigManager';
import { formatCurrency } from 'src/utils/string-utils';

const chain = getChain();
const symbol = chain.getSystemToken().symbol;
const precision = chain.getSystemToken().precision;

export const actions: ActionTree<ResourcesStateInterface, StateInterface> = {

    // general update action to assert all resources related data is loaded for the current account
    async updateResources(store, { account, force }) {
        const currentAccount = (account as string) ?? (store.rootState.account.accountName);
        try {
            store.commit('setLoading', 'updateResources');
            store.commit('setForceUpdate', force);
            if (
                store.state.currentAccount !== currentAccount ||
                !store.rootState.account.data ||
                force
            ) {
                // dispatch updateSelfStaked and updateDelegatedToOthers actions in parallel awaiting for both to finish
                await Promise.all([
                    store.dispatch('updateSelfStaked', currentAccount),
                    store.dispatch('updateDelegatedToOthers', currentAccount),
                ]);
                store.commit('setCurrentAccount', currentAccount);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            store.commit('setForceUpdate', false);
            store.commit('unsetLoading', 'updateResources');
        }
    },

    // self staked resources actions
    async updateSelfStaked(store, account: string) {
        try {
            store.commit('setLoading', 'updateSelfStaked');
            if (
                store.state.currentAccount !== account ||
                store.state.selfStaked?.from !== account ||
                store.state.selfStaked?.to !== account ||
                store.state.forceUpdate
            ) {
                // dispatch loadAccountData action from account module
                await store.dispatch('account/loadAccountData', account, { root: true });
            }

            const accountData = store.rootState.account.data;

            // self staked resources
            const self_net_weight = Number(accountData.self_delegated_bandwidth?.net_weight.value ?? 0);
            const self_cpu_weight = Number(accountData.self_delegated_bandwidth?.cpu_weight.value ?? 0);

            const self_net_asset = formatCurrency(self_net_weight, precision, symbol, true);
            const self_cpu_asset = formatCurrency(self_cpu_weight, precision, symbol, true);

            const selfStaked: DelegatedResources = {
                from: account,
                to: account,
                net_weight: self_net_asset,
                cpu_weight: self_cpu_asset,
            };

            // total staked resources
            const total_net_weight = Number(accountData.net_weight?.value ?? 0) / Math.pow(10, precision);
            const total_cpu_weight = Number(accountData.cpu_weight?.value ?? 0) / Math.pow(10, precision);

            // resources delegated from others
            const from_others_net_weight = total_net_weight - self_net_weight;
            const from_others_cpu_weight = total_cpu_weight - self_cpu_weight;

            const from_others_net_asset = formatCurrency(from_others_net_weight, precision, symbol, true);
            const from_others_cpu_asset = formatCurrency(from_others_cpu_weight, precision, symbol, true);

            const fromOthers: DelegatedResources = {
                from: 'not-available',
                to: account,
                net_weight: from_others_net_asset,
                cpu_weight: from_others_cpu_asset,
            };

            store.commit('setDelegatedFromOthers', fromOthers);
            store.commit('setSelfStaked', selfStaked);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            store.commit('unsetLoading', 'updateSelfStaked');
        }
    },

    // delegated resources actions
    async updateDelegatedToOthers({ commit }, account: string) {
        try {
            commit('setLoading', 'updateDelegatedToOthers');

            const paramsdelband = {
                code: 'eosio',
                limit: '200',
                scope: account,
                table: 'delband',
            } as GetTableRowsParams;

            const delegated = (
                (await api.getTableRows(paramsdelband)) as {
                    rows: DelegatedResources[];
                }
            ).rows;

            const delegatedToOthers = delegated.filter(item => item.to !== account);
            const delegatedToOthersNet = delegatedToOthers.reduce(
                (acc, item) => acc + parseFloat(item.net_weight),
                0,
            );
            const delegatedToOthersCpu = delegatedToOthers.reduce(
                (acc, item) => acc + parseFloat(item.cpu_weight),
                0,
            );
            const totalDelegatedToOthers = delegatedToOthersCpu + delegatedToOthersNet;

            commit('setCurrentAccount', account);
            commit('setDelegatedToOthers', delegated);
            commit('setDelegatedToOthersAggregated', totalDelegatedToOthers);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            commit('unsetLoading', 'updateDelegatedToOthers');
        }
    },
    async delegateResources({ commit, dispatch }, order: DelegatedResources) {
        const { from, to, net_weight, cpu_weight } = order;

        // create two actions, one for the delegatebw and one for the transfer
        try {
            commit('setLoading', 'delegateResources');

            // calculate the total amount
            const amount = Number(net_weight ?? '0') + Number(cpu_weight ?? '0');

            const actions = [
                {
                    account: 'eosio',
                    name: 'delegatebw',
                    authorization: [
                        {
                            actor: from,
                            permission: 'active',
                        },
                    ],
                    data: {
                        from,
                        receiver: to,
                        stake_net_quantity: net_weight,
                        stake_cpu_quantity: cpu_weight,
                        transfer: false,
                        amount,
                    },
                },
            ];

            await dispatch('account/sendTransaction', actions, { root: true });
            await dispatch('updateResources', { account:from, force: true });
        } catch (e) {
            commit('setTransactionError', e);
        } finally {
            commit('unsetLoading', 'delegateResources');
        }
    },
    async undelegateResources({ commit, dispatch }, order: DelegatedResources) {
        const { from, to, net_weight, cpu_weight } = order;

        // create two actions, one for the delegatebw and one for the transfer
        try {
            commit('setLoading', 'undelegateResources');

            const actions = [
                {
                    account: 'eosio',
                    name: 'undelegatebw',
                    authorization: [
                        {
                            actor: from,
                            permission: 'active',
                        },
                    ],
                    data: {
                        from,
                        receiver: to,
                        unstake_net_quantity: net_weight,
                        unstake_cpu_quantity: cpu_weight,
                    },
                },
            ];
            await dispatch('account/sendTransaction', actions, { root: true });
            await dispatch('updateResources', { account:from, force: true });
        } catch (e) {
            console.error('Error', e);
        } finally {
            commit('unsetLoading', 'undelegateResources');
        }
    },

    // reset interlad data when there's no logged in account
    resetResources({ commit }) {
        commit('setDelegatedFromOthers', null);
        commit('setDelegatedToOthers', []);
        commit('setSelfStaked', null);
    },
};

// include all actions in the interface as callable full-typed functions
export interface ResourcesActions {
    updateResources: (payload: {account?:string, force?: boolean}) => Promise<void>;
    updateSelfStaked: (account: string) => Promise<void>;
    updateDelegatedToOthers: (account: string) => Promise<void>;
    delegateResources: (order: DelegatedResources) => Promise<void>;
    undelegateResources: (order: DelegatedResources) => Promise<void>;
}
