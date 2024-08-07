<script lang="ts">
import { Session } from '@wharfkit/session';
import { DialogChainObject, useQuasar } from 'quasar';
import { useAccountStore } from 'src/stores/account';
import { computed, defineComponent, ref } from 'vue';


export default defineComponent({
    name: 'WalletModal',
    setup() {
        const $q = useQuasar();
        const accountStore = useAccountStore();
        const error = ref<string>(null);
        const account = accountStore.accountName;
        const user = accountStore.user;
        const loading = {};
        const walletDialog = ref<DialogChainObject>(null);
        const iconSize = computed(() => {
            if ($q.screen.width > 420) {
                return '3em';
            }
            return '1.5em';
        });

        const onLogin = () => {
            try {
                accountStore.login(user as Session);
            } catch (e) {
                error.value = e as string;
            }
            walletDialog.value.hide();
        };

        // TODO: check if this is the intention of the original author
        // because the original code was not present
        const openUrl = (url: string) => window.open(url, '_blank');

        return {
            error,
            loading,
            account,
            walletDialog,
            onLogin,
            openUrl,
            iconSize,
        };
    },
});
</script>
<template>
<q-dialog ref="walletDialog" class="modal-container">
    <div class="modal-header-container">
        <q-icon name="add_circle_outline" color="white" :size="iconSize"/>
        <h3 class="modal-header">Attach an account</h3>
    </div>
    <q-separator/>
    <q-list>
        <q-item v-if="error" :active="!!error" active-class="bg-red-1 text-grey-8">
            <q-item-section>{{ error }}</q-item-section>
        </q-item>
    </q-list>
</q-dialog>
</template>

<style lang="sass">
.fixed-full
  flex-direction: column
.modal-container
  background: radial-gradient(50% 67.35% at 50% 67.35%, #8A65D4 0%,  rgb(9, 26, 98, 100))
.modal-header
  margin-left: 0.6rem
  color: white
  font-size: 2.25rem
  width: 100%
.modal-header-container
  display: flex
  align-items: center
  box-shadow: unset !important

// on resolutions smaller than 420px h3.modal-header will have smaller text
  // and a smaller .modal-header-container q-icon
@media screen and (max-width: 420px)
  h3.modal-header
    font-size: 1.5rem
  .modal-header-container
    padding: 0 1rem
  .modal-container .q-dialog__inner
    padding: 0 1rem
</style>
