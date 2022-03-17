<script lang="ts">
// import { User } from 'universal-authenticator-library';
import { defineComponent } from 'vue';
import { mapActions, mapMutations } from 'vuex';
export default defineComponent({
  name: 'LoginHandlerDropdown',
  props: ['account'],
  data() {
    return {
      accounts: [this.account]
    };
  },
  computed: {
    disconnectLabel(): string {
      return this.accounts.length > 1 ? 'Disconnect all' : 'Disconnect';
    }
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
q-btn-dropdown.connect-button( color='primary' :label='account' :content-style="{ backgroundColor: '#172c6c' }")
  q-list
    q-item(v-for='account in accounts' :label='account')
  .buttons-container
    q-btn.account-button(@click='attachAccount' color='primary' label='Attach an account')
    q-btn.account-button(@click='onLogout' color='primary' :label='disconnectLabel')
WalletModal(:showModal='false')
</template>
<style lang="sass" scoped>
.q-menu
  background-color: blue
  min-width: unset
.q-list
  width: 12rem
.account-button
  width: calc(100% - 30px)
  margin: 0 15px 15px 15px
.connect-button
  text-transform: lowercase
</style>
