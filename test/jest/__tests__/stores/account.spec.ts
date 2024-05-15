// import { AccountStateInterface } from 'src/stores/account';

import { Authenticator, User, UALError, ButtonStyle, Chain } from 'universal-authenticator-library';
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

jest.mock('@greymass/eosio', () => ({
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

jest.mock('src/api/fuel', () => ({
    FuelUserWrapper: class {
        constructor() {
            jest.fn();
        }
        getAccountName() {
            return 'john.doe';
        }
        requestPermission = '';
    },
}));
const chainIdMock = 'chainIdMock';

const users = [{
    name: 'John Doe',
    getAccountName: jest.fn().mockResolvedValue('john.doe'),
} as unknown as User];

class MockAuthenticator extends Authenticator {
    reset(): void {
        throw new Error('Method not implemented.');
    }
    isErrored(): boolean {
        throw new Error('Method not implemented.');
    }
    getOnboardingLink(): string {
        throw new Error('Method not implemented.');
    }
    getError(): UALError {
        throw new Error('Method not implemented.');
    }
    isLoading(): boolean {
        throw new Error('Method not implemented.');
    }
    getStyle(): ButtonStyle {
        throw new Error('Method not implemented.');
    }
    shouldRender(): boolean {
        throw new Error('Method not implemented.');
    }
    shouldAutoLogin(): boolean {
        throw new Error('Method not implemented.');
    }
    login(accountName?: string): Promise<User[]> {
        return Promise.resolve(users);
    }
    logout(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    requiresGetKeyConfirmation(): boolean {
        throw new Error('Method not implemented.');
    }
    getName(): string {
        return 'autoLogin';
    }
    init(): Promise<void> {
        // Implementation for initialization logic
        return Promise.resolve();
    }
    shouldRequestAccountName(): Promise<boolean> {
        return Promise.resolve(true);
    }
    chains: Chain[] = [{
        chainId: chainIdMock,
    }] as unknown as Chain[]
}

describe('Store - Account Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setActivePinia(createPinia());

    });

    describe('login()', () => {
        test('when no account is provided it should request account', async () => {
            const accountStore = useAccountStore();

            const authenticator = new MockAuthenticator(null);

            const accountStoreLoginSpy = jest.spyOn(accountStore, 'login');
            const mockInit = jest.spyOn(authenticator, 'init');
            const mockShouldRequestAccountName = jest.spyOn(authenticator, 'shouldRequestAccountName');

            // call the action login
            await accountStore.login(
                { account: null, authenticator },
            );

            // verify that the action called correctly the init function of the authenticator
            expect(accountStoreLoginSpy).toHaveBeenCalledWith({ account: null, authenticator });

            // // Verify that the action called correctly the commit mutation 'setRequestAccount' with the value true
            expect(mockInit).toHaveBeenCalledTimes(1);

            expect(mockShouldRequestAccountName).toHaveBeenCalledTimes(1);

        });

        test('when not account provided but not needed', async () => {
            const accountStore = useAccountStore();
            const authenticator = new MockAuthenticator(null);

            const requestAccountSpy = jest.spyOn(authenticator, 'shouldRequestAccountName');
            const authenticatorInit = jest.spyOn(authenticator, 'init');
            const authenticatorLogin = jest.spyOn(authenticator, 'login');
            requestAccountSpy.mockResolvedValue(false);

            // call the action login
            await accountStore.login(
                { account: null, authenticator },
            );

            // verify that the action called correctly the init function of the authenticator
            expect(authenticatorInit).toHaveBeenCalled();

            expect(requestAccountSpy).toHaveBeenCalled();
            expect(accountStore.requestAccount).toEqual(false);

            // Verify that the action called the login method of the authenticator
            expect(authenticatorLogin).toHaveBeenCalled();
            expect(accountStore.accountPermission).toBe('active');
            expect(accountStore.isAuthenticated).toBe(true);
            expect(accountStore.accountName).toBe('john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('account_' + chainIdMock, 'john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('autoLogin_' + chainIdMock, 'autoLogin');

        });

        test('when account provided - Normal case', async () => {
            const accountStore = useAccountStore();
            const authenticator = new MockAuthenticator(null);

            const requestAccountSpy = jest.spyOn(authenticator, 'shouldRequestAccountName');
            const authenticatorInit = jest.spyOn(authenticator, 'init');
            const authenticatorLogin = jest.spyOn(authenticator, 'login');
            requestAccountSpy.mockResolvedValue(false);

            // call the action login
            await accountStore.login(
                { account: 'john.doe', authenticator },
            );

            // Verify that the action called correctly the init function of the authenticator
            expect(authenticatorInit).toHaveBeenCalled();

            // Verify that the action called the login method of the authenticator
            expect(authenticatorLogin).toHaveBeenCalled();
            expect(accountStore.accountPermission).toBe('active');
            expect(accountStore.isAuthenticated).toBe(true);
            expect(accountStore.accountName).toBe('john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('account_' + chainIdMock, 'john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('autoLogin_' + chainIdMock, 'autoLogin');
        });

    });

    describe('logout()', () => {
        beforeEach(async () => {
            jest.clearAllMocks();

            // Logs in
            const accountStore = useAccountStore();
            const authenticator = new MockAuthenticator(null);
            await accountStore.login(
                { account: 'john.doe', authenticator },
            );
        });

        test('normal case', () => {
            const accountStore = useAccountStore();

            expect(accountStore.user).not.toBe(null);
            expect(accountStore.accountPermission).toBe('active');
            expect(accountStore.isAuthenticated).toBe(true);
            expect(accountStore.accountName).toBe('john.doe');

            // call the action logout
            accountStore.logout();

            expect(accountStore.user).toBe(null);
            expect(accountStore.isAuthenticated).toBe(false);
            expect(accountStore.accountName).toBe('');

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('account_' + chainIdMock);
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('autoLogin_' + chainIdMock);
        });
    });
});







