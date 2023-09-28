import { AccountStateInterface } from 'src/store/account/state';
import { FuelUserWrapper } from 'src/api/fuel';

global.fetch = jest.fn((input: RequestInfo | URL) =>
    Promise.resolve({
        text: () => {
            if (input.toString() === 'https://raw.githubusercontent.com/KoyNetwork/token-list/main/koynmain.json') {
                return `{
                    "tokens": [
                        {
                            "name": "KOY Network",
                            "logo_sm": "https://raw.githubusercontent.com/KoyNetwork/token-list/master/logos/koyn.png",
                            "logo_lg": "https://raw.githubusercontent.com/KoyNetwork/token-list/master/logos/koyn.png",
                            "symbol": "KOYN",
                            "account": "koyn.token"
                        }
                    ]
                }`;
            } else {
                return `[
                    {
                      "name": "KOY Network",
                      "symbol": KOYN,
                      "contract": "koyn.token",
                      "precision": 4,
                      "logo": "https://raw.githubusercontent.com/KoyNetwork/token-list/master/logos/koyn.png"
                    }
                ]
                `;
            }
        },
    } as unknown as Response),
);

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

import { actions } from 'src/store/account/actions';
import { User } from 'universal-authenticator-library';

describe('Store - Account Actions', () => {
    let commit: jest.Mock;
    let state: AccountStateInterface;
    let users: User[] = [];

    const newAuthenticatorMock = (requestName = false) => ({
        init: jest.fn(),
        shouldRequestAccountName: jest.fn().mockResolvedValue(new Promise(resolve => resolve(requestName))),
        login: jest.fn().mockResolvedValue(new Promise(resolve => resolve(users))),
        getName: jest.fn().mockReturnValue('autoLogin'),
    });
    let authenticator = newAuthenticatorMock();


    beforeEach(() => {
        users = [{
            name: 'John Doe',
            getAccountName: jest.fn().mockResolvedValue('john.doe'),
        } as unknown as User];

        commit = jest.fn();
        authenticator = newAuthenticatorMock();

        state = {
            isAuthenticated: false,
            user: null,
            accountName: '',
            accountPermission: '',
        } as AccountStateInterface;

    });

    describe('login()', () => {
        test('when not account provided it should should request account', async () => {
            authenticator = newAuthenticatorMock(true);

            // call the action login
            await (actions as { login: (a:unknown, b:unknown) => Promise<void> }).login(
                { commit, state },
                { account: null, authenticator },
            );

            // verify that the action called correctly the init function of the authenticator
            expect(authenticator.init).toHaveBeenCalled();

            // Verify that the action called correctly the commit mutation 'setRequestAccount' with the value true
            expect(authenticator.shouldRequestAccountName).toHaveBeenCalled();
            expect(commit).toHaveBeenCalledWith('setRequestAccount', true);

        });

        test('when not account provided but not needed', async () => {
            const requestAccountSpy = jest.spyOn(authenticator, 'shouldRequestAccountName');
            requestAccountSpy.mockResolvedValue(false);

            // call the action login
            await (actions as { login: (a:unknown, b:unknown) => Promise<void> }).login(
                { commit, state },
                { account: null, authenticator },
            );

            // verify that the action called correctly the init function of the authenticator
            expect(authenticator.init).toHaveBeenCalled();

            // Verify that the action called correctly the commit mutation 'setRequestAccount' with the value true
            expect(requestAccountSpy).toHaveBeenCalled();
            expect(commit).not.toHaveBeenCalledWith('setRequestAccount', true);

            // Verify that the action called the login method of the authenticator
            expect(authenticator.login).toHaveBeenCalled();
            expect(commit).toHaveBeenCalledWith('setAccountPermission', 'active');
            expect(commit).toHaveBeenCalledWith('setUser', expect.any(FuelUserWrapper));
            expect(commit).toHaveBeenCalledWith('setIsAuthenticated', true);
            expect(commit).toHaveBeenCalledWith('setAccountName', 'john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('account', 'john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('autoLogin', 'autoLogin');

        });

        test('when account provided - Normal case', async () => {
            // call the action login
            await (actions as { login: (a:unknown, b:unknown) => Promise<void> }).login(
                { commit, state },
                { account: 'john.doe', authenticator },
            );

            // Verify that the action called correctly the init function of the authenticator
            expect(authenticator.init).toHaveBeenCalled();

            // Verify that the action called the login method of the authenticator
            expect(authenticator.login).toHaveBeenCalled();
            expect(commit).toHaveBeenCalledWith('setAccountPermission', 'active');
            expect(commit).toHaveBeenCalledWith('setUser', expect.any(FuelUserWrapper));
            expect(commit).toHaveBeenCalledWith('setIsAuthenticated', true);
            expect(commit).toHaveBeenCalledWith('setAccountName', 'john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('account', 'john.doe');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('autoLogin', 'autoLogin');
        });

    });

    describe('logout()', () => {
        test('normal case', async () => {
            // call the action logout
            await (actions as { logout: (a:unknown) => Promise<void> }).logout({ commit, state });

            // Verify that the action called the commit mutation 'setIsAuthenticated' with the value false
            expect(commit).toHaveBeenCalledWith('setIsAuthenticated', false);
            expect(commit).toHaveBeenCalledWith('setAccountName', '');
            expect(commit).toHaveBeenCalledWith('setUser', null);

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('account');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('autoLogin');
        });
    });
});







