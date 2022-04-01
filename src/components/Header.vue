<script lang="ts">
import { defineComponent } from 'vue';
import { isValidHex, isValidAccount } from 'src/utils/stringValidator';
import LoginHandler from 'components/LoginHandler.vue';

export default defineComponent({
  name: 'Header',
  components: { LoginHandler },
  data() {
    return {
      tab: 'Network',
      search: ''
    };
  },
  methods: {
    /* temp search check if possible tx or account, replace with results list rendering */
    async executeSearch(input: KeyboardEvent): Promise<void> {
      if (input != null) {
        const value = (input.currentTarget as HTMLInputElement).value;
        if (value === '') {
          this.$q.notify('no search term input');
          return;
        }
        if (isValidHex(value) && value.length == 64) {
          const check = await this.$api.getTransaction(value);
          if (check) {
            await this.$router.push({
              name: 'transaction',
              params: { transaction: value }
            });
            this.$router.go(0);
          } else {
            this.$q.notify(`transaction ${value} not found!`);
          }
        } else {
          if (isValidAccount(value)) {
            let account: string;
            try {
              account = value.toLowerCase();
              await this.$api.getAccount(account);
              await this.$router.push({
                name: 'account',
                params: {
                  account
                }
              });
              this.$router.go(0);
            } catch (e) {
              this.$q.notify(`account ${account} not found!`);
            }
          } else {
            this.$q.notify('invalid transacation id or account name');
          }
        }
      }
    }
  }
});
</script>

<template lang="pug">
div.header-background
  div.row.text-center.q-pt-sm
    div.logo-container.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md
      a( href="/")
        img.logo( src="~assets/telos_logo.svg")
    div.search-container.col-xs-6.col-sm-6.col-md-8.col-lg-8.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
      div.row.justify-center  
        q-input.col-12.search-input.q-pl-md(
          borderless 
          dense 
          label-color="white"  
          color="white" 
          :input-style="{ color: 'white' }"
          v-model="search" 
          label="Search"
          @keyup.enter="executeSearch" 
        )
          template(v-slot:prepend)
            q-icon.search-icon(name="search" color="white" size="20px")
    LoginHandler
  div.row.justify-center.col-12.q-pt-sm
    q-tabs(v-model="tab"  active-class="active-tab" indicator-color="white" align="justify" narrow-indicator color="white")
      q-route-tab.deactive.active-tab(name="network" label="Network" to='/').temp-hide
      q-route-tab.deactive(name="wallet" label="Wallet" to="{ name: 'account', params: {account: /* store account getter */} }").temp-hide
      q-route-tab.deactive(name="vote" label="Vote" to='/vote').temp-hide
      q-route-tab.deactive(name="proposal"  label="Proposal" to='/proposal').temp-hide
      q-route-tab.deactive(name="explore" label="Explore" to='/explore').temp-hide
</template>

<style lang="sass" scoped>
$medium:750px

.q-tab
  text-transform: unset
  font-size: 18px

.logo-container
  margin-left: .5rem

.logo
    width: 104px
    height:54px

.search-container
  width: 60%
  margin-left: 1rem

.header-items
    list-style-type: none

.active-tab
    text-decoration: none
    color: #ffffff
    opacity: 1 !important

.deactive
    opacity: 0.3
    font-size: 18px

.header-background
    background: $primary-dark

.search-input
    background: rgba(255, 255, 255, 0.05)
    border-radius: 4px

.search-icon
    transform: rotate(90deg)

@media screen and (max-width: $medium) // screen < $medium

  .search-container
    width: 60%
</style>
