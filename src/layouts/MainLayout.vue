<script lang="ts">
import { defineComponent } from 'vue';
import Footer from 'components/Footer.vue';
import Header from 'components/Header.vue';
import ChainsSidebar from 'components/ChainsSidebar.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    Header,
    Footer,
    ChainsSidebar
  },
  methods: {
    showSidebar(): boolean {
      return process.env.SHOW_SIDEBAR == 'true';
    }
  }
});
</script>

<template lang="pug">
q-layout( view="lHh lpR lFf")
  q-header
    Header
    q-separator.separator
  q-header

  chains-sidebar(
    v-if="showSidebar()"
  )

  q-page-container
    router-view
    q-separator
  q-footer
    Footer
</template>

<style lang="sass" scoped>
.q-header
  background-color: $primary-dark
.separator
  height: 2px
  min-height: 2px
</style>
