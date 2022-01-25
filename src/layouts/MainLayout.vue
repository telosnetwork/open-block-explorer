<template lang="pug">
q-layout( view="hHh lpR fFf")
  q-header( reveal elevated class="bg-primary text-white" height-hint="98")
    q-toolbar
      q-toolbar-title
        img.telos-logo( src="~assets/telos_logo.svg" )
        q-input.search-bar(
          outlined 
          square  
          v-model="searchText" 
          debounce=600  
          :input-style="{ color: 'white' }"
          placholder="Search"
        )
          template(v-slot:prepend)
            q-icon.rotate-90.input-icon( name="search" color="white" size='25px' 	)
        q-btn.connect-button( label="Connect" )
    q-tabs( align="center" )
      q-route-tab( to="/" label="Network" )
      q-route-tab( to="/" label="Vote" )
      q-route-tab( to="/" label="Proposal" )
      q-route-tab( to="/" label="Explore" )
  q-page-container
    router-view
  q-footer( reveal elevated class="text-white")
    q-list( no-border sparse seperator )
      q-item(clickable to='/terms' ) Terms
      q-item(clickable to='/terms' ) Privacy
      q-item(
        clickable 
        tag='a' 
        href='https://github.com/telosnetwork/open-block-explorer'
        target="_blank" 
        rel="noopener noreferrer"
        ) Repository
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { openURL } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  data() {
    return {
      searchText: ''
    };
  },

  methods: {
    openURL
  }
});
</script>
<style lang="sass" scoped>
.q-page
  height: 39.5rem
  background: $gradient-1
.q-toolbar
  height: 5.3125rem
.q-header
  height: 8.375rem
  background: $primary-dark !important
  border-bottom-style: inset
  border-bottom-color: $gray
.q-tab
  text-transform: unset
.q-footer
  height: 4.875rem
  background: $gradient-3
.q-list
  padding-top: 1.25rem
  width: 20rem
  margin: auto
.q-item
  display: inline-flex
  width: 6rem
.telos-logo
  position: absolute
  height: 2.5rem
  width: 6rem
  left: 4%
  right: 90%
  top: 20%
  bottom: 50%
  mix-blend-mode: lighten
.search-bar
  position: absolute
  left: 15%
  right: 15%
  top: 25%
  bottom: 50%
.input-icon
  padding-bottom: 0
  padding-right: 1.25rem
.connect-button
  text-transform: unset
  background-color: $primary
  position: absolute
  left: 88%
  right: 6%
  top: 25%
  bottom: 50%
</style>
