<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapMutations } from 'vuex';
export default defineComponent({
  name: 'LoginHandlerDropdown',
  props: ['account'],
  data() {
    return {
      accounts: [this.account],
      showModal: false
    };
  },
  computed: {
    disconnectLabel(): string {
      return this.accounts.length > 1 ? 'Disconnect all' : 'Disconnect';
    }
  },
  methods: {
    ...mapMutations({
      setAccountName: 'account/setAccountName'
    }),
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
        this.clearAccount();
      } catch (error) {
        console.log('Authenticator logout error', error);
        this.clearAccount();
      }

      if (this.$route.path !== '/') {
        await this.$router.push({ path: '/' });
      }
    },
    clearAccount(): void {
      // TODO: only remove what is related to login, localStorage has other uses
      localStorage.clear();
      this.setAccountName('');
    }
  }
});
</script>
<template lang="pug">
q-btn-dropdown.connect-button( color='primary' :label='account' :content-style="{ backgroundColor: '#172c6c' }")
  .buttons-container
    q-btn.account-button(@click='onLogout' color='primary' :label='disconnectLabel')
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
  width: 60%
  min-width: 120px
  max-width: 140px
  height: 40px
  text-transform: lowercase
</style>
