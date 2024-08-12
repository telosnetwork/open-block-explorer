<script lang="ts">
import { Session } from '@wharfkit/session';
import { storeToRefs } from 'pinia';
import { kit } from 'src/api/wharf';
import WalletModal from 'src/components/WalletModal.vue';
import { useAccountStore } from 'src/stores/account';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'LoginHandlerDropdown',
    components: { WalletModal },
    setup() {
        const accountStore = useAccountStore();
        const { accountName, user } = storeToRefs(accountStore);
        const showModal = ref(false);

        const onLogout = async (): Promise<void> => {
            try {
                await kit.logout(user.value as Session);
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
            accountName,
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
    :label="accountName"
    :content-style="{ backgroundColor: '#172c6c' }"
>
    <q-card class="buttons-container">
        <q-card-section class="account-link">
            <a class="text-white" :href=" '/account/' + accountName">
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
