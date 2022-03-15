<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Wallet',
  props: ['showModal'],
  data() {
    return {
      authenticators: {}
    };
  },
  mounted() {
    debugger;
    // this.authenticators = this.$ual.getAuthenticators();
    // debugger;
  }
});
</script>
<template lang="pug">
.modal-container
    q-dialog( v-model="showModal")
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
<style lang="sass"></style>
