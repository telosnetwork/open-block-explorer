<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import LoginHandlerDropdown from './LoginHandlerDropdown.vue';
import WalletModal from './WalletModal.vue';

export default defineComponent({
  name: 'LoginHandler',
  components: { LoginHandlerDropdown, WalletModal },
  data() {
    return {
      showDropdown: false,
      showModal: false
    };
  },
  mounted() {
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      this.setAccountName(storedAccount);
    }
  },
  computed: {
    ...mapGetters({ account: 'account/accountName' })
  },
  methods: {
    ...mapMutations({ setAccountName: 'account/setAccountName' }),
    ...mapActions({ logout: 'account/logout' }),
    getAuthenticator() {
      const wallet = localStorage.getItem('autoLogin');
      const availAuthenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const idx = availAuthenticators.findIndex(
        (auth) => auth.constructor.name === wallet
      );
      return availAuthenticators[idx];
    },
    showLogin(): void {
      if (this.account) {
        this.showDropdown = !this.showDropdown;
      } else {
        this.showModal = !this.showModal;
      }
    },
    async onLogout(): Promise<void> {
      const authenticator = this.getAuthenticator();
      try {
        authenticator && (await authenticator.logout());
      } catch (error) {
        console.log('Authenticator logout error', error);
      }
      this.setAccountName('');
      this.clearLocalStorage();
      if (this.$route.path !== '/') {
        await this.$router.push({ path: '/' });
      }
    },
    clearLocalStorage(): void {
      localStorage.removeItem('autoLogin');
      localStorage.removeItem('account');
      localStorage.removeItem('anchor-link--list');
      localStorage.removeItem('autoLogin');
    }
  }
});
</script>

<template lang="pug">
div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
    q-btn.button-primary.connect-button(v-if='account' @click='onLogout()' :label='account')
    q-btn.button-primary(v-else @click='showLogin()' label='Connect')
    LoginHandlerDropdown( v-if='showDropdown')
    WalletModal( :showModal='showModal' )
</template>

<style lang="sass">
.connect-button
  text-transform: lowercase
</style>
