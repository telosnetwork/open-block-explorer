<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import LoginHandlerDropdown from './LoginHandlerDropdown.vue';
import WalletModal from './WalletModal.vue';
import { Authenticator } from 'universal-authenticator-library';
import { useStore } from 'src/store';
import { authenticators } from 'src/boot/ual';

export default defineComponent({
    name: 'LoginHandler',
    components: { LoginHandlerDropdown, WalletModal },
    setup() {
        const store = useStore();

        const showDropdown = ref(false);
        const showModal = ref(false);
        const account = computed(() => store.state.account.accountName);

        onMounted(() => {
            const storedAccount = localStorage.getItem('account');
            if (storedAccount) {
                void store.commit('account/setAccountName', storedAccount);
                const ualName = localStorage.getItem('autoLogin');
                const ual: Authenticator = authenticators.find(
                    (a) => a.getName() === ualName,
                );
                void store.dispatch('account/login', {
                    account: storedAccount,
                    authenticator: ual,
                });
            }
        });

        return {
            showDropdown,
            showModal,
            account,
        };
    },
});
</script>

<template lang="pug">
div.col-xs-5.col-sm-3.col-md-2.col-lg-2
  .q-px-xs-xs.q-px-sm-xs.q-px-md-md.q-px-lg-md
    LoginHandlerDropdown(v-if='account')
    q-btn.button-primary.btn-login(v-else @click='showModal = true' label='Connect')
    WalletModal( v-model='showModal')
</template>

<style scoped lang="sass">
.btn-login
  width: 60%
  min-width: 120px
  max-width: 140px
  height: 40px
</style>
