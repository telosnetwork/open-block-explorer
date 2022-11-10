<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapMutations } from 'vuex';
import WalletModal from './WalletModal.vue';

export default defineComponent({
  name: 'LoginHandlerDropdown',
  props: ['account'],
  components: { WalletModal },
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
      setAccountName: 'account/setAccountName',
      setUser: 'account/setUser',
      setIsAuthenticaed: 'account/setIsAuthenticated',
      setAuthenticatorName: 'account/setAuthenticatorName'
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
      this.setIsAuthenticaed(false);
      this.setAccountName('');
      this.setAuthenticatorName(null);
      this.setUser(null);
      this.$router.go(0);
    }
  }
});
</script>
<template lang="pug">
q-btn-dropdown.connect-button( color='primary' :label='account' :content-style="{ backgroundColor: '#172c6c' }")
  q-card.buttons-container
    q-card-section
      .row(v-for='account in accounts')
        .col-12
          a.text-white(:href=" '/account/' + account" class="hover-dec") {{account}}
        //- .col-2
        //-   q-btn.float-right(@click='onLogout' color='white' icon='close' dense size='sm' flat )
    q-separator(dark)
    q-card-section
      //- .q-pa-sm
      //-   q-btn.full-width(@click='showModal = true' color='primary' label='Attatch an account')
      .q-px-sm.q-pb-sm
        q-btn.full-width(@click='onLogout' color='primary' label='Disconect')
WalletModal( v-model='showModal')
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
  width: fit-content
  height: 40px
  text-transform: lowercase
.buttons-container
  width: 220px
  max-width: 80vw
  background: var(--q-color-dropdown-card)
</style>
