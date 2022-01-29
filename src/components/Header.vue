<template lang="pug">
div.header-background
    div.row.text-center.q-pt-sm
        div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md
           img.logo( src="~assets/telos_logo.svg")

        div.col-xs-6.col-sm-6.col-md-8.col-lg-8.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
            div.row.justify-center  
                q-input.col-12.search-input.q-pl-md(borderless dense label-color="white"  color="white"  v-model="search" label="Search" )
                    template(v-slot:prepend)
                        q-icon.search-icon(name="search" color="white" size="20px")

        div.col-xs-3.col-sm-3.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
            q-btn.button-primary(@click='clicked()' label="CONNECT")

    div.row.justify-center.col-12.q-pt-sm
        q-tabs(v-model="tab"  active-class="active-tab" indicator-color="white" align="justify" narrow-indicator color="white")
          q-tab.deactive(name="Network" label="Network") 
          q-tab.deactive(name="Vote" label="Vote") 
          q-tab.deactive(name="Proposal"  label="Proposal") 
          q-tab.deactive(name="Explore" label="Explore") 

</template>
<script lang="ts">
import { defineComponent } from 'vue';
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
    background: $black-5
    border-radius: 4px

.search-icon
    transform: rotate(90deg)
</style>
