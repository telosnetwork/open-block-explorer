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
    ...mapMutations({
      setAccountName: 'account/setAccountName'
    })
  }
});
</script>

<template lang="pug">
div.col-xs-5.col-sm-3.col-md-2.col-lg-2
  .q-px-xs-xs.q-px-sm-xs.q-px-md-md.q-px-lg-md
    LoginHandlerDropdown(v-if='account' :account='account')
    q-btn.button-primary.btn-login(v-else @click='showModal = true' label='Connect')
    WalletModal( v-model='showModal')
</template>

<style scoped lang="sass">
.btn-login
  width: 60%
  min-width: 120px
  max-width: 140px
  height: 40px
</style>
