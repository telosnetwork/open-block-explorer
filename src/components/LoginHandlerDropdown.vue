<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import WalletModal from './WalletModal.vue';
import { useStore } from 'src/store';
import { authenticators } from 'src/boot/ual';
import { Authenticator } from 'universal-authenticator-library';

export default defineComponent({
    name: 'LoginHandlerDropdown',
    components: { WalletModal },
    setup() {
        const store = useStore();
        const account = computed(() => store.state.account.accountName);
        const showModal = ref(false);

        const getAuthenticator = (): Authenticator => {
            const wallet = localStorage.getItem('autoLogin');
            const authenticator = authenticators.find(
                auth => auth.getName() === wallet,
            );
            return authenticator;
        };

        const onLogout = async (): Promise<void> => {
            const authenticator = getAuthenticator();
            try {
                authenticator && (await authenticator.logout());
                clearAccount();
            } catch (error) {
                console.log('Authenticator logout error', error);
                clearAccount();
            }
        };

        const clearAccount = (): void => {
            void store.dispatch('account/logout');
        };
        return {
            account,
            showModal,
            disconnectLabel: 'Disconnect',
            onLogout,
        };
    },
});
</script>
<template lang="pug">
q-btn-dropdown.connect-button( color='primary' :label='account' :content-style="{ backgroundColor: '#172c6c' }")
  q-card.buttons-container
    q-card-section
      .row
        .col-12
          a.text-white(:href=" '/account/' + account" class="hover-dec") {{account}}
        //- .col-2
        //-   q-btn.float-right(@click='onLogout' color='white' icon='close' dense size='sm' flat )
    q-separator(dark)
    q-card-section
      //- .q-pa-sm
      //-   q-btn.full-width(@click='showModal = true' color='primary' label='Attatch an account')
      .q-px-sm.q-pb-sm
        q-btn.full-width(@click='onLogout' color='primary' label='Disconect')
WalletModal( v-model='showModal')
</template>
<style lang="sass" scoped>
.q-menu
  background-color: blue
  min-width: unset
.q-list
  width: 12rem
.account-button
  width: 110px
  margin: 15px
.connect-button
  width: fit-content
  height: 40px
  text-transform: lowercase
.buttons-container
  width: 220px
  max-width: 80vw
  background: var(--q-color-dropdown-card)
</style>
