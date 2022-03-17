<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { defineComponent } from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import LoginHandlerDropdown from './LoginHandlerDropdown.vue';
import WalletModal from './WalletModal.vue';

export default defineComponent({
  name: 'LoginHandler',
  components: { LoginHandlerDropdown, WalletModal },
  data() {
    return {
      showDropdown: false,
      showModal: false,
      accountName: ''
    };
  },
  mounted() {
    this.accountName = localStorage.getItem('account') || '';
    if (this.accountName) {
      this.setAccountName(this.accountName);
    }
  },
  methods: {
    ...mapGetters({ account: 'account/accountName' }),
    ...mapMutations({ setAccountName: 'account/setAccountName' }),
    getAuthenticator() {
      const wallet = localStorage.getItem('autoLogin');
      const availAuthenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const idx = availAuthenticators.findIndex(
        (auth) => auth.constructor.name === wallet
      );
      return availAuthenticators[idx];
    },
    login(): void {
      if (this.accountName) {
        this.showDropdown = !this.showDropdown;
      } else {
        this.showModal = !this.showModal;
      }
    },
    async logout(): Promise<void> {
      const authenticator = this.getAuthenticator();
      try {
        authenticator && (await authenticator.logout());
      } catch (error) {
        console.log('Authenticator logout error', error);
      }
      this.setAccountName('');
      localStorage.removeItem('autoLogin');
      localStorage.removeItem('account');
      localStorage.removeItem('anchor-link--list');
      if (this.$route.path !== '/') {
        await this.$router.push({ path: '/' });
      }
    }
  }
});
</script>

<template lang="pug">
div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
    q-btn.button-primary(v-if="!accountName" @click='login()' label='Connect')
    q-btn.button-primary.connect-button(v-else @click='logout()' :label='accountName')
    LoginHandlerDropdown( v-if='showDropdown')
    WalletModal( :showModal='showModal' )
</template>

<style lang="sass">
.connect-button
  text-transform: lowercase
</style>
