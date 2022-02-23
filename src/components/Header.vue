<template lang="pug">
div.header-background
    div.row.text-center.q-pt-sm
        div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md
           img.logo( src="~assets/telos_logo.svg")

        div.col-xs-6.col-sm-6.col-md-8.col-lg-8.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
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

        div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
            q-btn.button-primary(@click='clicked()' label="Connect")

    div.row.justify-center.col-12.q-pt-sm
        q-tabs(v-model="tab"  active-class="active-tab" indicator-color="white" align="justify" narrow-indicator color="white")
          q-tab.deactive(name="Network" label="Network" @click="menuClicked('Network')")
          q-tab.deactive(name="Vote" label="Vote" @click="menuClicked('Vote')")
          q-tab.deactive(name="Proposal"  label="Proposal" @click="menuClicked('Proposal')")
          q-tab.deactive(name="Explore" label="Explore" @click="menuClicked('Explore')")

</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Notify } from 'quasar';
import { isValidHex, isValidAccount } from 'src/utils/stringValidator';
export default defineComponent({
  name: 'Header',
  data() {
    return {
      tab: 'Network',
      search: ''
    };
  },
  methods: {
    clicked() {
      console.log('connect btn clicked');
    },
    async menuClicked(routeName: string) {
      await this.$router.push({ name: `${routeName}` });
    },
    /* temp search check if possible tx or account, replace with results list rendering */
    async executeSearch(input: KeyboardEvent): Promise<void> {
      if (input != null) {
        const value = (input.currentTarget as HTMLInputElement).value;
        if (value === '') {
          Notify.create('no search term input');
          return;
        }
        if (isValidHex(value) && value.length == 64) {
          await this.$router.push({
            name: 'transaction',
            params: { transaction: value }
          });
        } else {
          if (isValidAccount(value)) {
            await this.$router.push({
              name: 'account',
              params: { account: value }
            });
          } else {
            Notify.create('invalid transacation id or account name');
          }
        }
      }
    }
  }
});
</script>
<style lang="sass" scoped>

.logo
    width: 104px
    height:54px

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
</style>
