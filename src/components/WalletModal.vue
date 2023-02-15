<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { DialogChainObject } from 'quasar';
import { authenticators } from 'src/boot/ual';
import { useStore } from 'src/store';

export default defineComponent({
  name: 'WalletModal',
  setup() {
    const store = useStore();
    const error = ref<string>(null);
    const account = computed(() => store.state.account.accountName);
    const loading = {};
    const walletDialog = ref<DialogChainObject>(null);

    const onLogin = async (idx: number) => {
      const authenticator = authenticators[idx];
      error.value = null;
      try {
        await store.dispatch('account/login', {
          account: account.value,
          authenticator,
        });
      } catch (e) {
        error.value = e as string;
      }
      walletDialog.value.hide();
    };

    return {
      error,
      loading,
      account,
      walletDialog,
      onLogin,
    };
  },
});
</script>
<template lang="pug">
q-dialog.modal-container(ref='walletDialog')

  .modal-header-container
    q-icon( name='add_circle_outline' size='2.5rem' color="white")
    h3.modal-header Attach an account
  q-separator
  q-list
    q-item(
      v-for="(wallet, idx) in $ual.authenticators"
      :key="wallet.getStyle().text"
      v-ripple
      :style="{background: wallet.getStyle().background, color: wallet.getStyle().textColor}"
    )
      q-item-section( class="cursor-pointer" avatar @click="onLogin(idx)")
        img( :src="wallet.getStyle().icon" width="30")
      q-item-section( class="cursor-pointer" @click="onLogin(idx)") {{ wallet.getStyle().text }}
      q-item-section( class="flex" avatar)
        q-spinner(
          v-if="loading === wallet.getStyle().text"
          :color="wallet.getStyle().textColor"
          size="2em"
        )
        q-btn(
          v-else
          :color="wallet.getStyle().textColor"
          icon="get_app"
          @click="openUrl(wallet.getOnboardingLink())"
          target="_blank"
          dense
          flat
          size="12px"
        )
          q-tooltip Get app
    q-item(
      v-if="error"
      :active="!!error"
      active-class="bg-red-1 text-grey-8"
    )
      q-item-section {{ error }}
</template>
<style lang="sass">
.fixed-full
  flex-direction: column
.modal-container
  background: radial-gradient(50% 67.35% at 50% 67.35%, #8A65D4 0%,  rgb(9, 26, 98, 100))
.modal-header
  color: white
  font-size: 2.25rem
  width: 100%
.modal-header-container
  display: flex
  align-items: center
  box-shadow: unset !important
</style>
