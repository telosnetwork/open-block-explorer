<script lang="ts">
import { storeToRefs } from 'pinia';
import { kit, ui } from 'src/api/wharf';
import LoginHandlerDropdown from 'src/components/LoginHandlerDropdown.vue';
import { useAccountStore } from 'src/stores/account';
import { useNetworksStore } from 'src/stores/networks';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
    name: 'LoginHandler',
    components: { LoginHandlerDropdown },
    setup() {
        const accountStore = useAccountStore();
        const networksStore = useNetworksStore();

        const { accountName } = storeToRefs(accountStore);
        const showDropdown = ref(false);

        const login = async () => {
            try {
                const result = await kit.login();
                if (result?.session) {
                    accountStore.login(result.session);
                }
            } catch (e) {
                console.error('error logging in', e);
            }
        };

        onMounted(async () => {
            // Manually append the dialog to the page, since this is after the DOM events
            ui.appendDialogElement();
            // Attempt to restore any existing sessions
            try {
                // This is only needed because the application state doesn't allow dynamic switching of chains
                const sessions = await kit.getSessions();
                // It'll restore the first matching account for the chain once switching chains
                const matchingSession = sessions.find(session =>
                    session.chain === networksStore.getCurrentNetwork.getChainId(),
                );
                if (matchingSession) {
                    const session = await kit.restore(matchingSession);
                    if (session) {
                        accountStore.login(session);
                    }
                }
            } catch (e) {
                console.error('error restoring session', e);
            }
        });

        return {
            showDropdown,
            accountName,
            login,
        };
    },
});
</script>

<template>
<div class="col-xs-5 col-sm-3 col-md-2 col-lg-2">
    <div class="q-px-xs-xs q-px-sm-xs q-px-md-md q-px-lg-md">
        <LoginHandlerDropdown v-if="accountName"/>
        <q-btn
            v-else
            class="button-primary btn-login"
            label="Connect"
            @click="login()"
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
