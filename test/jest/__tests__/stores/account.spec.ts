import { Session } from '@wharfkit/session';
import { createPinia, setActivePinia } from 'pinia';
import { useAccountStore } from 'src/stores/account';

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem:jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const transactionHeaders = {
    context_free_actions: [] as never[],
    delay_sec: 123,
    expiration: new Date(new Date().getTime() + 30000),
    max_cpu_usage_ms: 99,
    max_net_usage_words: 0,
    ref_block_num: 0,
    ref_block_prefix: 0,
    transaction_extensions: [] as never[],
};

jest.mock('@wharfkit/session', () => ({
    Name: {
        from: (s: string) => ({ toString: () => s }),
    },
    UInt64: {
        from: (i: number) => Number(i),
    },
    APIClient: jest.fn().mockImplementation(() => ({
        v1: {
            chain: {
                get_info: () => ({
                    getTransactionHeader: () => transactionHeaders,
                }),
                get_abi: () => Promise.resolve({ abi: 'abi' }),
                push_transaction: () => ({
                    transaction_id: 'transaction_id',
                    processed: { receipt: { status: 'status' } },
                }),
            },
        },
    })),
}));

const chainIdMock = 'chainIdMock';

const users = [{
    name: 'John Doe',
    getAccountName: jest.fn().mockResolvedValue('john.doe'),
} as unknown];

describe('Store - Account Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setActivePinia(createPinia());
    });

    describe('login()', () => {
        test('when permission is defined', () => {
            const accountStore = useAccountStore();

            const login = jest.spyOn(accountStore, 'login');
            const setAccountPermission = jest.spyOn(accountStore, 'setAccountPermission');
            const setUser = jest.spyOn(accountStore, 'setUser');
            const setIsAuthenticated = jest.spyOn(accountStore, 'setIsAuthenticated');
            const setAccountName = jest.spyOn(accountStore, 'setAccountName');

            const mockSession = {
                permission: 'custom',
                actor: 'accountName',
            } as unknown as Session;


            accountStore.login(mockSession);

            expect(login).toHaveBeenCalledWith(mockSession);
            expect(setAccountPermission).toHaveBeenCalledWith('custom');
            expect(setUser).toHaveBeenCalledWith(mockSession);
            expect(setIsAuthenticated).toHaveBeenCalledWith(true);
            expect(setAccountName).toHaveBeenCalledWith('accountName');
        });

        test('when permission is null', () => {
            const accountStore = useAccountStore();

            const login = jest.spyOn(accountStore, 'login');
            const setAccountPermission = jest.spyOn(accountStore, 'setAccountPermission');
            const setUser = jest.spyOn(accountStore, 'setUser');
            const setIsAuthenticated = jest.spyOn(accountStore, 'setIsAuthenticated');
            const setAccountName = jest.spyOn(accountStore, 'setAccountName');

            const mockSession = {
                permission: null,
                actor: 'accountName',
            } as unknown as Session;

            accountStore.login(mockSession);

            expect(login).toHaveBeenCalledWith(mockSession);
            expect(setAccountPermission).toHaveBeenCalledWith('active');
            expect(setUser).toHaveBeenCalledWith(mockSession);
            expect(setIsAuthenticated).toHaveBeenCalledWith(true);
            expect(setAccountName).toHaveBeenCalledWith('accountName');
        });
    });

    describe('logout()', () => {
        test('when permission is defined', () => {
            const accountStore = useAccountStore();

            const logout = jest.spyOn(accountStore, 'logout');
            const setAccountPermission = jest.spyOn(accountStore, 'setAccountPermission');
            const setUser = jest.spyOn(accountStore, 'setUser');
            const setIsAuthenticated = jest.spyOn(accountStore, 'setIsAuthenticated');
            const setAccountName = jest.spyOn(accountStore, 'setAccountName');

            accountStore.logout();

            expect(logout).toHaveBeenCalledTimes(1);
            expect(setAccountPermission).toHaveBeenCalledWith('');
            expect(setUser).toHaveBeenCalledWith(null);
            expect(setIsAuthenticated).toHaveBeenCalledWith(false);
            expect(setAccountName).toHaveBeenCalledWith('');
        });
    });
});
