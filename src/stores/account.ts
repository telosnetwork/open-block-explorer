import { API, Name, ResolvedSigningRequest, Session, UInt64 } from '@wharfkit/session';
import { defineStore } from 'pinia';
import { api } from 'src/api';
import { useNetworksStore } from 'src/stores/networks';
import { Action, Authorization, GetTableRowsParams, Rexbal, RexbalRows, RexPoolRows } from 'src/types';
import { formatCurrency } from 'src/utils/string-utils';
import { markRaw } from 'vue';

export interface AccountStateInterface {
    loading: unknown;
    accountName: string;
    accountPermission: string;
    requestAccount: boolean;
    user: Session;
    isAuthenticated: boolean;
    linkedAccounts: Array<unknown>;
    data: API.v1.AccountObject;
    authorization: Authorization[];
    rexActions: Action[];
    transactionId: string;
    transactionError: unknown;
    rexbal: Rexbal;
    vote: string[];
    abi: API.v1.GetAbiResponse;
    coreRexBalance: string;
    maturingRex: string;
    maturedRex: string;
    savingsRex: string;
    tlosRexRatio: number;
    rexfund: number;
    chainId: string;
}

const networksStore = useNetworksStore();
const { symbol } = networksStore.getCurrentNetwork.getSystemToken();

export const useAccountStore = defineStore('account', {
    state: (): AccountStateInterface => ({
        loading: false,
        accountName: '',
        accountPermission: 'active',
        requestAccount: false,
        user: null,
        isAuthenticated: false,
        linkedAccounts: [],
        data: {
            account_name: '',
            /** Highest block number on the chain */
            // head_block_num: UInt32;
            // /** Highest block unix timestamp. */
            // head_block_time: TimePoint;
            // /** Indicator of if this is a privileged system account */
            // privileged: boolean;
            // /** Last update to accounts contract as unix timestamp. */
            // last_code_update: TimePoint;
            // /** Account created as unix timestamp. */
            // created: TimePoint;
            /** Account core token balance */
            core_liquid_balance: UInt64.from(0),
            ram_quota: UInt64.from(0),
            // net_weight: Int64;
            // cpu_weight: Int64;
            // net_limit: AccountResourceLimit;
            // cpu_limit: AccountResourceLimit;
            ram_usage: UInt64.from(0),
            // permissions: AccountPermission[];
            // total_resources: AccountTotalResources;
            // self_delegated_bandwidth?: AccountSelfDelegatedBandwidth;
            // refund_request?: AccountRefundRequest;
            // voter_info?: AccountVoterInfo;
            // rex_info?: AccountRexInfo;
            // getPermission(permission: NameType): AccountPermission;
        } as unknown as API.v1.AccountObject,

        authorization: [],
        rexActions: [],
        transactionId: '',
        transactionError: '',
        rexbal: {} as Rexbal,
        vote: [],
        abi: { account_name: '', abi: null } as API.v1.GetAbiResponse,
        coreRexBalance: `0 ${symbol}`,
        maturingRex: `0 ${symbol}`,
        maturedRex: `0 ${symbol}`,
        savingsRex: `0 ${symbol}`,
        tlosRexRatio: 1,
        rexfund: 0,
        chainId: '',
    }),
    getters: {
        account(): AccountStateInterface {
            return {
                loading: this.loading,
                accountName: this.accountName,
                accountPermission: this.accountPermission,
                user: this.user,
                isAuthenticated: this.isAuthenticated,
                linkedAccounts: this.linkedAccounts,
                data: this.data,
                authorization: this.authorization,
                rexActions: this.rexActions,
                transactionId: this.transactionId,
                transactionError: this.transactionError,
                rexbal: this.rexbal,
                vote: this.vote,
                abi: this.abi,
                coreRexBalance: this.coreRexBalance,
                maturingRex: this.maturingRex,
                maturedRex: this.maturedRex,
                savingsRex: this.savingsRex,
                tlosRexRatio: this.tlosRexRatio,
                rexfund: this.rexfund,
                chainId: this.chainId,
            } as AccountStateInterface;
        },
        getAccountData(): API.v1.AccountObject {
            return this.data as API.v1.AccountObject;
        },
        getUser(): Session {
            return this.user as Session;
        },
    },
    actions: {
        setUser(user: Session) {
            this.user = user ? markRaw(user) : user;
        },
        setAccountName(accountName: string) {
            this.accountName = accountName;
        },
        setAccountData(accountData: API.v1.AccountObject) {
            this.$patch({
                data: accountData,
                vote: accountData?.voter_info?.producers.map(vote => vote.toString()) ?? [],
            });
        },
        setTransaction(transactionId: string) {
            this.transactionId = transactionId;
        },
        setTransactionError(transactionError: unknown) {
            this.transactionError = transactionError;
        },
        setRexActions(rexActions: Action[]) {
            this.rexActions = rexActions;
        },
        setRexbal(
            params: {
                rexbal: Rexbal;
                coreBalance: number;
                maturingRex: number;
                savingsRex: number;
                maturedRex: number;
            },
        ) {
            this.rexbal= params.rexbal;
            this.coreRexBalance= formatCurrency(params.coreBalance, 4, symbol);
            this.maturedRex= formatCurrency(params.maturedRex, 4, symbol);
            this.maturingRex= formatCurrency(params.maturingRex, 4, symbol);
            this.savingsRex= formatCurrency(params.savingsRex, 4, symbol);
        },
        setVote(vote: string[]) {
            this.vote = vote.sort();
        },
        setABI(abi: API.v1.GetAbiResponse) {
            this.abi = abi;
        },
        setTlosRexRatio(tlosRexRatio: number) {
            this.tlosRexRatio = tlosRexRatio;
        },
        setAccountPermission(accountPermission: string) {
            this.accountPermission = accountPermission;
        },
        setIsAuthenticated(isAuthenticated: boolean) {
            this.isAuthenticated = isAuthenticated;
        },
        setRexFund(rexfund: number) {
            this.rexfund = rexfund;
        },
        setChainId(chainId: string) {
            this.chainId = chainId;
        },

        login(session: Session)  {
            this.setAccountPermission(String(session.permission || 'active'));
            this.setUser(session);
            this.setIsAuthenticated(true);
            this.setAccountName(String(session.actor));
        },
        logout() {
            this.setIsAuthenticated(false);
            this.setAccountName('');
            this.setAccountPermission('');
            this.setUser(null);
        },
        async loadAccountData() {
            try {
                this.data = await api.getAccount(this.accountName);
            } catch (e) {
                return;
            }
        },
        async updateRexData({ account }: {account: string}) {
            const paramsrexbal = {
                code: 'eosio',
                limit: '2',
                lower_bound: Name.from(account),
                scope: 'eosio',
                table: 'rexbal',
                reverse: false,
                upper_bound: Name.from(account),
            } as GetTableRowsParams;
            const rexbalRows = (await api.getTableRows(paramsrexbal)) as RexbalRows;
            const paramsrexpool = {
                code: 'eosio',
                scope: 'eosio',
                table: 'rexpool',
                json: true,
                reverse: false,
            } as GetTableRowsParams;
            const rexpool = ((await api.getTableRows(paramsrexpool)) as RexPoolRows).rows[0];
            const paramsrexfund = {
                code: 'eosio',
                limit: '1',
                lower_bound: Name.from(account),
                scope: 'eosio',
                table: 'rexfund',
                reverse: false,
                upper_bound: Name.from(account),
            } as GetTableRowsParams;
            const rexfund = (
                (await api.getTableRows(paramsrexfund)) as {
                    rows: {
                        owner: string;
                        balance: string;
                    }[];
                }
            ).rows[0];

            const rexFundBalance = rexfund?.balance ? Number(rexfund.balance.split(' ')[0]) : 0.0;
            this.setRexFund(rexFundBalance);

            const rexbal = rexbalRows.rows[0];
            const rexBalance =
                rexbal && rexbal.rex_balance
                    ? parseFloat(rexbal.rex_balance.split(' ')[0])
                    : 0;
            const totalRex = Number(rexpool.total_rex.split(' ')[0]);
            const totalLendable = Number(rexpool.total_lendable.split(' ')[0]);
            const tlosRexRatio = totalRex > 0 ? totalLendable / totalRex : 1;
            this.setTlosRexRatio(tlosRexRatio);

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
                this.setRexbal({
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
            const rexActions = (await api.getActions(account as unknown as string, filter)).actions;
            this.setRexActions(rexActions);
        },
        async sendAction({ account, data, name, actor, permission }: {
            name: Name|string;
            data: Record<string, unknown>;
            account?: Name|string;
            actor?: Name|string;
            permission?: string;
        }): Promise<ResolvedSigningRequest | null> {
            const actions = [
                {
                    account: account ?? this.abi.account_name,
                    name: name.toString(),
                    authorization: [
                        {
                            actor: actor ?? this.accountName,
                            permission: permission ?? this.accountPermission,
                        },
                    ],
                    data,
                },
            ] as Action[];
            return this.sendTransaction(actions);
        },
        async sendTransaction(actions: Action[]) {
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                return result.resolved;
            } catch (e) {
                console.error(e);
                this.setTransactionError(e);
            }
        },
        async stakeRex({ amount }: {amount: string}) {
            const quantityStr = formatCurrency(amount, 4, symbol, true);
            const actions = [
                {
                    account: 'eosio',
                    name: 'deposit',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        owner: this.accountName,
                        amount: quantityStr,
                    },
                },
                {
                    account: 'eosio',
                    name: 'buyrex',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        from: this.accountName,
                        amount: quantityStr,
                    },
                },
            ] as Action[];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
                void this.updateRexData({ account: this.accountName });
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async unstakeRex({ amount }: {amount: number|string}) {
            const tokenRexBalance = this.rexbal.rex_balance
                ? Number(this.rexbal.rex_balance.split(' ')[0])
                : 0;
            if (tokenRexBalance === 0) {
                return;
            }
            const quantityStr = formatCurrency(amount, 4, symbol, true);
            const rexToUnstake = formatCurrency(+amount / this.tlosRexRatio, 4, null, true);

            //   TODO check maturities
            const actions = [
                {
                    account: 'eosio',
                    name: 'sellrex',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        from: this.accountName,
                        rex: `${rexToUnstake} REX`,
                    },
                },
                {
                    account: 'eosio',
                    name: 'withdraw',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        owner: this.accountName,
                        amount: quantityStr,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
                void this.updateRexData({ account: this.accountName });
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async unstakeRexFund({ amount }: {amount: number}) {
            const quantityStr = formatCurrency(amount, 4, symbol, true);

            const actions = [
                {
                    account: 'eosio',
                    name: 'withdraw',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        owner: this.accountName,
                        amount: quantityStr,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async stakeCpuNetRex({ cpuAmount, netAmount }: {cpuAmount: string, netAmount: string}) {
            const quantityStrCPU = formatCurrency(cpuAmount, 4, symbol, true);
            const quantityStrNET = formatCurrency(netAmount, 4, symbol, true);
            const actions = [
                {
                    account: 'eosio',
                    name: 'unstaketorex',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        owner: this.accountName,
                        receiver: this.accountName,
                        from_net: quantityStrNET,
                        from_cpu: quantityStrCPU,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
                void this.updateRexData({ account: this.accountName });
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async unstakeCpuNetRex({ cpuAmount, netAmount }: {cpuAmount: string, netAmount: string}) {
            const quantityStrCPU = formatCurrency(cpuAmount, 4, symbol, true);
            const quantityStrNET = formatCurrency(netAmount, 4, symbol, true);
            const actions = [
                {
                    account: 'eosio',
                    name: 'stakefromrex',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        owner: this.accountName,
                        receiver: this.accountName,
                        from_net: quantityStrNET,
                        from_cpu: quantityStrCPU,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
                void this.updateRexData({ account: this.accountName });
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        resetTransaction() {
            this.setTransaction('');
            this.setTransactionError('');
        },
        async updateABI(account: string) {
            const abi = await api.getABI(account);
            this.setABI(abi);
        },
        async sendVoteTransaction() {
            const actions = [
                {
                    account: 'eosio',
                    name: 'voteproducer',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        voter: this.accountName,
                        proxy: '',
                        producers: this.vote,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async buyRam({ amount, receivingAccount }: {amount: string, receivingAccount?: string}) {
            const actions = [
                {
                    account: 'eosio',
                    name: 'buyram',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        payer: this.accountName,
                        receiver: receivingAccount,
                        quant: amount,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async buyRamBytes({ amount, receivingAccount }: {amount: string, receivingAccount?: string}) {
            const actions = [
                {
                    account: 'eosio',
                    name: 'buyrambytes',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        payer: this.accountName,
                        receiver: receivingAccount,
                        bytes: amount,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async sellRam({ amount }: {amount: string}) {
            const actions = [
                {
                    account: 'eosio',
                    name: 'sellram',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        account: this.accountName,
                        bytes: amount,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async moveToSavings({ amount }: {amount: string}) {
            const rexToUnstake = formatCurrency((+amount / this.tlosRexRatio), 4, 'REX', true);
            const actions = [
                {
                    account: 'eosio',
                    name: 'mvtosavings',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        owner: this.accountName,
                        rex: rexToUnstake,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
                void this.updateRexData({ account: this.accountName });
            } catch (e) {
                this.setTransactionError(e);
            }
        },
        async moveFromSavings({ amount }: {amount: string}) {
            const rexToUnstake = formatCurrency((+amount / this.tlosRexRatio), 4, 'REX', true);

            const actions = [
                {
                    account: 'eosio',
                    name: 'mvfrsavings',
                    authorization: [
                        {
                            actor: this.accountName,
                            permission: this.accountPermission,
                        },
                    ],
                    data: {
                        owner: this.accountName,
                        rex: rexToUnstake,
                    },
                },
            ];
            try {
                const result = await this.user.transact(
                    {
                        actions,
                    },
                );
                this.setTransaction(String(result.resolved.transaction.id));
                void this.loadAccountData();
                void this.updateRexData({ account: this.accountName });
            } catch (e) {
                this.setTransactionError(e);
            }
        },
    },
});

