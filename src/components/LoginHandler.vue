<script lang="ts">
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
      showModal: false
    };
  },
  async mounted() {
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      this.setAccountName(storedAccount);
      const authenticators =
        this.$ual.getAuthenticators().availableAuthenticators;
      const users = await authenticators[0].login();
      this.setUser(users[0]);
    }
  },
  computed: {
    ...mapGetters({ account: 'account/accountName' })
  },
  methods: {
    ...mapMutations({
      setAccountName: 'account/setAccountName',
      setUser: 'account/setUser'
    }),
    showWalletModal(): void {
      this.showModal = !this.showModal;
    }
  }
});
</script>

<template lang="pug">
div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
    LoginHandlerDropdown(v-if='account' :account='account')
    q-btn.button-primary(v-else @click='showWalletModal' label='Connect')
    WalletModal( :showModal='showModal')
</template>

<style lang="sass">
.button-primary
  width: 140px
</style>
