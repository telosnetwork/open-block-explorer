<script lang="ts">
import { defineComponent } from 'vue';
import LoginHandlerDropdown from './LoginHandlerDropdown.vue';
import WalletModal from './WalletModal.vue';
// import { UAL } from 'universal-authenticator-library';

export default defineComponent({
  name: 'LoginHandler',
  components: { LoginHandlerDropdown, WalletModal },
  data() {
    return {
      showDropdown: false,
      showModal: false
    };
  },
  methods: {
    login(): void {
      debugger;
      this.showModal = !this.showModal;
      // this.showDropdown = !this.showDropdown;
    }
  }
});
</script>

<template lang="pug">
div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
    q-btn.button-primary(@click='login()' label="Connect")
    LoginHandlerDropdown( v-if='showDropdown')
    WalletModal( :showModal='showModal' )
</template>
