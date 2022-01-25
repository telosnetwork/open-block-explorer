<template lang="pug">
q-layout( view="hHh lpR fFf")
  q-header( reveal elevated class="bg-primary text-white" height-hint="98")
    q-toolbar
      q-toolbar-title
        q-avatar
          img( src="~assets/telos_logo.svg")
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
import ProducerMap from 'components/ProducerMap.vue';
import { defineComponent } from 'vue';
import { openURL } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: {
    ProducerMap
  },

  data() {
    return {};
  },

  methods: {
    openURL
  }
});
</script>
<style lang="sass" scoped>
.q-page-container
  height: 39.5rem
  background: $gradient-1
.q-header
  height: 8.375rem
  background: $primary-dark !important
  border-bottom-style: inset
  border-bottom-color: $gray
.q-tabs
  padding-top: 2.25rem
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
</style>
