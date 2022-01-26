<template lang="pug">
q-layout( view="hHh lpR fFf")
  q-header
    Header
    q-separator.separator
  q-page-container
    router-view
    q-separator
  q-footer
    Footer
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { openURL } from 'quasar';
import Footer from 'components/Footer.vue';
import Header from 'components/Header.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    Header,
    Footer
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
.q-page
  height: 39.5rem
  background: $gradient-1
.separator
  height:1px
</style>
