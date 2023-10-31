import { defineStore } from 'pinia';
import { formatCurrency } from 'src/utils/string-utils';
import { Action, GetTableRowsParams } from 'src/types';
import { api } from 'src/api';
import { useAccountStore } from 'src/stores/account';
import { getChain } from 'src/config/ConfigManager';

export interface DelegatedResources {
    from: string
    to: string
    net_weight: string
    cpu_weight: string
    transfer?: boolean
}


export interface ResourcesStateInterface {
    currentAccount: string;
    toOthers: DelegatedResources[];
    toOthersAggregated: number;
    fromOthers: DelegatedResources | null;
    selfStaked: DelegatedResources | null;
    loading: string[];
    forceUpdate: boolean;
}

const chain = getChain();
const symbol = chain.getSystemToken().symbol;
const precision = chain.getSystemToken().precision;


export const useResourceStore = defineStore('resource', {
    state: (): ResourcesStateInterface => ({
        currentAccount: '',
        toOthers: [],
        toOthersAggregated: 0,
        fromOthers: null,
        selfStaked: null,
        loading: [],
        forceUpdate: false,
    }),
    getters: {
        // get list of delegates resources to other accounts
        getDelegatedToOthers(store: ResourcesStateInterface): DelegatedResources[] {
            return store.toOthers ?? [];
        },

        // get list of delegates resources to other accounts
        getDelegatedToOthersAggregated(store: ResourcesStateInterface): number {
            return store.toOthersAggregated ?? 0;
        },

        // get list of delegates resources from other accounts
        getDelegatedFromOthers(store: ResourcesStateInterface): DelegatedResources | null {
            return store.fromOthers;
        },

        // get list of self staked resources
        getSelfStaked(store: ResourcesStateInterface): DelegatedResources | null {
            return store.selfStaked;
        },

        getLoading(store: ResourcesStateInterface): string[] {
            return store.loading;
        },

        // is loading function name
        isLoading(store: ResourcesStateInterface): (name: string) => boolean {
            return (name: string) => store.loading.includes(name);
        },
    },
    actions: {
        setCurrentAccount(account: string) {
            this.currentAccount = account;
        },

        setDelegatedFromOthers(delegated: DelegatedResources) {
            this.fromOthers = delegated;
        },

        setDelegatedToOthers(delegated: DelegatedResources[]) {
            this.toOthers = delegated;
        },

        setDelegatedToOthersAggregated(aggregated: number) {
            this.toOthersAggregated = aggregated;
        },

        setSelfStaked(delegated: DelegatedResources) {
            this.selfStaked = delegated;
        },

        setLoading(label: string) {
            // add label to loading array but only if it's not already there
            if (!this.loading.includes(label)) {
                this.loading.push(label);
            }
        },

        unsetLoading(label: string) {
            // remove label from loading array
            this.loading = this.loading.filter(l => l !== label);
        },

        setForceUpdate(forceUpdate: boolean) {
            this.forceUpdate = forceUpdate;
        },

        async updateResources({ account, force }: {account?:string, force?: boolean}) {
            const accountStore = useAccountStore();

            const currentAccount = (account) ?? (accountStore.accountName);
            try {
                this.setLoading('updateResources');
                this.setForceUpdate(force);
                if (
                    this.currentAccount !== currentAccount ||
                    !accountStore.data ||
                    force
                ) {
                    // dispatch updateSelfStaked and updateDelegatedToOthers actions in parallel awaiting for both to finish
                    await Promise.all([
                        this.updateSelfStaked(currentAccount),
                        this.updateDelegatedToOthers(currentAccount),
                    ]);
                    this.setCurrentAccount(currentAccount);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                this.setForceUpdate(false);
                this.unsetLoading('updateResources');
            }
        },

        // self staked resources actions
        async updateSelfStaked(account: string) {
            const accountStore = useAccountStore();

            try {
                this.setLoading('updateSelfStaked');
                if (
                    this.currentAccount !== account ||
                    this.selfStaked?.from !== account ||
                    this.selfStaked?.to !== account ||
                    this.forceUpdate
                ) {
                    // dispatch loadAccountData action from account module
                    await accountStore.loadAccountData();
                }

                const accountData = accountStore.data;

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

                this.setDelegatedFromOthers(fromOthers);
                this.setSelfStaked(selfStaked);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                this.unsetLoading('updateSelfStaked');
            }
        },

        // delegated resources actions
        async updateDelegatedToOthers(account: string) {
            try {
                this.setLoading('updateDelegatedToOthers');

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

                this.setCurrentAccount(account);
                this.setDelegatedToOthers(delegated);
                this.setDelegatedToOthersAggregated(totalDelegatedToOthers);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                this.unsetLoading('updateDelegatedToOthers');
            }
        },
        async delegateResources(order: DelegatedResources) {
            const accountStore = useAccountStore();
            const { from, to, net_weight, cpu_weight } = order;

            // create two actions, one for the delegatebw and one for the transfer
            try {
                this.setLoading('delegateResources');

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

                await accountStore.sendTransaction(actions as Action[]);
                await this.updateResources({ account:from, force: true });
            } catch (e) {
                accountStore.setTransactionError(e);
            } finally {
                this.unsetLoading('delegateResources');
            }
        },
        async undelegateResources(order: DelegatedResources) {
            const accountStore = useAccountStore();
            const { from, to, net_weight, cpu_weight } = order;

            // create two actions, one for the delegatebw and one for the transfer
            try {
                this.setLoading('undelegateResources');

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
                await accountStore.sendTransaction(actions as Action[]);
                await this.updateResources({ account:from, force: true });
            } catch (e) {
                console.error('Error', e);
            } finally {
                this.unsetLoading('undelegateResources');
            }
        },

        // reset interlaced data when there's no logged in account
        resetResources() {
            this.setDelegatedFromOthers(null);
            this.setDelegatedToOthers([]);
            this.setSelfStaked(null);
        },
    },
});

