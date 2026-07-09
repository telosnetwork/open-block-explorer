<script lang="ts">
import { kit } from 'src/boot/wharf';
import WalletModal from 'src/components/WalletModal.vue';
import { useAccountStore } from 'src/stores/account';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'LoginHandlerDropdown',
    components: { WalletModal },
    setup() {
        const accountStore = useAccountStore();
        const account = computed(() => accountStore.accountName);
        const showModal = ref(false);

        const onLogout = async (): Promise<void> => {
            try {
                await kit.logout();
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
    :content-style="{ backgroundColor: 'var(--q-color-dropdown-card)' }"
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
  min-width: unset
.q-list
  width: 12rem
.account-button
  width: 110px
  margin: 15px
.connect-button
  width: fit-content
  height: 42px
  min-height: 42px
  text-transform: lowercase
  background-color: rgba(255, 255, 255, 0.06) !important
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.05) 100%) !important
  border: 1px solid rgba(0, 242, 254, 0.22)
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16)
  color: #FFFFFF !important
  font-size: 15px
  font-weight: 600
  letter-spacing: 0
  min-width: 168px
  padding: 0 12px
  &::before
    border-color: transparent !important
  &:hover, &:focus
    border-color: rgba(0, 242, 254, 0.42)
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18), 0 0 12px rgba(0, 242, 254, 0.08)
  :deep(.q-btn__content)
    gap: 10px
    line-height: 1

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
