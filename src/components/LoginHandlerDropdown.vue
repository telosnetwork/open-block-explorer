<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import WalletModal from 'src/components/WalletModal.vue';
import { getAuthenticators } from 'src/boot/ual';
import { Authenticator } from 'universal-authenticator-library';
import { getChain } from 'src/config/ConfigManager';
import { useAccountStore } from 'src/stores/account';

export default defineComponent({
    name: 'LoginHandlerDropdown',
    components: { WalletModal },
    setup() {
        const authenticators = getAuthenticators();
        const accountStore = useAccountStore();
        const account = computed(() => accountStore.accountName);
        const showModal = ref(false);

        const getAuthenticator = (): Authenticator => {
            const wallet = localStorage.getItem('autoLogin_' + getChain().getChainId());
            return authenticators.find(
                auth => auth.getName() === wallet,
            );
        };

        const onLogout = async (): Promise<void> => {
            const authenticator = getAuthenticator();
            try {
                authenticator && (await authenticator.logout());
                clearAccount();
            } catch (error) {
                console.error('Authenticator logout error', error);
                clearAccount();
            }
        };

        const clearAccount = (): void => {
            void accountStore.logout();
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
<template>

<q-btn-dropdown
    class="connect-button"
    color="primary"
    :label="account"
    :content-style="{ backgroundColor: '#172c6c' }"
>
    <q-card class="buttons-container">
        <q-card-section class="account-link">
            <a class="text-white" :href=" '/account/' + account">
                <div class="row">
                    <div class="col-12">
                        View my account
                    </div>
                </div>
            </a>
        </q-card-section>
        <q-separator dark/>
        <q-card-section>
            <div class="q-px-sm q-pb-sm">
                <q-btn
                    class="full-width"
                    color="primary"
                    label="Disconnect"
                    @click="onLogout"
                />
            </div>
        </q-card-section>
    </q-card>
</q-btn-dropdown>
<WalletModal v-model="showModal"/>

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

.account-link
  &:hover
    cursor: pointer
    transition: background-color .3s
    background-color: color-mix(in oklab, var(--q-secondary) 88%, white 12%)
  a
    text-decoration: none
    div
        width: fit-content
        margin-left: .25rem
.buttons-container
  width: 220px
  max-width: 80vw
  background: var(--q-color-dropdown-card)
</style>
