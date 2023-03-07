<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import LoginHandlerDropdown from 'src/components/LoginHandlerDropdown.vue';
import { useStore } from 'src/store';
import SessionKit, { BrowserLocalStorage, LoginResult } from '@wharfkit/session';
import { WalletPluginMock } from '@wharfkit/wallet-plugin-mock';
import { WebUIRenderer } from '@wharfkit/web-ui-renderer';

export default defineComponent({
    name: 'LoginHandler',
    components: { LoginHandlerDropdown },
    setup() {
        const authenticators = getAuthenticators();
        const store = useStore();

        const showDropdown = ref(false);
        const account = computed(() => store.state.account.accountName);
        let kit: SessionKit;

        onMounted(() => {
            kit = new SessionKit({
                appName: process.env.APP_NAME,
                chains: [
                    {
                        id: '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11',
                        url: 'https://telos.greymass.com0',
                    },
                ],
                ui: new WebUIRenderer(),
                storage: new BrowserLocalStorage('obe'),
                walletPlugins: [new WalletPluginMock()],
            });
            const storedAccount = localStorage.getItem('account');
            if (storedAccount) {
                // TODO Wharf: restore session
                // void store.commit('account/setAccountName', storedAccount);
                // const ualName = localStorage.getItem('autoLogin');
                // const ual: Authenticator = authenticators.find(
                //     a => a.getName() === ualName,
                // );
                // void store.dispatch('account/login', {
                //     account: storedAccount,
                //     authenticator: ual,
                // });
            }
        });

        return {
            showDropdown,
            login: async () => {
                const result: LoginResult = await kit.login();
                console.log(result);
            },
            account,
        };
    },
});
</script>

<template>
<div class="col-xs-5 col-sm-3 col-md-2 col-lg-2">
    <div class="q-px-xs-xs q-px-sm-xs q-px-md-md q-px-lg-md">
        <LoginHandlerDropdown v-if="account"/>
        <q-btn
            v-else
            class="button-primary btn-login"
            label="Connect"
            @click=login
        />
    </div>
</div>
</template>

<style scoped lang="sass">
.btn-login
  width: 60%
  min-width: 120px
  max-width: 140px
  height: 40px
</style>
