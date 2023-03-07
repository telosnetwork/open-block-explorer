<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import LoginHandlerDropdown from 'src/components/LoginHandlerDropdown.vue';
import { useStore } from 'src/store';
import SessionKit, { BrowserLocalStorage, LoginResult } from '@wharfkit/session';
import { WalletPluginMock } from '@wharfkit/wallet-plugin-mock';
import { WebUIRenderer } from '@wharfkit/web-ui-renderer';
// import { LoginResult } from '@wharfkit/session';
import { kit, ui } from 'boot/wharf';

export default defineComponent({
    name: 'LoginHandler',
    components: { LoginHandlerDropdown },
    setup(props, context) {
        console.log(props, context);
        const store = useStore();

        const showDropdown = ref(false);
        const account = computed(() => store.state.account.accountName);

        onMounted(async () => {
            // Manually append the dialog to the page, since this is after the DOM events
            ui.appendDialogElement();
            // Attempt to restore any existing sessions
            try {
                const session = await kit.restore();
                if (session) {
                    await store.dispatch('account/login', session);
                }
            } catch (e) {
                console.log('error restoring session');
            }
        });

        return {
            showDropdown,
            login: async () => {
                const result = await kit.login();
                console.log(result);
                if (result.session) {
                    await store.dispatch('account/login', result.session);
                }
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
            @click=this.$kit.login()
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
