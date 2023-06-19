<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import LoginHandlerDropdown from 'src/components/LoginHandlerDropdown.vue';
import WalletModal from 'src/components/WalletModal.vue';
import { Authenticator } from 'universal-authenticator-library';
import { useStore } from 'src/store';
import { getAuthenticators } from 'src/boot/ual';
import { useRouteDataNetwork } from 'src/router';

export default defineComponent({
    name: 'LoginHandler',
    components: { LoginHandlerDropdown, WalletModal },
    setup() {
        const authenticators = getAuthenticators();
        const store = useStore();
        const network = useRouteDataNetwork();

        const showDropdown = ref(false);
        const showModal = ref(false);
        const account = computed(() => store.state.account.accountName);

        function loadAccount() {
            const storedAccount = localStorage.getItem('account');
            if (storedAccount) {
                void store.commit('account/setAccountName', storedAccount);
                const ualName = localStorage.getItem('autoLogin');
                const ual: Authenticator = authenticators.find(
                    a => a.getName() === ualName,
                );
                void store.dispatch('account/login', {
                    account: storedAccount,
                    authenticator: ual,
                });
            }
        }

        onMounted(loadAccount);

        watch(network, loadAccount);

        return {
            showDropdown,
            showModal,
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
            @click="showModal = true"
        />
        <WalletModal v-model="showModal"/>
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
