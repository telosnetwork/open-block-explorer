import { getCurrentInstance, computed, ComputedRef } from 'vue';
import { UAL, Authenticator, User } from 'universal-authenticator-library';
import { useStore } from 'src/store';

interface UseAuthenticator {
  account: ComputedRef<string>;
  isAuthenticated: ComputedRef<boolean>;
  getUser: () => Promise<User>;
}

export function useAuthenticator(): UseAuthenticator {
  const app = getCurrentInstance();

  const store = useStore();
  const account = computed((): string => store.state.account.accountName);
  const isAuthenticated = computed(
    (): boolean => !!store.state.account.accountName
  );

  async function getUser() {
    const $ual = app.appContext.config.globalProperties.$ual as UAL;

    const authenticators: Authenticator[] =
      $ual.getAuthenticators().availableAuthenticators;
    const users: User[] = await authenticators[0].login();

    return users[0];
  }

  return {
    account,
    isAuthenticated,
    getUser
  };
}
