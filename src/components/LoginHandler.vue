<script lang="ts">
import { defineComponent } from 'vue';
import LoginHandlerDropdown from './LoginHandlerDropdown.vue';
import WalletModal from './WalletModal.vue';

const connectButtonLabel = 'Connect';

export default defineComponent({
  name: 'LoginHandler',
  components: { LoginHandlerDropdown, WalletModal },
  props: ['accountName'],
  data() {
    return {
      showDropdown: false,
      showModal: false,
      connectLabel: (this.accountName as string) || connectButtonLabel
    };
  },
  methods: {
    login(): void {
      if (this.connectLabel !== this.connectLabel) {
        this.showDropdown = !this.showDropdown;
      } else {
        this.showModal = !this.showModal;
      }
    }
  }
});
</script>

<template lang="pug">
div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
    q-btn.button-primary.connect-button( @click='login()' :label="connectLabel")
    LoginHandlerDropdown( v-if='showDropdown')
    WalletModal( :showModal='showModal' )
</template>

<style lang="sass">
.connect-button
  text-transform: lowercase
</style>
