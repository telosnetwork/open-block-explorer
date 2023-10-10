import { Authenticator } from 'universal-authenticator-library';
import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { AccountStateInterface } from 'src/store/account/state';
import { api } from 'src/api/index';
import { Action, GetTableRowsParams, RexbalRows, RexPoolRows } from 'src/types';
import { TableIndexType } from 'src/types/Api';
import { getChain } from 'src/config/ConfigManager';
import { FuelUserWrapper } from 'src/api/fuel';
import { formatCurrency } from 'src/utils/string-utils';

const chain = getChain();
const symbol = chain.getSystemToken().symbol;

export const actions: ActionTree<AccountStateInterface, StateInterface> = {
    async login({ commit }, { account, authenticator }) {
        await (authenticator as Authenticator).init();
        if (!account) {
            const requestAccount = await (
                authenticator as Authenticator
            ).shouldRequestAccountName();
            if (requestAccount) {
                commit('setRequestAccount', true);
                return;
            }
        }
        const users = await (authenticator as Authenticator).login();
        if (users?.length) {
            const account = new FuelUserWrapper(users[0]);
            const permission = (account as unknown as { requestPermission: string })
                .requestPermission;
            const accountName = await account.getAccountName();

            commit('setAccountPermission', permission || 'active');
            commit('setUser', account);
            commit('setIsAuthenticated', true);
            commit('setAccountName', accountName);
            commit('setChainId', (authenticator as Authenticator).chains[0].chainId);

            localStorage.setItem(`account_${(authenticator as Authenticator).chains[0].chainId}`, accountName);
            localStorage.setItem(
                `autoLogin_${(authenticator as Authenticator).chains[0].chainId}`,
                (authenticator as Authenticator).getName(),
            );
        }
    },
    logout({ commit, state }) {
        commit('setIsAuthenticated', false);
        commit('setAccountName', '');
        commit('setUser', null);

        localStorage.removeItem(`account_${state.chainId}`);
        localStorage.removeItem(`autoLogin_${state.chainId}`);
    },
    async loadAccountData({ commit, state }) {
        try {
            const data = await api.getAccount(state.accountName);
            commit('setAccountData', data);
        } catch (e) {
            return;
        }
    },
    async updateRexData({ commit }, { account }) {
        const paramsrexbal = {
            code: 'eosio',
            limit: '2',
            lower_bound: account as TableIndexType,
            scope: 'eosio',
            table: 'rexbal',
            reverse: false,
            upper_bound: account as TableIndexType,
        } as GetTableRowsParams;
        const rexbalRows = (await api.getTableRows(paramsrexbal)) as RexbalRows;
        const paramsrexpool = {
            code: 'eosio',
            scope: 'eosio',
            table: 'rexpool',
            json: true,
            reverse: false,
        } as GetTableRowsParams;
        const rexpool = ((await api.getTableRows(paramsrexpool)) as RexPoolRows)
            .rows[0];
        const paramsrexfund = {
            code: 'eosio',
            limit: '1',
            lower_bound: account as TableIndexType,
            scope: 'eosio',
            table: 'rexfund',
            reverse: false,
            upper_bound: account as TableIndexType,
        } as GetTableRowsParams;
        const rexfund = (
            (await api.getTableRows(paramsrexfund)) as {
                rows: {
                owner: string;
                balance: string;
                }[];
            }
        ).rows[0];
        const rexFundBalance =
            rexfund?.balance ? Number(rexfund.balance.split(' ')[0]) : 0.0;
        commit('setRexFund', rexFundBalance);
        const rexbal = rexbalRows.rows[0];
        const rexBalance =
            rexbal && rexbal.rex_balance
                ? parseFloat(rexbal.rex_balance.split(' ')[0])
                : 0;
        const totalRex = Number(rexpool.total_rex.split(' ')[0]);
        const totalLendable = Number(rexpool.total_lendable.split(' ')[0]);
        const tlosRexRatio = totalRex > 0 ? totalLendable / totalRex : 1;
        commit('setTlosRexRatio', tlosRexRatio);
        let coreBalance = totalRex > 0 ? tlosRexRatio * rexBalance : 0.0;
        coreBalance += rexFundBalance;

        let savingsRex = 0;
        let maturedRex = rexbal
            ? tlosRexRatio * (Number(rexbal.matured_rex) / 10000)
            : 0;
        let maturingRex = 0;
        if (rexbal && rexbal.rex_maturities && rexbal.rex_maturities.length > 0) {
            const thisYear = new Date().getFullYear();
            const now = new Date().getTime();
            rexbal.rex_maturities.forEach((maturity) => {
                const maturityYear = new Date(maturity.first).getFullYear();
                const maturityTime = new Date(maturity.first).getTime();
                if (maturityYear - thisYear > 1) {
                    savingsRex = tlosRexRatio * (Number(maturity.second) / 10000);
                } else if (maturityTime - now < 0) {
                    maturedRex += tlosRexRatio * (Number(maturity.second) / 10000);
                } else {
                    maturingRex = tlosRexRatio * (Number(maturity.second) / 10000);
                }
            });
        }

        if (rexbalRows.rows.length > 0) {
            commit('setRexbal', {
                rexbal: rexbalRows.rows[0],
                coreBalance,
                maturingRex,
                savingsRex,
                maturedRex,
            });
        }
        const filter = [
            'eosio:sellrex',
            'eosio:buyrex',
            'eosio:deposit',
            'eosio:withdraw',
            'eosio:unstaketorex',
            'eosio:cnclrexorder',
            'eosio:rentcpu',
            'eosio:rentnet',
            'eosio:fundcpuloan',
            'eosio:fundnetloan',
            'eosio:defcpuloan',
            'eosio:defnetloan',
            'eosio:updaterex',
            'eosio:consolidate',
            'eosio:closerex',
            'eosio:mvfrsavings',
            'eosio:mvtosavings',
            'eosio:rexexec',
        ].join(',');
        const rexActions = (await api.getActions(account, filter)).actions;
        commit('setRexActions', rexActions);
    },
    async sendAction({ state, dispatch }, { account, data, name, actor, permission }) {
        const actions = [
            {
                account: account as string ?? state.abi.account_name,
                name: name as string,
                authorization: [
                    {
                        actor: actor as string ?? state.accountName,
                        permission: permission as string ?? state.accountPermission,
                    },
                ],
                data: data as unknown,
            },
        ];
        return dispatch('sendTransaction', actions);
    },
    async sendTransaction({ commit, state }, actions: Action[]) {
        let transaction = null;
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
        } catch (e) {
            console.error(e);
            commit('setTransactionError', e);
        }
        return transaction;
    },
    async stakeRex({ commit, dispatch, state }, { amount }) {
        let transaction = null;
        const quantityStr = formatCurrency(amount, 4, symbol, true);
        const actions = [
            {
                account: 'eosio',
                name: 'deposit',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    owner: state.accountName,
                    amount: quantityStr,
                },
            },
            {
                account: 'eosio',
                name: 'buyrex',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    from: state.accountName,
                    amount: quantityStr,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
            void dispatch('updateRexData', { account: state.accountName });
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async unstakeRex({ commit, dispatch, state }, { amount }) {
        let transaction = null;
        const tokenRexBalance = state.rexbal.rex_balance
            ? Number(state.rexbal.rex_balance.split(' ')[0])
            : 0;
        if (tokenRexBalance === 0) {
            return;
        }
        const quantityStr = formatCurrency(amount, 4, symbol, true);
        const rexToUnstake = formatCurrency(+amount / state.tlosRexRatio, 4, null, true);

        //   TODO check maturities
        const actions = [
            {
                account: 'eosio',
                name: 'sellrex',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    from: state.accountName,
                    rex: `${rexToUnstake} REX`,
                },
            },
            {
                account: 'eosio',
                name: 'withdraw',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    owner: state.accountName,
                    amount: quantityStr,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
            void dispatch('updateRexData', { account: state.accountName });
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async unstakeRexFund({ commit, state }, { amount }) {
        let transaction = null;
        const quantityStr = formatCurrency(amount, 4, symbol, true);

        const actions = [
            {
                account: 'eosio',
                name: 'withdraw',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    owner: state.accountName,
                    amount: quantityStr,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async stakeCpuNetRex({ commit, dispatch, state }, { cpuAmount, netAmount }) {
        let transaction = null;
        const quantityStrCPU = formatCurrency(cpuAmount, 4, symbol, true);
        const quantityStrNET = formatCurrency(netAmount, 4, symbol, true);
        const actions = [
            {
                account: 'eosio',
                name: 'unstaketorex',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    owner: state.accountName,
                    receiver: state.accountName,
                    from_net: quantityStrNET,
                    from_cpu: quantityStrCPU,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
            void dispatch('updateRexData', { account: state.accountName });
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async unstakeCpuNetRex({ commit, dispatch, state }, { cpuAmount, netAmount }) {
        let transaction = null;
        const quantityStrCPU = formatCurrency(cpuAmount, 4, symbol, true);
        const quantityStrNET = formatCurrency(netAmount, 4, symbol, true);
        const actions = [
            {
                account: 'eosio',
                name: 'stakefromrex',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    owner: state.accountName,
                    receiver: state.accountName,
                    from_net: quantityStrNET,
                    from_cpu: quantityStrCPU,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
            void dispatch('updateRexData', { account: state.accountName });
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    resetTransaction({ commit }) {
        commit('setTransaction', '');
        commit('setTransactionError', '');
    },
    async updateABI({ commit }, account: string) {
        const abi = await api.getABI(account);
        commit('setABI', abi);
    },
    async sendVoteTransaction({ commit, state }) {
        let transaction = null;
        const actions = [
            {
                account: 'eosio',
                name: 'voteproducer',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    voter: state.accountName,
                    proxy: '',
                    producers: state.vote,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async buyRam({ commit, dispatch, state }, { amount, receivingAccount }) {
        let transaction = null;
        const actions = [
            {
                account: 'eosio',
                name: 'buyram',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    payer: state.accountName,
                    receiver: receivingAccount as string,
                    quant: amount as string,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async buyRamBytes({ commit, dispatch, state }, { amount, receivingAccount }) {
        let transaction = null;
        const actions = [
            {
                account: 'eosio',
                name: 'buyrambytes',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    payer: state.accountName,
                    receiver: receivingAccount as string,
                    bytes: amount as string,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async sellRam({ commit, dispatch, state }, { amount }) {
        let transaction = null;
        const actions = [
            {
                account: 'eosio',
                name: 'sellram',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    account: state.accountName,
                    bytes: amount as string,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async moveToSavings({ commit, dispatch, state }, { amount }) {
        let transaction = null;
        const rexToUnstake = formatCurrency((+amount / state.tlosRexRatio), 4, 'REX', true);
        const actions = [
            {
                account: 'eosio',
                name: 'mvtosavings',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    owner: state.accountName,
                    rex: rexToUnstake,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
            void dispatch('updateRexData', { account: state.accountName });
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
    async moveFromSavings({ commit, dispatch, state }, { amount }) {
        let transaction = null;
        const rexToUnstake = formatCurrency((+amount / state.tlosRexRatio), 4, 'REX', true);

        const actions = [
            {
                account: 'eosio',
                name: 'mvfrsavings',
                authorization: [
                    {
                        actor: state.accountName,
                        permission: state.accountPermission,
                    },
                ],
                data: {
                    owner: state.accountName,
                    rex: rexToUnstake,
                },
            },
        ];
        try {
            transaction = await state.user.signTransaction(
                {
                    actions,
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 180,
                },
            );
            commit('setTransaction', transaction.transactionId);
            void dispatch('loadAccountData');
            void dispatch('updateRexData', { account: state.accountName });
        } catch (e) {
            commit('setTransactionError', e);
        }
    },
};
