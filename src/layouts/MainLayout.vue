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
    return {
      accountName: ''
    };
  },

  methods: {
    openURL
  }
});
</script>

<template lang="pug">
q-layout( view="hHh lpR fff")
  q-header
    Header
    q-separator.separator
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
